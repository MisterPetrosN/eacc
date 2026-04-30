"use client";

import { useState, useEffect, useRef } from "react";
import { type Currency } from "@/components/shared/Pills";
import {
  PRIMARY_CURRENCY,
  P2P_RATES,
  toRWF,
  formatNumber,
  CommodityEmoji,
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
        className="text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
        style={{ backgroundColor: "#EAF3DE", color: "#3B6D11" }}
      >
        ↗ {spread.toFixed(1)}%
      </span>
    );
  }

  // Watch/low arb: amber styling
  return (
    <span
      className="text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
      style={{ backgroundColor: "#FAEEDA", color: "#854F0B" }}
    >
      {spread.toFixed(1)}%
    </span>
  );
}

// ============================================================================
// ARB CARD - COMPACT LAYOUT FOR TICKER
// Smaller prices (22px mobile / 28px desktop) to fit two prices side-by-side
// Fixed width for consistent ticker scrolling
// ============================================================================
function ArbCard({ data }: { data: ComparisonData }) {
  const { emoji, name, cheapest, mostExpensive, spread } = data;
  const isHighArb = spread >= ARB_THRESHOLD;
  const bgColor = isHighArb ? "#FEF9E7" : "#FFFFFF";

  const expensiveIsNonRWF = mostExpensive.currency !== PRIMARY_CURRENCY;

  // Source city color: always green
  const sourceColor = "#3B6D11";
  // Destination city color: blue for non-RWF, green for RWF
  const destColor = expensiveIsNonRWF ? "#185FA5" : "#3B6D11";

  return (
    <article
      className="rounded-xl flex flex-col flex-shrink-0"
      style={{
        backgroundColor: bgColor,
        border: "0.5px solid rgba(0,0,0,0.08)",
        padding: "14px 16px",
        minHeight: "120px",
        width: "260px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      }}
      aria-label={`${name}: ${spread.toFixed(1)}% arbitrage opportunity from ${cheapest.cityName} to ${mostExpensive.cityName}`}
    >
      {/* TOP ROW: commodity name (left) + arb badge (right) */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-1.5">
          <CommodityEmoji emoji={emoji} className="text-[0.9rem]" />
          <span className="text-[13px] font-normal text-gray-500">
            {name}
          </span>
        </div>
        <ArbBadge spread={spread} />
      </div>

      {/* MIDDLE: City labels row */}
      <div className="flex items-center justify-between mb-1 px-1">
        <span className="text-[10px] font-medium" style={{ color: sourceColor }}>
          {cheapest.flag} {cheapest.cityName}
        </span>
        <span className="text-[12px] text-gray-400">→</span>
        <span className="text-[10px] font-medium" style={{ color: destColor }}>
          {mostExpensive.flag} {mostExpensive.cityName}
        </span>
      </div>

      {/* PRICES ROW: Two prices side-by-side - SMALLER to fit cleanly, EXTRA BOLD (900) */}
      <div className="flex items-baseline justify-between px-1">
        {/* Source price (cheaper) */}
        <div className="font-outfit text-[22px] md:text-[28px] font-black text-[var(--ink)] leading-none">
          {formatNumber(cheapest.rwfPrice)}
          <span className="text-[9px] md:text-[10px] font-semibold ml-0.5 text-gray-500">RWF</span>
        </div>

        {/* Destination price (more expensive) */}
        <div className="font-outfit text-[20px] md:text-[24px] font-black text-gray-600 leading-none">
          {formatNumber(mostExpensive.rwfPrice)}
          <span className="text-[9px] md:text-[10px] font-semibold ml-0.5 text-gray-400">RWF</span>
        </div>
      </div>

      {/* UGX conversion pill (if destination is non-RWF) */}
      {expensiveIsNonRWF && (
        <div className="flex justify-end mt-1.5 px-1">
          <span
            className="text-[9px] font-medium px-1.5 py-0.5 rounded-full"
            style={{ backgroundColor: "#E6F1FB", color: "#185FA5" }}
          >
            ≈ {formatNumber(mostExpensive.price)} {mostExpensive.currency}
          </span>
        </div>
      )}
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
          className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
          style={{ backgroundColor: "#EAF3DE", color: "#3B6D11" }}
        >
          ↗ 12.0%
        </span>
        <span className="text-gray-600">Arb opportunity</span>
      </div>

      {/* Watch */}
      <div className="flex items-center gap-1.5">
        <span
          className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
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
// MAIN COMPONENT - NOW WITH HORIZONTAL SCROLLING TICKER
// ============================================================================

export function BestPriceComparison({ cities }: BestPriceComparisonProps) {
  const [currentTime, setCurrentTime] = useState("");
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollWidth, setScrollWidth] = useState(0);

  // Update time every minute
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

  // Measure scroll width for animation
  useEffect(() => {
    if (scrollRef.current && comparisons.length > 0) {
      // Get width of one set of items (half the total since we duplicate)
      const children = scrollRef.current.children;
      if (children.length > 0) {
        let width = 0;
        const halfCount = Math.floor(children.length / 2);
        for (let i = 0; i < halfCount; i++) {
          width += (children[i] as HTMLElement).offsetWidth + 12; // 12px gap
        }
        setScrollWidth(width);
      }
    }
  }, [comparisons]);

  if (comparisons.length === 0) {
    return null;
  }

  // Duplicate items for seamless loop
  const tickerItems = [...comparisons, ...comparisons];

  return (
    <section className="mb-4" aria-label="Arb opportunities across the region">
      {/* Header - STATIC, stays above scrolling content */}
      <div className="flex justify-between items-center mb-3">
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

      {/* Scrolling ticker container */}
      <div
        className="overflow-hidden mb-4"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        <div
          ref={scrollRef}
          className="flex gap-3"
          style={{
            animation: scrollWidth > 0 ? `arb-ticker 35s linear infinite` : 'none',
            animationPlayState: isPaused ? 'paused' : 'running',
          }}
        >
          {tickerItems.map((comparison, index) => (
            <ArbCard key={`${comparison.key}-${index}`} data={comparison} />
          ))}
        </div>
      </div>

      {/* Legend bar - STATIC, below scrolling content */}
      <LegendBar fxRate={P2P_RATES.UGX} />

      {/* CSS animation for ticker */}
      <style jsx>{`
        @keyframes arb-ticker {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-${scrollWidth}px);
          }
        }
      `}</style>
    </section>
  );
}
