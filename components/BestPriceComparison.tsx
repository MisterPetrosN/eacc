"use client";

import { useState, useEffect } from "react";
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

interface BestPriceComparisonProps {
  cities: CityData[];
}

interface CityPrice {
  cityName: string;
  flag: string;
  price: number;
  currency: Currency;
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
  { key: "soya", name: "Soya", emoji: "🌱" },
  { key: "rice", name: "Rice", emoji: "🍚" },
  { key: "palm_oil", name: "Palm oil", emoji: "🌴" },
];

// P2P rates for conversion
const P2P_RATES: Record<Currency, number> = {
  RWF: 1,
  UGX: 0.343,
  CDF: 0.47,
  TZS: 0.52,
  USD: 1280,
  ETB: 22,
  KES: 9.5,
};

const ARB_THRESHOLD = 12; // >= 12% is "Arb opportunity"

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function toRWF(value: number, fromCurrency: Currency): number {
  if (fromCurrency === "RWF") return value;
  return Math.round(value * P2P_RATES[fromCurrency]);
}

function formatNumber(value: number | null): string {
  if (value === null) return "—";
  return new Intl.NumberFormat("en-US").format(value);
}

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
        className="text-[11px] font-medium px-2 py-0.5 rounded-full"
        style={{ backgroundColor: "#EAF3DE", color: "#3B6D11" }}
      >
        ↗ {spread.toFixed(1)}%
      </span>
    );
  }

  // Watch/low arb: amber styling
  return (
    <span
      className="text-[11px] font-medium px-2 py-0.5 rounded-full"
      style={{ backgroundColor: "#FAEEDA", color: "#854F0B" }}
    >
      {spread.toFixed(1)}%
    </span>
  );
}

// Commodity comparison card
function CommodityCard({ data }: { data: ComparisonData }) {
  const { emoji, name, cheapest, mostExpensive, spread } = data;
  const isHighArb = spread >= ARB_THRESHOLD;
  const bgColor = isHighArb ? "#FEF9E7" : "#FFFFFF";

  const destIsUGX = mostExpensive.currency === "UGX";

  // Source city color: always green (RWF source)
  const sourceColor = "#3B6D11";
  // Destination city color: blue for UGX, green for RWF
  const destColor = destIsUGX ? "#185FA5" : "#3B6D11";

  return (
    <article
      className="rounded-xl flex flex-col gap-2.5"
      style={{
        backgroundColor: bgColor,
        border: "0.5px solid rgba(0,0,0,0.08)",
        padding: "14px 16px",
      }}
      aria-label={`${name}: ${spread.toFixed(1)}% arbitrage opportunity from ${cheapest.cityName} to ${mostExpensive.cityName}`}
    >
      {/* Header: commodity name + arb badge */}
      <div className="flex justify-between items-center">
        <span className="text-[14px] font-medium text-[var(--ink)]">
          {emoji} {name}
        </span>
        <ArbBadge spread={spread} />
      </div>

      {/* Price comparison row */}
      <div className="flex justify-between items-end gap-2">
        {/* Source (cheap) - left aligned */}
        <div className="flex-1">
          <div className="text-[11px] font-medium mb-1" style={{ color: sourceColor }}>
            {cheapest.flag} {cheapest.cityName}
          </div>
          <div className="text-[18px] font-medium text-[var(--ink)] leading-none">
            {formatNumber(cheapest.price)}
            <span className="text-[10px] font-normal text-gray-400 ml-0.5">
              {cheapest.currency}
            </span>
          </div>
        </div>

        {/* Arrow */}
        <div className="text-[14px] text-gray-400 pb-0.5">→</div>

        {/* Destination (expensive) - right aligned */}
        <div className="flex-1 text-right">
          <div className="text-[11px] font-medium mb-1" style={{ color: destColor }}>
            {mostExpensive.flag} {mostExpensive.cityName}
          </div>
          <div className="text-[14px] font-medium text-gray-600 leading-none">
            {formatNumber(mostExpensive.price)}
            <span className="text-[10px] font-normal text-gray-400 ml-0.5">
              {mostExpensive.currency}
            </span>
          </div>
          {/* UGX: RWF conversion in amber */}
          {destIsUGX && (
            <div className="text-[10px] font-medium mt-0.5" style={{ color: "#BA7517" }}>
              ≈ {formatNumber(toRWF(mostExpensive.price, mostExpensive.currency))} RWF
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
      }}
    >
      {/* Arb opportunity */}
      <div className="flex items-center gap-1.5">
        <span
          className="text-[11px] font-medium px-2 py-0.5 rounded-full"
          style={{ backgroundColor: "#EAF3DE", color: "#3B6D11" }}
        >
          ↗ 12.0%
        </span>
        <span className="text-gray-600">Arb opportunity</span>
      </div>

      {/* Watch */}
      <div className="flex items-center gap-1.5">
        <span
          className="text-[11px] font-medium px-2 py-0.5 rounded-full"
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

  // Calculate best prices for each commodity
  const getBestPrices = (commodityKey: string): { cheapest: CityPrice; mostExpensive: CityPrice; spread: number } | null => {
    const citiesWithPrice: CityPrice[] = [];

    for (const city of cities) {
      const priceData = city.prices[commodityKey as keyof typeof city.prices];
      if (priceData?.value !== null && priceData?.value !== undefined) {
        citiesWithPrice.push({
          cityName: city.name,
          flag: city.flag,
          price: priceData.value,
          currency: city.currency as Currency,
        });
      }
    }

    if (citiesWithPrice.length < 2) {
      return null;
    }

    // Sort by price (ascending)
    citiesWithPrice.sort((a, b) => a.price - b.price);

    const cheapest = citiesWithPrice[0];
    const mostExpensive = citiesWithPrice[citiesWithPrice.length - 1];
    const spread = ((mostExpensive.price - cheapest.price) / cheapest.price) * 100;

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
          <span className="text-[18px]">💹</span>
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
