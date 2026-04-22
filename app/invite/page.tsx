"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  MessageSquare,
  Ticket,
  DollarSign,
  Check,
  ChevronRight,
  Smartphone,
} from "lucide-react";
import type { LotteryRow } from "@/lib/types";

interface DashboardData {
  lottery: LotteryRow[];
  config: Record<string, string>;
  spots: { id: string; name: string }[];
}

function InviteContent() {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");

  const [data, setData] = useState<DashboardData | null>(null);
  const [, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/dashboard");
        const dashboardData = await res.json();
        setData(dashboardData);
      } catch (err) {
        console.error("Invite fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Parse referrer info
  let referrerName = "";
  let referrerSpot = "";
  if (ref && data) {
    const [spotId, firstName] = ref.split("-");
    referrerName = firstName?.charAt(0).toUpperCase() + (firstName?.slice(1) || "");
    const spot = data.spots.find((s) => s.id.toLowerCase() === spotId.toLowerCase());
    referrerSpot = spot?.name || spotId;
  }

  const jackpot = data?.config.weekly_jackpot_usd || "15";
  const twilioNumber = data?.config.twilio_number || "250788000000";
  const recentWinners = data?.lottery?.slice(0, 3) || [];

  const handleJoin = () => {
    const region = "KIGALI"; // Default region
    const refCode = ref || "DIRECT";
    const message = `JOIN-${region}-${refCode}`;
    window.open(
      `https://wa.me/${twilioNumber}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  return (
    <div className="max-w-md mx-auto">
      {/* Referral banner */}
      {ref && referrerName && (
        <div className="bg-[var(--green)] rounded-2xl p-4 mb-4 text-center">
          <p className="text-sm text-white">
            <span className="font-bold">{referrerName}</span> from {referrerSpot} invited
            you to join EACC
          </p>
          <p className="text-xs text-white/70 mt-1">
            They earn +5 lottery tickets when you report for 2 weeks
          </p>
        </div>
      )}

      {/* Hero section */}
      <div className="bg-[var(--green)] rounded-2xl p-6 text-center mb-4">
        {/* Logo */}
        <div className="w-16 h-16 bg-[var(--amber)] rounded-2xl mx-auto mb-4 flex items-center justify-center">
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2C7 2 4 6 4 10c0 3 1 5 3 7l5 5 5-5c2-2 3-4 3-7 0-4-3-8-8-8z"
              fill="var(--ink)"
            />
            <path
              d="M12 6c-2 0-3 2-3 4s1 4 3 4 3-2 3-4-1-4-3-4z"
              fill="var(--amber)"
            />
          </svg>
        </div>

        <h1 className="font-outfit font-bold text-2xl text-white mb-2">
          Earn cash reporting commodity prices
        </h1>
        <p className="text-sm text-white/80 mb-4">
          Send us prices from your market every morning. Earn tickets. Win weekly.
        </p>

        {/* Prize pill */}
        <div className="inline-flex items-center gap-2 bg-[var(--amber)] rounded-full px-4 py-2">
          <Ticket size={16} className="text-[var(--ink)]" />
          <span className="text-sm font-bold text-[var(--ink)]">
            This week: ${jackpot}
          </span>
        </div>
      </div>

      {/* How it works */}
      <div className="space-y-3 mb-4">
        <h2 className="font-outfit font-bold text-base text-[var(--ink)] text-center">
          How it works
        </h2>

        {[
          {
            icon: Smartphone,
            title: "Report via WhatsApp",
            desc: "Send maize and beans price to our number every morning before 9am",
          },
          {
            icon: Ticket,
            title: "Earn tickets",
            desc: "Every 3 reports = 1 ticket. Accurate reports earn bonus entries.",
          },
          {
            icon: DollarSign,
            title: "Win weekly",
            desc: "Sunday 6pm draw. Winner gets MTN Mobile Money same day.",
          },
        ].map((step, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl border border-[var(--border)] p-4 flex gap-3"
          >
            <div className="w-10 h-10 rounded-full bg-[var(--green-pale)] flex items-center justify-center flex-shrink-0">
              <step.icon size={20} className="text-[var(--green)]" />
            </div>
            <div>
              <p className="font-outfit font-bold text-sm text-[var(--ink)]">
                {step.title}
              </p>
              <p className="text-xs text-[var(--ink3)] mt-0.5">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Earnings explainer */}
      <div className="bg-[var(--surface)] rounded-2xl p-4 mb-4">
        <h3 className="font-outfit font-bold text-sm text-[var(--ink)] mb-3">
          What you can earn per month
        </h3>
        <div className="space-y-2">
          {[
            { label: "Ticket payouts", value: "~$6" },
            { label: "Accuracy bonuses", value: "~$6 per week" },
            { label: "Jackpot wins", value: "$15 per week (if you win)" },
            { label: "Perfect month bonus", value: "$10" },
          ].map((row) => (
            <div key={row.label} className="flex justify-between text-xs">
              <span className="text-[var(--ink3)]">{row.label}</span>
              <span className="font-bold text-[var(--ink)]">{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent winners */}
      {recentWinners.length > 0 && (
        <div className="bg-white rounded-2xl border border-[var(--border)] p-4 mb-4">
          <h3 className="font-outfit font-bold text-sm text-[var(--ink)] mb-3">
            Recent winners
          </h3>
          <div className="space-y-2">
            {recentWinners.map((winner, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--green)] flex items-center justify-center text-white text-xs font-bold">
                  {winner.winner_name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[var(--ink)]">
                    {winner.winner_name.split(" ")[0]}
                  </p>
                  <p className="text-[10px] text-[var(--ink4)]">
                    {winner.winner_spot}
                  </p>
                </div>
                <span className="font-outfit font-bold text-sm text-[var(--green)]">
                  ${winner.prize_usd}
                </span>
                {winner.paid_at && (
                  <span className="inline-flex items-center gap-0.5 bg-[var(--green-pale)] text-[var(--green)] px-1.5 py-0.5 rounded text-[9px] font-bold">
                    <Check size={10} />
                    Paid
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA button */}
      <button
        onClick={handleJoin}
        className="w-full bg-[var(--amber)] text-[var(--ink)] rounded-xl py-4 px-6 flex items-center justify-center gap-2 font-bold text-base hover:opacity-90 transition-opacity mb-3"
      >
        <MessageSquare size={20} />
        Join EACC via WhatsApp
        <ChevronRight size={20} />
      </button>
      <p className="text-xs text-[var(--ink4)] text-center mb-6">
        Free to join. No app needed. Just WhatsApp.
      </p>

      {/* Footer */}
      <div className="text-center border-t border-[var(--border)] pt-4">
        <p className="text-xs text-[var(--ink4)]">
          Already a reporter?{" "}
          <Link
            href={ref ? `/me?agent=${ref}` : "/me"}
            className="text-[var(--green)] font-medium hover:underline"
          >
            See your personal stats →
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function InvitePage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto space-y-4">
          <div className="h-64 bg-[var(--border)] rounded-2xl animate-pulse" />
          <div className="h-32 bg-[var(--border)] rounded-2xl animate-pulse" />
        </div>
      }
    >
      <InviteContent />
    </Suspense>
  );
}
