import { NextRequest, NextResponse } from 'next/server';
import { getAgents, getPrices, getSpots, getConfig } from '@/lib/eacc-data';
import type { AgentData } from '@/lib/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // id format: spot_id-firstname (e.g., kimironko-patrick)
    const [spotIdFromUrl, agentFirstName] = id.split('-');

    const [agents, prices, spots, config] = await Promise.all([
      getAgents(),
      getPrices(),
      getSpots(),
      getConfig(),
    ]);

    // Find matching agent
    const agent = agents.find(
      (a) =>
        a.spot_id.toLowerCase() === spotIdFromUrl.toLowerCase() &&
        a.name.toLowerCase().startsWith(agentFirstName?.toLowerCase() || '')
    );

    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    // Find agent's spot
    const spot = spots.find((s) => s.id === agent.spot_id);
    if (!spot) {
      return NextResponse.json(
        { error: 'Spot not found' },
        { status: 404 }
      );
    }

    // Get recent reports for this spot
    const spotPrices = prices.filter((p) => p.spot_id === agent.spot_id);

    // Calculate ticket history (simulated for last 4 weeks)
    const ticketHistory = [
      { week: 'Week 1', tickets: Math.max(0, agent.tickets_month - 9) },
      { week: 'Week 2', tickets: 3 },
      { week: 'Week 3', tickets: 3 },
      { week: 'Week 4', tickets: 3 },
    ];

    // Weekly activity (simulated reports per week)
    const reportsPerTicket = parseInt(config.reports_per_ticket || '3', 10);
    const weeklyActivity = [
      Math.floor(Math.random() * 5) + reportsPerTicket,
      Math.floor(Math.random() * 5) + reportsPerTicket,
      Math.floor(Math.random() * 5) + reportsPerTicket,
      agent.tickets_month * reportsPerTicket / 4,
    ];

    // Calculate leaderboard position
    const sortedAgents = [...agents]
      .filter((a) => a.active)
      .sort((a, b) => b.tickets_month - a.tickets_month);
    const leaderboardPosition = sortedAgents.findIndex((a) => a.name === agent.name) + 1;

    const data: AgentData = {
      agent,
      spot,
      recentReports: spotPrices.slice(0, 30),
      ticketHistory,
      leaderboardPosition,
      totalAgents: sortedAgents.length,
      weeklyActivity: weeklyActivity.map(Math.round),
    };

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'max-age=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('Agent API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agent data' },
      { status: 500 }
    );
  }
}
