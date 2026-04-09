import { CATEGORY_NAMES, determineCategory, PREFERRED_UNITS } from './kamisCodes';

export interface ServerAgriProduct {
  id: string;
  productNo: string;
  rawName: string;
  fullName: string;
  name: string;
  categoryCode: string;
  categoryName: string;
  predictCategory: 'greenhouse' | 'transport-heavy' | 'general';
  currentPrice: number;
  minPrice: number;
  maxPrice: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  changeRate: number;
  source: string;
}


export async function fetchAgriProductsServer(): Promise<ServerAgriProduct[]> {
  const res = await fetch(
    'http://www.kamis.or.kr/service/price/xml.do?action=dailySalesList&p_cert_key=test&p_cert_id=test&p_returntype=json',
    { next: { revalidate: 3600 } },
  );

  if (!res.ok) return [];
  const data = await res.json();

  if (!data?.price) return [];

  const groups = new Map<string, any[]>();
  data.price.forEach((item: any) => {
    if (!item.dpr1 || item.dpr1 === '-') return;
    const key = item.item_name;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(item);
  });

  const processedItems = Array.from(groups.values())
    .map((groupItems) => {
      const first = groupItems[0];
      const retailItems = groupItems.filter((m: any) => m.product_cls_code === '01');
      const wholesaleItems = groupItems.filter((m: any) => m.product_cls_code === '02');

      const retailPrice = retailItems.length > 0 ? parseInt(retailItems[0].dpr1.replace(/,/g, '')) : null;
      const wholesalePrice = wholesaleItems.length > 0 ? parseInt(wholesaleItems[0].dpr1.replace(/,/g, '')) : null;

      if (!retailPrice && !wholesalePrice) return null;

      let min = 0, max = 0, current = 0;
      if (retailPrice && wholesalePrice) {
        min = Math.min(retailPrice, wholesalePrice);
        max = Math.max(retailPrice, wholesalePrice);
        current = retailPrice;
      } else if (retailPrice) {
        min = Math.round(retailPrice * 0.82);
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
        rawName,
        fullName: first.item_name,
        name: `${first.item_name} (${first.unit})`,
        categoryCode: first.category_code,
        categoryName: CATEGORY_NAMES[first.category_code] || '기타',
        predictCategory: determineCategory(first.item_name, first.category_code),
        currentPrice: current,
        minPrice: min,
        maxPrice: max,
        unit: first.unit,
        trend: first.direction === '1' ? 'up' as const : first.direction === '2' ? 'down' as const : 'stable' as const,
        changeRate: parseFloat(first.value) || 0,
        source: 'KAMIS (농산물유통정보)',
      };
    })
    .filter(Boolean) as ServerAgriProduct[];

  const deduplicated = new Map<string, ServerAgriProduct>();
  processedItems.forEach((item) => {
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

  return Array.from(deduplicated.values());
}


export async function fetchProductTrendServer(itemCode: string, categoryCode: string) {
  try {
    const res = await fetch(
      `http://www.kamis.or.kr/service/price/xml.do?action=recentPriceTrendList&p_cert_key=test&p_cert_id=test&p_returntype=json&p_item_code=${itemCode}&p_item_category_code=${categoryCode}`,
      { next: { revalidate: 3600 } },
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data?.price || [];
  } catch {
    return [];
  }
}

export async function fetchProductByName(name: string): Promise<ServerAgriProduct | null> {
  const products = await fetchAgriProductsServer();
  return products.find((p) => p.rawName === name || p.fullName === name) || null;
}

export async function fetchProductsByCategory(categoryCode: string): Promise<ServerAgriProduct[]> {
  const products = await fetchAgriProductsServer();
  return products.filter((p) => p.categoryCode === categoryCode);
}
