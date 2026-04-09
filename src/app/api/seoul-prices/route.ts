import { NextResponse } from 'next/server';
import { fetchSeoulPricesServer } from '@/lib/seoul-api';

export const dynamic = 'force-dynamic';

export async function GET() {
  const data = await fetchSeoulPricesServer();
  return NextResponse.json(data, {
    headers: { 'Cache-Control': 'no-store' },
  });
}
