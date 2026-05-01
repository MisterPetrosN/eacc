import { NextResponse } from 'next/server';
import {
  getSpots,
  getLatestPrices,
  getConfig,
  getCommodities,
  getAgents,
  getLottery,
  getSpreads,
  getExchangeRates,
} from '@/lib/eacc-data';
import type { SpotWithPrices, DashboardData, Price } from '@/lib/types';

export async function GET() {
  try {
    // Fetch all data in parallel
    const [spots, priceMap, config, commodities, agents, lottery, spreads, exchangeRates] =
      await Promise.all([
        getSpots(),
        getLatestPrices(),
        getConfig(),
        getCommodities(),
        getAgents(),
        getLottery(),
        getSpreads(),
        getExchangeRates(),
      ]);

    // Convert priceMap to array grouped by spot_id
    const pricesBySpot = new Map<string, Price[]>();
    for (const [, price] of Array.from(priceMap.entries())) {
      const spotPrices = pricesBySpot.get(price.spot_id) || [];
      spotPrices.push(price);
      pricesBySpot.set(price.spot_id, spotPrices);
    }

    // Join prices onto spots (long format: each spot has prices: Price[])
    const spotsWithPrices: SpotWithPrices[] = spots.map((spot) => ({
      ...spot,
      prices: pricesBySpot.get(spot.id) || [],
    }));

    // Get live commodity IDs for computing averages
    const liveCommodityIds = commodities
      .filter((c) => c.status === 'live')
      .map((c) => c.id);

    // Compute Kigali averages dynamically per commodity
    const rwSpotsWithPrices = spotsWithPrices.filter(
      (s) => s.country === 'RW' && s.prices.length > 0
    );

    const kigali_averages: Record<string, number> = {};
    for (const commodityId of liveCommodityIds) {
      const pricesForCommodity = rwSpotsWithPrices
        .flatMap((s) => s.prices)
        .filter((p) => p.commodity_id === commodityId && p.price !== null);

      if (pricesForCommodity.length > 0) {
        const sum = pricesForCommodity.reduce((acc, p) => acc + (p.price || 0), 0);
        kigali_averages[commodityId] = Math.round(sum / pricesForCommodity.length);
      }
    }

    // Count active agents
    const active_agents = agents.filter((a) => a.active).length;

    // Sort commodities by tab_order
    const sortedCommodities = [...commodities].sort((a, b) => a.tab_order - b.tab_order);

    const data: DashboardData & { spreads: typeof spreads; exchangeRates: typeof exchangeRates } = {
      spots: spotsWithPrices,
      config,
      commodities: sortedCommodities,
      agents,
      lottery,
      spreads,
      exchangeRates,
      kigali_averages,
      active_agents,
    };

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'max-age=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
