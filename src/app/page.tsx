'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { SeoulPriceItem, SeoulPriceItemName, SEOUL_PRICE_ITEMS, groupByGu } from '@/lib/seoul-api';
import { SEOUL_GU_LIST } from '@/lib/seoul-geo';
import { MapPin, ChevronDown, TrendingUp, TrendingDown } from 'lucide-react';

const SeoulMap = dynamic(
  () => import('@/components/SeoulMap').then((m) => m.SeoulMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[400px]">
        <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
      </div>
    ),
  },
);

export default function Home() {
  const router = useRouter();
  const [prices, setPrices] = useState<SeoulPriceItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<SeoulPriceItemName>('배추');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/seoul-prices', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data: SeoulPriceItem[]) => {
        setPrices(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const priceByGu = groupByGu(prices, selectedItem);

  const handleGuClick = useCallback(
    (gu: string) => {
      if (gu) router.push(`/district/${encodeURIComponent(gu)}`);
    },
    [router],
  );

  // 최저/최고 구 계산
  const guEntries = Object.entries(priceByGu).filter(([, v]) => v > 0);
  const cheapestGu = guEntries.length
    ? guEntries.reduce((a, b) => (a[1] < b[1] ? a : b))
    : null;
  const mostExpensiveGu = guEntries.length
    ? guEntries.reduce((a, b) => (a[1] > b[1] ? a : b))
    : null;

  return (
    <div className="p-4 flex flex-col gap-5">
      {/* Header */}
      <header className="pt-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-green-600" />
          <h1 className="text-xl font-bold text-gray-900">서울시 생필품 가격 지도</h1>
        </div>
        <p className="text-gray-400 text-xs mt-1">
          구를 클릭하면 동별 상세 가격을 확인할 수 있습니다
        </p>
      </header>

      {/* 품목 선택 */}
      <div className="relative">
        <select
          value={selectedItem}
          onChange={(e) => setSelectedItem(e.target.value as SeoulPriceItemName)}
          className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm font-medium text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          {SEOUL_PRICE_ITEMS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>

      {/* 지도 */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden p-3">
        {loading ? (
          <div className="flex items-center justify-center h-[400px]">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
              <p className="text-xs text-gray-400">가격 데이터 불러오는 중...</p>
            </div>
          </div>
        ) : (
          <SeoulMap
            priceData={priceByGu}
            selectedItem={selectedItem}
            onGuClick={handleGuClick}
          />
        )}
      </div>

      {/* 최저/최고 구 요약 */}
      {cheapestGu && mostExpensiveGu && (
        <div className="grid grid-cols-2 gap-3">
          <div
            className="flex flex-col gap-1 p-3 rounded-xl bg-blue-50 border border-blue-100 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleGuClick(cheapestGu[0])}
          >
            <div className="flex items-center gap-1 text-blue-600">
              <TrendingDown className="w-4 h-4" />
              <span className="text-xs font-semibold">최저가 구</span>
            </div>
            <span className="text-sm font-bold text-gray-800">{cheapestGu[0]}</span>
            <span className="text-lg font-black text-blue-700">
              {cheapestGu[1].toLocaleString()}원
            </span>
          </div>
          <div
            className="flex flex-col gap-1 p-3 rounded-xl bg-red-50 border border-red-100 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleGuClick(mostExpensiveGu[0])}
          >
            <div className="flex items-center gap-1 text-red-500">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-semibold">최고가 구</span>
            </div>
            <span className="text-sm font-bold text-gray-800">{mostExpensiveGu[0]}</span>
            <span className="text-lg font-black text-red-600">
              {mostExpensiveGu[1].toLocaleString()}원
            </span>
          </div>
        </div>
      )}

      {/* 전체 구 목록 */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 mb-3">전체 자치구</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {SEOUL_GU_LIST.map((gu) => {
            const price = priceByGu[gu];
            return (
              <button
                key={gu}
                onClick={() => handleGuClick(gu)}
                className="flex flex-col items-start p-3 rounded-xl border border-gray-100 bg-white hover:border-green-300 hover:shadow-sm transition-all text-left"
              >
                <span className="text-xs font-semibold text-gray-700 leading-tight">
                  {gu.replace('구', '')}
                </span>
                <span className="text-sm font-bold text-gray-900 mt-0.5">
                  {price ? `${price.toLocaleString()}원` : '—'}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <p className="text-[10px] text-gray-300 text-center pb-2">
        서울시 생필품 농수축산물 가격 정보 (전통시장 기준, 매주 화요일 갱신)
      </p>
    </div>
  );
}
