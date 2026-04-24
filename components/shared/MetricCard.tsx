"use client";

import { ReactNode } from "react";
import { ChangePill } from "./Pill";

interface MetricCardProps {
  label: string;
  value: string | number;
  delta?: number | null;
  sub?: string;
  icon?: ReactNode;
  variant?: "default" | "success" | "warning" | "danger";
}

const variantStyles = {
  default: "bg-white border-[rgba(0,0,0,0.08)]",
  success: "bg-[#EAF3DE] border-[#3B6D11]/20",
  warning: "bg-[#FAEEDA] border-[#EF9F27]/30",
  danger: "bg-[#FCEBEB] border-[#A32D2D]/20",
};

export function MetricCard({ label, value, delta, sub, icon, variant = "default" }: MetricCardProps) {
  return (
    <div
      className={`rounded-xl p-4 border ${variantStyles[variant]}`}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          {label}
        </span>
        {icon && <span className="text-gray-400">{icon}</span>}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-[var(--ink)]">{value}</span>
        {delta !== undefined && delta !== null && <ChangePill delta={delta} size="sm" />}
      </div>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}

// Compact variant for metric strips
interface MetricStripItemProps {
  label: string;
  value: string | number;
  delta?: number | null;
}

export function MetricStripItem({ label, value, delta }: MetricStripItemProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-lg border border-[rgba(0,0,0,0.08)]">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="font-semibold text-[var(--ink)]">{value}</span>
      {delta !== undefined && delta !== null && <ChangePill delta={delta} size="sm" />}
    </div>
  );
}
