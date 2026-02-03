import { NextResponse } from 'next/server';
import { getOrder } from '../../../../services/paymentService';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const orderNo = body?.orderNo;
    if (!orderNo) return new NextResponse('`orderNo` is required', { status: 400 });

    const order = await getOrder(orderNo);

    if (order?.status !== 'paid') {
      return NextResponse.json({ ok: false, order });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_AUTH_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ ok: true, note: 'paid but SUPABASE_SERVICE_ROLE_KEY not configured; no DB update performed', order });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceKey);

    // Try to resolve user from Authorization: Bearer <access_token>
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    let userId: string | null = null;
    if (token) {
      const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
      if (userErr) {
        // ignore: token might be invalid
      } else if (userData?.user?.id) {
        userId = userData.user.id;
      }
    }

    // Attempt to insert a subscriptions row into Supabase. If table is missing, ignore gracefully.
    try {
      const { error: insertErr } = await supabaseAdmin.from('subscriptions').insert({
        user_id: userId ?? 'anonymous',
        order_no: orderNo,
        status: 'active',
        tx_hash: order?.txHash ?? null,
        metadata: order,
        created_at: new Date().toISOString(),
      });

      if (insertErr) {
        // Fallback: mark profile metadata if userId exists
        if (userId) {
          await supabaseAdmin.from('profiles').upsert({ id: userId, metadata: { subscribed: true, order_no: orderNo } }, { onConflict: 'id' });
        }
      }
    } catch (e) {
      // swallow: best-effort persistence
    }

    // Additionally, if a DATABASE_URL is configured, upsert into Postgres directly
    try {
      const { upsertSubscription } = await import('../../../../services/postgresService');
      const amount = order?.amount ?? order?.amt ?? null;
      const pgResult = await upsertSubscription({
        userId,
        orderNo,
        status: 'active',
        txHash: order?.txHash ?? order?.tx_hash ?? null,
        amount,
        metadata: order,
      });

      // if pgResult.ok === false, ignore (we're best-effort) but log to console
      if (!pgResult.ok) {
        console.warn('Postgres upsertSubscription failed:', pgResult.error);
      }
    } catch (e) {
      // ignore; service might not exist or DATABASE_URL not configured
    }

    return NextResponse.json({ ok: true, order });
  } catch (err: any) {
    return new NextResponse(err?.message ?? String(err), { status: 502 });
  }
}
