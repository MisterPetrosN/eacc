"use client";

import { type Currency } from "@/components/shared/Pills";

// ============================================================================
// TYPES
// ============================================================================

interface PriceData {
  value: number | null;
  change: number | null;
}

interface CityData {
  id: string;
  name: string;
  flag: string;
  currency: string;
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

interface BestPricesTopProps {
  cities: CityData[];
}

interface HighestPrice {
  cityName: string;
  flag: string;
  price: number;
  currency: Currency;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const commodities = [
  { key: "maize", name: "Maize", emoji: "🌽" },
  { key: "beans", name: "Beans", emoji: "🫘" },
  { key: "soya", name: "Soya", emoji: "🌱" },
  { key: "rice", name: "Rice", emoji: "🍚" },
  { key: "palm_oil", name: "Palm oil", emoji: "🌴" },
];

// P2P rate for UGX to RWF conversion
const UGX_TO_RWF = 0.343;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function formatNumber(value: number | null): string {
  if (value === null) return "—";
  return new Intl.NumberFormat("en-US").format(value);
}

function toRWF(value: number, currency: Currency): number {
  if (currency === "RWF") return value;
  if (currency === "UGX") return Math.round(value * UGX_TO_RWF);
  return value;
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

// "BEST" pill
function BestPill() {
  return (
    <span
      className="text-[10px] font-medium px-2 py-0.5 rounded-full"
      style={{ backgroundColor: "#EAF3DE", color: "#3B6D11" }}
    >
      ↗ BEST
    </span>
  );
}

// Single commodity card - shows only the highest price market
function BestPriceCard({
  emoji,
  name,
  market,
}: {
  emoji: string;
  name: string;
  market: HighestPrice;
}) {
  const isUGX = market.currency === "UGX";

  return (
    <article
      className="rounded-xl flex flex-col justify-between"
      style={{
        backgroundColor: "#FEF9E7",
        border: "0.5px solid rgba(0,0,0,0.08)",
        padding: "12px 14px",
        minHeight: "90px",
      }}
      aria-label={`${name}: highest price at ${market.cityName}, ${formatNumber(market.price)} ${market.currency}`}
    >
      {/* Top row: commodity name + BEST pill */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-[14px] font-medium text-[var(--ink)]">
          {emoji} {name}
        </span>
        <BestPill />
      </div>

      {/* Bottom row: market (left) + price (right) */}
      <div className="flex justify-between items-end">
        {/* Market name */}
        <div className="text-[11px] font-medium" style={{ color: "#3B6D11" }}>
          {market.flag} {market.cityName}
        </div>

        {/* Price hero + FX pill */}
        <div className="flex flex-col items-end gap-1">
          <div className="text-[22px] font-bold text-[var(--ink)] leading-none">
            {formatNumber(market.price)}
            <span className="text-[10px] font-normal text-gray-400 ml-0.5">
              {market.currency}
            </span>
          </div>
          {/* UGX: White pill FX conversion */}
          {isUGX && (
            <span
              className="text-[11px] font-medium px-2 py-0.5 rounded-full"
              style={{ backgroundColor: "#FFFFFF", color: "#3B6D11" }}
            >
              ≈ {formatNumber(toRWF(market.price, market.currency))} RWF
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function BestPricesTop({ cities }: BestPricesTopProps) {
  // Find the highest price market for each commodity
  const getHighestPrice = (commodityKey: string): HighestPrice | null => {
    let highest: HighestPrice | null = null;
    let highestRwfValue = 0;

    for (const city of cities) {
      const priceData = city.prices[commodityKey as keyof typeof city.prices];
      if (priceData?.value !== null && priceData?.value !== undefined) {
        const currency = city.currency as Currency;
        const rwfValue = toRWF(priceData.value, currency);

        if (rwfValue > highestRwfValue) {
          highestRwfValue = rwfValue;
          highest = {
            cityName: city.name,
            flag: city.flag,
            price: priceData.value,
            currency,
          };
        }
      }
    }

    return highest;
  };

  // Build data for all commodities
  const bestPrices = commodities
    .map((commodity) => ({
      ...commodity,
      highest: getHighestPrice(commodity.key),
    }))
    .filter((c) => c.highest !== null);

  if (bestPrices.length === 0) {
    return null;
  }

  return (
    <section className="mb-4" aria-label="Best prices across the region">
      {/* Header */}
      <div className="mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[18px]">📊</span>
          <h2 className="text-[15px] font-medium text-[var(--ink)]">
            Best prices across the region
          </h2>
        </div>
        <p className="text-[11px] text-gray-500 mt-0.5 ml-7">
          Where each commodity is selling highest
        </p>
      </div>

      {/* Card grid */}
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}
      >
        {bestPrices.map((item) => (
          <BestPriceCard
            key={item.key}
            emoji={item.emoji}
            name={item.name}
            market={item.highest!}
          />
        ))}
      </div>
    </section>
  );
}
