import { getSheetTab, getExchangeRates } from './sheets';
import type {
  SpotRow,
  PriceRow,
  CommodityRow,
  AgentRow,
  LotteryRow,
  SpreadRow,
} from './types';

// Helper to parse boolean values from sheet
function parseBool(value: string): boolean {
  return value?.toLowerCase() === 'true' || value === '1' || value?.toLowerCase() === 'yes';
}

// Helper to parse numbers
function parseNum(value: string): number {
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num;
}

// Helper to parse nullable numbers
function parseNumOrNull(value: string): number | null {
  if (!value || value === '' || value === 'null') return null;
  const num = parseFloat(value);
  return isNaN(num) ? null : num;
}

export async function getSpots(): Promise<SpotRow[]> {
  const rows = await getSheetTab('spots');
  return rows.map((row) => ({
    id: row.id || '',
    name: row.name || '',
    country: row.country || 'RW',
    region: row.region || '',
    flag: row.flag || '🇷🇼',
    priority: parseBool(row.priority),
    active: parseBool(row.active),
    lat: row.lat || '',
    lng: row.lng || '',
    notes: row.notes || '',
  }));
}

export async function getPrices(): Promise<PriceRow[]> {
  const rows = await getSheetTab('prices');
  return rows.map((row) => ({
    spot_id: row.spot_id || '',
    maize_rwf: parseNumOrNull(row.maize_rwf),
    beans_rwf: parseNumOrNull(row.beans_rwf),
    soya_rwf: parseNumOrNull(row.soya_rwf),
    rice_rwf: parseNumOrNull(row.rice_rwf),
    palm_oil_rwf: parseNumOrNull(row.palm_oil_rwf),
    gold_usd: parseNumOrNull(row.gold_usd),
    updated_at: row.updated_at || null,
    reported_by: row.reported_by || '',
    change_pct: parseNum(row.change_pct),
    status: (row.status as 'live' | 'pending' | 'stale') || 'pending',
  }));
}

export async function getConfig(): Promise<Record<string, string>> {
  const rows = await getSheetTab('config');
  const config: Record<string, string> = {};
  rows.forEach((row) => {
    if (row.key) {
      config[row.key] = row.value || '';
    }
  });
  return config;
}

export async function getCommodities(): Promise<CommodityRow[]> {
  const rows = await getSheetTab('commodities');
  return rows.map((row) => ({
    id: row.id || '',
    name: row.name || '',
    icon: row.icon || '🌽',
    status: (row.status as 'live' | 'coming') || 'coming',
    launch_note: row.launch_note || '',
    tab_order: parseNum(row.tab_order),
  }));
}

export async function getAgents(): Promise<AgentRow[]> {
  const rows = await getSheetTab('agents');
  return rows.map((row) => ({
    name: row.name || '',
    phone: row.phone || '',
    spot_id: row.spot_id || '',
    active: parseBool(row.active),
    streak: parseNum(row.streak),
    tickets_month: parseNum(row.tickets_month),
    accuracy_pct: parseNum(row.accuracy_pct),
    notes: row.notes || '',
  }));
}

export async function getLottery(): Promise<LotteryRow[]> {
  const rows = await getSheetTab('lottery');
  return rows.map((row) => ({
    week_start: row.week_start || '',
    winner_name: row.winner_name || '',
    winner_spot: row.winner_spot || '',
    prize_usd: parseNum(row.prize_usd),
    total_entries: parseNum(row.total_entries),
    gold_bonus: parseBool(row.gold_bonus),
    drawn_at: row.drawn_at || null,
    paid_at: row.paid_at || null,
    notes: row.notes || '',
  }));
}

export async function getSpreads(): Promise<SpreadRow[]> {
  const rows = await getSheetTab('spreads');
  return rows.map((row) => ({
    id: row.id || '',
    route_name: row.route_name || '',
    buy_spot_id: row.buy_spot_id || '',
    sell_spot_id: row.sell_spot_id || '',
    freight_default: parseNum(row.freight_default) || 65,
    phyto_default: parseNum(row.phyto_default) || 12,
    customs_default: parseNum(row.customs_default) || 12,
    agent_fee_default: parseNum(row.agent_fee_default) || 10,
    contingency_default: parseNum(row.contingency_default) || 8,
    status: row.status || 'active',
    notes: row.notes || '',
  }));
}

// Re-export exchange rates
export { getExchangeRates };
