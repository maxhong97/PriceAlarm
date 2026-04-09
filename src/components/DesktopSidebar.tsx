'use client';

import Link from 'next/link';
import { AdBanner } from './AdBanner';
import { AD_SLOTS, CATEGORY_SLUGS } from '@/lib/constants';
import { TrendingUp, ChevronRight } from 'lucide-react';

interface TrendingProduct {
  rawName: string;
  name: string;
  changeRate: number;
  trend: 'up' | 'down' | 'stable';
}

export function DesktopSidebar({ trending = [] }: { trending?: TrendingProduct[] }) {
  return (
    <aside className="hidden md:flex flex-col gap-6 sticky top-6 self-start">
      <AdBanner slot={AD_SLOTS.sidebar} format="rectangle" />

      {trending.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-bold text-sm text-gray-900 flex items-center gap-1.5 mb-3">
            <TrendingUp className="w-4 h-4 text-green-600" />
            실시간 가격 변동
          </h3>
          <ul className="flex flex-col gap-2">
            {trending.slice(0, 5).map((item) => (
              <li key={item.rawName}>
                <Link
                  href={`/product/${encodeURIComponent(item.rawName)}`}
                  className="flex justify-between items-center py-1.5 px-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm text-gray-700">{item.rawName}</span>
                  <span
                    className={`text-xs font-bold ${
                      item.trend === 'up' ? 'text-red-500' : item.trend === 'down' ? 'text-blue-500' : 'text-gray-400'
                    }`}
                  >
                    {item.trend === 'up' ? '+' : ''}{item.changeRate}%
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="font-bold text-sm text-gray-900 mb-3">카테고리</h3>
        <ul className="flex flex-col gap-1">
          {Object.values(CATEGORY_SLUGS).map((cat) => (
            <li key={cat.slug}>
              <Link
                href={`/category/${cat.slug}`}
                className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-600 hover:text-gray-900"
              >
                {cat.name}
                <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
