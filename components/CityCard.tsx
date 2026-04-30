"use client";

import { type Currency } from "@/components/shared/Pills";

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

// P2P rates for UGX to RWF conversion
const UGX_TO_RWF = 0.343;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function formatNumber(value: number | null): string {
  if (value === null) return "—";
  return new Intl.NumberFormat("en-US").format(value);
}

function formatChange(change: number | null): string {
  if (change === null || change === undefined) return "—";
  // Use proper minus sign (U+2212) for negative
  const sign = change >= 0 ? "+" : "\u2212";
  return `${sign}${Math.abs(change).toFixed(1)}%`;
}

function toRWF(ugxValue: number): number {
  return Math.round(ugxValue * UGX_TO_RWF);
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

// Currency pill in header
function CurrencyPill({ currency }: { currency: Currency }) {
  const isUGX = currency === "UGX";
  const bgColor = isUGX ? "#E6F1FB" : "#EAF3DE";
  const textColor = isUGX ? "#185FA5" : "#3B6D11";

  return (
    <span
      className="text-[10px] font-medium px-2 py-0.5 rounded-full"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      {currency}
    </span>
  );
}

// ============================================================================
// COMMODITY TILE - CORNER POSITIONING LAYOUT
// Label top-left, Price top-right (hero 55px), Percent bottom-left
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
  const isUGX = currency === "UGX";
  const bgColor = isUGX ? "#E6F1FB" : "#FEF9E7";
  const labelColor = isUGX ? "#185FA5" : "var(--ink3, #6B7280)";
  const priceColor = isUGX ? "#042C53" : "var(--ink, #111827)";
  const suffixColor = isUGX ? "#185FA5" : "var(--ink4, #9CA3AF)";
  const changeColor = (change ?? 0) >= 0 ? "#3B6D11" : "#A32D2D";

  return (
    <button
      onClick={onClick}
      className="text-left rounded-lg transition-all hover:opacity-90 active:scale-[0.98] flex flex-col justify-between"
      style={{
        backgroundColor: bgColor,
        padding: "8px 10px",
        minHeight: "100px",
      }}
      aria-label={`${name}: ${formatNumber(price)} ${currency}${isUGX ? `, approximately ${formatNumber(toRWF(price))} RWF` : ""}`}
    >
      {/* TOP ROW: Label (left) + Price (right) */}
      <div className="flex items-start justify-between gap-1.5">
        {/* Left: emoji + name */}
        <div className="flex items-center gap-1.5">
          <span className="text-[13px]">{emoji}</span>
          <span className="text-[12px] font-normal" style={{ color: labelColor }}>
            {name}
          </span>
        </div>

        {/* Right: Price hero (+ FX pill for UGX) */}
        <div className="flex flex-col items-end gap-1">
          {/* Price: 55px hero (2.5x), weight 700 */}
          <div className="text-[55px] font-bold leading-none" style={{ color: priceColor }}>
            {formatNumber(price)}
            <span className="text-[10px] font-normal ml-0.5" style={{ color: suffixColor }}>
              {currency}
            </span>
          </div>

          {/* UGX: White pill FX conversion */}
          {isUGX && (
            <span
              className="text-[11px] font-medium px-2 py-0.5 rounded-full"
              style={{ backgroundColor: "#FFFFFF", color: "#3B6D11" }}
            >
              ≈ {formatNumber(toRWF(price))} RWF
            </span>
          )}
        </div>
      </div>

      {/* BOTTOM ROW: Percent change (left), empty (right) */}
      <div className="flex justify-between items-end">
        <span className="text-[11px] font-medium" style={{ color: changeColor }}>
          {formatChange(change)}
        </span>
      </div>
    </button>
  );
}

// Empty tile - same structure for alignment
function EmptyTile({ emoji, name }: { emoji: string; name: string }) {
  return (
    <div
      className="rounded-lg flex flex-col justify-between opacity-55"
      style={{
        backgroundColor: "var(--surface, #F0F2F5)",
        padding: "8px 10px",
        minHeight: "100px",
      }}
    >
      {/* TOP ROW */}
      <div className="flex items-start justify-between gap-1.5">
        {/* Left: emoji + name */}
        <div className="flex items-center gap-1.5">
          <span className="text-[13px]">{emoji}</span>
          <span className="text-[12px] font-normal text-gray-500">{name}</span>
        </div>
        {/* Right: em-dash where price would be */}
        <span className="text-[40px] font-bold text-gray-400 leading-none">—</span>
      </div>

      {/* BOTTOM ROW */}
      <div className="flex justify-between items-end">
        <span className="text-[11px] text-gray-400">—</span>
      </div>
    </div>
  );
}

