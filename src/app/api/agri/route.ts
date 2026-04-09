import { NextResponse } from 'next/server';
import { CATEGORY_NAMES, determineCategory, PREFERRED_UNITS } from '@/lib/kamisCodes';

export async function GET() {
  try {
    // KAMIS API with sample key (test/test)
    const res = await fetch(
      'http://www.kamis.or.kr/service/price/xml.do?action=dailySalesList&p_cert_key=test&p_cert_id=test&p_returntype=json',
      { next: { revalidate: 3600 } } 
    );
    
    if (!res.ok) throw new Error('KAMIS API failed');
    const data = await res.json();
    
    if (data && data.price) {
      // 품목 그룹화 (fullName 기준)
      // 소매(01)와 도매(02) 가격을 모두 수집하여 시장 범위를 산출합니다.
      const groups = new Map<string, any[]>();
      
      data.price.forEach((item: any) => {
        if (!item.dpr1 || item.dpr1 === '-') return;
        
        const key = item.item_name; // 예: "쌀/20kg"
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(item);
      });

      // 그룹별 데이터 정제
      const processedItems = Array.from(groups.values()).map(groupItems => {
        const first = groupItems[0];
        
        // 소매 데이터와 도매 데이터 분리
        const retailItems = groupItems.filter(m => m.product_cls_code === '01');
        const wholesaleItems = groupItems.filter(m => m.product_cls_code === '02');

        const retailPrice = retailItems.length > 0 
          ? parseInt(retailItems[0].dpr1.replace(/,/g, '')) 
          : null;
        const wholesalePrice = wholesaleItems.length > 0 
          ? parseInt(wholesaleItems[0].dpr1.replace(/,/g, '')) 
          : null;

        if (!retailPrice && !wholesalePrice) return null;

        // 시장 범위 산출 로직:
        // 1. 도매가와 소매가가 모두 있다면 [도매가, 소매가]를 범위로 설정
        // 2. 소매가만 있다면 [소매가*0.85, 소매가]를 범위로 설정 (온라인 마진 고려)
        // 3. 도매가만 있다면 [도매가, 도매가*1.2]를 범위로 설정
        let min = 0;
        let max = 0;
        let current = 0;

        if (retailPrice && wholesalePrice) {
          min = Math.min(retailPrice, wholesalePrice);
          max = Math.max(retailPrice, wholesalePrice);
          current = retailPrice;
        } else if (retailPrice) {
          min = Math.round(retailPrice * 0.82); // 통상적인 대형몰 최저가 기준 (18% 할인)
          max = Math.round(retailPrice * 1.05);
          current = retailPrice;
        } else if (wholesalePrice) {
          min = wholesalePrice;
          max = Math.round(wholesalePrice * 1.25);
          current = max;
        }

        const rawName = first.item_name.split('/')[0];

        return {
          id: `${first.productno}_${first.item_name}_${first.unit}`,
          productNo: first.productno,
          rawName: rawName,
          fullName: first.item_name,
          name: `${first.item_name} (${first.unit})`,
          categoryCode: first.category_code,
          categoryName: CATEGORY_NAMES[first.category_code] || '기타',
          predictCategory: determineCategory(first.item_name, first.category_code),
          currentPrice: current,
          minPrice: min,
          maxPrice: max,
          unit: first.unit,
          trend: first.direction === '1' ? 'up' : first.direction === '2' ? 'down' : 'stable',
          changeRate: parseFloat(first.value) || 0,
          source: 'KAMIS (농산물유통정보)'
        };
      }).filter(Boolean);

      // 동일 품목명(예: 쌀)에 대해 여러 규격이 있는 경우 대표 하나만 선정
      const deduplicated = new Map<string, any>();
      processedItems.forEach((item: any) => {
        const existing = deduplicated.get(item.fullName);
        if (!existing) {
          deduplicated.set(item.fullName, item);
        } else {
          const preferred = PREFERRED_UNITS[item.rawName] || [];
          const currentIdx = preferred.indexOf(item.unit.replace(/\s/g, ''));
          const existingIdx = preferred.indexOf(existing.unit.replace(/\s/g, ''));

          if (currentIdx !== -1 && (existingIdx === -1 || currentIdx < existingIdx)) {
            deduplicated.set(item.fullName, item);
          }
        }
      });

      return NextResponse.json(Array.from(deduplicated.values()));
    }
    
    return NextResponse.json([]);
  } catch (error) {
    console.error('Agri API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch agri data' }, { status: 500 });
  }
}
