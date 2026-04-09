import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { Nav } from '@/components/Nav';
import { TooltipProvider } from '@/components/ui/tooltip';
import { BASE_URL, ADSENSE_PUB_ID } from '@/lib/constants';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    template: '%s | PriceAlarm - 농산물 유가 알림',
    default: 'PriceAlarm - 농산물 유가 알림 | 오늘의 농산물 시세',
  },
  description: '유가 추이에 따른 한국 농산물 가격 변동 알림 서비스. 실시간 농산물 시세, 가격 비교, 가격 예측까지.',
  keywords: ['농산물 시세', '유가', '농산물 가격', '물가', '장바구니 물가', 'KAMIS'],
  openGraph: {
    locale: 'ko_KR',
    siteName: 'PriceAlarm',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={`${inter.className} pb-16 md:pb-0 min-h-screen bg-gray-50`}>
        <TooltipProvider>
          <div className="max-w-6xl mx-auto min-h-screen md:grid md:grid-cols-[1fr_300px] md:gap-6 md:px-4">
            <main className="max-w-lg md:max-w-none mx-auto md:mx-0 min-h-screen bg-white shadow-xl md:shadow-sm md:rounded-xl md:my-4 relative pb-20 md:pb-6">
              {children}
              <Nav />
            </main>
            <div id="desktop-sidebar-portal" className="hidden md:block" />
          </div>
        </TooltipProvider>
        <Script
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_PUB_ID}`}
          strategy="afterInteractive"
          crossOrigin="anonymous"
        />
      </body>
    </html>
  );
}
