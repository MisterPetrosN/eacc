"use client";

import { useState, useEffect } from "react";
import { type Currency } from "@/components/shared/Pills";
import {
  PRIMARY_CURRENCY,
  P2P_RATES,
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

interface BestPriceComparisonProps {
  cities: CityData[];
}

interface CityPrice {
  cityName: string;
  flag: string;
  price: number;
  currency: Currency;
  rwfPrice: number;
}

interface ComparisonData {
  key: string;
  name: string;
  emoji: string;
  cheapest: CityPrice;
  mostExpensive: CityPrice;
  spread: number;
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

const ARB_THRESHOLD = 12; // >= 12% is "Arb opportunity"

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Africa/Kigali",
  }) + " CAT";
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

// Arb badge pill
function ArbBadge({ spread }: { spread: number }) {
  const isHigh = spread >= ARB_THRESHOLD;

  if (isHigh) {
    return (
      <span
        className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
        style={{ backgroundColor: "#EAF3DE", color: "#3B6D11" }}
      >
        ↗ {spread.toFixed(1)}%
      </span>
    );
  }

  // Watch/low arb: amber styling
  return (
    <span
      className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
      style={{ backgroundColor: "#FAEEDA", color: "#854F0B" }}
    >
      {spread.toFixed(1)}%
    </span>
  );
}

