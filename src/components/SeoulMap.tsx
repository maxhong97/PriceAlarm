'use client';

import { useEffect, useState, useCallback } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { scaleSequential } from 'd3-scale';
import { interpolateYlOrRd } from 'd3-scale-chromatic';
import { getGuName, SEOUL_GEO_JSON_URL } from '@/lib/seoul-geo';

interface Props {
  priceData: Record<string, number>;
  selectedItem: string;
  onGuClick: (gu: string) => void;
}

export function SeoulMap({ priceData, selectedItem, onGuClick }: Props) {
  const [tooltip, setTooltip] = useState<{ name: string; price: number | null; x: number; y: number } | null>(null);
  const [geoData, setGeoData] = useState<object | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    fetch(SEOUL_GEO_JSON_URL)
      .then((r) => {
        if (!r.ok) throw new Error('GeoJSON fetch failed');
        return r.json();
      })
      .then(setGeoData)
      .catch(() => setLoadError(true));
  }, []);

  const prices = Object.values(priceData).filter((p) => p > 0);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 1;

  const colorScale = scaleSequential(interpolateYlOrRd).domain([minPrice, maxPrice]);

  const getColor = useCallback(
    (gu: string) => {
      const price = priceData[gu];
      if (!price) return '#e5e7eb';
      return colorScale(price);
    },
    [priceData, colorScale],
  );

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-[400px] text-gray-400 text-sm">
        지도를 불러오지 못했습니다.
      </div>
    );
  }

  if (!geoData) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative w-full select-none">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 65000, center: [126.986, 37.565] }}
        width={600}
        height={420}
        style={{ width: '100%', height: 'auto' }}
      >
        <Geographies geography={geoData}>
          {({ geographies }: { geographies: Array<{ rsmKey: string; properties: Record<string, unknown>; geometry: object }> }) =>
            geographies.map((geo) => {
              const guName = getGuName(geo.properties);
              const price = priceData[guName];
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={getColor(guName)}
                  stroke="#ffffff"
                  strokeWidth={0.8}
                  style={{
                    default: { outline: 'none', cursor: 'pointer', transition: 'fill 0.2s' },
                    hover: { outline: 'none', filter: 'brightness(0.85)' },
                    pressed: { outline: 'none' },
                  }}
                  onClick={() => guName && onGuClick(guName)}
                  onMouseEnter={(e: React.MouseEvent<SVGPathElement>) => {
                    const rect = (e.target as SVGElement)
                      .closest('svg')
                      ?.getBoundingClientRect();
                    setTooltip({
                      name: guName,
                      price: price ?? null,
                      x: e.clientX - (rect?.left ?? 0),
                      y: e.clientY - (rect?.top ?? 0),
                    });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="pointer-events-none absolute bg-gray-900 text-white text-xs px-2.5 py-1.5 rounded-lg shadow-xl z-10 whitespace-nowrap"
          style={{ left: tooltip.x + 8, top: tooltip.y - 36 }}
        >
          <span className="font-semibold">{tooltip.name}</span>
          {tooltip.price != null ? (
            <span className="ml-1.5 text-yellow-300">{tooltip.price.toLocaleString()}원</span>
          ) : (
            <span className="ml-1.5 text-gray-400">데이터 없음</span>
          )}
        </div>
      )}

      {/* Legend */}
      {prices.length > 0 && (
        <div className="mt-2 flex items-center gap-2 justify-center text-xs text-gray-500">
          <span>{minPrice.toLocaleString()}원</span>
          <div
            className="h-3 w-32 rounded"
            style={{
              background: `linear-gradient(to right, ${colorScale(minPrice)}, ${colorScale(maxPrice)})`,
            }}
          />
          <span>{maxPrice.toLocaleString()}원</span>
        </div>
      )}

      {prices.length === 0 && (
        <p className="text-center text-xs text-gray-400 mt-2">
          {selectedItem} 가격 데이터를 불러오는 중...
        </p>
      )}
    </div>
  );
}
