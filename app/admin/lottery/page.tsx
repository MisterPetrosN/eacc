"use client";

import { Gift, Trophy } from "lucide-react";
import { Pill } from "@/components/shared/Pill";

export default function LotteryPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--ink)]">Lottery</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage weekly prize draws and tickets
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--green)] text-white text-sm font-medium hover:bg-[var(--green-mid)] transition-colors">
          <Trophy size={16} />
          Run Draw
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-[rgba(0,0,0,0.08)] p-4">
          <p className="text-xs text-gray-500 mb-1">This Week&apos;s Pool</p>
          <p className="text-2xl font-bold text-[var(--ink)]">0</p>
          <p className="text-xs text-gray-400">tickets</p>
        </div>
        <div className="bg-white rounded-xl border border-[rgba(0,0,0,0.08)] p-4">
          <p className="text-xs text-gray-500 mb-1">Next Draw</p>
          <p className="text-2xl font-bold text-[var(--ink)]">--</p>
          <p className="text-xs text-gray-400">Sundays 18:00</p>
        </div>
        <div className="bg-white rounded-xl border border-[rgba(0,0,0,0.08)] p-4">
          <p className="text-xs text-gray-500 mb-1">Total Winners</p>
          <p className="text-2xl font-bold text-[var(--ink)]">0</p>
          <p className="text-xs text-gray-400">all time</p>
        </div>
      </div>

      {/* Coming Soon Placeholder */}
      <div className="bg-white rounded-xl border border-[rgba(0,0,0,0.08)] p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <Gift size={28} className="text-gray-400" />
        </div>
        <h2 className="text-lg font-semibold text-[var(--ink)] mb-2">
          Lottery System Coming Soon
        </h2>
        <p className="text-sm text-gray-500 max-w-md mx-auto mb-4">
          Weekly prize draws to incentivize accurate reporting. Agents earn tickets
          for verified submissions. View draw history, winners, and ticket balances.
        </p>
        <Pill variant="amber" size="lg">
          Under Construction
        </Pill>
      </div>
    </div>
  );
}
