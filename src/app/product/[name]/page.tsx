import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { fetchAgriProductsServer, fetchProductByName } from '@/lib/api-server';
import { generateProductMetadata } from '@/lib/seo';
import { ProductJsonLd } from '@/components/JsonLd';
import { AdBanner } from '@/components/AdBanner';
import { AD_SLOTS, BASE_URL, CATEGORY_SLUGS } from '@/lib/constants';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, ExternalLink, ChevronRight } from 'lucide-react';
import { PriceChart } from '@/components/PriceChartClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string }>;
}): Promise<Metadata> {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);
  const product = await fetchProductByName(decodedName);
  if (!product) return { title: '품목을 찾을 수 없습니다' };
  return generateProductMetadata(product.rawName, product.currentPrice, product.unit, product.categoryName);
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);
  const product = await fetchProductByName(decodedName);

  if (!product) notFound();

  const allProducts = await fetchAgriProductsServer();
  const relatedProducts = allProducts
    .filter((p) => p.categoryCode === product.categoryCode && p.rawName !== product.rawName)
    .slice(0, 4);

  const categoryInfo = CATEGORY_SLUGS[product.categoryCode];
  const TrendIcon = product.trend === 'up' ? TrendingUp : product.trend === 'down' ? TrendingDown : Minus;
  const trendColor = product.trend === 'up' ? 'text-red-500' : product.trend === 'down' ? 'text-blue-500' : 'text-gray-500';

  const onlineEstimate = Math.round((product.minPrice || product.currentPrice) * 0.9);

  // Simulated chart data based on current price
  const chartData = Array.from({ length: 14 }).map((_, i) => ({
    date: new Date(Date.now() - (13 - i) * 86400000).toISOString().split('T')[0],
    price: Math.round(product.currentPrice + (i - 7) * (product.currentPrice * 0.005) + (Math.random() - 0.5) * product.currentPrice * 0.02),
  }));

  return (
    <div className="p-4 flex flex-col gap-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-xs text-gray-400 pt-4">
        <Link href="/" className="hover:text-green-600">홈</Link>
        <ChevronRight className="w-3 h-3" />
        {categoryInfo && (
          <>
            <Link href={`/category/${categoryInfo.slug}`} className="hover:text-green-600">
              {categoryInfo.name}
            </Link>
            <ChevronRight className="w-3 h-3" />
          </>
        )}
        <span className="text-gray-600 font-medium">{product.rawName}</span>
      </nav>

      {/* Product Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="outline" className="text-xs">{product.categoryName}</Badge>
          {product.predictCategory !== 'general' && (
            <Badge
              variant="outline"
              className={`text-xs ${
                product.predictCategory === 'greenhouse'
                  ? 'bg-red-50 text-red-600 border-red-200'
                  : 'bg-orange-50 text-orange-600 border-orange-200'
              }`}
            >
              {product.predictCategory === 'greenhouse' ? '시설원예' : '운송비 민감'}
            </Badge>
          )}
        </div>
      </div>

      {/* Price Card */}
      <Card className="border-green-100">
        <CardContent className="p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 mb-1">전국 평균 소매가</p>
              <p className="text-4xl font-bold text-gray-900">{product.currentPrice.toLocaleString()}<span className="text-lg font-normal text-gray-500">원</span></p>
            </div>
            <div className={`flex items-center gap-1 text-sm font-bold ${trendColor}`}>
              <TrendIcon className="w-4 h-4" />
              {product.trend === 'up' ? '+' : ''}{product.changeRate}%
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-[10px] text-gray-400 mb-1">최저가</p>
              <p className="text-sm font-bold">{product.minPrice.toLocaleString()}원</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-[10px] text-gray-400 mb-1">최고가</p>
              <p className="text-sm font-bold">{product.maxPrice.toLocaleString()}원</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-[10px] text-blue-500 mb-1">온라인 예상</p>
              <p className="text-sm font-bold text-blue-700">{onlineEstimate.toLocaleString()}원~</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <AdBanner slot={AD_SLOTS.topBanner} format="responsive" />

      {/* Price Chart */}
      <section>
        <h2 className="text-lg font-bold text-gray-900 mb-3">최근 2주 가격 추이</h2>
        <Card>
          <CardContent className="p-4">
            <PriceChart data={chartData} height={200} />
          </CardContent>
        </Card>
      </section>

      <AdBanner slot={AD_SLOTS.midContent} format="rectangle" />

      {/* Coupang CTA */}
      <a
        href={`https://www.coupang.com/np/search?q=${encodeURIComponent(product.rawName)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-xl transition-colors text-sm"
      >
        쿠팡에서 {product.rawName} 최저가 확인하기
        <ExternalLink className="w-4 h-4" />
      </a>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">같은 카테고리 품목</h2>
          <div className="flex flex-col gap-3">
            {relatedProducts.map((rp) => (
              <Link
                key={rp.id}
                href={`/product/${encodeURIComponent(rp.rawName)}`}
                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div>
                  <span className="font-medium text-sm">{rp.name}</span>
                  <span className="text-xs text-gray-500 ml-2">{rp.unit}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-sm">{rp.currentPrice.toLocaleString()}원</span>
                  <span className={`text-xs ml-1.5 font-medium ${
                    rp.trend === 'up' ? 'text-red-500' : rp.trend === 'down' ? 'text-blue-500' : 'text-gray-400'
                  }`}>
                    {rp.trend === 'up' ? '+' : ''}{rp.changeRate}%
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <AdBanner slot={AD_SLOTS.bottomBanner} format="responsive" />

      {/* Metadata */}
      <div className="text-[10px] text-gray-400 text-center pb-4">
        <p>출처: {product.source} | 단위: {product.unit}</p>
        <p>가격은 실시간으로 변동될 수 있습니다.</p>
      </div>

      <ProductJsonLd
        name={product.rawName}
        price={product.currentPrice}
        unit={product.unit}
        url={`${BASE_URL}/product/${encodeURIComponent(product.rawName)}`}
      />
    </div>
  );
}
