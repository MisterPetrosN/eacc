"use client";

import { type Currency } from "@/components/shared/Pills";
import {
  PRIMARY_CURRENCY,
  toRWF,
  formatNumber,
  CommodityEmoji,
  CurrencyTicker,
} from "@/components/shared/PriceDisplay";

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
    rice?: PriceData;
    igitoki?: PriceData;
    irish_potatoes?: PriceData;
    sweet_potatoes?: PriceData;
    fuel?: PriceData;
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
  rwfPrice: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const commodities = [
  { key: "maize", name: "Maize", emoji: "🌽" },
  { key: "beans", name: "Beans", emoji: "🫘" },
  { key: "rice", name: "Rice", emoji: "🍚" },
  { key: "igitoki", name: "Igitoki", emoji: "🍌" },
  { key: "fuel", name: "Fuel", emoji: "⛽" },
];

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

// "BEST" pill
function BestPill() {
  return (
    <span
      className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
      style={{ backgroundColor: "#EAF3DE", color: "#3B6D11" }}
    >
      ↗ BEST
    </span>
  );
}

// Single commodity card - shows only the highest price market
// FIXED: RWF is always primary, original currency is secondary
function BestPriceCard({
  emoji,
  name,
  market,
}: {
  emoji: string;
  name: string;
  market: HighestPrice;
}) {
  const isNonRWF = market.currency !== PRIMARY_CURRENCY;

  return (
    <article
      className="rounded-xl flex flex-col justify-between"
      style={{
        backgroundColor: "#FEF9E7",
        border: "0.5px solid rgba(0,0,0,0.08)",
        padding: "12px 14px",
        minHeight: "90px",
      }}
      aria-label={`${name}: highest price at ${market.cityName}, ${formatNumber(market.rwfPrice)} RWF`}
    >
      {/* Top row: commodity name + BEST pill */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <CommodityEmoji emoji={emoji} />
          <span className="text-[14px] font-medium text-[var(--ink)]">
            {name}
          </span>
        </div>
        <BestPill />
      </div>

      {/* Bottom row: market (left) + price (right) */}
      <div className="flex justify-between items-end">
        {/* Market name */}
        <div className="text-[11px] font-medium" style={{ color: "#3B6D11" }}>
          {market.flag} {market.cityName}
        </div>

        {/* Price: RWF primary (large), original currency secondary (small) */}
        <div className="flex flex-col items-end gap-1">
          {/* PRIMARY: Always RWF */}
          <div className="text-[var(--text-price)] font-bold text-[var(--ink)] leading-none">
            {formatNumber(market.rwfPrice)}
            <CurrencyTicker currency="RWF" size="sm" className="ml-1 text-gray-500" />
          </div>

          {/* SECONDARY: Original currency if not RWF */}
          {isNonRWF && (
            <span
              className="text-[11px] font-medium px-2 py-0.5 rounded-full"
              style={{ backgroundColor: "#E6F1FB", color: "#185FA5" }}
            >
              ≈ {formatNumber(market.price)} {market.currency}
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
  // Find the highest price market for each commodity (by RWF value)
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
            rwfPrice: rwfValue,
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
          <span className="text-[1.5rem] md:text-[1.75rem]">📊</span>
          <h2 className="text-[15px] font-medium text-[var(--ink)]">
            Best prices across the region
          </h2>
        </div>
        <p className="text-[11px] text-gray-500 mt-0.5 ml-10 md:ml-11">
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
