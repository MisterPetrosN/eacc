"use client";

import { useState, useEffect } from "react";
import { Check, X, AlertTriangle, User } from "lucide-react";
import { Pill, PricePill, COUNTRY_COLORS } from "@/components/shared/Pill";

interface ModerationItem {
  id: string;
  reporter: string;
  phone: string;
  market: string;
  country: "RW" | "CD" | "UG";
  flag: string;
  commodity: string;
  commodityEmoji: string;
  reportedValue: number;
  expectedRange: { min: number; max: number };
  reason: "outlier" | "duplicate" | "suspicious";
  reportedAt: string;
}

export function PendingModeration() {
  const [items, setItems] = useState<ModerationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with actual API call
    setItems([
      {
        id: "1",
        reporter: "Jean Baptiste",
        phone: "+250788123456",
        market: "Kigali",
        country: "RW",
        flag: "🇷🇼",
        commodity: "Maize",
        commodityEmoji: "🌽",
        reportedValue: 580,
        expectedRange: { min: 300, max: 380 },
        reason: "outlier",
        reportedAt: "2 hours ago",
      },
      {
        id: "2",
        reporter: "Omar Kabila",
        phone: "+243812345678",
        market: "Goma",
        country: "CD",
        flag: "🇨🇩",
        commodity: "Beans",
        commodityEmoji: "🫘",
        reportedValue: 1200,
        expectedRange: { min: 750, max: 850 },
        reason: "outlier",
        reportedAt: "4 hours ago",
      },
      {
        id: "3",
        reporter: "Sarah Uwimana",
        phone: "+250788234567",
        market: "Kigali",
        country: "RW",
        flag: "🇷🇼",
        commodity: "Rice",
        commodityEmoji: "🍚",
        reportedValue: 1240,
        expectedRange: { min: 1200, max: 1300 },
        reason: "duplicate",
        reportedAt: "5 hours ago",
      },
    ]);
    setLoading(false);
  }, []);

  const handleApprove = async (id: string) => {
    // TODO: Call API to approve
    console.log("Approving report:", id);
    setItems(items.filter((item) => item.id !== id));
  };

  const handleReject = async (id: string) => {
    // TODO: Call API to reject
    console.log("Rejecting report:", id);
    setItems(items.filter((item) => item.id !== id));
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-gray-100 rounded-lg" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-8 text-center">
        <div className="w-12 h-12 rounded-full bg-[#EAF3DE] flex items-center justify-center mx-auto mb-3">
          <Check size={20} className="text-[#3B6D11]" />
        </div>
        <p className="text-sm text-gray-500">All caught up!</p>
        <p className="text-xs text-gray-400 mt-1">No reports pending moderation</p>
      </div>
    );
  }

  const reasonStyles = {
    outlier: { variant: "red" as const, label: "Outlier" },
    duplicate: { variant: "amber" as const, label: "Duplicate" },
    suspicious: { variant: "red" as const, label: "Suspicious" },
  };

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const reason = reasonStyles[item.reason];
        const deviation =
          item.reportedValue > item.expectedRange.max
            ? `+${Math.round(((item.reportedValue - item.expectedRange.max) / item.expectedRange.max) * 100)}%`
            : `-${Math.round(((item.expectedRange.min - item.reportedValue) / item.expectedRange.min) * 100)}%`;

        return (
          <div
            key={item.id}
            className="p-3 rounded-lg border border-[rgba(0,0,0,0.08)] bg-gray-50"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${COUNTRY_COLORS[item.country]}20` }}
                >
                  <User size={14} style={{ color: COUNTRY_COLORS[item.country] }} />
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--ink)]">
                    {item.reporter}
                  </p>
                  <p className="text-xs text-gray-500">
                    {item.flag} {item.market} · {item.reportedAt}
                  </p>
                </div>
              </div>
              <Pill variant={reason.variant} size="sm">
                <AlertTriangle size={10} />
                {reason.label}
              </Pill>
            </div>

            {/* Price Info */}
            <div className="flex items-center gap-3 mb-3">
              <span className="text-sm">{item.commodityEmoji}</span>
              <span className="text-sm text-gray-600">{item.commodity}</span>
              <PricePill value={item.reportedValue} size="sm" />
              <span className="text-xs text-[#A32D2D] font-medium">{deviation}</span>
              <span className="text-xs text-gray-400">
                Expected: {item.expectedRange.min.toLocaleString()}–
                {item.expectedRange.max.toLocaleString()}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleApprove(item.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EAF3DE] text-[#3B6D11] text-xs font-medium hover:bg-[#d9ebcc] transition-colors"
              >
                <Check size={14} />
                Approve
              </button>
              <button
                onClick={() => handleReject(item.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FCEBEB] text-[#A32D2D] text-xs font-medium hover:bg-[#f8dada] transition-colors"
              >
                <X size={14} />
                Reject
              </button>
              <button className="px-3 py-1.5 rounded-lg text-gray-500 text-xs font-medium hover:bg-gray-100 transition-colors">
                View Details
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
