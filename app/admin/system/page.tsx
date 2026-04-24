"use client";

import { Settings, Database, Clock, Shield, RefreshCw } from "lucide-react";
import { Pill } from "@/components/shared/Pill";

export default function SystemPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--ink)]">System</h1>
          <p className="text-sm text-gray-500 mt-1">
            System configuration and diagnostics
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[rgba(0,0,0,0.08)] text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
          <RefreshCw size={16} />
          Refresh Status
        </button>
      </div>

      {/* System Status Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-[rgba(0,0,0,0.08)] p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <Database size={18} className="text-gray-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--ink)]">Google Sheets</p>
              <p className="text-xs text-gray-500">Data source</p>
            </div>
          </div>
          <Pill variant="gray" size="sm">Unknown</Pill>
        </div>

        <div className="bg-white rounded-xl border border-[rgba(0,0,0,0.08)] p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <Clock size={18} className="text-gray-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--ink)]">Cron Jobs</p>
              <p className="text-xs text-gray-500">Scheduled tasks</p>
            </div>
          </div>
          <Pill variant="gray" size="sm">Not configured</Pill>
        </div>

        <div className="bg-white rounded-xl border border-[rgba(0,0,0,0.08)] p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <Shield size={18} className="text-gray-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--ink)]">Authentication</p>
              <p className="text-xs text-gray-500">NextAuth + Google</p>
            </div>
          </div>
          <Pill variant="green" size="sm">Active</Pill>
        </div>

        <div className="bg-white rounded-xl border border-[rgba(0,0,0,0.08)] p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <Settings size={18} className="text-gray-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--ink)]">Environment</p>
              <p className="text-xs text-gray-500">Config status</p>
            </div>
          </div>
          <Pill variant="gray" size="sm">Development</Pill>
        </div>
      </div>

      {/* Coming Soon Placeholder */}
      <div className="bg-white rounded-xl border border-[rgba(0,0,0,0.08)] p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <Settings size={28} className="text-gray-400" />
        </div>
        <h2 className="text-lg font-semibold text-[var(--ink)] mb-2">
          Full System Dashboard Coming Soon
        </h2>
        <p className="text-sm text-gray-500 max-w-md mx-auto mb-4">
          Monitor API health, view cron job logs, manage admin whitelist,
          configure rate limits, and access system diagnostics.
        </p>
        <Pill variant="amber" size="lg">
          Under Construction
        </Pill>
      </div>
    </div>
  );
}
