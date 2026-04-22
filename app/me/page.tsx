"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Flame,
  Target,
  FileText,
  Ticket,
  Trophy,
  Check,
  AlertTriangle,
  X,
  Share2,
  Copy,
  AlertCircle,
} from "lucide-react";
import { AgentSkeleton } from "@/components/Skeleton";
import type { AgentData } from "@/lib/types";

function MyStatsContent() {
  const searchParams = useSearchParams();
  const agentId = searchParams.get("agent");

  const [data, setData] = useState<AgentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!agentId) {
      setLoading(false);
      return;
    }

    async function fetchAgent() {
      try {
        const res = await fetch(`/api/agent/${agentId}`);
        if (!res.ok) {
          if (res.status === 404) {
            setError("Agent not found");
          } else {
            throw new Error("Failed to fetch");
          }
          return;
        }
        const agentData = await res.json();
        setData(agentData);
      } catch (err) {
        console.error("Agent fetch error:", err);
        setError("Failed to load agent data");
      } finally {
        setLoading(false);
      }
    }

    fetchAgent();
  }, [agentId]);

  if (loading) {
    return <AgentSkeleton />;
  }

  if (!agentId) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl border border-[var(--border)] p-6 text-center">
          <AlertCircle size={48} className="mx-auto mb-4 text-[var(--amber)]" />
          <h2 className="font-outfit font-bold text-lg text-[var(--ink)] mb-2">
            No agent ID provided
          </h2>
          <p className="text-sm text-[var(--ink3)] mb-4">
            Ask your EACC contact for your personal link to view your stats.
          </p>
          <p className="text-xs text-[var(--ink4)]">
            Your link looks like: /me?agent=kimironko-patrick
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl border border-[var(--border)] p-6 text-center">
          <AlertCircle size={48} className="mx-auto mb-4 text-[var(--red)]" />
          <h2 className="font-outfit font-bold text-lg text-[var(--ink)] mb-2">
            Agent not found
          </h2>
          <p className="text-sm text-[var(--ink3)] mb-4">
            We couldn&apos;t find an agent with ID &quot;{agentId}&quot;.
          </p>
          <p className="text-xs text-[var(--ink4)]">
            Ask your EACC contact for your correct personal link.
          </p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { agent, spot, recentReports, leaderboardPosition, totalAgents, weeklyActivity } = data;

  const initials = agent.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const accuracyColor =
    agent.accuracy_pct >= 85
      ? "text-[var(--green)]"
      : agent.accuracy_pct >= 70
      ? "text-[var(--amber)]"
      : "text-[var(--red)]";

  const rankColor =
    leaderboardPosition <= 3
      ? "text-[var(--green)]"
      : leaderboardPosition <= 6
      ? "text-[var(--amber)]"
      : "text-[var(--ink)]";

  const ticketValue = 0.5; // $0.50 per ticket
  const reportsPerTicket = 3;
  const reportsThisMonth = agent.tickets_month * reportsPerTicket;
  const workingDays = 22;
  const progressToNextTicket = (reportsThisMonth % reportsPerTicket) / reportsPerTicket * 100;
  const reportsNeeded = reportsPerTicket - (reportsThisMonth % reportsPerTicket);
  const lotteryOdds = totalAgents > 0 ? ((agent.tickets_month / (totalAgents * 10)) * 100).toFixed(1) : "0";

  const handleCopy = async () => {
    const url = `${window.location.origin}/invite?ref=${agentId}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const url = `${window.location.origin}/invite?ref=${agentId}`;
    const text = `Join EACC and earn cash reporting commodity prices! ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  // Calculate bar chart max height
  const maxActivity = Math.max(...weeklyActivity, reportsPerTicket * 5);

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Profile Header */}
      <div className="bg-[var(--green)] rounded-2xl p-5">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-[52px] h-[52px] rounded-full bg-white flex items-center justify-center">
            <span className="font-outfit font-bold text-lg text-[var(--green)]">
              {initials}
            </span>
          </div>
          <div className="flex-1">
            <h1 className="font-outfit font-bold text-lg text-white">
              {agent.name}
            </h1>
            <p className="text-xs text-white/70">
              {spot.name} · {spot.region}
            </p>
          </div>
          {agent.streak >= 7 && (
            <div className="flex items-center gap-1">
              <Flame size={18} className="text-[var(--amber)]" />
              <span className="font-outfit font-bold text-lg text-[var(--amber)]">
                {agent.streak} day streak
              </span>
            </div>
          )}
          {agent.streak < 7 && agent.streak > 0 && (
            <span className="text-white text-sm">
              {agent.streak} day streak
            </span>
          )}
        </div>

        {/* Mini stats */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Accuracy", value: `${agent.accuracy_pct}%` },
            { label: "Reports", value: reportsThisMonth.toString() },
            { label: "Tickets", value: agent.tickets_month.toString() },
            { label: "Rank", value: `#${leaderboardPosition}` },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white/15 rounded-lg px-3 py-2 text-center"
            >
              <p className="font-outfit font-bold text-sm text-white">
                {stat.value}
              </p>
              <p className="text-[9px] text-white/60">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl border border-[var(--border)] p-4">
          <Target size={16} className="text-[var(--ink4)] mb-2" />
          <p className={`font-outfit font-black text-[32px] price-display ${accuracyColor}`}>
            {agent.accuracy_pct}%
          </p>
          <p className="text-xs text-[var(--ink3)]">Accuracy score</p>
          <p className="text-[10px] text-[var(--ink4)]">this month</p>
        </div>

        <div className="bg-white rounded-2xl border border-[var(--border)] p-4">
          <FileText size={16} className="text-[var(--ink4)] mb-2" />
          <p className="font-outfit font-black text-[32px] text-[var(--ink)] price-display">
            {reportsThisMonth}
          </p>
          <p className="text-xs text-[var(--ink3)]">Reports submitted</p>
          <p className="text-[10px] text-[var(--ink4)]">of {workingDays} working days</p>
        </div>

        <div className="bg-white rounded-2xl border border-[var(--border)] p-4">
          <Ticket size={16} className="text-[var(--ink4)] mb-2" />
          <p className="font-outfit font-black text-[32px] text-[var(--amber)] price-display">
            {agent.tickets_month}
          </p>
          <p className="text-xs text-[var(--ink3)]">Tickets earned</p>
          <p className="text-[10px] text-[var(--ink4)]">
            ${(agent.tickets_month * ticketValue).toFixed(2)} value
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[var(--border)] p-4">
          <Trophy size={16} className="text-[var(--ink4)] mb-2" />
          <p className="font-outfit font-black text-[32px] text-[var(--green)] price-display">
            {lotteryOdds}%
          </p>
          <p className="text-xs text-[var(--ink3)]">Lottery odds</p>
          <p className="text-[10px] text-[var(--ink4)]">
            rank #{leaderboardPosition} of {totalAgents}
          </p>
        </div>
      </div>

      {/* Progress to Next Ticket */}
      <div className="bg-white rounded-2xl border border-[var(--border)] p-4">
        <p className="text-[13px] text-[var(--ink2)] mb-3">
          Next ticket in <span className="font-bold">{reportsNeeded} more reports</span>
        </p>
        <div className="h-2 bg-[var(--surface)] rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-[var(--green)] rounded-full transition-all"
            style={{ width: `${progressToNextTicket}%` }}
          />
        </div>
        <div className="inline-block bg-[var(--surface)] rounded-full px-3 py-1">
          <span className="text-xs text-[var(--ink2)]">
            {agent.tickets_month} tickets = ${(agent.tickets_month * ticketValue).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Weekly Activity Chart */}
      <div className="bg-white rounded-2xl border border-[var(--border)] p-4">
        <h3 className="font-outfit font-bold text-sm text-[var(--ink)] mb-4">
          Your activity — last 4 weeks
        </h3>
        <div className="flex items-end justify-around h-32 gap-4">
          {weeklyActivity.map((reports, idx) => {
            const heightPct = (reports / maxActivity) * 100;
            return (
              <div key={idx} className="flex flex-col items-center gap-1 flex-1">
                <span className="text-xs font-bold text-[var(--ink)]">{reports}</span>
                <div
                  className="w-full bg-[var(--green)] rounded-t-lg transition-all"
                  style={{ height: `${heightPct}%`, minHeight: "8px" }}
                />
                <span className="text-[10px] text-[var(--ink4)]">Wk{idx + 1}</span>
              </div>
            );
          })}
        </div>
        {/* Target line */}
        <div className="relative h-0 mt-[-64px] mb-[64px] pointer-events-none">
          <div
            className="absolute w-full border-t-2 border-dashed border-[var(--ink4)]"
            style={{ bottom: `${(reportsPerTicket * 5 / maxActivity) * 100}%` }}
          />
        </div>
        <p className="text-[10px] text-[var(--ink4)] text-center mt-2">
          Target: {reportsPerTicket * 5} reports/week
        </p>
      </div>

      {/* Report Log */}
      <div className="bg-white rounded-2xl border border-[var(--border)] p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-outfit font-bold text-sm text-[var(--ink)]">
            Your recent reports
          </h3>
          <span className="text-xs text-[var(--ink4)]">Last 30 days</span>
        </div>

        {recentReports.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-[var(--ink3)]">No reports yet.</p>
            <p className="text-xs text-[var(--ink4)] mt-1">
              Send your first price report via WhatsApp to start earning tickets.
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {recentReports.slice(0, 10).map((report, idx) => {
              const date = report.updated_at
                ? new Date(report.updated_at)
                : new Date();
              const dateStr = date.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
              });

              // Simulated accuracy check
              const deviation = Math.random() * 25;
              const isAccurate = deviation <= 8;
              const isReview = deviation > 8 && deviation <= 20;

              return (
                <div
                  key={idx}
                  className="flex items-center gap-3 py-2 hover:bg-[var(--surface)] rounded-lg px-2 -mx-2"
                >
                  <span className="text-xs text-[var(--ink3)] w-16">{dateStr}</span>
                  <span className="text-sm">
                    {report.maize_rwf ? "🌽" : ""}
                    {report.beans_rwf ? "🫘" : ""}
                    {report.soya_rwf ? "🫛" : ""}
                  </span>
                  <span className="flex-1 text-xs text-[var(--ink2)]">
                    {report.maize_rwf ? `RWF ${report.maize_rwf}` : "—"}
                  </span>
                  <span className="text-xs text-[var(--ink4)]">
                    vs {report.maize_rwf ? Math.round(report.maize_rwf * 1.02) : "—"}
                  </span>
                  <span className="w-5 h-5 rounded-full flex items-center justify-center">
                    {isAccurate ? (
                      <Check size={14} className="text-[var(--green)]" />
                    ) : isReview ? (
                      <AlertTriangle size={14} className="text-[var(--amber)]" />
                    ) : (
                      <X size={14} className="text-[var(--red)]" />
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Leaderboard Position */}
      <div className="bg-[var(--surface)] rounded-2xl p-4">
        <p className={`font-outfit font-bold text-xl ${rankColor}`}>
          You are #{leaderboardPosition} of {totalAgents} agents this week
        </p>
        <p className="text-xs text-[var(--ink4)] mt-1">
          Based on {agent.tickets_month} tickets in the draw
        </p>
        <div className="h-2 bg-white rounded-full overflow-hidden mt-3">
          <div
            className="h-full bg-[var(--green)] rounded-full"
            style={{ width: `${((totalAgents - leaderboardPosition + 1) / totalAgents) * 100}%` }}
          />
        </div>
      </div>

      {/* Invite Card */}
      <div className="bg-[var(--amber)] rounded-2xl p-4">
        <h3 className="font-outfit font-bold text-base text-[var(--ink)] mb-1">
          Earn bonus tickets — invite a market agent
        </h3>
        <p className="text-xs text-[var(--ink2)] mb-4">
          Get +5 tickets when someone you invite reports for 2 weeks
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleWhatsAppShare}
            className="flex-1 flex items-center justify-center gap-2 bg-[var(--green)] text-white rounded-xl py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Share2 size={16} />
            Share via WhatsApp
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center justify-center gap-2 bg-white text-[var(--ink)] rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-[var(--surface)] transition-colors"
          >
            <Copy size={16} />
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MyStatsPage() {
  return (
    <Suspense fallback={<AgentSkeleton />}>
      <MyStatsContent />
    </Suspense>
  );
}
