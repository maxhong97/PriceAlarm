import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, MapPin } from 'lucide-react';
import { fetchSeoulPricesServer, groupByItem } from '@/lib/seoul-api';
import { SEOUL_DONGS, SEOUL_GU_LIST, SeoulGu } from '@/lib/seoul-geo';
import { DongGrid } from '@/components/DongGrid';
import { PriceTable } from '@/components/PriceTable';

export async function generateStaticParams() {
  return SEOUL_GU_LIST.map((gu) => ({ gu: encodeURIComponent(gu) }));
}

export async function generateMetadata({ params }: { params: Promise<{ gu: string }> }) {
  const { gu } = await params;
  const decoded = decodeURIComponent(gu);
  return {
    title: `${decoded} 생필품 가격 | PriceAlarm`,
    description: `서울 ${decoded} 전통시장 기준 생필품 농수축산물 평균 가격 정보`,
  };
}

export default async function GuPage({ params }: { params: Promise<{ gu: string }> }) {
  const { gu } = await params;
  const decoded = decodeURIComponent(gu) as SeoulGu;

  const dongs = SEOUL_DONGS[decoded];
  if (!dongs) notFound();

  const allPrices = await fetchSeoulPricesServer();
  const itemPrices = groupByItem(allPrices, decoded);
  const latestDate = allPrices.find((r) => r.gu === decoded)?.date;

  const tableItems = Object.entries(itemPrices).map(([item, { price, unit }]) => ({
    item,
    price,
    unit,
  }));

  return (
    <div className="p-4 flex flex-col gap-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-xs text-gray-400 pt-4">
        <Link href="/" className="hover:text-green-600">서울</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-700 font-semibold">{decoded}</span>
      </nav>

      {/* Header */}
      <header>
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-green-600" />
          <h1 className="text-xl font-bold text-gray-900">{decoded}</h1>
        </div>
        <p className="text-gray-400 text-xs mt-1">동을 클릭하면 상세 가격을 확인할 수 있습니다</p>
      </header>

      {/* 동 그리드 */}
      <section>
        <h2 className="text-sm font-semibold text-gray-600 mb-3">행정동 목록</h2>
        <DongGrid gu={decoded} dongs={dongs} />
      </section>

      {/* 구 전체 품목 가격 */}
      <section>
        <h2 className="text-sm font-semibold text-gray-600 mb-3">
          {decoded} 전체 품목 평균가
        </h2>
        <PriceTable items={tableItems} gu={decoded} dataDate={latestDate} />
      </section>
    </div>
  );
}
