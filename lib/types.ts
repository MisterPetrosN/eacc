// Type definitions for EACC Google Sheets data

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

export interface PriceRow {
  spot_id: string;
  maize_rwf: number | null;
  beans_rwf: number | null;
  soya_rwf: number | null;
  rice_rwf: number | null;
  palm_oil_rwf: number | null;
  gold_usd: number | null;
  updated_at: string | null;
  reported_by: string;
  change_pct: number;
  status: 'live' | 'pending' | 'stale';
}

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

// Joined data types
export interface SpotWithPrice extends SpotRow {
  price?: PriceRow;
}

// Dashboard API response
export interface DashboardData {
  spots: SpotWithPrice[];
  config: Record<string, string>;
  commodities: CommodityRow[];
  agents: AgentRow[];
  lottery: LotteryRow[];
  kigali_avg_maize: number;
  kigali_avg_beans: number;
  kigali_avg_soya: number;
  kigali_avg_rice: number;
  active_agents: number;
  gold_active_this_week: boolean;
}

// Agent API response
export interface AgentData {
  agent: AgentRow;
  spot: SpotRow;
  recentReports: PriceRow[];
  ticketHistory: { week: string; tickets: number; prize?: number }[];
  leaderboardPosition: number;
  totalAgents: number;
  weeklyActivity: number[];
}

// Commodity type for price access
export type CommodityType = 'maize' | 'beans' | 'soya' | 'rice' | 'palm_oil' | 'gold';
