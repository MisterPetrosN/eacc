"use client";

import { useState, useEffect } from "react";
import { Ticket, Sparkles, Check, Clock, Award } from "lucide-react";
import { LotterySkeleton } from "@/components/Skeleton";
import type { AgentRow, LotteryRow, SpotWithPrices } from "@/lib/types";

interface DashboardData {
  agents: AgentRow[];
  spots: SpotWithPrices[];
  lottery: LotteryRow[];
  config: Record<string, string>;
  gold_active_this_week: boolean;
}

export default function LotteryPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/dashboard");
        const dashboardData = await res.json();
        setData(dashboardData);
      } catch (err) {
        console.error("Lottery fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Countdown timer
  useEffect(() => {
    const calculateCountdown = () => {
      const now = new Date();
      const target = new Date();

      // Set to next Sunday 6pm EAT (UTC+3)
      target.setUTCHours(15, 0, 0, 0);
      const daysUntilSunday = (7 - now.getUTCDay()) % 7;
      target.setUTCDate(now.getUTCDate() + (daysUntilSunday || 7));

      if (target <= now) {
        target.setUTCDate(target.getUTCDate() + 7);
      }

      const diff = target.getTime() - now.getTime();
      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      };
    };

    setCountdown(calculateCountdown());
    const interval = setInterval(() => {
      setCountdown(calculateCountdown());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <LotterySkeleton />;
  }

  if (!data) return null;

  const jackpot = parseInt(data.config.weekly_jackpot_usd || "15");
  const goldBonus = data.gold_active_this_week ? 10 : 0;
  const totalPrize = jackpot + goldBonus;

  // Calculate entries for this week
  const agentEntries = data.agents
    .filter((a) => a.active)
    .map((agent) => ({
      ...agent,
      entries: agent.tickets_month,
    }))
    .sort((a, b) => b.entries - a.entries);

  const totalEntries = agentEntries.reduce((sum, a) => sum + a.entries, 0);

  // Gold reporter (if active)
  const goldReporter = data.gold_active_this_week
    ? data.spots.find((s) => {
        const goldPrice = s.prices.find((p) => p.commodity_id === "gold");
        return goldPrice?.price && goldPrice.price > 0;
      })
    : null;
  const goldPrice = goldReporter?.prices.find((p) => p.commodity_id === "gold");

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Prize pool hero */}
      <div className="bg-[var(--amber)] rounded-2xl p-5 text-center">
        <p className="text-[9px] uppercase tracking-widest text-black/50 mb-2">
          This week&apos;s draw
        </p>
        <p className="font-outfit font-black text-[52px] text-[var(--ink)] leading-none price-display">
          ${totalPrize}
        </p>
        {data.gold_active_this_week && (
          <div className="inline-flex items-center gap-1 bg-[var(--green)] px-3 py-1 rounded-full mt-2">
            <Sparkles size={12} className="text-white" />
            <span className="text-[10px] uppercase font-bold text-white">
              Gold Bonus Active +$10
            </span>
          </div>
        )}

        {/* Countdown */}
        <div className="mt-4">
          <p className="text-[10px] text-black/50 mb-2">Draw in</p>
          <div className="flex justify-center gap-3">
            {[
              { value: countdown.days, label: "d" },
              { value: countdown.hours, label: "h" },
              { value: countdown.minutes, label: "m" },
              { value: countdown.seconds, label: "s" },
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <span className="font-outfit font-black text-2xl text-[var(--ink)] mono-nums">
                  {String(item.value).padStart(2, "0")}
                </span>
                <span className="text-sm text-[var(--ink)]">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Entry leaderboard */}
      <div className="bg-white rounded-2xl border border-[var(--border)] p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Ticket size={16} className="text-[var(--green)]" />
            <span className="font-outfit font-bold text-sm text-[var(--ink)]">
              This week&apos;s entries
            </span>
          </div>
          <span className="bg-[var(--surface)] px-2 py-0.5 rounded text-xs font-medium text-[var(--ink3)]">
            {totalEntries} total
          </span>
        </div>

        <div className="space-y-1">
          {agentEntries.slice(0, 15).map((agent, idx) => {
            const spot = data.spots.find((s) => s.id === agent.spot_id);
            const initials = agent.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);
            const probability = totalEntries > 0
              ? ((agent.entries / totalEntries) * 100).toFixed(1)
              : "0";
            const barWidth = totalEntries > 0
              ? (agent.entries / agentEntries[0].entries) * 100
              : 0;

            return (
              <div
                key={agent.name}
                className="flex items-center gap-3 py-2 relative"
              >
                {/* Probability bar background */}
                <div
                  className="absolute left-0 top-0 bottom-0 bg-[var(--green-pale)] rounded-lg -z-10"
                  style={{ width: `${barWidth}%` }}
                />

                {/* Rank */}
                <span className="text-sm font-bold text-[var(--ink)] w-5">
                  {idx + 1}
                </span>

                {/* Avatar */}
                <div className="w-7 h-7 rounded-full bg-[var(--green)] flex items-center justify-center text-white text-[9px] font-bold">
                  {initials}
                </div>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-[var(--ink)]">
                    {agent.name.split(" ")[0]}
                  </span>
                  <span className="text-xs text-[var(--ink4)] ml-1">
                    {spot?.name || agent.spot_id}
                  </span>
                </div>

                {/* Entries */}
                <span className="bg-[var(--surface)] px-2 py-0.5 rounded text-xs font-bold text-[var(--ink)]">
                  {agent.entries}
                </span>

                {/* Probability */}
                <span className="text-xs font-bold text-[var(--green)] w-12 text-right">
                  {probability}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gold bonus card */}
      {data.gold_active_this_week && goldReporter && (
        <div className="bg-white rounded-2xl border-2 border-[var(--amber)] p-4">
          <div className="flex items-center gap-2 mb-2">
            <Award size={16} className="text-[var(--amber)]" />
            <span className="font-outfit font-bold text-sm text-[var(--ink)]">
              Gold bonus active this week
            </span>
          </div>
          <p className="text-sm text-[var(--ink2)]">
            {goldReporter.name} reported gold at ${goldPrice?.price?.toLocaleString()}/oz
          </p>
          <p className="text-xs text-[var(--ink4)] mt-1">
            Prize pool boosted by +$10
          </p>
        </div>
      )}

      {/* Draw history */}
      <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
        <div className="p-4 border-b border-[var(--border)]">
          <h3 className="font-outfit font-bold text-sm text-[var(--ink)]">
            Draw history
          </h3>
        </div>
        <div className="divide-y divide-[var(--border)]">
          <div className="grid grid-cols-6 gap-2 px-4 py-2 text-[10px] uppercase text-[var(--ink4)] font-medium">
            <span>Week</span>
            <span>Winner</span>
            <span>Spot</span>
            <span className="text-right">Prize</span>
            <span className="text-right">Entries</span>
            <span className="text-right">Status</span>
          </div>
          {data.lottery.slice(0, 10).map((draw, idx) => (
            <div
              key={idx}
              className={`grid grid-cols-6 gap-2 px-4 py-3 items-center ${
                draw.gold_bonus ? "bg-[var(--amber-bg)]" : ""
              }`}
            >
              <span className="text-xs text-[var(--ink3)]">
                {new Date(draw.week_start).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                })}
              </span>
              <span className="text-xs font-medium text-[var(--ink)]">
                {draw.winner_name.split(" ")[0]}
              </span>
              <span className="text-xs text-[var(--ink3)]">
                {draw.winner_spot}
              </span>
              <span className="text-xs font-bold text-[var(--green)] text-right">
                ${draw.prize_usd}
              </span>
              <span className="text-xs text-[var(--ink4)] text-right">
                {draw.total_entries}
              </span>
              <div className="flex justify-end">
                {draw.paid_at ? (
                  <span className="inline-flex items-center gap-0.5 bg-[var(--green-pale)] text-[var(--green)] px-1.5 py-0.5 rounded text-[9px] font-bold">
                    <Check size={10} />
                    Paid
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-0.5 bg-[var(--amber-bg)] text-[var(--amber)] px-1.5 py-0.5 rounded text-[9px] font-bold">
                    <Clock size={10} />
                    Pending
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
