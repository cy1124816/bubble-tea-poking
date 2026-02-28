export interface TeaRecord {
  id: string;
  brand: string;
  name: string;
  sugar: string; // e.g., "30%", "Regular", "Zero"
  ice: string;   // e.g., "None", "Less", "Regular"
  price: number;
  rating: number; // 1-5
  remark: string;
  timestamp: number;
  imageUrl?: string; // base64 or url
  tags?: string[]; // Toppings or custom tags
}

export type Screen = 'calendar' | 'record' | 'stats' | 'library';

export interface BrandStat {
  name: string;
  count: number;
  avgRating: number;
}

export interface DayStat {
  date: string;
  count: number;
}