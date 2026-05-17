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

// ============ PRICE FLUCTUATION & FALLBACK SYSTEM ============

interface PriceFallback {
  source_spot: string;
  target_spot: string;
  min_pct: number;
  max_pct: number;
}

// Get price fallback rules from sheet
export async function getPriceFallbacks(): Promise<PriceFallback[]> {
  try {
    const rows = await getSheetTab('price_fallbacks');
    return rows.map((row) => ({
      source_spot: row.source_spot || '',
      target_spot: row.target_spot || '',
      min_pct: parseNum(row.min_pct),
      max_pct: parseNum(row.max_pct),
    }));
  } catch {
    return [];
  }
}

// Seeded random for consistent fluctuations within time window
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Get fluctuation seed based on configurable time windows
function getFluctuationSeed(spotId: string, commodityId: string, intervalSeconds: number): number {
  const now = Date.now();
  const interval = intervalSeconds * 1000;
  const timeWindow = Math.floor(now / interval);

  // Create unique seed from time + spot + commodity
  let hash = timeWindow;
  for (let i = 0; i < spotId.length; i++) {
    hash = ((hash << 5) - hash) + spotId.charCodeAt(i);
  }
  for (let i = 0; i < commodityId.length; i++) {
    hash = ((hash << 5) - hash) + commodityId.charCodeAt(i);
  }
  return hash;
}

// Determine which prices should fluctuate this interval
// Returns true for only 2-3 cities with 1 commodity each
function shouldFluctuate(
  spotId: string,
  commodityId: string,
  allSpots: string[],
  allCommodities: string[],
  intervalSeconds: number
): boolean {
  const now = Date.now();
  const interval = intervalSeconds * 1000;
  const timeWindow = Math.floor(now / interval);

  // Use time window to select which cities change (2-3 cities)
  const numCities = 2 + Math.floor(seededRandom(timeWindow * 11) * 2); // 2-3 cities

  // Select which cities will fluctuate
  const selectedCityIndices: number[] = [];
  for (let i = 0; i < numCities && i < allSpots.length; i++) {
    const idx = Math.floor(seededRandom(timeWindow * 13 + i * 17) * allSpots.length);
    if (!selectedCityIndices.includes(idx)) {
      selectedCityIndices.push(idx);
    }
  }

  const selectedCities = selectedCityIndices.map(i => allSpots[i]);

  // Each selected city gets 1 commodity that fluctuates
  if (!selectedCities.includes(spotId)) {
    return false;
  }

  // Determine which commodity fluctuates for this city
  const cityIndex = allSpots.indexOf(spotId);
  const commoditySeed = timeWindow * 19 + cityIndex * 23;
  const selectedCommodityIdx = Math.floor(seededRandom(commoditySeed) * allCommodities.length);
  const selectedCommodity = allCommodities[selectedCommodityIdx];

  return commodityId === selectedCommodity;
}

// Apply fluctuation to a price (±2% that returns to base)
function applyFluctuation(
  basePrice: number,
  spotId: string,
  commodityId: string,
  fluctuationPct: number,
  intervalSeconds: number
): { price: number; change_pct: number } {
  const seed = getFluctuationSeed(spotId, commodityId, intervalSeconds);
  const random = seededRandom(seed);

  // Convert to range [-fluctuationPct, +fluctuationPct]
  const changePct = (random * 2 - 1) * fluctuationPct;
  const newPrice = Math.round(basePrice * (1 + changePct / 100));

  return {
    price: newPrice,
    change_pct: Math.round(changePct * 100) / 100,
  };
}

// Apply percentage offset to derive price from source
function derivePrice(sourcePrice: number, minPct: number, maxPct: number, seed: number): number {
  const random = seededRandom(seed);
  const pctOffset = minPct + random * (maxPct - minPct);
  return Math.round(sourcePrice * (1 + pctOffset / 100));
}

// Get prices with fluctuations and fallbacks applied
export async function getPricesWithFluctuations(): Promise<Price[]> {
  const [basePrices, config, fallbacks, validCommodityIds, spots] = await Promise.all([
    getPricesLong(),
    getConfig(),
    getPriceFallbacks(),
    getValidCommodityIds(),
    getSpots(),
  ]);

  // Read from sheet config - update these in Google Sheet config tab
  const fluctuationEnabledRaw = config.fluctuation_enabled;
  const fluctuationEnabled = fluctuationEnabledRaw?.toLowerCase() !== 'false';
  const fluctuationPct = parseNum(config.fluctuation_pct) || 4;
  const fluctuationInterval = parseNum(config.fluctuation_interval_sec) || 10;

  // Debug logging
  console.log('[Fluctuation] Config:', {
    raw: fluctuationEnabledRaw,
    enabled: fluctuationEnabled,
    pct: fluctuationPct,
    interval: fluctuationInterval
  });

  // Build price map for lookups
  const priceMap = new Map<string, Price>();
  for (const price of basePrices) {
    const key = `${price.spot_id}:${price.commodity_id}`;
    priceMap.set(key, price);
  }

  const result: Price[] = [];
  const activeSpots = spots.filter(s => s.active).map(s => s.id);

  console.log('[Fluctuation] Active spots:', activeSpots.length, 'Commodities:', validCommodityIds.length);

  // Process each spot and commodity
  for (const spotId of activeSpots) {
    for (const commodityId of validCommodityIds) {
      const key = `${spotId}:${commodityId}`;
      let price = priceMap.get(key);

      // If no price, try to derive from fallback source
      if (!price || price.price === null) {
        const fallback = fallbacks.find(f => f.target_spot === spotId);
        if (fallback) {
          const sourceKey = `${fallback.source_spot}:${commodityId}`;
          const sourcePrice = priceMap.get(sourceKey);

          if (sourcePrice && sourcePrice.price !== null) {
            const seed = getFluctuationSeed(spotId, commodityId, fluctuationInterval);
            const derivedValue = derivePrice(sourcePrice.price, fallback.min_pct, fallback.max_pct, seed);

            price = {
              spot_id: spotId,
              commodity_id: commodityId as CommodityType,
              price: derivedValue,
              currency: sourcePrice.currency,
              change_pct: 0,
              updated_at: new Date().toISOString(),
              reported_by: 'system',
              status: 'live',
            };
          }
        }
      }

      // Apply fluctuation if enabled and price exists
      if (price && price.price !== null && fluctuationEnabled) {
        // Check if this price should fluctuate this interval
        const shouldChange = shouldFluctuate(
          spotId,
          commodityId,
          activeSpots,
          validCommodityIds,
          fluctuationInterval
        );

        if (shouldChange) {
          const { price: fluctuatedPrice, change_pct } = applyFluctuation(
            price.price,
            spotId,
            commodityId,
            fluctuationPct,
            fluctuationInterval
          );

          console.log('[Fluctuation] Applied:', { spotId, commodityId, base: price.price, fluctuated: fluctuatedPrice, change_pct });

          result.push({
            ...price,
            price: fluctuatedPrice,
            change_pct,
          });
        } else {
          // No fluctuation this interval - keep base price
          result.push({
            ...price,
            change_pct: 0,
          });
        }
      } else if (price && price.price !== null) {
        result.push(price);
      }
    }
  }

  return result;
}
