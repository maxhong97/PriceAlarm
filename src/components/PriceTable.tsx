import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const ITEM_ICONS: Record<string, string> = {
  배추: '🥬', 무: '🫚', 양파: '🧅', 오이: '🥒', 상추: '🥗',
  애호박: '🥦', 호박: '🎃', 사과: '🍎', 배: '🍐', 달걀: '🥚',
  닭고기: '🍗', 삼겹살: '🥩', 쇠고기: '🥩', 고등어: '🐟',
  갈치: '🐠', 오징어: '🦑',
};

interface PriceItem {
  item: string;
  price: number;
  unit: string;
  prevPrice?: number; // 전주 가격 (optional)
}

interface Props {
  items: PriceItem[];
  gu: string;
  dong?: string;
  dataDate?: string;
}

export function PriceTable({ items, gu, dong, dataDate }: Props) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
        <span className="text-4xl">📭</span>
        <p className="text-sm">데이터가 없습니다.</p>
        <p className="text-xs text-gray-300">서울 OpenAPI 키를 확인해주세요.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {items.map(({ item, price, unit, prevPrice }) => {
          const diff = prevPrice != null ? price - prevPrice : null;
          const pct = prevPrice && prevPrice > 0 ? ((price - prevPrice) / prevPrice) * 100 : null;
          const trend = diff == null ? null : diff > 0 ? 'up' : diff < 0 ? 'down' : 'stable';

          return (
            <div
              key={item}
              className="flex flex-col gap-2 p-4 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">{ITEM_ICONS[item] ?? '🛒'}</span>
                <span className="text-sm font-bold text-gray-800">{item}</span>
              </div>
              <div>
                <span className="text-xl font-black text-gray-900">
                  {price.toLocaleString()}
                </span>
                <span className="text-xs text-gray-400 ml-1">원/{unit}</span>
              </div>
              {trend && pct != null && (
                <div
                  className={`flex items-center gap-0.5 text-xs font-semibold ${
                    trend === 'up'
                      ? 'text-red-500'
                      : trend === 'down'
                        ? 'text-blue-500'
                        : 'text-gray-400'
                  }`}
                >
                  {trend === 'up' ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : trend === 'down' ? (
                    <TrendingDown className="w-3 h-3" />
                  ) : (
                    <Minus className="w-3 h-3" />
                  )}
                  {trend === 'up' ? '+' : ''}
                  {pct.toFixed(1)}% 전주 대비
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-gray-400 text-center mt-2">
        출처: {gu} 전통시장 기준{dong ? ` (${dong} 소속)` : ''} | 서울시 생필품 가격 정보
        {dataDate && ` | 조사일: ${dataDate.slice(0, 4)}-${dataDate.slice(4, 6)}-${dataDate.slice(6, 8)}`}
      </p>
    </div>
  );
}
