"use client";

import { Users, Search, UserPlus } from "lucide-react";
import { Pill } from "@/components/shared/Pill";

export default function UsersPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--ink)]">Users</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage agents and their performance
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--green)] text-white text-sm font-medium hover:bg-[var(--green-mid)] transition-colors">
          <UserPlus size={16} />
          Add Agent
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, phone, or market..."
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-[rgba(0,0,0,0.08)] text-sm focus:outline-none focus:border-[var(--green)] transition-colors"
        />
      </div>

      {/* Coming Soon Placeholder */}
      <div className="bg-white rounded-xl border border-[rgba(0,0,0,0.08)] p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <Users size={28} className="text-gray-400" />
        </div>
        <h2 className="text-lg font-semibold text-[var(--ink)] mb-2">
          User Management Coming Soon
        </h2>
        <p className="text-sm text-gray-500 max-w-md mx-auto mb-4">
          Full user list with accuracy scores, streak tracking, ticket balances,
          and activity logs. Click through to individual user profiles.
        </p>
        <Pill variant="amber" size="lg">
          🚧 Under Construction
        </Pill>
      </div>
    </div>
  );
}
