'use client';

import { useRouter } from 'next/navigation';

interface Props {
  gu: string;
  dongs: string[];
  representativePrice?: Record<string, number>; // 동 이름 → 대표 가격 (선택)
  selectedItem?: string;
}

export function DongGrid({ gu, dongs, representativePrice, selectedItem }: Props) {
  const router = useRouter();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {dongs.map((dong) => {
        const price = representativePrice?.[dong];
        return (
          <button
            key={dong}
            onClick={() =>
              router.push(`/district/${encodeURIComponent(gu)}/${encodeURIComponent(dong)}`)
            }
            className="flex flex-col items-start gap-1 p-3 rounded-xl border border-gray-100 bg-white hover:border-green-300 hover:shadow-md transition-all text-left group"
          >
            <span className="text-sm font-semibold text-gray-800 group-hover:text-green-700 leading-tight">
              {dong}
            </span>
            {price != null ? (
              <span className="text-xs text-gray-500">
                {selectedItem && <span className="mr-1">{selectedItem}</span>}
                <span className="font-bold text-gray-700">{price.toLocaleString()}원</span>
              </span>
            ) : (
              <span className="text-xs text-gray-400">—</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
