"use client";

import { useState, useRef, useEffect } from "react";
import { type Currency } from "@/components/shared/Pills";
import {
  PRIMARY_CURRENCY,
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

// All 7 commodities
const commodities = [
  { key: "maize", name: "Maize", emoji: "🌽" },
  { key: "beans", name: "Beans", emoji: "🫘" },
  { key: "rice", name: "Rice", emoji: "🍚" },
  { key: "igitoki", name: "Igitoki", emoji: "🍌" },
  { key: "irish_potatoes", name: "Irish potatoes", emoji: "🥔" },
  { key: "sweet_potatoes", name: "Sweet potatoes", emoji: "🍠" },
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

// ============================================================================
// BEST PRICE CARD - FINANCIAL DASHBOARD LAYOUT
// Top: emoji+name LEFT, BEST pill TOP-RIGHT (metadata row)
// Middle: price CENTERED (hero element)
// Bottom: UGX conversion + market location centered
// ============================================================================
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
      className="rounded-xl flex flex-col flex-shrink-0"
      style={{
        backgroundColor: "#FEF9E7",
        border: "0.5px solid rgba(0,0,0,0.08)",
        padding: "16px 20px",
        minHeight: "130px",
        width: "220px",
      }}
      aria-label={`${name}: highest price at ${market.cityName}, ${formatNumber(market.rwfPrice)} RWF`}
    >
      {/* TOP ROW: commodity name (left) + BEST pill (right) */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-1.5">
          <CommodityEmoji emoji={emoji} className="text-[1rem]" />
          <span className="text-[14px] font-normal text-gray-500">
            {name}
          </span>
        </div>
        <BestPill />
      </div>

      {/* MIDDLE: Price CENTERED - HERO ELEMENT (matches city card sizes) */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {/* PRIMARY: Always RWF - centered, HERO SIZE matching city cards */}
        <div className="font-outfit text-[28px] md:text-[44px] font-black text-[var(--ink)] leading-none text-center">
          {formatNumber(market.rwfPrice)}
          <span className="text-[11px] md:text-[13px] font-semibold ml-1 text-gray-500 align-baseline">RWF</span>
        </div>

        {/* SECONDARY: UGX conversion pill centered below price */}
        {isNonRWF && (
          <span
            className="text-[11px] font-medium px-2 py-0.5 rounded-full mt-1.5"
            style={{ backgroundColor: "#E6F1FB", color: "#185FA5" }}
          >
            ≈ {formatNumber(market.price)} {market.currency}
          </span>
        )}
      </div>

      {/* BOTTOM: Market location centered */}
      <div className="text-[11px] font-medium text-center mt-2" style={{ color: "#3B6D11" }}>
        {market.flag} {market.cityName}
      </div>
    </article>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function BestPricesTop({ cities }: BestPricesTopProps) {
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollWidth, setScrollWidth] = useState(0);

  // Measure scroll width for animation
  useEffect(() => {
    if (scrollRef.current) {
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
  }, [cities]);

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

  // Duplicate items for seamless loop
  const tickerItems = [...bestPrices, ...bestPrices];

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

      {/* Scrolling ticker container */}
      <div
        className="overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        <div
          ref={scrollRef}
          className="flex gap-3"
          style={{
            animation: scrollWidth > 0 ? `ticker 35s linear infinite` : 'none',
            animationPlayState: isPaused ? 'paused' : 'running',
          }}
        >
          {tickerItems.map((item, index) => (
            <BestPriceCard
              key={`${item.key}-${index}`}
              emoji={item.emoji}
              name={item.name}
              market={item.highest!}
            />
          ))}
        </div>
      </div>

      {/* CSS animation */}
      <style jsx>{`
        @keyframes ticker {
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
