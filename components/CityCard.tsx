"use client";

import { type Currency } from "@/components/shared/Pills";
import type { CommodityRow } from "@/lib/types";
import {
  PRIMARY_CURRENCY,
  toRWF,
  formatNumber,
  CommodityEmoji,
  CurrencyBadge,
  ChangeIndicator,
} from "@/components/shared/PriceDisplay";

// ============================================================================
// TYPES
// ============================================================================

interface PriceData {
  value: number | null;
  change: number | null;
  currency: string;
  unit?: string;
  reportedAt?: string;
}

interface CityData {
  id: string;
  name: string;
  country: string;
  flag: string;
  subtitle: string;
  currency: string;
  specialBadge?: string | null;
  accentBorder?: string;
  prices: Record<string, PriceData | undefined>;
}

interface CityCardProps {
  city: CityData;
  commodities: CommodityRow[];
  onReportPrice?: (cityId: string, commodity: string) => void;
  onPlayVoice?: (cityId: string) => void;
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

// ============================================================================
// COMMODITY TILE - FINANCIAL DASHBOARD LAYOUT (Bloomberg/TradingView style)
// Top: emoji+name LEFT, % TOP-RIGHT (metadata row)
// Middle: price CENTERED (hero element)
// Bottom: UGX conversion centered (if applicable)
// ============================================================================

function CommodityTile({
  emoji,
  name,
  price,
  change,
  currency,
  onClick,
}: {
  emoji: string;
  name: string;
  price: number;
  change: number | null;
  currency: Currency;
  onClick?: () => void;
}) {
  const isRWF = currency === PRIMARY_CURRENCY;
  const rwfPrice = isRWF ? price : toRWF(price, currency);

  // Colors based on source currency (for background tinting)
  const isUGX = currency === "UGX";
  const bgColor = isUGX ? "#E6F1FB" : "#FEF9E7";
  const labelColor = "var(--ink3, #6B7280)";
  const priceColor = "var(--ink, #111827)";

  return (
    <button
      onClick={onClick}
      className="text-left rounded-lg transition-all hover:opacity-90 active:scale-[0.98] flex flex-col"
      style={{
        backgroundColor: bgColor,
        padding: "16px",
        minHeight: "115px",
      }}
      aria-label={`${name}: ${formatNumber(rwfPrice)} RWF${!isRWF ? `, approximately ${formatNumber(price)} ${currency}` : ""}`}
    >
      {/* TOP ROW: Label (left) + Percent change (right) - METADATA */}
      <div className="flex items-center justify-between gap-1.5 mb-2">
        {/* Left: emoji + name */}
        <div className="flex items-center gap-1.5">
          <CommodityEmoji emoji={emoji} className="text-[1rem] md:text-[1.125rem]" />
          <span className="text-[14px] md:text-[16px] font-normal" style={{ color: labelColor }}>
            {name}
          </span>
        </div>

        {/* Right: Percent change */}
        <ChangeIndicator change={change} />
      </div>

      {/* MIDDLE: Price CENTERED - HERO ELEMENT */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {/* PRIMARY: Always RWF - centered, hero size, EXTRA BOLD (900) */}
        {/* Use 28px on mobile for 4-digit prices to avoid cramping */}
        <div className="font-outfit text-[28px] md:text-[44px] font-black leading-none text-center" style={{ color: priceColor }}>
          {formatNumber(rwfPrice)}
          <span className="text-[11px] md:text-[13px] font-semibold ml-1 text-gray-500 align-baseline">RWF</span>
        </div>

        {/* SECONDARY: UGX conversion pill centered below price */}
        {!isRWF && (
          <span
            className="text-[11px] font-medium px-2 py-0.5 rounded-full mt-2"
            style={{ backgroundColor: "#FFFFFF", color: "#185FA5" }}
          >
            ≈ {formatNumber(price)} {currency}
          </span>
        )}
      </div>
    </button>
  );
}

// Empty tile - financial dashboard layout
function EmptyTile({ emoji, name }: { emoji: string; name: string }) {
  return (
    <div
      className="rounded-lg flex flex-col opacity-55"
      style={{
        backgroundColor: "var(--surface, #F0F2F5)",
        padding: "16px",
        minHeight: "115px",
      }}
    >
      {/* TOP ROW: Label (left) + placeholder % (right) */}
      <div className="flex items-center justify-between gap-1.5 mb-2">
        <div className="flex items-center gap-1.5">
          <CommodityEmoji emoji={emoji} className="text-[1rem] md:text-[1.125rem]" />
          <span className="text-[14px] md:text-[16px] font-normal text-gray-500">{name}</span>
        </div>
        <span className="text-[11px] text-gray-400">—</span>
      </div>

      {/* MIDDLE: em-dash centered where price would be */}
      <div className="flex-1 flex items-center justify-center">
        <span className="font-outfit text-[28px] md:text-[44px] font-black text-gray-400 leading-none">—</span>
      </div>
    </div>
  );
}

// Coming Soon tile - financial dashboard layout with blur
function ComingSoonTile({ emoji, name }: { emoji: string; name: string }) {
  return (
    <div
      className="rounded-lg relative overflow-hidden"
      style={{
        backgroundColor: "var(--surface, #F0F2F5)",
        padding: "16px",
        minHeight: "115px",
      }}
    >
      {/* Blurred content - financial dashboard layout */}
      <div className="flex flex-col h-full filter blur-[4px] opacity-40">
        {/* TOP ROW: Label (left) + % (right) */}
        <div className="flex items-center justify-between gap-1.5 mb-2">
          <div className="flex items-center gap-1.5">
            <CommodityEmoji emoji={emoji} className="text-[1rem] md:text-[1.125rem]" />
            <span className="text-[14px] md:text-[16px] font-normal text-gray-500">{name}</span>
          </div>
          <span className="text-[11px] text-gray-400">+1.2%</span>
        </div>
        {/* MIDDLE: Centered price */}
        <div className="flex-1 flex items-center justify-center">
          <span className="font-outfit text-[28px] md:text-[44px] font-black text-gray-400 leading-none">450</span>
        </div>
      </div>

      {/* Coming Soon overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="text-[10px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded"
          style={{ backgroundColor: "var(--ink, #111827)", color: "#FFFFFF" }}
        >
          Coming soon
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function CityCard({ city, commodities, onReportPrice }: CityCardProps) {
  const cityCurrency = city.currency as Currency;

  const handlePriceClick = (commodity: string) => {
    onReportPrice?.(city.id, commodity);
  };

  // Sort commodities by tab_order
  const sortedCommodities = [...commodities].sort((a, b) => a.tab_order - b.tab_order);

  return (
    <article
      className="rounded-xl bg-white"
      style={{
        border: "0.5px solid rgba(0,0,0,0.08)",
        padding: "14px 16px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      }}
      aria-label={`${city.name} market prices`}
    >
      {/* Header */}
      <header
        className="flex justify-between items-start pb-2.5 mb-3"
        style={{ borderBottom: "0.5px solid rgba(0,0,0,0.08)" }}
      >
        <div>
          <div className="flex items-center">
            <span className="text-[14px]">{city.flag}</span>
            <span className="text-[14px] font-medium text-[var(--ink)] ml-1.5">
              {city.name}
            </span>
          </div>
          <p className="text-[11px] text-gray-500 mt-0.5">{city.subtitle}</p>
        </div>
        <CurrencyBadge currency={cityCurrency} />
      </header>

      {/* Commodity tiles grid - dynamic based on commodities prop */}
      <div className="grid grid-cols-2 gap-2">
        {sortedCommodities.map((commodity) => {
          const priceData = city.prices[commodity.id];
          const hasPrice = priceData?.value !== null && priceData?.value !== undefined;

          // Check if commodity is coming soon (status !== 'live')
          if (commodity.status !== "live") {
            return (
              <ComingSoonTile
                key={commodity.id}
                emoji={commodity.icon}
                name={commodity.name}
              />
            );
          }

          if (hasPrice) {
            return (
              <CommodityTile
                key={commodity.id}
                emoji={commodity.icon}
                name={commodity.name}
                price={priceData!.value!}
                change={priceData!.change}
                currency={(priceData?.currency as Currency) || cityCurrency}
                onClick={() => handlePriceClick(commodity.id)}
              />
            );
          }

          return (
            <EmptyTile
              key={commodity.id}
              emoji={commodity.icon}
              name={commodity.name}
            />
          );
        })}
      </div>
    </article>
  );
}
