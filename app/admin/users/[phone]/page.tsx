"use client";

import { use } from "react";
import { ArrowLeft, User, MapPin, Calendar, Award, Ticket } from "lucide-react";
import Link from "next/link";
import { Pill } from "@/components/shared/Pill";

interface UserDetailPageProps {
  params: Promise<{ phone: string }>;
}

export default function UserDetailPage({ params }: UserDetailPageProps) {
  const { phone } = use(params);
  const decodedPhone = decodeURIComponent(phone);

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[var(--ink)] transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Users
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
            <User size={28} className="text-gray-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--ink)]">Agent Profile</h1>
            <p className="text-sm text-gray-500 mt-1">{decodedPhone}</p>
          </div>
        </div>
        <Pill variant="gray" size="lg">
          Preview Mode
        </Pill>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-[rgba(0,0,0,0.08)] p-4">
          <div className="flex items-center gap-2 mb-2">
            <Award size={14} className="text-gray-400" />
            <p className="text-xs text-gray-500">Accuracy</p>
          </div>
          <p className="text-2xl font-bold text-[var(--ink)]">--%</p>
        </div>
        <div className="bg-white rounded-xl border border-[rgba(0,0,0,0.08)] p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar size={14} className="text-gray-400" />
            <p className="text-xs text-gray-500">Streak</p>
          </div>
          <p className="text-2xl font-bold text-[var(--ink)]">-- days</p>
        </div>
        <div className="bg-white rounded-xl border border-[rgba(0,0,0,0.08)] p-4">
          <div className="flex items-center gap-2 mb-2">
            <Ticket size={14} className="text-gray-400" />
            <p className="text-xs text-gray-500">Tickets</p>
          </div>
          <p className="text-2xl font-bold text-[var(--ink)]">--</p>
        </div>
        <div className="bg-white rounded-xl border border-[rgba(0,0,0,0.08)] p-4">
          <div className="flex items-center gap-2 mb-2">
            <MapPin size={14} className="text-gray-400" />
            <p className="text-xs text-gray-500">Market</p>
          </div>
          <p className="text-2xl font-bold text-[var(--ink)]">--</p>
        </div>
      </div>

      {/* Coming Soon Placeholder */}
      <div className="bg-white rounded-xl border border-[rgba(0,0,0,0.08)] p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <User size={28} className="text-gray-400" />
        </div>
        <h2 className="text-lg font-semibold text-[var(--ink)] mb-2">
          User Profile Coming Soon
        </h2>
        <p className="text-sm text-gray-500 max-w-md mx-auto mb-4">
          Full agent profile with report history, accuracy trends, ticket balance,
          referral stats, and activity timeline.
        </p>
        <Pill variant="amber" size="lg">
          Under Construction
        </Pill>
      </div>
    </div>
  );
}
