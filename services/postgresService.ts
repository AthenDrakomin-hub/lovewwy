import { Pool } from 'pg';

const DATABASE_URL = process.env.DATABASE_URL || '';

let pool: Pool | null = null;

if (DATABASE_URL) {
  pool = new Pool({ connectionString: DATABASE_URL });
}

export async function runSql(sql: string) {
  if (!pool) return { ok: false, error: 'DATABASE_URL not configured' };
  const client = await pool.connect();
  try {
    await client.query(sql);
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? String(e) };
  } finally {
    client.release();
  }
}

export async function upsertSubscription(options: {
  userId?: string | null;
  orderNo: string;
  status: string;
  txHash?: string | null;
  amount?: string | number | null;
  metadata?: any;
}) {
  if (!pool) {
    return { ok: false, error: 'DATABASE_URL not configured' };
  }

  const { userId, orderNo, status, txHash, amount, metadata } = options;

  const client = await pool.connect();
  try {
    const query = `INSERT INTO subscriptions (id, user_id, order_no, status, tx_hash, amount, metadata, created_at, updated_at)
      VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6::jsonb, now(), now())
      ON CONFLICT (order_no) DO UPDATE SET
        status = EXCLUDED.status,
        tx_hash = EXCLUDED.tx_hash,
        amount = EXCLUDED.amount,
        metadata = EXCLUDED.metadata,
        updated_at = now()`;

    const params = [userId ?? null, orderNo, status, txHash ?? null, amount ?? null, JSON.stringify(metadata ?? {})];
    await client.query(query, params);
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? String(e) };
  } finally {
    client.release();
  }
}

export async function getPendingSubscriptions(limit = 100) {
  if (!pool) return { ok: false, error: 'DATABASE_URL not configured' };
  const client = await pool.connect();
  try {
    const res = await client.query(`SELECT * FROM subscriptions WHERE status != 'active' ORDER BY created_at DESC LIMIT $1`, [limit]);
    return { ok: true, rows: res.rows };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? String(e) };
  } finally {
    client.release();
  }
}

export async function updateSubscriptionByOrderNo(orderNo: string, fields: { status?: string; txHash?: string | null; metadata?: any; amount?: number | null; }) {
  if (!pool) return { ok: false, error: 'DATABASE_URL not configured' };
  const client = await pool.connect();
  try {
    const updates = [] as string[];
    const params: any[] = [];
    let idx = 1;
    if (fields.status) { updates.push(`status = $${idx++}`); params.push(fields.status); }
    if (fields.txHash !== undefined) { updates.push(`tx_hash = $${idx++}`); params.push(fields.txHash); }
    if (fields.amount !== undefined) { updates.push(`amount = $${idx++}`); params.push(fields.amount); }
    if (fields.metadata !== undefined) { updates.push(`metadata = $${idx++}`); params.push(JSON.stringify(fields.metadata)); }
    if (updates.length === 0) return { ok: false, error: 'no fields to update' };
    const sql = `UPDATE subscriptions SET ${updates.join(', ')}, updated_at = now() WHERE order_no = $${idx}`;
    params.push(orderNo);
    await client.query(sql, params);
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? String(e) };
  } finally {
    client.release();
  }
}
