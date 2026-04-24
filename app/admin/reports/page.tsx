"use client";

import { FileText, Filter, Download, Search } from "lucide-react";
import { Pill } from "@/components/shared/Pill";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--ink)]">Reports</h1>
          <p className="text-sm text-gray-500 mt-1">
            View and moderate all price reports
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[rgba(0,0,0,0.08)] text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            <Filter size={16} />
            Filters
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[rgba(0,0,0,0.08)] text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by reporter, market, or commodity..."
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-[rgba(0,0,0,0.08)] text-sm focus:outline-none focus:border-[var(--green)] transition-colors"
        />
      </div>

      {/* Coming Soon Placeholder */}
      <div className="bg-white rounded-xl border border-[rgba(0,0,0,0.08)] p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <FileText size={28} className="text-gray-400" />
        </div>
        <h2 className="text-lg font-semibold text-[var(--ink)] mb-2">
          Reports Table Coming Soon
        </h2>
        <p className="text-sm text-gray-500 max-w-md mx-auto mb-4">
          Full reports table with filtering by date, market, commodity, status, and reporter.
          Includes bulk moderation actions and export functionality.
        </p>
        <Pill variant="amber" size="lg">
          🚧 Under Construction
        </Pill>
      </div>
    </div>
  );
}
