"use client";

import { type Currency } from "@/components/shared/Pills";
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
  prices: {
    maize?: PriceData;
    beans?: PriceData;
    rice?: PriceData;
    igitoki?: PriceData;
    irish_potatoes?: PriceData;
    sweet_potatoes?: PriceData;
    fuel?: PriceData;
  };
}

interface CityCardProps {
  city: CityData;
  onReportPrice?: (cityId: string, commodity: string) => void;
  onPlayVoice?: (cityId: string) => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

// Grid commodities (2x3 layout)
const commodityConfig = [
  { key: "maize", name: "Maize", emoji: "🌽", comingSoon: false },
  { key: "beans", name: "Beans", emoji: "🫘", comingSoon: false },
  { key: "rice", name: "Rice", emoji: "🍚", comingSoon: false },
  { key: "igitoki", name: "Igitoki", emoji: "🍌", comingSoon: false },
  { key: "irish_potatoes", name: "Irish potatoes", emoji: "🥔", comingSoon: true },
  { key: "sweet_potatoes", name: "Sweet potatoes", emoji: "🍠", comingSoon: true },
];

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
// FUEL TILE - RESTRUCTURED TWO-ROW LAYOUT
// Row 1: Icon + "Fuel" (left) | Price + RWF (center-right) | % (far right)
// Row 2: "RWF/L" (left) | UGX conversion (center-right)
// ============================================================================
function FuelTile({
  price,
  change,
  currency,
  onClick,
}: {
  price: number;
  change: number | null;
  currency: Currency;
  onClick?: () => void;
}) {
  const isRWF = currency === PRIMARY_CURRENCY;
  const rwfPrice = isRWF ? price : toRWF(price, currency);

  const isUGX = currency === "UGX";
  const bgColor = isUGX ? "#E6F1FB" : "#FEF9E7";
  const priceColor = "var(--ink, #111827)";
  const labelColor = "var(--ink3, #6B7280)";

  return (
    <button
      onClick={onClick}
      className="col-span-2 rounded-lg transition-all hover:opacity-90 active:scale-[0.99]"
      style={{
        backgroundColor: bgColor,
        padding: "12px 16px",
      }}
      aria-label={`Fuel: ${formatNumber(rwfPrice)} RWF per liter`}
    >
      {/* ROW 1: Label (left) | Price (center-right) | % (far right) */}
      <div className="flex items-center justify-between">
        {/* Left column: Icon + Fuel label */}
        <div className="flex items-center gap-2">
          <CommodityEmoji emoji="⛽" className="text-[1.125rem] md:text-[1.25rem]" />
          <span className="text-[14px] md:text-[16px] font-medium" style={{ color: labelColor }}>
            Fuel
          </span>
        </div>

        {/* Right side: Price + Percentage */}
        <div className="flex items-center gap-4">
          {/* CENTER-RIGHT: Price - EXTRA BOLD (900) */}
          <div className="flex items-baseline">
            <span className="font-outfit text-[24px] md:text-[36px] font-black leading-none" style={{ color: priceColor }}>
              {formatNumber(rwfPrice)}
            </span>
            <span className="text-[11px] md:text-[13px] font-semibold ml-1 text-gray-500 align-baseline">RWF</span>
          </div>

          {/* FAR RIGHT: Percentage */}
          <ChangeIndicator change={change} />
        </div>
      </div>

      {/* ROW 2: Unit label (left) | UGX conversion (center-right) */}
      <div className="flex items-center justify-between mt-1">
        {/* Left: Unit indicator */}
        <span className="text-[11px] font-normal ml-7" style={{ color: labelColor, opacity: 0.7 }}>
          RWF/L
        </span>

        {/* Center-right: UGX conversion if applicable */}
        {!isRWF && (
          <span
            className="text-[11px] font-medium px-2 py-0.5 rounded-full mr-10"
            style={{ backgroundColor: "#FFFFFF", color: "#185FA5" }}
          >
            ≈ {formatNumber(price)} {currency}
          </span>
        )}
      </div>
    </button>
  );
}

// Empty Fuel tile - two-row layout
function EmptyFuelTile() {
  const labelColor = "var(--ink3, #6B7280)";

  return (
    <div
      className="col-span-2 rounded-lg opacity-55"
      style={{
        backgroundColor: "var(--surface, #F0F2F5)",
        padding: "12px 16px",
      }}
    >
      {/* ROW 1: Label (left) | em-dash (center-right) | em-dash (far right) */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CommodityEmoji emoji="⛽" className="text-[1.125rem] md:text-[1.25rem]" />
          <span className="text-[14px] md:text-[16px] font-medium" style={{ color: labelColor }}>
            Fuel
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-outfit text-[24px] md:text-[36px] font-black text-gray-400 leading-none">—</span>
          <span className="text-[11px] text-gray-400">—</span>
        </div>
      </div>
      {/* ROW 2: Unit label */}
      <div className="flex items-center mt-1">
        <span className="text-[11px] font-normal ml-7" style={{ color: labelColor, opacity: 0.7 }}>
          RWF/L
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function CityCard({ city, onReportPrice }: CityCardProps) {
  const cityCurrency = city.currency as Currency;
  const hasFuel = city.prices.fuel?.value !== null && city.prices.fuel?.value !== undefined;

  const handlePriceClick = (commodity: string) => {
    onReportPrice?.(city.id, commodity);
  };

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

      {/* Commodity tiles grid - 2x3 */}
      <div className="grid grid-cols-2 gap-2">
        {commodityConfig.map((commodity) => {
          // Coming soon tiles (Row 3: Irish potatoes, Sweet potatoes)
          if (commodity.comingSoon) {
            return (
              <ComingSoonTile
                key={commodity.key}
                emoji={commodity.emoji}
                name={commodity.name}
              />
            );
          }

          const priceData = city.prices[commodity.key as keyof typeof city.prices];
          const hasPrice = priceData?.value !== null && priceData?.value !== undefined;

          if (hasPrice) {
            return (
              <CommodityTile
                key={commodity.key}
                emoji={commodity.emoji}
                name={commodity.name}
                price={priceData!.value!}
                change={priceData!.change}
                currency={cityCurrency}
                onClick={() => handlePriceClick(commodity.key)}
              />
            );
          }

          return (
            <EmptyTile
              key={commodity.key}
              emoji={commodity.emoji}
              name={commodity.name}
            />
          );
        })}

        {/* Fuel bar - full width, always shown */}
        {hasFuel ? (
          <FuelTile
            price={city.prices.fuel!.value!}
            change={city.prices.fuel!.change}
            currency={cityCurrency}
            onClick={() => handlePriceClick("fuel")}
          />
        ) : (
          <EmptyFuelTile />
        )}
      </div>
    </article>
  );
}
