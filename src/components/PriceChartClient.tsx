'use client';

import dynamic from 'next/dynamic';

const PriceChart = dynamic(() => import('./PriceChart').then((m) => m.PriceChart), {
  ssr: false,
  loading: () => <div className="h-[200px] bg-gray-50 rounded-lg animate-pulse" />,
});

export { PriceChart };
