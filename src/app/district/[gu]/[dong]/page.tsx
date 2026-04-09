import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, MapPin } from 'lucide-react';
import { fetchSeoulPricesServer, groupByItem } from '@/lib/seoul-api';
import { SEOUL_DONGS, SEOUL_GU_LIST, SeoulGu } from '@/lib/seoul-geo';
import { PriceTable } from '@/components/PriceTable';

export async function generateStaticParams() {
  return SEOUL_GU_LIST.flatMap((gu) =>
    (SEOUL_DONGS[gu] ?? []).map((dong) => ({
      gu: encodeURIComponent(gu),
      dong: encodeURIComponent(dong),
    })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ gu: string; dong: string }>;
}) {
  const { gu, dong } = await params;
  const decodedGu = decodeURIComponent(gu);
  const decodedDong = decodeURIComponent(dong);
  return {
    title: `${decodedGu} ${decodedDong} 생필품 가격 | PriceAlarm`,
    description: `서울 ${decodedGu} ${decodedDong} 전통시장 기준 생필품 평균 가격 정보`,
  };
}

export default async function DongPage({
  params,
}: {
  params: Promise<{ gu: string; dong: string }>;
}) {
  const { gu, dong } = await params;
  const decodedGu = decodeURIComponent(gu) as SeoulGu;
  const decodedDong = decodeURIComponent(dong);

  const dongs = SEOUL_DONGS[decodedGu];
  if (!dongs || !dongs.includes(decodedDong)) notFound();

  const allPrices = await fetchSeoulPricesServer();
  const itemPrices = groupByItem(allPrices, decodedGu);
  const latestDate = allPrices.find((r) => r.gu === decodedGu)?.date;

  const tableItems = Object.entries(itemPrices).map(([item, { price, unit }]) => ({
    item,
    price,
    unit,
  }));

  return (
    <div className="p-4 flex flex-col gap-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-xs text-gray-400 pt-4 flex-wrap">
        <Link href="/" className="hover:text-green-600">서울</Link>
        <ChevronRight className="w-3 h-3" />
        <Link
          href={`/district/${encodeURIComponent(decodedGu)}`}
          className="hover:text-green-600"
        >
          {decodedGu}
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-700 font-semibold">{decodedDong}</span>
      </nav>

      {/* Header */}
      <header>
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-green-600" />
          <h1 className="text-xl font-bold text-gray-900">
            {decodedDong}
            <span className="text-sm font-normal text-gray-400 ml-2">{decodedGu}</span>
          </h1>
        </div>
        <p className="text-gray-400 text-xs mt-1">
          {decodedGu} 전통시장 기준 생필품 평균가 (동 단위 별도 조사 없음)
        </p>
      </header>

      {/* 전 품목 가격 카드 */}
      <section>
        <h2 className="text-sm font-semibold text-gray-600 mb-3">전 품목 평균가</h2>
        <PriceTable
          items={tableItems}
          gu={decodedGu}
          dong={decodedDong}
          dataDate={latestDate}
        />
      </section>
    </div>
  );
}
