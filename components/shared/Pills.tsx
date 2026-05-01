"use client";

import { ReactNode } from "react";

// ============================================================================
// 1. SECTION LABEL PILL (uppercase small-caps)
// Usage: BENCHMARK, LEAN SEASON ALERT, CROSS-BORDER
// ============================================================================

interface SectionLabelPillProps {
  children: ReactNode;
  variant?: "light" | "dark";
  accentColor?: string;
  className?: string;
}

export function SectionLabelPill({
  children,
  variant = "light",
  accentColor = "#0F5132",
  className = "",
}: SectionLabelPillProps) {
  const bgStyle = variant === "light" ? "bg-white" : "bg-white/15";

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        ${bgStyle}
        rounded-full px-[14px] py-[7px]
        text-[12px] font-semibold uppercase tracking-[0.06em]
        ${className}
      `}
      style={{ color: accentColor }}
    >
      {children}
    </span>
  );
}

// ============================================================================
// 2. ENTITY PILL (sentence case) - BUMPED for readability
// Usage: 📍 Kigali city average, 🌽 Maize, 🇷🇼 Rusumo
// ============================================================================

interface EntityPillProps {
  children: ReactNode;
  icon?: string;
  variant?: "light" | "dark";
  accentColor?: string;
  className?: string;
}

export function EntityPill({
  children,
  icon,
  variant = "light",
  accentColor = "#0F5132",
  className = "",
}: EntityPillProps) {
  const bgStyle =
    variant === "light"
      ? "bg-white border border-[rgba(0,0,0,0.05)]"
      : "bg-white/15";

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        ${bgStyle}
        rounded-full px-[16px] py-[9px]
        text-[16px] font-medium
        ${className}
      `}
      style={{ color: accentColor }}
    >
      {icon && <span className="text-[17px]">{icon}</span>}
      {children}
    </span>
  );
}

// ============================================================================
// 3. MODIFIER PILL (date ranges, units)
// Usage: Jul 15 – Aug 30, per MT, Cross-border
// ============================================================================

interface ModifierPillProps {
  children: ReactNode;
  parentColor?: string;
  className?: string;
}

export function ModifierPill({
  children,
  parentColor = "#444441",
  className = "",
}: ModifierPillProps) {
  return (
    <span
      className={`
        inline-flex items-center
        rounded-full px-[12px] py-[6px]
        text-[12px] font-semibold
        ${className}
      `}
      style={{
        backgroundColor: `${parentColor}15`,
        color: parentColor,
      }}
    >
      {children}
    </span>
  );
}

// ============================================================================
// 4. CURRENCY CHIP (colored by currency)
// Re-exported from CurrencyChip.tsx
// ============================================================================

export { CurrencyChip, DualCurrency, ConvertedPrice, toRWF } from "./CurrencyChip";
export type { Currency } from "@/lib/types";

// ============================================================================
// 5. STATUS PILL (semantic meaning) - BUMPED padding
// Usage: ↗ +2.3%, ● Profitable route, ● Stale price
// ============================================================================

type StatusVariant = "success" | "warning" | "error" | "neutral";

const STATUS_STYLES: Record<StatusVariant, { bg: string; text: string }> = {
  success: { bg: "#EAF3DE", text: "#3B6D11" },
  warning: { bg: "#FAEEDA", text: "#854F0B" },
  error: { bg: "#FCEBEB", text: "#A32D2D" },
  neutral: { bg: "#F1EFE8", text: "#444441" },
};

interface StatusPillProps {
  children: ReactNode;
  variant?: StatusVariant;
  showDot?: boolean;
  className?: string;
}

export function StatusPill({
  children,
  variant = "neutral",
  showDot = false,
  className = "",
}: StatusPillProps) {
  const styles = STATUS_STYLES[variant];

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        rounded-full px-[14px] py-[7px]
        text-[14px] font-bold
        ${className}
      `}
      style={{
        backgroundColor: styles.bg,
        color: styles.text,
      }}
    >
      {showDot && (
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: styles.text }}
        />
      )}
      {children}
    </span>
  );
}

// ============================================================================
// CHANGE PILL - BUMPED: 15px weight 700, padding 7px 14px
// ============================================================================

interface ChangePillProps {
  delta: number | null;
  showArrow?: boolean;
  size?: "sm" | "md" | "lg";
}

export function ChangePill({ delta, showArrow = true, size = "md" }: ChangePillProps) {
  if (delta === null || delta === undefined) {
    return <StatusPill variant="neutral">—</StatusPill>;
  }

  const isPositive = delta > 0;
  const isNegative = delta < 0;
  const arrow = showArrow ? (isPositive ? "↗ " : isNegative ? "↘ " : "") : "";

  // BUMPED sizes for readability
  const sizeClasses = {
    sm: "text-[13px] px-[10px] py-[5px]",    // was: 11px px-2 py-0.5
    md: "text-[15px] px-[14px] py-[7px]",    // was: 13px px-[13px] py-[6px]
    lg: "text-[16px] px-[16px] py-[8px]",    // was: 14px
  };

  if (delta === 0) {
    return (
      <span
        className={`inline-flex items-center rounded-full font-bold bg-[#F1EFE8] text-[#444441] ${sizeClasses[size]}`}
      >
        0%
      </span>
    );
  }

  const variant = isPositive ? "success" : "error";
  const styles = STATUS_STYLES[variant];

  return (
    <span
      className={`inline-flex items-center rounded-full font-bold ${sizeClasses[size]}`}
      style={{ backgroundColor: styles.bg, color: styles.text }}
      aria-label={`${isPositive ? "up" : "down"} ${Math.abs(delta).toFixed(1)} percent`}
    >
      {arrow}
      {Math.abs(delta).toFixed(1)}%
    </span>
  );
}

// ============================================================================
// SPREAD PILL - BUMPED: 15px weight 700, padding 7px 14px
// ============================================================================

interface SpreadPillProps {
  spread: number;
  showArrow?: boolean;
}

export function SpreadPill({ spread, showArrow = true }: SpreadPillProps) {
  const isHighSpread = spread >= 10;
  const isMediumSpread = spread >= 5 && spread < 10;

  const variant: StatusVariant = isHighSpread
    ? "success"
    : isMediumSpread
    ? "warning"
    : "neutral";

  const styles = STATUS_STYLES[variant];

  return (
    <span
      className="inline-flex items-center rounded-full px-[14px] py-[7px] text-[15px] font-bold"
      style={{ backgroundColor: styles.bg, color: styles.text }}
    >
      {showArrow && isHighSpread && "↗ "}
      {spread.toFixed(1)}%
    </span>
  );
}

// ============================================================================
// COMMODITY ROW - Helper for consistent commodity display
// ============================================================================

interface CommodityLabelProps {
  emoji: string;
  name: string;
  className?: string;
}

export function CommodityLabel({ emoji, name, className = "" }: CommodityLabelProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-[22px]">{emoji}</span>
      <span className="text-[17px] font-medium text-gray-700">{name}</span>
    </div>
  );
}
