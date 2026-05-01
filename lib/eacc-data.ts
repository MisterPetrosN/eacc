import { getSheetTab, getExchangeRates } from './sheets';
import type {
  SpotRow,
  Price,
  PriceKey,
  PriceMap,
  CommodityType,
  Currency,
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

// Valid currencies (static - these don't change often)
const VALID_CURRENCIES: Currency[] = ['RWF', 'UGX', 'CDF', 'TZS', 'USD', 'ETB', 'KES'];

// Dynamic commodity validation - fetches live commodity IDs from the commodities tab
// Cached alongside other sheet reads (60s via getSheetTab)
export async function getValidCommodityIds(): Promise<string[]> {
  const commodities = await getCommodities();
  return commodities
    .filter((c) => c.status === 'live')
    .map((c) => c.id);
}

// New long format - one row per spot+commodity
export async function getPricesLong(): Promise<Price[]> {
  // Fetch prices and valid commodity IDs in parallel
  const [rows, validCommodityIds] = await Promise.all([
    getSheetTab('prices'),
    getValidCommodityIds(),
  ]);

  return rows
    .map((row) => {
      const commodity_id = row.commodity_id;
      const currency = (row.currency || 'RWF') as Currency;

      // Skip invalid rows - validate against dynamic commodity list
      if (!row.spot_id || !validCommodityIds.includes(commodity_id)) {
        return null;
      }

      return {
        spot_id: row.spot_id,
        commodity_id: commodity_id as CommodityType,
        price: parseNumOrNull(row.price),
        currency: VALID_CURRENCIES.includes(currency) ? currency : 'RWF',
        change_pct: parseNumOrNull(row.change_pct),
        updated_at: row.updated_at || null,
        reported_by: row.reported_by || '',
        status: (row.status as 'live' | 'pending' | 'stale') || 'pending',
      };
    })
    .filter((p): p is Price => p !== null);
}

// Get latest price for each spot+commodity combination
export async function getLatestPrices(): Promise<PriceMap> {
  const prices = await getPricesLong();
  const priceMap: PriceMap = new Map();

  // Latest entry wins (assumes sheet is sorted by updated_at ascending)
  for (const price of prices) {
    const key: PriceKey = `${price.spot_id}:${price.commodity_id}`;
    priceMap.set(key, price);
  }

  return priceMap;
}

// Helper to get price for a specific spot and commodity
export function getPriceFromMap(
  priceMap: PriceMap,
  spotId: string,
  commodity: CommodityType
): Price | undefined {
  const key: PriceKey = `${spotId}:${commodity}`;
  return priceMap.get(key);
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
