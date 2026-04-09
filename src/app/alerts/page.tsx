'use client';

import { useState, useEffect } from 'react';
import { AgriProduct } from '@/lib/mockData';
import { fetchAgriProducts } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Bell, BellOff, Info, Loader2 } from 'lucide-react';

export default function AlertsPage() {
  const [subscribedIds, setSubscribedIds] = useState<string[]>([]);
  const [products, setProducts] = useState<AgriProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    async function load() {
      const data = await fetchAgriProducts();
      setProducts(data);
      const saved = localStorage.getItem('priceAlarm_subscriptions');
      if (saved) {
        setSubscribedIds(JSON.parse(saved));
      }
      setLoading(false);
    }
    load();
  }, []);

  const toggleSubscription = (id: string) => {
    const newSubscribed = subscribedIds.includes(id)
      ? subscribedIds.filter(subId => subId !== id)
      : [...subscribedIds, id];
    
    setSubscribedIds(newSubscribed);
    localStorage.setItem('priceAlarm_subscriptions', JSON.stringify(newSubscribed));
  };

  if (!isMounted || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="p-4 flex flex-col gap-6">
      <header className="pt-4">
        <h1 className="text-2xl font-bold text-gray-900">알림 설정</h1>
        <p className="text-gray-500 text-sm mt-1">관심 품목의 가격 변동 알림을 받으세요</p>
      </header>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 text-blue-800 text-sm">
        <Info className="w-5 h-5 shrink-0 text-blue-500" />
        <p>구독한 품목의 가격 상승/하락이 예상될 때 푸시 알림을 보내드립니다.</p>
      </div>

      <div className="flex flex-col gap-3 pb-8">
        <h2 className="font-semibold text-gray-700 mt-2 mb-1">관심 농산물 구독</h2>
        {products.slice(0, 15).map(item => { // Show first 15 products
          const isSubscribed = subscribedIds.includes(item.id);
          
          return (
            <Card key={item.id} className={`border ${isSubscribed ? 'border-green-200 bg-green-50/30' : 'border-gray-100'}`}>
              <CardContent className="p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${isSubscribed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                    {isSubscribed ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{item.name}</h3>
                    <p className="text-xs text-gray-500">{item.category === 'greenhouse' ? '시설원예' : item.category === 'transport-heavy' ? '운송비 민감' : '일반'}</p>
                  </div>
                </div>
                <Switch 
                  checked={isSubscribed}
                  onCheckedChange={() => toggleSubscription(item.id)}
                  className="data-[state=checked]:bg-green-500"
                />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
