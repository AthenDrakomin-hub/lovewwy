const PAYMENT_API_URL = (process.env.PAYMENT_API_URL || process.env.NEXT_PUBLIC_PAYMENT_API_URL || '').replace(/\/$/, '');

export async function createOrder(amount: string) {
  if (!PAYMENT_API_URL) throw new Error('PAYMENT_API_URL is not configured');
  const res = await fetch(`${PAYMENT_API_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`createOrder failed: ${res.status} ${text}`);
  }
  return res.json();
}

export async function getOrder(orderNo: string) {
  if (!PAYMENT_API_URL) throw new Error('PAYMENT_API_URL is not configured');
  const res = await fetch(`${PAYMENT_API_URL}/api/orders/${encodeURIComponent(orderNo)}`);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`getOrder failed: ${res.status} ${text}`);
  }
  return res.json();
}
