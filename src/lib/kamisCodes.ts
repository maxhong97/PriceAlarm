export interface StandardProduct {
  itemCode: string;
  name: string;
  unit: string;
  category: 'greenhouse' | 'transport-heavy' | 'general';
}

export const CATEGORY_NAMES: Record<string, string> = {
  '100': '식량작물',
  '200': '채소류',
  '300': '특용작물',
  '400': '과일류',
  '500': '축산물',
  '600': '수산물',
};

/**
 * 특정 품목명을 기반으로 시설원예(greenhouse) 또는 운송비 민감(transport-heavy) 품목인지 판별합니다.
 */
export function determineCategory(name: string, categoryCode: string): 'greenhouse' | 'transport-heavy' | 'general' {
  const greenhouseKeywords = ['오이', '토마토', '딸기', '참외', '호박', '풋고추', '깻잎', '상추', '가지', '피망', '파프리카'];
  const transportHeavyKeywords = ['배추', '무', '양파', '마늘', '파', '감자', '양배추', '시금치'];

  if (greenhouseKeywords.some(k => name.includes(k))) return 'greenhouse';
  if (transportHeavyKeywords.some(k => name.includes(k))) return 'transport-heavy';
  
  return 'general';
}

/**
 * 각 품목별로 우선적으로 보여줄 표준 규격 리스트입니다. (자동 선정 보완용)
 */
export const PREFERRED_UNITS: Record<string, string[]> = {
  '쌀': ['20kg'],
  '배추': ['1포기', '10포기'],
  '무': ['1개'],
  '감자': ['1kg', '20kg'],
  '수박': ['1개'],
  '달걀': ['30구', '10구'],
  '소고기': ['100g'],
  '돼지고기': ['100g'],
  '닭고기': ['1kg'],
};
