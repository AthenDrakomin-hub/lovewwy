import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Pool } from 'pg';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();

    // Try Supabase admin first if available
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_AUTH_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    let userId: string | null = null;
    if (token && supabaseUrl && serviceKey) {
      try {
        const supabaseAdmin = createClient(supabaseUrl, serviceKey);
        const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
        if (!userErr && userData?.user?.id) userId = userData.user.id;
      } catch (e) {
        // ignore
      }
    }

    // Check Supabase subscriptions table first
    if (supabaseUrl && serviceKey && userId) {
      const supabaseAdmin = createClient(supabaseUrl, serviceKey);
      try {
        const { data, error } = await supabaseAdmin.from('subscriptions').select('*').eq('user_id', userId).limit(1);
        if (!error && data && data.length > 0) {
          const sub = data[0];
          return NextResponse.json({ subscribed: sub.status === 'active', subscription: sub });
        }
      } catch (e) {
        // ignore
      }
    }

    // Fallback to Postgres if configured and token resolved to userId
    const dbUrl = process.env.DATABASE_URL;
    if (dbUrl && userId) {
      const pool = new Pool({ connectionString: dbUrl });
      const client = await pool.connect();
      try {
        const r = await client.query("SELECT * FROM subscriptions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1", [userId]);
        if (r.rows && r.rows.length > 0) {
          const sub = r.rows[0];
          return NextResponse.json({ subscribed: sub.status === 'active', subscription: sub });
        }
      } catch (e) {
        // ignore
      } finally {
        client.release();
        await pool.end();
      }
    }

    return NextResponse.json({ subscribed: false });
  } catch (err: any) {
    return new NextResponse(err?.message ?? String(err), { status: 502 });
  }
}