// Commodity comparison card - RWF ALWAYS PRIMARY
function CommodityCard({ data }: { data: ComparisonData }) {
  const { emoji, name, cheapest, mostExpensive, spread } = data;
  const isHighArb = spread >= ARB_THRESHOLD;
  const bgColor = isHighArb ? "#FEF9E7" : "#FFFFFF";

  const cheapestIsNonRWF = cheapest.currency !== PRIMARY_CURRENCY;
  const expensiveIsNonRWF = mostExpensive.currency !== PRIMARY_CURRENCY;

  // Source city color: always green (RWF source)
  const sourceColor = "#3B6D11";
  // Destination city color: blue for non-RWF, green for RWF
  const destColor = expensiveIsNonRWF ? "#185FA5" : "#3B6D11";

  return (
    <article
      className="rounded-xl flex flex-col gap-2.5"
      style={{
        backgroundColor: bgColor,
        border: "0.5px solid rgba(0,0,0,0.08)",
        padding: "14px 16px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      }}
      aria-label={`${name}: ${spread.toFixed(1)}% arbitrage opportunity from ${cheapest.cityName} to ${mostExpensive.cityName}`}
    >
      {/* Header: commodity name + arb badge */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <CommodityEmoji emoji={emoji} />
          <span className="text-[14px] font-medium text-[var(--ink)]">
            {name}
          </span>
        </div>
        <ArbBadge spread={spread} />
      </div>

      {/* Price comparison row - RWF always primary */}
      <div className="flex justify-between items-end gap-2">
        {/* Source (cheap) - left aligned */}
        <div className="flex-1">
          <div className="text-[11px] font-medium mb-1" style={{ color: sourceColor }}>
            {cheapest.flag} {cheapest.cityName}
          </div>
          {/* PRIMARY: Always RWF */}
          <div className="text-[var(--text-price)] font-bold text-[var(--ink)] leading-none">
            {formatNumber(cheapest.rwfPrice)}
            <CurrencyTicker currency="RWF" size="sm" className="ml-0.5 text-gray-500" />
          </div>
          {/* SECONDARY: Original currency if not RWF */}
          {cheapestIsNonRWF && (
            <div className="text-[10px] font-medium mt-0.5" style={{ color: "#185FA5" }}>
              ≈ {formatNumber(cheapest.price)} {cheapest.currency}
            </div>
          )}
        </div>

        {/* Arrow */}
        <div className="text-[14px] text-gray-400 pb-0.5">→</div>

        {/* Destination (expensive) - right aligned */}
        <div className="flex-1 text-right">
          <div className="text-[11px] font-medium mb-1" style={{ color: destColor }}>
            {mostExpensive.flag} {mostExpensive.cityName}
          </div>
          {/* PRIMARY: Always RWF */}
          <div className="text-[calc(var(--text-price)*0.85)] font-bold text-gray-600 leading-none">
            {formatNumber(mostExpensive.rwfPrice)}
            <CurrencyTicker currency="RWF" size="sm" className="ml-0.5 text-gray-400" />
          </div>
          {/* SECONDARY: Original currency if not RWF */}
          {expensiveIsNonRWF && (
            <div className="text-[10px] font-medium mt-0.5" style={{ color: "#185FA5" }}>
              ≈ {formatNumber(mostExpensive.price)} {mostExpensive.currency}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

// Legend bar
function LegendBar({ fxRate }: { fxRate: number }) {
  return (
    <div
      className="flex flex-wrap items-center gap-4 rounded-lg text-[12px]"
      style={{
        backgroundColor: "var(--surface, #F0F2F5)",
        padding: "10px 14px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      }}
    >
      {/* Arb opportunity */}
      <div className="flex items-center gap-1.5">
        <span
          className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
          style={{ backgroundColor: "#EAF3DE", color: "#3B6D11" }}
        >
          ↗ 12.0%
        </span>
        <span className="text-gray-600">Arb opportunity</span>
      </div>

      {/* Watch */}
      <div className="flex items-center gap-1.5">
        <span
          className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
          style={{ backgroundColor: "#FAEEDA", color: "#854F0B" }}
        >
          6.0%
        </span>
        <span className="text-gray-600">Watch</span>
      </div>

      {/* FX rate */}
      <span className="ml-auto text-[11px] text-gray-500">
        1 UGX ≈ {fxRate} RWF
      </span>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function BestPriceComparison({ cities }: BestPriceComparisonProps) {
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    setCurrentTime(formatTime(new Date()));
    const interval = setInterval(() => {
      setCurrentTime(formatTime(new Date()));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Calculate best prices for each commodity (compare by RWF value)
  const getBestPrices = (commodityKey: string): { cheapest: CityPrice; mostExpensive: CityPrice; spread: number } | null => {
    const citiesWithPrice: CityPrice[] = [];

    for (const city of cities) {
      const priceData = city.prices[commodityKey as keyof typeof city.prices];
      if (priceData?.value !== null && priceData?.value !== undefined) {
        const currency = city.currency as Currency;
        const rwfPrice = toRWF(priceData.value, currency);
        citiesWithPrice.push({
          cityName: city.name,
          flag: city.flag,
          price: priceData.value,
          currency,
          rwfPrice,
        });
      }
    }

    if (citiesWithPrice.length < 2) {
      return null;
    }

    // Sort by RWF price (ascending)
    citiesWithPrice.sort((a, b) => a.rwfPrice - b.rwfPrice);

    const cheapest = citiesWithPrice[0];
    const mostExpensive = citiesWithPrice[citiesWithPrice.length - 1];
    const spread = ((mostExpensive.rwfPrice - cheapest.rwfPrice) / cheapest.rwfPrice) * 100;

    return { cheapest, mostExpensive, spread };
  };

  // Build comparison data for all commodities
  const comparisons: ComparisonData[] = commodities
    .map((commodity) => {
      const result = getBestPrices(commodity.key);
      if (!result) return null;
      return {
        key: commodity.key,
        name: commodity.name,
        emoji: commodity.emoji,
        ...result,
      };
    })
    .filter((c): c is ComparisonData => c !== null);

  if (comparisons.length === 0) {
    return null;
  }

  return (
    <section className="mb-4" aria-label="Arb opportunities across the region">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <span className="text-[1.5rem] md:text-[1.75rem]">💹</span>
          <h2 className="text-[15px] font-medium text-[var(--ink)]">
            Arb opportunities across the region
          </h2>
        </div>
        <span className="text-[11px] uppercase tracking-wide text-gray-500">
          Updated {currentTime}
        </span>
      </div>

      {/* Commodity cards grid */}
      <div
        className="grid gap-3 mb-4"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}
      >
        {comparisons.map((comparison) => (
          <CommodityCard key={comparison.key} data={comparison} />
        ))}
      </div>

      {/* Legend bar */}
      <LegendBar fxRate={P2P_RATES.UGX} />
    </section>
  );
}
