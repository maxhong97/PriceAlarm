export interface SeoulPriceItem {
  gu: string;        // 자치구명
  item: string;      // 품목명
  unit: string;      // 단위
  price: number;     // 가격 (원)
  date: string;      // 조사일자 (YYYYMMDD)
  market: string;    // 시장명
}

export const SEOUL_PRICE_ITEMS = [
  '배추', '무', '양파', '오이', '상추', '애호박', '호박',
  '사과', '배', '달걀', '닭고기', '삼겹살', '쇠고기',
  '고등어', '갈치', '오징어',
] as const;

export type SeoulPriceItemName = (typeof SEOUL_PRICE_ITEMS)[number];

/** 구별 특정 품목 평균가 맵 반환 */
export function groupByGu(
  data: SeoulPriceItem[],
  item: string,
): Record<string, number> {
  const map: Record<string, { total: number; count: number }> = {};
  for (const row of data) {
    if (row.item !== item) continue;
    if (!map[row.gu]) map[row.gu] = { total: 0, count: 0 };
    map[row.gu].total += row.price;
    map[row.gu].count += 1;
  }
  const result: Record<string, number> = {};
  for (const [gu, { total, count }] of Object.entries(map)) {
    result[gu] = Math.round(total / count);
  }
  return result;
}

/** 구 내 전 품목 평균가 맵 반환 */
export function groupByItem(
  data: SeoulPriceItem[],
  gu: string,
): Record<string, { price: number; unit: string }> {
  const map: Record<string, { total: number; count: number; unit: string }> = {};
  for (const row of data) {
    if (row.gu !== gu) continue;
    if (!map[row.item]) map[row.item] = { total: 0, count: 0, unit: row.unit };
    map[row.item].total += row.price;
    map[row.item].count += 1;
  }
  const result: Record<string, { price: number; unit: string }> = {};
  for (const [item, { total, count, unit }] of Object.entries(map)) {
    result[item] = { price: Math.round(total / count), unit };
  }
  return result;
}

/** 서울 OpenAPI 호출 (서버 전용) */
export async function fetchSeoulPricesServer(): Promise<SeoulPriceItem[]> {
  const key = process.env.SEOUL_API_KEY;

  // 목업 모드: 키가 없거나 'mock' 으로 설정된 경우
  if (!key || key === 'mock') {
    const { generateMockSeoulPrices } = await import('./seoul-mock');
    return generateMockSeoulPrices();
  }

  try {
    const url = `https://openapi.seoul.go.kr:8088/${key}/json/ListNecessariesPricesService/1/1000/`;

    // openapi.seoul.go.kr:8088 은 자체 서명 인증서를 사용 → SSL 검증 우회 (서버 전용)
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

    const res = await fetch(url, { next: { revalidate: 3600 } });

    if (!res.ok) {
      console.warn(`[seoul-api] API 응답 실패 (${res.status}), 목업 데이터로 폴백`);
      const { generateMockSeoulPrices } = await import('./seoul-mock');
      return generateMockSeoulPrices();
    }

    const json = await res.json();
    const rows: Record<string, string>[] =
      json?.ListNecessariesPricesService?.row ?? [];

    if (rows.length === 0) {
      const { generateMockSeoulPrices } = await import('./seoul-mock');
      return generateMockSeoulPrices();
    }

    return rows
      .map((row) => {
        const priceRaw = row.A_PRICE ?? row.price ?? '';
        const price = parseInt(priceRaw.replace(/,/g, ''), 10);
        if (isNaN(price) || price <= 0) return null;
        return {
          gu: row.M_GU_NAME ?? row.gu_name ?? '',
          item: row.A_NAME ?? row.a_name ?? '',
          unit: row.A_UNIT ?? row.a_unit ?? '',
          price,
          date: row.P_DATE ?? row.p_date ?? '',
          market: row.M_NAME ?? row.m_name ?? '',
        } satisfies SeoulPriceItem;
      })
      .filter((r): r is SeoulPriceItem => r !== null && r.gu !== '' && r.item !== '');
  } catch (err) {
    console.error('[seoul-api] fetch 실패, 목업 데이터로 폴백:', err);
    const { generateMockSeoulPrices } = await import('./seoul-mock');
    return generateMockSeoulPrices();
  }
}
