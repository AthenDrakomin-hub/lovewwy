import { NextResponse } from 'next/server';
import { getPendingSubscriptions, updateSubscriptionByOrderNo } from '../../../../services/postgresService';
import { getOrder } from '../../../../services/paymentService';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  const secretHeader = request.headers.get('x-migrate-secret') || null;
  const body = await request.json().catch(() => ({}));
  const bodySecret = body?.secret || null;
  const secret = process.env.MIGRATE_SECRET;

  if (!secret || (secretHeader !== secret && bodySecret !== secret)) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const pending = await getPendingSubscriptions(500);
  if (!pending.ok) return NextResponse.json({ ok: false, error: pending.error });

  const results: any[] = [];

  const rows = Array.isArray(pending.rows) ? pending.rows : [];

  for (const row of rows) {
    const orderNo = row.order_no;
    try {
      const order = await getOrder(orderNo);
      if (order?.status === 'paid') {
        // update Postgres
        const up = await updateSubscriptionByOrderNo(orderNo, { status: 'active', txHash: order?.txHash ?? order?.tx_hash ?? null, metadata: order, amount: order?.amount ?? order?.amt ?? null });
        // update Supabase as well if configured
        try {
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_AUTH_URL;
          const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
          if (supabaseUrl && serviceKey) {
            const supabaseAdmin = createClient(supabaseUrl, serviceKey);
            await supabaseAdmin.from('subscriptions').upsert({ user_id: row.user_id ?? 'anonymous', order_no: orderNo, status: 'active', tx_hash: order?.txHash ?? order?.tx_hash ?? null, metadata: order });
            if (row.user_id) {
              await supabaseAdmin.from('profiles').upsert({ id: row.user_id, metadata: { subscribed: true, order_no: orderNo } }, { onConflict: 'id' });
            }
          }
        } catch (e) {
          // ignore
        }
        results.push({ orderNo, updated: true });
      } else {
        results.push({ orderNo, updated: false, status: order?.status });
      }
    } catch (err: any) {
      results.push({ orderNo, error: err?.message ?? String(err) });
    }
  }

  return NextResponse.json({ ok: true, results });
}
