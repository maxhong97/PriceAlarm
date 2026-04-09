'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Map, Search, Bell } from 'lucide-react';

const navItems = [
  { href: '/', icon: Map, label: '지도' },
  { href: '/search', icon: Search, label: '검색' },
  { href: '/alerts', icon: Bell, label: '알림' },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile: Bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg bg-white border-t border-gray-200 flex justify-around items-center py-3 z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        {navItems.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-1 ${
              pathname === href ? 'text-green-600' : 'text-gray-400'
            }`}
          >
            <Icon className="w-6 h-6" />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        ))}
      </nav>

      {/* Desktop: Top horizontal bar */}
      <nav className="hidden md:flex items-center gap-1 px-4 py-3 border-b border-gray-100 bg-white sticky top-0 z-50">
        <Link href="/" className="font-bold text-green-600 text-lg mr-6">
          PriceAlarm
        </Link>
        {navItems.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              pathname === href
                ? 'text-green-700 bg-green-50'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        ))}
      </nav>
    </>
  );
}
