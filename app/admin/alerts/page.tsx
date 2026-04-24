"use client";

import { Bell, Plus, Settings } from "lucide-react";
import { Pill } from "@/components/shared/Pill";

export default function AlertsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--ink)]">Alerts</h1>
          <p className="text-sm text-gray-500 mt-1">
            Configure price alerts and notifications
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[rgba(0,0,0,0.08)] text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            <Settings size={16} />
            Settings
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--green)] text-white text-sm font-medium hover:bg-[var(--green-mid)] transition-colors">
            <Plus size={16} />
            New Alert Rule
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-[rgba(0,0,0,0.08)] p-4">
          <p className="text-xs text-gray-500 mb-1">Active Rules</p>
          <p className="text-2xl font-bold text-[var(--ink)]">0</p>
          <p className="text-xs text-gray-400">configured</p>
        </div>
        <div className="bg-white rounded-xl border border-[rgba(0,0,0,0.08)] p-4">
          <p className="text-xs text-gray-500 mb-1">Triggered Today</p>
          <p className="text-2xl font-bold text-[var(--ink)]">0</p>
          <p className="text-xs text-gray-400">alerts</p>
        </div>
        <div className="bg-white rounded-xl border border-[rgba(0,0,0,0.08)] p-4">
          <p className="text-xs text-gray-500 mb-1">Arb Opportunities</p>
          <p className="text-2xl font-bold text-[var(--green)]">0</p>
          <p className="text-xs text-gray-400">above 10%</p>
        </div>
      </div>

      {/* Coming Soon Placeholder */}
      <div className="bg-white rounded-xl border border-[rgba(0,0,0,0.08)] p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <Bell size={28} className="text-gray-400" />
        </div>
        <h2 className="text-lg font-semibold text-[var(--ink)] mb-2">
          Alert System Coming Soon
        </h2>
        <p className="text-sm text-gray-500 max-w-md mx-auto mb-4">
          Set up price movement alerts, arbitrage opportunity notifications, and
          quorum warnings. Alerts delivered via SMS, WhatsApp, or dashboard.
        </p>
        <Pill variant="amber" size="lg">
          Under Construction
        </Pill>
      </div>
    </div>
  );
}