// Coming Soon tile - blurred with overlay
function ComingSoonTile({ emoji, name }: { emoji: string; name: string }) {
  return (
    <div
      className="rounded-lg relative overflow-hidden"
      style={{
        backgroundColor: "var(--surface, #F0F2F5)",
        padding: "8px 10px",
        minHeight: "100px",
      }}
    >
      {/* Blurred content */}
      <div className="flex flex-col justify-between h-full filter blur-[4px] opacity-40">
        <div className="flex items-start justify-between gap-1.5">
          <div className="flex items-center gap-1.5">
            <span className="text-[13px]">{emoji}</span>
            <span className="text-[12px] font-normal text-gray-500">{name}</span>
          </div>
          <span className="text-[40px] font-bold text-gray-400 leading-none">450</span>
        </div>
        <div className="flex justify-between items-end">
          <span className="text-[11px] text-gray-400">+1.2%</span>
        </div>
      </div>

      {/* Coming Soon overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="text-[10px] font-medium uppercase tracking-wide px-2.5 py-1 rounded"
          style={{ backgroundColor: "var(--ink, #111827)", color: "#FFFFFF" }}
        >
          Coming soon
        </span>
      </div>
    </div>
  );
}

// Fuel tile (full-width bottom bar)
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
  const isUGX = currency === "UGX";
  const changeColor = (change ?? 0) >= 0 ? "#3B6D11" : "#A32D2D";
  const bgColor = isUGX ? "#E6F1FB" : "#FEF9E7";
  const priceColor = isUGX ? "#042C53" : "var(--ink, #111827)";
  const labelColor = isUGX ? "#185FA5" : "var(--ink3, #6B7280)";

  return (
    <button
      onClick={onClick}
      className="col-span-2 flex justify-between items-center rounded-lg transition-all hover:opacity-90 active:scale-[0.99]"
      style={{
        backgroundColor: bgColor,
        padding: "10px 14px",
      }}
      aria-label={`Fuel: ${formatNumber(price)} ${currency} per liter`}
    >
      <div className="flex items-baseline gap-1.5">
        <span className="text-[13px]">⛽</span>
        <span className="text-[12px] font-medium" style={{ color: labelColor }}>
          Fuel
        </span>
        <span className="text-[10px] font-normal" style={{ color: labelColor, opacity: 0.7 }}>
          {currency}/L
        </span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-baseline">
          <span className="text-[32px] font-bold leading-none" style={{ color: priceColor }}>
            {formatNumber(price)}
          </span>
          <span className="text-[10px] font-normal ml-0.5" style={{ color: labelColor }}>
            {currency}
          </span>
        </div>
        {/* UGX: RWF conversion pill */}
        {isUGX && (
          <span
            className="text-[11px] font-medium px-2 py-0.5 rounded-full"
            style={{ backgroundColor: "#FFFFFF", color: "#3B6D11" }}
          >
            ≈ {formatNumber(toRWF(price))} RWF
          </span>
        )}
        <span className="text-[11px] font-medium" style={{ color: changeColor }}>
          {formatChange(change)}
        </span>
      </div>
    </button>
  );
}

// Empty Fuel tile
function EmptyFuelTile({ currency }: { currency: Currency }) {
  const isUGX = currency === "UGX";
  const labelColor = isUGX ? "#185FA5" : "var(--ink3, #6B7280)";

  return (
    <div
      className="col-span-2 flex justify-between items-center rounded-lg opacity-55"
      style={{
        backgroundColor: "var(--surface, #F0F2F5)",
        padding: "10px 14px",
      }}
    >
      <div className="flex items-baseline gap-1.5">
        <span className="text-[13px]">⛽</span>
        <span className="text-[12px] font-medium" style={{ color: labelColor }}>
          Fuel
        </span>
        <span className="text-[10px] font-normal" style={{ color: labelColor, opacity: 0.7 }}>
          {currency}/L
        </span>
      </div>
      <span className="text-[32px] font-bold text-gray-400 leading-none">—</span>
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
        <CurrencyPill currency={cityCurrency} />
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
          <EmptyFuelTile currency={cityCurrency} />
        )}
      </div>
    </article>
  );
}
