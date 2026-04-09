import type { SeoulPriceItem } from './seoul-api';
import { SEOUL_GU_LIST } from './seoul-geo';

const BASE_PRICES: Record<string, { price: number; unit: string }> = {
  배추: { price: 3200, unit: '1포기' },
  무: { price: 1800, unit: '1개' },
  양파: { price: 2500, unit: '1kg' },
  오이: { price: 900, unit: '1개' },
  상추: { price: 2200, unit: '100g' },
  애호박: { price: 1400, unit: '1개' },
  호박: { price: 2800, unit: '1개' },
  사과: { price: 3500, unit: '1개' },
  배: { price: 4200, unit: '1개' },
  달걀: { price: 8500, unit: '30개' },
  닭고기: { price: 6800, unit: '1kg' },
  삼겹살: { price: 28000, unit: '1kg' },
  쇠고기: { price: 65000, unit: '1kg' },
  고등어: { price: 4500, unit: '1마리' },
  갈치: { price: 9000, unit: '1마리' },
  오징어: { price: 5500, unit: '1마리' },
};

// 구마다 ±8% 범위의 고정 계수 (seed-based, 매번 동일한 값)
const GU_FACTORS: Record<string, number> = {
  강남구: 1.07, 강동구: 0.97, 강북구: 0.94, 강서구: 0.98, 관악구: 0.96,
  광진구: 1.01, 구로구: 0.95, 금천구: 0.93, 노원구: 0.96, 도봉구: 0.95,
  동대문구: 0.99, 동작구: 1.02, 마포구: 1.05, 서대문구: 1.00, 서초구: 1.08,
  성동구: 1.03, 성북구: 0.97, 송파구: 1.04, 양천구: 0.99, 영등포구: 1.01,
  용산구: 1.06, 은평구: 0.95, 종로구: 1.04, 중구: 1.02, 중랑구: 0.94,
};

export function generateMockSeoulPrices(): SeoulPriceItem[] {
  const today = new Date();
  const dateStr = today.toISOString().replace(/-/g, '').slice(0, 8);
  const items: SeoulPriceItem[] = [];

  for (const gu of SEOUL_GU_LIST) {
    const factor = GU_FACTORS[gu] ?? 1.0;
    for (const [item, { price, unit }] of Object.entries(BASE_PRICES)) {
      const guPrice = Math.round(price * factor);
      items.push({
        gu,
        item,
        unit,
        price: guPrice,
        date: dateStr,
        market: `${gu} 전통시장`,
      });
    }
  }
  return items;
}
