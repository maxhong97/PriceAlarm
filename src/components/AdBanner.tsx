'use client';

import { useEffect, useRef } from 'react';

interface AdBannerProps {
  slot: string;
  format?: 'horizontal' | 'rectangle' | 'responsive';
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export function AdBanner({ slot, format = 'responsive', className = '' }: AdBannerProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // AdSense not loaded yet
    }
  }, []);

  const isDev = process.env.NODE_ENV === 'development';

  if (isDev) {
    const heightMap = { horizontal: 'h-[90px]', rectangle: 'h-[250px]', responsive: 'h-[90px] md:h-[100px]' };
    return (
      <div className={`w-full ${heightMap[format]} bg-gray-100 border border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-sm font-medium ${className}`}>
        AD - {format}
      </div>
    );
  }

  return (
    <div ref={adRef} className={`w-full overflow-hidden ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_PUB_ID || ''}
        data-ad-slot={slot}
        data-ad-format={format === 'responsive' ? 'auto' : format === 'horizontal' ? 'horizontal' : 'rectangle'}
        data-full-width-responsive="true"
      />
    </div>
  );
}
