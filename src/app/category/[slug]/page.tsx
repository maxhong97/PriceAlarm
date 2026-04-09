import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { fetchProductsByCategory } from '@/lib/api-server';
import { generateCategoryMetadata } from '@/lib/seo';
import { getCategoryBySlug, CATEGORY_SLUGS, AD_SLOTS, BASE_URL } from '@/lib/constants';
import { WebPageJsonLd } from '@/components/JsonLd';
import { AdBanner } from '@/components/AdBanner';
import { ProductCard } from '@/components/ProductCard';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export async function generateStaticParams() {
  return Object.values(CATEGORY_SLUGS).map((cat) => ({ slug: cat.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = getCategoryBySlug(slug);
  if (!entry) return { title: '카테고리를 찾을 수 없습니다' };
  const [code] = entry;
  const products = await fetchProductsByCategory(code);
  return generateCategoryMetadata(entry[1].name, slug, products.length);
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = getCategoryBySlug(slug);
  if (!entry) notFound();

  const [categoryCode, categoryInfo] = entry;
  const products = await fetchProductsByCategory(categoryCode);

  // Top movers
  const sortedByChange = [...products].sort((a, b) => Math.abs(b.changeRate) - Math.abs(a.changeRate));
  const topMovers = sortedByChange.slice(0, 3);

  return (
    <div className="p-4 flex flex-col gap-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-xs text-gray-400 pt-4">
        <Link href="/" className="hover:text-green-600">홈</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-600 font-medium">{categoryInfo.name}</span>
      </nav>

      <header>
        <h1 className="text-2xl font-bold text-gray-900">{categoryInfo.name}</h1>
        <p className="text-gray-500 text-sm mt-2 leading-relaxed">{categoryInfo.description}</p>
        <p className="text-xs text-gray-400 mt-1">총 {products.length}개 품목</p>
      </header>

      <AdBanner slot={AD_SLOTS.topBanner} format="responsive" />

      {/* Top Movers */}
      {topMovers.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">이번 주 가격 변동 TOP 3</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {topMovers.map((item, idx) => {
              const TrendIcon = item.trend === 'up' ? TrendingUp : item.trend === 'down' ? TrendingDown : Minus;
              const trendColor = item.trend === 'up' ? 'text-red-500' : item.trend === 'down' ? 'text-blue-500' : 'text-gray-500';
              const bgColor = idx === 0 ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-200';

              return (
                <Link key={item.id} href={`/product/${encodeURIComponent(item.rawName)}`}>
                  <Card className={`${bgColor} hover:shadow-md transition-shadow`}>
                    <CardContent className="p-4 text-center">
                      <p className="text-[10px] text-gray-400 mb-1">{idx + 1}위</p>
                      <p className="font-bold text-sm">{item.rawName}</p>
                      <p className={`text-lg font-bold mt-1 flex items-center justify-center gap-1 ${trendColor}`}>
                        <TrendIcon className="w-4 h-4" />
                        {item.trend === 'up' ? '+' : ''}{item.changeRate}%
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{item.currentPrice.toLocaleString()}원</p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Product List with In-feed Ads */}
      <section>
        <h2 className="text-lg font-bold text-gray-900 mb-3">전체 품목</h2>
        <div className="flex flex-col gap-3 pb-8">
          {products.map((product, idx) => (
            <div key={product.id}>
              <ProductCard product={product} />
              {(idx + 1) % 4 === 0 && idx < products.length - 1 && (
                <div className="my-3">
                  <AdBanner slot={AD_SLOTS.inFeed} format="responsive" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <AdBanner slot={AD_SLOTS.bottomBanner} format="responsive" />

      <WebPageJsonLd
        name={`${categoryInfo.name} 시세`}
        description={categoryInfo.description}
        url={`${BASE_URL}/category/${slug}`}
      />
    </div>
  );
}
