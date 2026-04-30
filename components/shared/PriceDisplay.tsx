"use client";

import { type Currency } from "@/components/shared/Pills";

// ============================================================================
// CONSTANTS
// ============================================================================

export const PRIMARY_CURRENCY: Currency = "RWF";

// P2P rates for conversion TO RWF
export const P2P_RATES: Record<Currency, number> = {
  RWF: 1,
  UGX: 0.343,
  CDF: 0.47,
  TZS: 0.52,
  USD: 1280,
  ETB: 22,
  KES: 9.5,
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function toRWF(value: number, fromCurrency: Currency): number {
  if (fromCurrency === "RWF") return value;
  return Math.round(value * P2P_RATES[fromCurrency]);
}

export function formatNumber(value: number | null): string {
  if (value === null) return "—";
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatChange(change: number | null): string {
  if (change === null || change === undefined) return "—";
  const sign = change >= 0 ? "+" : "\u2212";
  return `${sign}${Math.abs(change).toFixed(1)}%`;
}

// ============================================================================
// SHARED COMPONENTS
// ============================================================================

// Standardized emoji wrapper - 24px mobile, 28px tablet+
export function CommodityEmoji({ emoji, className = "" }: { emoji: string; className?: string }) {
  return (
    <span
      className={`text-[1.5rem] md:text-[1.75rem] leading-none inline-flex items-center justify-center ${className}`}
      role="img"
    >
      {emoji}
    </span>
  );
}

// Standardized currency ticker - bold, 20% larger
export function CurrencyTicker({
  currency,
  size = "sm",
  className = ""
}: {
  currency: Currency;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeClasses = {
    xs: "text-[10px]",  // was 8px, now 10px (+25%)
    sm: "text-[12px]",  // was 10px, now 12px (+20%)
    md: "text-[14px]",  // was 12px, now 14px
    lg: "text-[16px]",  // was 14px, now 16px
  };

  return (
    <span className={`font-semibold ${sizeClasses[size]} ${className}`}>
      {currency}
    </span>
  );
}

// Primary price display (RWF always large)
// If source currency is not RWF, convert and show RWF as primary
interface PriceDisplayProps {
  price: number;
  currency: Currency;
  primarySize?: "sm" | "md" | "lg" | "xl" | "hero";
  showSecondary?: boolean;
  className?: string;
}

export function PriceDisplay({
  price,
  currency,
  primarySize = "lg",
  showSecondary = true,
  className = "",
}: PriceDisplayProps) {
  const isRWF = currency === "RWF";
  const rwfPrice = isRWF ? price : toRWF(price, currency);

  const primarySizeClasses = {
    sm: "text-[18px]",
    md: "text-[22px]",
    lg: "text-[28px]",
    xl: "text-[32px]",
    hero: "text-[55px]",
  };

  return (
    <div className={`flex flex-col items-end gap-1 ${className}`}>
      {/* Primary: Always RWF */}
      <div className={`${primarySizeClasses[primarySize]} font-bold leading-none text-[var(--ink)]`}>
        {formatNumber(rwfPrice)}
        <CurrencyTicker currency="RWF" size="sm" className="ml-1 text-[var(--ink4)]" />
      </div>

      {/* Secondary: Original currency if not RWF */}
      {showSecondary && !isRWF && (
        <span
          className="text-[11px] font-medium px-2 py-0.5 rounded-full"
          style={{ backgroundColor: "#E6F1FB", color: "#185FA5" }}
        >
          ≈ {formatNumber(price)} {currency}
        </span>
      )}
    </div>
  );
}

// Currency region badge (e.g., the green "RWF" pill on cards)
export function CurrencyBadge({ currency }: { currency: Currency }) {
  const isUGX = currency === "UGX";
  const bgColor = isUGX ? "#E6F1FB" : "#EAF3DE";
  const textColor = isUGX ? "#185FA5" : "#3B6D11";

  return (
    <span
      className="text-[11px] font-bold px-2.5 py-1 rounded-full"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      {currency}
    </span>
  );
}

// Change indicator with consistent styling
export function ChangeIndicator({ change, className = "" }: { change: number | null; className?: string }) {
  const changeColor = (change ?? 0) >= 0 ? "#3B6D11" : "#A32D2D";

  return (
    <span
      className={`text-[11px] font-semibold ${className}`}
      style={{ color: changeColor }}
    >
      {formatChange(change)}
    </span>
  );
}
