"use client";

import { MapPin, Plus, Search } from "lucide-react";
import { Pill } from "@/components/shared/Pill";

export default function MarketsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--ink)]">Markets</h1>
          <p className="text-sm text-gray-500 mt-1">
            Configure markets and commodities
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--green)] text-white text-sm font-medium hover:bg-[var(--green-mid)] transition-colors">
          <Plus size={16} />
          Add Market
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by market name or country..."
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-[rgba(0,0,0,0.08)] text-sm focus:outline-none focus:border-[var(--green)] transition-colors"
        />
      </div>

      {/* Coming Soon Placeholder */}
      <div className="bg-white rounded-xl border border-[rgba(0,0,0,0.08)] p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <MapPin size={28} className="text-gray-400" />
        </div>
        <h2 className="text-lg font-semibold text-[var(--ink)] mb-2">
          Market Configuration Coming Soon
        </h2>
        <p className="text-sm text-gray-500 max-w-md mx-auto mb-4">
          Manage markets across Rwanda, DRC, Uganda, and Tanzania. Configure
          commodities tracked per market, set price ranges, and define quorum requirements.
        </p>
        <Pill variant="amber" size="lg">
          Under Construction
        </Pill>
      </div>
    </div>
  );
}
