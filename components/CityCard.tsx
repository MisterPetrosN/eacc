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
    soya?: PriceData;
    rice?: PriceData;
    palm_oil?: PriceData;
    fuel?: PriceData;
    gold?: PriceData;
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

const commodityConfig = [
  { key: "maize", name: "Maize", emoji: "🌽" },
  { key: "beans", name: "Beans", emoji: "🫘" },
  { key: "soya", name: "Soya", emoji: "🌱" },
  { key: "rice", name: "Rice", emoji: "🍚" },
  { key: "palm_oil", name: "Palm oil", emoji: "🌴" },
  { key: "fuel", name: "Fuel", emoji: "⛽" },
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

// Gold Hub badge
function GoldHubBadge() {
  return (
    <span
      className="text-[9px] font-medium tracking-[0.5px] px-1.5 py-0.5 rounded-full ml-1.5"
      style={{ backgroundColor: "#FAEEDA", color: "#854F0B" }}
    >
      GOLD HUB
    </span>
  );
}

// ============================================================================
// COMMODITY TILE - CORNER POSITIONING LAYOUT
// Label top-left, Price top-right (hero), Percent bottom-left, bottom-right empty
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
        padding: "10px 12px",
        minHeight: "78px",
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
          {/* Price: 22px hero, weight 700 */}
          <div className="text-[22px] font-bold leading-none" style={{ color: priceColor }}>
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
        {/* Bottom-right intentionally empty */}
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
        padding: "10px 12px",
        minHeight: "78px",
      }}
    >
      {/* TOP ROW */}
      <div className="flex items-start justify-between gap-1.5">
        {/* Left: emoji + name */}
        <div className="flex items-center gap-1.5">
          <span className="text-[13px]">{emoji}</span>
          <span className="text-[12px] font-normal text-gray-500">{name}</span>
        </div>
        {/* Right: em-dash where price would be, weight 700 to match */}
        <span className="text-[22px] font-bold text-gray-400 leading-none">—</span>
      </div>

      {/* BOTTOM ROW */}
      <div className="flex justify-between items-end">
        <span className="text-[11px] text-gray-400">—</span>
      </div>
    </div>
  );
}

// Gold tile (special, wide)
function GoldTile({
  price,
  change,
  onClick,
}: {
  price: number;
  change: number | null;
  onClick?: () => void;
}) {
  const hasChange = change !== null && change !== undefined;
  const changeColor = (change ?? 0) >= 0 ? "#3B6D11" : "#A32D2D";

  return (
    <button
      onClick={onClick}
      className="col-span-2 flex justify-between items-center rounded-lg transition-all hover:opacity-90 active:scale-[0.99]"
      style={{
        backgroundColor: "#FAEEDA",
        padding: "8px 10px",
      }}
      aria-label={`Gold: ${formatNumber(price)} USD per gram`}
    >
      <div className="flex items-baseline gap-1">
        <span className="text-[11px] font-medium" style={{ color: "#854F0B" }}>
          🥇 Gold
        </span>
        <span className="text-[9px] font-normal" style={{ color: "#854F0B", opacity: 0.7 }}>
          USD/g
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[14px] font-bold" style={{ color: "#412402" }}>
          {formatNumber(price)}
          <span className="text-[10px] font-normal ml-0.5 opacity-70">USD</span>
        </span>
        {hasChange && (
          <span className="text-[10px] font-medium" style={{ color: changeColor }}>
            {formatChange(change)}
          </span>
        )}
      </div>
    </button>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function CityCard({ city, onReportPrice }: CityCardProps) {
  const hasGold = city.prices.gold?.value !== null && city.prices.gold?.value !== undefined;
  const isGomaStyle = city.specialBadge === "GOLD HUB";
  const cityCurrency = city.currency as Currency;

  const handlePriceClick = (commodity: string) => {
    onReportPrice?.(city.id, commodity);
  };

  return (
    <article
      className="rounded-xl bg-white"
      style={{
        border: isGomaStyle
          ? "1.5px solid #EF9F27"
          : "0.5px solid rgba(0,0,0,0.08)",
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
            {isGomaStyle && <GoldHubBadge />}
          </div>
          <p className="text-[11px] text-gray-500 mt-0.5">{city.subtitle}</p>
        </div>
        <CurrencyPill currency={cityCurrency} />
      </header>

      {/* Commodity tiles grid - 2 columns */}
      <div className="grid grid-cols-2 gap-2">
        {commodityConfig.map((commodity) => {
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

        {/* Gold tile - spans both columns */}
        {hasGold && (
          <GoldTile
            price={city.prices.gold!.value!}
            change={city.prices.gold!.change}
            onClick={() => handlePriceClick("gold")}
          />
        )}
      </div>
    </article>
  );
}
