"use client";

import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  Info,
  Share2,
} from "lucide-react";
import { LeaderboardSkeleton } from "@/components/Skeleton";
import type { AgentRow, SpotWithPrices } from "@/lib/types";

interface DashboardData {
  agents: AgentRow[];
  spots: SpotWithPrices[];
  config: Record<string, string>;
}

const regions = [
  "All",
  "Kigali",
  "North",
  "South",
  "East",
  "West",
  "Border",
  "DRC",
  "Uganda",
];

const regionMap: Record<string, string[]> = {
  All: [],
  Kigali: ["Kigali", "Kimironko", "Nyabugogo", "Remera"],
  North: ["Musanze", "Rubavu", "Gicumbi"],
  South: ["Huye", "Nyanza", "Muhanga"],
  East: ["Rwamagana", "Kayonza", "Nyagatare"],
  West: ["Karongi", "Rusizi", "Rubavu"],
  Border: ["Rusumo", "Gatuna", "Cyanika", "Rubavu"],
  DRC: ["Goma", "Bukavu"],
  Uganda: ["Kampala", "Mbarara", "Kabale"],
};

export default function LeaderboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeRegion, setActiveRegion] = useState("All");
  const [weekOffset, setWeekOffset] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/dashboard");
        const dashboardData = await res.json();
        setData(dashboardData);
      } catch (err) {
        console.error("Leaderboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return <LeaderboardSkeleton />;
  }

  if (!data) return null;

  // Get current week date
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() - weekOffset * 7);
  const weekStart = new Date(currentDate);
  weekStart.setDate(currentDate.getDate() - currentDate.getDay());
  const weekLabel = weekStart.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  // Filter agents by region
  const filteredAgents = data.agents
    .filter((agent) => agent.active)
    .filter((agent) => {
      if (activeRegion === "All") return true;
      const spot = data.spots.find((s) => s.id === agent.spot_id);
      if (!spot) return false;
      const regionSpots = regionMap[activeRegion] || [];
      return regionSpots.some(
        (r) =>
          spot.region?.toLowerCase().includes(r.toLowerCase()) ||
          spot.name?.toLowerCase().includes(r.toLowerCase())
      );
    })
    .sort((a, b) => b.accuracy_pct - a.accuracy_pct);

  // Find top reporter per region
  const topReporters = new Map<string, string>();
  regions.forEach((region) => {
    if (region === "All") return;
    const regionAgents = data.agents
      .filter((agent) => {
        const spot = data.spots.find((s) => s.id === agent.spot_id);
        if (!spot) return false;
        const regionSpots = regionMap[region] || [];
        return regionSpots.some(
          (r) =>
            spot.region?.toLowerCase().includes(r.toLowerCase()) ||
            spot.name?.toLowerCase().includes(r.toLowerCase())
        );
      })
      .sort((a, b) => b.accuracy_pct - a.accuracy_pct);
    if (regionAgents[0]) {
      topReporters.set(regionAgents[0].name, region);
    }
  });

  // Calculate city stats
  const cityStats = {
    avgAccuracy:
      filteredAgents.length > 0
        ? Math.round(
            filteredAgents.reduce((sum, a) => sum + a.accuracy_pct, 0) /
              filteredAgents.length
          )
        : 0,
    activeAgents: filteredAgents.length,
    reportsToday: filteredAgents.reduce((sum, a) => sum + (a.streak > 0 ? 1 : 0), 0),
  };

  const handleWhatsAppShare = () => {
    const url = `${window.location.origin}/invite`;
    const city = activeRegion === "All" ? "East Africa" : activeRegion;
    const text = `Know a market agent in ${city}? Invite them to join EACC and earn +5 bonus tickets! ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Header */}
      <div>
        <h1 className="font-outfit font-bold text-[22px] text-[var(--ink)]">
          Price reporters
        </h1>
        <div className="flex items-center gap-2 mt-1">
          <button
            onClick={() => setWeekOffset((w) => w + 1)}
            className="p-1 hover:bg-[var(--surface)] rounded"
            disabled={weekOffset >= 4}
          >
            <ChevronLeft size={16} className="text-[var(--ink4)]" />
          </button>
          <span className="text-sm text-[var(--ink3)]">
            Week of {weekLabel}
          </span>
          <button
            onClick={() => setWeekOffset((w) => Math.max(0, w - 1))}
            className="p-1 hover:bg-[var(--surface)] rounded"
            disabled={weekOffset === 0}
          >
            <ChevronRight size={16} className="text-[var(--ink4)]" />
          </button>
        </div>
      </div>

      {/* City filter tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
        {regions.map((region) => (
          <button
            key={region}
            onClick={() => setActiveRegion(region)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              activeRegion === region
                ? "bg-[var(--green)] text-white"
                : "bg-white border border-[var(--border)] text-[var(--ink3)] hover:border-[var(--green-light)]"
            }`}
          >
            {region}
          </button>
        ))}
      </div>

      {/* Info note */}
      <div className="bg-[var(--amber-bg)] rounded-xl p-2.5 px-3.5 flex items-center gap-2">
        <Info size={14} className="text-[var(--amber)] flex-shrink-0" />
        <p className="text-[11px] text-[var(--ink2)] italic">
          Leaderboard shows accuracy only — ticket counts are private to each agent
        </p>
      </div>

      {/* Leaderboard table */}
      <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
        {filteredAgents.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-[var(--ink3)]">
              No agents found in {activeRegion}
            </p>
          </div>
        ) : (
          <div>
            {filteredAgents.map((agent, idx) => {
              const rank = idx + 1;
              const spot = data.spots.find((s) => s.id === agent.spot_id);
              const initials = agent.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);

              const isTopReporter = topReporters.get(agent.name);
              const isTop3 = rank <= 3;

              const rankColors = {
                1: "bg-yellow-400 text-yellow-900",
                2: "bg-gray-300 text-gray-700",
                3: "bg-amber-600 text-amber-100",
              };

              return (
                <div
                  key={agent.name}
                  className={`flex items-center gap-3 px-4 py-3 ${
                    idx % 2 === 0 ? "bg-white" : "bg-[var(--surface)]"
                  } ${isTop3 ? "border-l-[3px] border-l-[var(--green)]" : ""}`}
                >
                  {/* Rank */}
                  <div className="w-6 flex justify-center">
                    {isTop3 ? (
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          rankColors[rank as 1 | 2 | 3]
                        }`}
                      >
                        {rank}
                      </span>
                    ) : (
                      <span className="text-sm font-bold text-[var(--ink)]">
                        {rank}
                      </span>
                    )}
                  </div>

                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full bg-[var(--green)] flex items-center justify-center text-white text-[10px] font-bold">
                    {initials}
                  </div>

                  {/* Name and spot */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[var(--ink)] truncate">
                        {agent.name.split(" ")[0]}
                      </span>
                      {isTopReporter && (
                        <span className="bg-[var(--amber)] px-1.5 py-0.5 rounded text-[8px] uppercase font-bold text-[var(--ink)]">
                          Top reporter
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-[var(--ink4)]">
                      {spot?.name || agent.spot_id}
                    </span>
                  </div>

                  {/* Region badge */}
                  <span className="hidden sm:inline-block bg-[var(--surface)] px-2 py-0.5 rounded text-[9px] text-[var(--ink3)]">
                    {spot?.region || "—"}
                  </span>

                  {/* Accuracy bar */}
                  <div className="w-24 flex items-center gap-2">
                    <div className="flex-1 h-2 bg-[var(--surface)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[var(--green)] rounded-full"
                        style={{ width: `${agent.accuracy_pct}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-[var(--green)] w-8 text-right">
                      {agent.accuracy_pct}%
                    </span>
                  </div>

                  {/* Streak */}
                  {agent.streak >= 7 && (
                    <div className="flex items-center gap-0.5">
                      <Flame size={12} className="text-[var(--amber)]" />
                      <span className="text-[10px] font-bold text-[var(--amber)]">
                        {agent.streak}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* City stats strip */}
      <div className="flex gap-3 justify-center">
        <div className="bg-white rounded-full px-4 py-2 border border-[var(--border)]">
          <span className="text-xs text-[var(--ink4)]">Avg accuracy</span>
          <span className="text-sm font-bold text-[var(--green)] ml-2">
            {cityStats.avgAccuracy}%
          </span>
        </div>
        <div className="bg-white rounded-full px-4 py-2 border border-[var(--border)]">
          <span className="text-xs text-[var(--ink4)]">Active agents</span>
          <span className="text-sm font-bold text-[var(--ink)] ml-2">
            {cityStats.activeAgents}
          </span>
        </div>
        <div className="bg-white rounded-full px-4 py-2 border border-[var(--border)]">
          <span className="text-xs text-[var(--ink4)]">Reports today</span>
          <span className="text-sm font-bold text-[var(--ink)] ml-2">
            {cityStats.reportsToday}
          </span>
        </div>
      </div>

      {/* Invite strip */}
      <div className="bg-white rounded-2xl border border-[var(--border)] p-4 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-1 text-center sm:text-left">
          <p className="text-sm font-medium text-[var(--ink)]">
            Know a market agent in {activeRegion === "All" ? "your area" : activeRegion}?
          </p>
          <p className="text-xs text-[var(--ink3)]">
            Invite them to join EACC and earn +5 bonus tickets
          </p>
        </div>
        <button
          onClick={handleWhatsAppShare}
          className="flex items-center gap-2 bg-[var(--green)] text-white rounded-xl px-4 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Share2 size={16} />
          Share via WhatsApp
        </button>
      </div>
    </div>
  );
}
