export const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://pricealarm.vercel.app';

export const CATEGORY_SLUGS: Record<string, { name: string; slug: string; description: string }> = {
  '100': {
    name: '식량작물',
    slug: 'grains',
    description: '쌀, 찹쌀, 콩 등 우리 식탁의 기본이 되는 식량작물의 오늘 시세를 확인하세요. 산지 도매가부터 소매가까지 한눈에 비교할 수 있습니다.',
  },
  '200': {
    name: '채소류',
    slug: 'vegetables',
    description: '배추, 무, 양파, 감자, 고추 등 채소류의 실시간 가격 정보입니다. 유가 변동에 따른 시설원예 작물 가격 영향도 함께 분석합니다.',
  },
  '300': {
    name: '특용작물',
    slug: 'specialty',
    description: '참깨, 들깨, 땅콩, 고춧가루 등 특용작물의 가격 동향을 확인하세요. 계절별 가격 변동이 큰 품목들의 시세를 추적합니다.',
  },
  '400': {
    name: '과일류',
    slug: 'fruits',
    description: '사과, 배, 감귤, 포도, 수박 등 과일류의 오늘 시세입니다. 제철 과일 가격과 비수기 가격을 비교해보세요.',
  },
  '500': {
    name: '축산물',
    slug: 'livestock',
    description: '한우, 돼지고기, 닭고기, 달걀 등 축산물의 실시간 가격 정보입니다. 등급별, 부위별 가격을 확인할 수 있습니다.',
  },
  '600': {
    name: '수산물',
    slug: 'seafood',
    description: '고등어, 갈치, 오징어, 새우 등 수산물의 오늘 시세입니다. 어획량과 계절에 따른 가격 변동을 추적합니다.',
  },
};

export function getCategoryBySlug(slug: string) {
  return Object.entries(CATEGORY_SLUGS).find(([, v]) => v.slug === slug);
}

export function getCategoryByCode(code: string) {
  return CATEGORY_SLUGS[code];
}

export const AD_SLOTS = {
  topBanner: 'ca-pub-XXXXXXX-top',
  inFeed: 'ca-pub-XXXXXXX-infeed',
  midContent: 'ca-pub-XXXXXXX-mid',
  sidebar: 'ca-pub-XXXXXXX-sidebar',
  bottomBanner: 'ca-pub-XXXXXXX-bottom',
};

export const ADSENSE_PUB_ID = process.env.NEXT_PUBLIC_ADSENSE_PUB_ID || 'ca-pub-XXXXXXXXXXXXXXXX';
