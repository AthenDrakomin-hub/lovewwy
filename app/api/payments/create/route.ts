import { NextResponse } from 'next/server';
import { createOrder } from '../../../../services/paymentService';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const amount = body?.amount ?? '9.9';
    const order = await createOrder(String(amount));
    return NextResponse.json(order);
  } catch (err: any) {
    return new NextResponse(err?.message ?? String(err), { status: 502 });
  }
}
