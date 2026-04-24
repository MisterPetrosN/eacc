"use client";

import { MapPin, AlertTriangle } from "lucide-react";
import { Pill } from "@/components/shared/Pill";

interface QuorumStatusProps {
  total: number;
  reporting: number;
  atRisk: string[];
}

export function QuorumStatus({ total, reporting, atRisk }: QuorumStatusProps) {
  const percentage = Math.round((reporting / total) * 100);
  const isHealthy = percentage >= 80;
  const isWarning = percentage >= 60 && percentage < 80;

  return (
    <div className="rounded-xl p-5 bg-white border border-[rgba(0,0,0,0.08)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MapPin size={18} className="text-[var(--green)]" />
          <span className="text-sm font-medium text-[var(--ink)]">
            Market Quorum
          </span>
        </div>
        <Pill
          variant={isHealthy ? "green" : isWarning ? "amber" : "red"}
          size="sm"
        >
          {percentage}%
        </Pill>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-3xl font-bold font-outfit text-[var(--ink)]">
            {reporting}
            <span className="text-lg text-gray-400">/{total}</span>
          </span>
          <span className="text-xs text-gray-500">markets reporting</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              isHealthy
                ? "bg-[#3B6D11]"
                : isWarning
                ? "bg-[#EF9F27]"
                : "bg-[#A32D2D]"
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* At Risk Markets */}
      {atRisk.length > 0 && (
        <div className="pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1.5 mb-2">
            <AlertTriangle size={12} className="text-[#854F0B]" />
            <span className="text-xs font-medium text-[#854F0B]">
              Markets at risk ({atRisk.length})
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {atRisk.map((market) => (
              <Pill key={market} variant="amber" size="sm">
                {market}
              </Pill>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
