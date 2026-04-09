export interface AgriProduct {
  id: string;
  name: string;
  category: 'greenhouse' | 'transport-heavy' | 'general';
  currentPrice: number;
  minPrice?: number;
  maxPrice?: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  changeRate: number; // percentage
  expectedNextWeek: 'up' | 'down' | 'stable';
  source?: string;
}
