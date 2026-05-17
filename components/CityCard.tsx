"use client";

import { useState, useEffect } from "react";
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
  currency?: string;
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

interface PrevPriceData {
  price: number;
  change: number | null;
}

interface CityCardProps {
  city: CityData;
  commodities: CommodityRow[];
  prevPrices?: Record<string, PrevPriceData>;
  onReportPrice?: (cityId: string, commodity: string) => void;
  onPlayVoice?: (cityId: string) => void;
}

// ============================================================================
// LIVE PRICE TILE - With flash animation on change
// ============================================================================

function LivePriceTile({
  emoji,
  name,
  price,
  change,
  currency,
  cityCurrency,
  commodityId,
  prevPrice,
  prevChange,
  onClick,
}: {
  emoji: string;
  name: string;
  price: number;
  change: number | null;
  currency: Currency;
  cityCurrency: Currency;
  commodityId: string;
  prevPrice?: number;
  prevChange?: number | null;
  onClick?: () => void;
}) {
  const [flash, setFlash] = useState<"up" | "down" | null>(null);

  // Detect price or change updates and trigger flash
  useEffect(() => {
    // Check if change_pct is non-zero and different from previous
    if (change !== null && change !== 0 && change !== prevChange) {
      setFlash(change > 0 ? "up" : "down");
      const timer = setTimeout(() => setFlash(null), 2000);
      return () => clearTimeout(timer);
    }

    // Also check if price itself changed
    if (prevPrice !== undefined && price !== prevPrice) {
      const direction = price > prevPrice ? "up" : "down";
      setFlash(direction);
      const timer = setTimeout(() => setFlash(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [price, change, prevPrice, prevChange]);

  // Use price's currency if available, otherwise use city's currency
  const actualCurrency = currency || cityCurrency;
  const isRWF = actualCurrency === PRIMARY_CURRENCY;
  const rwfPrice = isRWF ? price : toRWF(price, actualCurrency);

  // Colors based on city currency (for background tinting)
  const isUGXCity = cityCurrency === "UGX";
  const normalBg = isUGXCity ? "#E6F1FB" : "#FEF9E7";

  return (
    <button
      onClick={onClick}
      className={`text-left rounded-lg flex flex-col relative overflow-hidden
        hover:opacity-90 active:scale-[0.98]
        ${flash === "up" ? "price-flash-up" : ""}
        ${flash === "down" ? "price-flash-down" : ""}`}
      style={{
        backgroundColor: flash === "up"
          ? "#22C55E" // bright green
          : flash === "down"
          ? "#EF4444" // bright red
          : normalBg,
        padding: "14px",
        minHeight: "105px",
        transition: "background-color 0.4s ease-out",
      }}
      aria-label={`${name}: ${formatNumber(rwfPrice)} RWF`}
    >
      {/* TOP ROW: Label (left) + Percent change (right) */}
      <div className="flex items-center justify-between gap-1.5 mb-2 relative z-10">
        {/* Left: emoji + name */}
        <div className="flex items-center gap-1.5">
          <CommodityEmoji emoji={emoji} className="text-[1rem] md:text-[1.125rem]" />
          <span
            className="text-[13px] md:text-[15px] font-medium transition-colors duration-300"
            style={{ color: flash ? "#FFFFFF" : "var(--ink3, #6B7280)" }}
          >
            {name}
          </span>
        </div>

        {/* Right: Percent change */}
        <div className={`transition-transform duration-300 ${flash ? "scale-125" : ""}`}>
          {flash ? (
            <span className="text-[13px] font-bold text-white">
              {change && change > 0 ? "▲" : "▼"} {Math.abs(change || 0).toFixed(1)}%
            </span>
          ) : (
            <ChangeIndicator change={change} />
          )}
        </div>
      </div>

      {/* MIDDLE: Price CENTERED */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10">
        <div
          className={`font-outfit text-[26px] md:text-[40px] font-black leading-none text-center
            transition-all duration-300 ${flash ? "scale-110" : ""}`}
          style={{
            color: flash ? "#FFFFFF" : "var(--ink, #111827)",
          }}
        >
          {formatNumber(rwfPrice)}
          <span
            className="text-[10px] md:text-[12px] font-semibold ml-1 align-baseline transition-colors duration-300"
            style={{ color: flash ? "rgba(255,255,255,0.8)" : "#6B7280" }}
          >
            RWF
          </span>
        </div>
      </div>

      {/* Arrow indicator during flash */}
      {flash && (
        <div className="absolute top-2 right-2 text-white text-xl animate-bounce">
          {flash === "up" ? "↑" : "↓"}
        </div>
      )}
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
        padding: "14px",
        minHeight: "105px",
      }}
    >
      {/* TOP ROW: Label (left) + placeholder % (right) */}
      <div className="flex items-center justify-between gap-1.5 mb-2">
        <div className="flex items-center gap-1.5">
          <CommodityEmoji emoji={emoji} className="text-[1rem] md:text-[1.125rem]" />
          <span className="text-[13px] md:text-[15px] font-normal text-gray-500">{name}</span>
        </div>
        <span className="text-[11px] text-gray-400">—</span>
      </div>

      {/* MIDDLE: em-dash centered where price would be */}
      <div className="flex-1 flex items-center justify-center">
        <span className="font-outfit text-[26px] md:text-[40px] font-black text-gray-400 leading-none">—</span>
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
        padding: "14px",
        minHeight: "105px",
      }}
    >
      {/* Blurred content - financial dashboard layout */}
      <div className="flex flex-col h-full filter blur-[4px] opacity-40">
        {/* TOP ROW: Label (left) + % (right) */}
        <div className="flex items-center justify-between gap-1.5 mb-2">
          <div className="flex items-center gap-1.5">
            <CommodityEmoji emoji={emoji} className="text-[1rem] md:text-[1.125rem]" />
            <span className="text-[13px] md:text-[15px] font-normal text-gray-500">{name}</span>
          </div>
          <span className="text-[11px] text-gray-400">+1.2%</span>
        </div>
        {/* MIDDLE: Centered price */}
        <div className="flex-1 flex items-center justify-center">
          <span className="font-outfit text-[26px] md:text-[40px] font-black text-gray-400 leading-none">450</span>
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

export function CityCard({ city, commodities, prevPrices, onReportPrice }: CityCardProps) {
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
            const prev = prevPrices?.[commodity.id];
            return (
              <LivePriceTile
                key={commodity.id}
                commodityId={commodity.id}
                emoji={commodity.icon}
                name={commodity.name}
                price={priceData!.value!}
                change={priceData!.change}
                prevPrice={prev?.price}
                prevChange={prev?.change}
                currency={(priceData?.currency as Currency) || cityCurrency}
                cityCurrency={cityCurrency}
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
