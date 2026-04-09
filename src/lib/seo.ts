import type { Metadata } from 'next';
import { BASE_URL } from './constants';

export function generateProductMetadata(
  name: string,
  price: number,
  unit: string,
  categoryName: string,
): Metadata {
  const title = `${name} 시세 - 오늘 ${price.toLocaleString()}원/${unit}`;
  const description = `${name} 오늘 가격 ${price.toLocaleString()}원. ${categoryName} 시세 추이, 도매/소매 가격 비교, 온라인 최저가 확인. KAMIS 공식 데이터 기반 실시간 농산물 시세.`;

  return {
    title,
    description,
    keywords: [name, `${name} 가격`, `${name} 시세`, categoryName, '농산물 시세', '오늘 시세'],
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'ko_KR',
      url: `${BASE_URL}/product/${encodeURIComponent(name)}`,
    },
  };
}

export function generateCategoryMetadata(
  categoryName: string,
  slug: string,
  count?: number,
): Metadata {
  const title = `${categoryName} 시세 - 오늘의 가격 비교`;
  const countText = count ? ` ${count}개 품목` : '';
  const description = `${categoryName} 전체 품목의 오늘 시세를 확인하세요.${countText} 가격 비교, 주간 변동률, 최저가 정보를 제공합니다.`;

  return {
    title,
    description,
    keywords: [categoryName, `${categoryName} 가격`, `${categoryName} 시세`, '농산물 시세', '오늘 시세'],
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'ko_KR',
      url: `${BASE_URL}/category/${slug}`,
    },
  };
}

export function generateReportMetadata(dateStr: string): Metadata {
  const title = `오늘의 농산물 시세 리포트 (${dateStr})`;
  const description = `${dateStr} 농산물 가격 동향 리포트. 유가 변동, 주요 품목 가격 상승/하락 분석, 카테고리별 시세 요약.`;

  return {
    title,
    description,
    keywords: ['농산물 시세', '오늘 시세', '농산물 가격', '유가', '물가', dateStr],
    openGraph: {
      title,
      description,
      type: 'article',
      locale: 'ko_KR',
      url: `${BASE_URL}/report`,
    },
  };
}
