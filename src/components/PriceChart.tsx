'use client';

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface PriceChartProps {
  data: { date: string; price: number }[];
  height?: number;
  color?: string;
}

export function PriceChart({ data, height = 200, color = '#16a34a' }: PriceChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center text-gray-400 text-sm" style={{ height }}>
        데이터가 없습니다
      </div>
    );
  }

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis domain={['auto', 'auto']} hide />
          <Tooltip
            contentStyle={{
              borderRadius: '8px',
              fontSize: '12px',
              border: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
            labelFormatter={(label) => `${label}`}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any) => [`${Number(value ?? 0).toLocaleString()}원`, '가격']}
          />
          <Line type="monotone" dataKey="price" stroke={color} strokeWidth={3} dot={false} activeDot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
