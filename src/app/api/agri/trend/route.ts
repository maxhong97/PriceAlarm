import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const itemCode = searchParams.get('itemCode') || '221'; // Default: Watermelon
  const categoryCode = searchParams.get('categoryCode') || '200';

  try {
    // API #7: 최근 가격추이 조회 (recentPriceTrendList)
    // 최근 2주간의 실제 가격 변동 데이터를 가져옵니다.
    const res = await fetch(
      `http://www.kamis.or.kr/service/price/xml.do?action=recentPriceTrendList&p_cert_key=test&p_cert_id=test&p_returntype=json&p_item_code=${itemCode}&p_item_category_code=${categoryCode}`,
      { next: { revalidate: 3600 } }
    );

    if (!res.ok) throw new Error('KAMIS Trend API failed');
    const data = await res.json();

    // Mapping Trend data
    if (data && data.price) {
      return NextResponse.json(data.price);
    }

    return NextResponse.json([]);
  } catch (error) {
    console.error('Agri Trend API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch trend data' }, { status: 500 });
  }
}
