'use client';

import { useState, useEffect } from 'react';
import { AgriProduct } from '@/lib/mockData';
import { fetchAgriProducts } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Search, TrendingUp, TrendingDown, Minus, Loader2, HelpCircle, ExternalLink, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('전체');

  useEffect(() => {
    async function load() {
      const data = await fetchAgriProducts();
      setProducts(data);
      setLoading(false);
    }
    load();
  }, []);

  const categories = ['전체', ...Array.from(new Set(products.map(p => p.categoryName)))];

  const filtered = products.filter(p => {
    const matchesQuery = p.name.includes(query) || p.categoryName.includes(query);
    const matchesCategory = selectedCategory === '전체' || p.categoryName === selectedCategory;
    return matchesQuery && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="p-4 flex flex-col gap-6">
      <header className="pt-4">
        <h1 className="text-2xl font-bold text-gray-900">농산물 검색</h1>
        <p className="text-gray-500 text-sm mt-1">KAMIS의 모든 실시간 품목({products.length}개)을 확인하세요</p>
      </header>

      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input 
            className="pl-10 h-12 bg-white rounded-xl shadow-sm border-gray-200"
            placeholder="농산물 이름 검색 (예: 감자, 한우, 고등어)" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-colors ${
                selectedCategory === cat 
                ? 'bg-green-600 text-white border-green-600' 
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 pb-8">
        <div className="flex justify-between items-center px-1">
          <span className="text-xs text-gray-500 font-medium">검색 결과 {filtered.length}건</span>
        </div>
        
        {filtered.length > 0 ? filtered.map(item => (
          <Card key={item.id} className="border-gray-100 shadow-sm overflow-hidden">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-lg">{item.name}</h3>
                  <div className="flex gap-1.5 mt-1">
                    <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                      {item.categoryName}
                    </span>
                    {item.predictCategory !== 'general' && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-md ${
                        item.predictCategory === 'greenhouse' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'
                      }`}>
                        {item.predictCategory === 'greenhouse' ? '시설원예' : '운송비민감'}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                  <div className="text-xl font-bold">{item.currentPrice.toLocaleString()}원</div>
                  {item.minPrice && item.maxPrice && (
                    <div className="text-[10px] text-gray-400 font-medium">시장 {item.minPrice.toLocaleString()}~{item.maxPrice.toLocaleString()}원</div>
                  )}
                  <div className={`text-xs flex items-center justify-end gap-1 font-bold ${
                    item.trend === 'up' ? 'text-red-500' : 
                    item.trend === 'down' ? 'text-blue-500' : 'text-gray-500'
                  }`}>
                    {item.trend === 'up' && <TrendingUp className="w-3 h-3" />}
                    {item.trend === 'down' && <TrendingDown className="w-3 h-3" />}
                    {item.trend === 'stable' && <Minus className="w-3 h-3" />}
                    {Math.abs(item.changeRate)}% (전주 대비)
                  </div>
                </div>
              </div>
              
              <div className="mt-2 p-2 bg-blue-50/50 rounded-lg flex flex-col gap-2 border border-blue-100/50">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] font-bold text-blue-700">🛒 온라인 예상 구매가</span>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="w-3 h-3 text-blue-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[200px] text-[11px] bg-gray-900 text-white p-2 rounded shadow-xl">
                        전국 최저 소매가 데이터를 기반으로 온라인 유통 마진을 역산한 추정 가격입니다.
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <span className="text-sm font-black text-blue-800">{Math.round((item.minPrice || item.currentPrice) * 0.9).toLocaleString()}원~</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full h-8 text-[11px] font-bold text-blue-600 bg-white hover:bg-blue-100 border border-blue-200"
                  onClick={() => window.open(`https://www.coupang.com/np/search?q=${encodeURIComponent(item.name.split(' ')[0])}`, '_blank')}
                >
                  쿠팡에서 실제 최저가 확인하기 <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-50 flex justify-between items-end">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-500 font-medium">단위: {item.unit}</span>
                  {item.source && <span className="text-[10px] text-gray-400">출처: {item.source}</span>}
                </div>
                <Badge variant="outline" className="text-xs border-gray-200 bg-gray-50 text-gray-600">실시간 데이터</Badge>
              </div>
            </CardContent>
          </Card>
        )) : (
          <div className="text-center py-10 text-gray-500">
            검색 결과가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
