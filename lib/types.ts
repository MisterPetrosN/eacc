// Type definitions for EACC Google Sheets data

// Commodity type for price access
// Using string to support dynamic commodities from the commodities sheet
export type CommodityType = string;

// Currency type
export type Currency = 'RWF' | 'UGX' | 'CDF' | 'TZS' | 'USD' | 'ETB' | 'KES';

export interface SpotRow {
  id: string;
  name: string;
  country: string; // RW, UG, CD, XB (cross-border)
  region: string;
  flag: string;
  priority: boolean;
  active: boolean;
  lat: string;
  lng: string;
  notes: string;
}


// New long format - one row per spot+commodity
export interface Price {
  spot_id: string;
  commodity_id: CommodityType;
  price: number | null;
  currency: Currency;
  change_pct: number | null;
  updated_at: string | null;
  reported_by: string;
  status: 'live' | 'pending' | 'stale';
}

// Helper type for price lookup key
export type PriceKey = `${string}:${CommodityType}`;

// Map of latest prices by spot_id:commodity_id
export type PriceMap = Map<PriceKey, Price>;

export interface ConfigRow {
  key: string;
  value: string;
}

export interface CommodityRow {
  id: string;
  name: string;
  icon: string;
  status: 'live' | 'coming';
  launch_note: string;
  tab_order: number;
}

export interface AgentRow {
  name: string;
  phone: string;
  spot_id: string;
  active: boolean;
  streak: number;
  tickets_month: number;
  accuracy_pct: number;
  notes: string;
}

export interface LotteryRow {
  week_start: string;
  winner_name: string;
  winner_spot: string;
  prize_usd: number;
  total_entries: number;
  gold_bonus: boolean;
  drawn_at: string | null;
  paid_at: string | null;
  notes: string;
}

export interface SpreadRow {
  id: string;
  route_name: string;
  buy_spot_id: string;
  sell_spot_id: string;
  freight_default: number;
  phyto_default: number;
  customs_default: number;
  agent_fee_default: number;
  contingency_default: number;
  status: string;
  notes: string;
}

// Joined data types - spot with all its prices (long format)
export interface SpotWithPrices extends SpotRow {
  prices: Price[];
}

// Dashboard API response
export interface DashboardData {
  spots: SpotWithPrices[];
  config: Record<string, string>;
  commodities: CommodityRow[];
  agents: AgentRow[];
  lottery: LotteryRow[];
  // Dynamic averages keyed by commodity_id (e.g., { maize: 320, beans: 450 })
  kigali_averages: Record<string, number>;
  active_agents: number;
}

// Agent API response
export interface AgentData {
  agent: AgentRow;
  spot: SpotRow;
  recentReports: Price[];
  ticketHistory: { week: string; tickets: number; prize?: number }[];
  leaderboardPosition: number;
  totalAgents: number;
  weeklyActivity: number[];
}

