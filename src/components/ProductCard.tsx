'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Minus, HelpCircle, ExternalLink } from 'lucide-react';

interface ProductCardProps {
  product: {
    rawName: string;
    name: string;
    categoryName?: string;
    predictCategory?: string;
    currentPrice: number;
    minPrice?: number;
    maxPrice?: number;
    unit: string;
    trend: 'up' | 'down' | 'stable';
    changeRate: number;
    source?: string;
  };
  showCoupangLink?: boolean;
  compact?: boolean;
}

export function ProductCard({ product, showCoupangLink = true, compact = false }: ProductCardProps) {
  const TrendIcon = product.trend === 'up' ? TrendingUp : product.trend === 'down' ? TrendingDown : Minus;
  const trendColor = product.trend === 'up' ? 'text-red-500' : product.trend === 'down' ? 'text-blue-500' : 'text-gray-500';

  return (
    <Card className="border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className={compact ? 'p-3' : 'p-4'}>
        <div className="flex justify-between items-start mb-2">
          <div>
            <Link
              href={`/product/${encodeURIComponent(product.rawName)}`}
              className="font-semibold text-lg hover:text-green-700 transition-colors"
            >
              {product.name}
            </Link>
            <div className="flex gap-1.5 mt-1">
              {product.categoryName && (
                <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                  {product.categoryName}
                </span>
              )}
              {product.predictCategory && product.predictCategory !== 'general' && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-md ${
                    product.predictCategory === 'greenhouse' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'
                  }`}
                >
                  {product.predictCategory === 'greenhouse' ? '시설원예' : '운송비민감'}
                </span>
              )}
            </div>
          </div>
          <div className="text-right flex flex-col items-end gap-1">
            <div className="text-xl font-bold">{product.currentPrice.toLocaleString()}원</div>
            {product.minPrice != null && product.maxPrice != null && (
              <div className="text-[10px] text-gray-400 font-medium">
                시장 {product.minPrice.toLocaleString()}~{product.maxPrice.toLocaleString()}원
              </div>
            )}
            <div className={`text-xs flex items-center justify-end gap-1 font-bold ${trendColor}`}>
              <TrendIcon className="w-3 h-3" />
              {Math.abs(product.changeRate)}% (전주 대비)
            </div>
          </div>
        </div>

        {showCoupangLink && (
          <div className="mt-2 p-2 bg-blue-50/50 rounded-lg flex flex-col gap-2 border border-blue-100/50">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-bold text-blue-700">온라인 예상가</span>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="w-3 h-3 text-blue-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[200px] text-[11px] bg-gray-900 text-white p-2 rounded shadow-xl">
                    전국 최저 소매가 데이터를 기반으로 온라인 유통 마진을 역산한 추정 가격입니다.
                  </TooltipContent>
                </Tooltip>
              </div>
              <span className="text-sm font-black text-blue-800">
                {Math.round((product.minPrice || product.currentPrice) * 0.9).toLocaleString()}원~
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full h-8 text-[11px] font-bold text-blue-600 bg-white hover:bg-blue-100 border border-blue-200"
              onClick={() =>
                window.open(
                  `https://www.coupang.com/np/search?q=${encodeURIComponent(product.rawName || product.name.split(' ')[0])}`,
                  '_blank',
                )
              }
            >
              쿠팡에서 최저가 확인 <ExternalLink className="w-3 h-3 ml-1" />
            </Button>
          </div>
        )}

        {!compact && (
          <div className="mt-3 pt-3 border-t border-gray-50 flex justify-between items-end">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-500 font-medium">단위: {product.unit}</span>
              {product.source && <span className="text-[10px] text-gray-400">출처: {product.source}</span>}
            </div>
            <Badge variant="outline" className="text-xs border-gray-200 bg-gray-50 text-gray-600">
              실시간 데이터
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
