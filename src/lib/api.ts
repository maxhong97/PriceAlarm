import { AgriProduct } from './mockData';

/**
 * 농산물 가격 데이터 가져오기 (Proxy API)
 * KAMIS API(test/test)를 사용하는 내부 API(/api/agri)를 호출합니다.
 */
export async function fetchAgriProducts(): Promise<AgriProduct[]> {
  try {
    const res = await fetch('/api/agri', { cache: 'no-store' });
    if (!res.ok) throw new Error('Agri Proxy failed');
    return await res.json();
  } catch (error) {
    console.error('Failed to fetch agri products from proxy:', error);
    return [];
  }
}
