import { NextResponse } from 'next/server';
import {
  getSpots,
  getPrices,
  getConfig,
  getCommodities,
  getAgents,
  getLottery,
  getSpreads,
  getExchangeRates,
} from '@/lib/eacc-data';
import type { SpotWithPrice, DashboardData } from '@/lib/types';

export async function GET() {
  try {
    // Fetch all data in parallel
    const [spots, prices, config, commodities, agents, lottery, spreads, exchangeRates] =
      await Promise.all([
        getSpots(),
        getPrices(),
        getConfig(),
        getCommodities(),
        getAgents(),
        getLottery(),
        getSpreads(),
        getExchangeRates(),
      ]);

    // Join prices onto spots
    const spotsWithPrices: SpotWithPrice[] = spots.map((spot) => {
      const price = prices.find((p) => p.spot_id === spot.id);
      return {
        ...spot,
        price,
      };
    });

    // Compute Kigali averages (RW spots with prices)
    const rwSpotsWithPrices = spotsWithPrices.filter(
      (s) => s.country === 'RW' && s.price
    );

    const kigali_avg_maize =
      rwSpotsWithPrices.length > 0
        ? Math.round(
            rwSpotsWithPrices.reduce((sum, s) => sum + (s.price?.maize_rwf || 0), 0) /
              rwSpotsWithPrices.filter((s) => s.price?.maize_rwf).length || 1
          )
        : 0;

    const kigali_avg_beans =
      rwSpotsWithPrices.length > 0
        ? Math.round(
            rwSpotsWithPrices.reduce((sum, s) => sum + (s.price?.beans_rwf || 0), 0) /
              rwSpotsWithPrices.filter((s) => s.price?.beans_rwf).length || 1
          )
        : 0;

    const kigali_avg_soya =
      rwSpotsWithPrices.length > 0
        ? Math.round(
            rwSpotsWithPrices.reduce((sum, s) => sum + (s.price?.soya_rwf || 0), 0) /
              rwSpotsWithPrices.filter((s) => s.price?.soya_rwf).length || 1
          )
        : 0;

    const kigali_avg_rice =
      rwSpotsWithPrices.length > 0
        ? Math.round(
            rwSpotsWithPrices.reduce((sum, s) => sum + (s.price?.rice_rwf || 0), 0) /
              rwSpotsWithPrices.filter((s) => s.price?.rice_rwf).length || 1
          )
        : 0;

    // Count active agents
    const active_agents = agents.filter((a) => a.active).length;

    // Check if gold is active this week
    const gold_active_this_week = spotsWithPrices.some(
      (s) => s.price?.gold_usd && s.price.gold_usd > 0
    );

    const data: DashboardData & { spreads: typeof spreads; exchangeRates: typeof exchangeRates } = {
      spots: spotsWithPrices,
      config,
      commodities,
      agents,
      lottery,
      spreads,
      exchangeRates,
      kigali_avg_maize,
      kigali_avg_beans,
      kigali_avg_soya,
      kigali_avg_rice,
      active_agents,
      gold_active_this_week,
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
