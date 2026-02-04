import { NextResponse } from 'next/server';
import { getOrder } from '../../../../services/paymentService';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const orderNo = url.searchParams.get('orderNo');
    if (!orderNo) return new NextResponse('query param `orderNo` is required', { status: 400 });
    const order = await getOrder(orderNo);
    return NextResponse.json(order);
  } catch (err: any) {
    return new NextResponse(err?.message ?? String(err), { status: 502 });
  }
}
