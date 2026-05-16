"use client";

import { useState, useRef, useEffect } from "react";
import { type Currency } from "@/components/shared/Pills";
import {
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
  currency?: string;
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
    cooking_bananas?: PriceData;
    irish_potatoes?: PriceData;
    maize_powder?: PriceData;
    sweet_potatoes?: PriceData;
    fuel?: PriceData;
    diesel?: PriceData;
    petrol?: PriceData;
  };
}

interface BestPricesTopProps {
  cities: CityData[];
}

interface PriceInfo {
  cityName: string;
  flag: string;
  price: number;
  currency: Currency;
  rwfPrice: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

// All commodities - matching the sheet
const commodities = [
  { key: "maize", name: "Maize", emoji: "🌽" },
  { key: "beans", name: "Beans", emoji: "🫘" },
  { key: "rice", name: "Rice", emoji: "🍚" },
  { key: "cooking_bananas", name: "Igitoki", emoji: "🍌" },
  { key: "irish_potatoes", name: "Potatoes", emoji: "🥔" },
  { key: "maize_powder", name: "Maize Powder", emoji: "🌾" },
];

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

// "BEST" pill (highest price)
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

// "LOWEST" pill
function LowestPill() {
  return (
    <span
      className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
      style={{ backgroundColor: "#E6F1FB", color: "#185FA5" }}
    >
      ↘ LOW
    </span>
  );
}

// ============================================================================
// PRICE CARD - FINANCIAL DASHBOARD LAYOUT
// Top: emoji+name LEFT, pill TOP-RIGHT (metadata row)
// Middle: price CENTERED (hero element) - ALWAYS IN RWF
// Bottom: market location centered
// ============================================================================
function PriceCard({
  emoji,
  name,
  market,
  type,
}: {
  emoji: string;
  name: string;
  market: PriceInfo;
  type: "highest" | "lowest";
}) {
  const bgColor = type === "highest" ? "#FEF9E7" : "#F0F9FF";
  const locationColor = type === "highest" ? "#3B6D11" : "#185FA5";

  return (
    <article
      className="rounded-xl flex flex-col flex-shrink-0"
      style={{
        backgroundColor: bgColor,
        border: "0.5px solid rgba(0,0,0,0.08)",
        padding: "16px 20px",
        minHeight: "120px",
        width: "200px",
      }}
      aria-label={`${name}: ${type} price at ${market.cityName}, ${formatNumber(market.rwfPrice)} RWF`}
    >
      {/* TOP ROW: commodity name (left) + pill (right) */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-1.5">
          <CommodityEmoji emoji={emoji} className="text-[1rem]" />
          <span className="text-[13px] font-normal text-gray-500">
            {name}
          </span>
        </div>
        {type === "highest" ? <BestPill /> : <LowestPill />}
      </div>

      {/* MIDDLE: Price CENTERED - ALWAYS IN RWF */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="font-outfit text-[26px] md:text-[38px] font-black text-[var(--ink)] leading-none text-center">
          {formatNumber(market.rwfPrice)}
          <span className="text-[10px] md:text-[12px] font-semibold ml-1 text-gray-500 align-baseline">RWF</span>
        </div>
      </div>

      {/* BOTTOM: Market location centered */}
      <div className="text-[11px] font-medium text-center mt-2" style={{ color: locationColor }}>
        {market.flag} {market.cityName}
      </div>
    </article>
  );
}

// ============================================================================
// MAIN COMPONENT - Shows both Lowest and Highest prices
// ============================================================================

export function BestPricesTop({ cities }: BestPricesTopProps) {
  const [isPausedLow, setIsPausedLow] = useState(false);
  const [isPausedHigh, setIsPausedHigh] = useState(false);
  const scrollRefLow = useRef<HTMLDivElement>(null);
  const scrollRefHigh = useRef<HTMLDivElement>(null);
  const [scrollWidthLow, setScrollWidthLow] = useState(0);
  const [scrollWidthHigh, setScrollWidthHigh] = useState(0);

  // Get price for a commodity from a city - ALWAYS convert to RWF
  const getPriceInRWF = (city: CityData, commodityKey: string): { rwfPrice: number; originalPrice: number; currency: Currency } | null => {
    const priceData = city.prices[commodityKey as keyof typeof city.prices];
    if (priceData?.value === null || priceData?.value === undefined) return null;

    // Use the price's own currency if available, otherwise fall back to city currency
    const currency = (priceData.currency as Currency) || (city.currency as Currency);
    const rwfPrice = toRWF(priceData.value, currency);

    return { rwfPrice, originalPrice: priceData.value, currency };
  };

  // Find lowest and highest price markets for each commodity
  const getPrices = (commodityKey: string): { lowest: PriceInfo | null; highest: PriceInfo | null } => {
    let lowest: PriceInfo | null = null;
    let highest: PriceInfo | null = null;
    let lowestRwf = Infinity;
    let highestRwf = 0;

    for (const city of cities) {
      const priceInfo = getPriceInRWF(city, commodityKey);
      if (!priceInfo) continue;

      if (priceInfo.rwfPrice < lowestRwf) {
        lowestRwf = priceInfo.rwfPrice;
        lowest = {
          cityName: city.name,
          flag: city.flag,
          price: priceInfo.originalPrice,
          currency: priceInfo.currency,
          rwfPrice: priceInfo.rwfPrice,
        };
      }

      if (priceInfo.rwfPrice > highestRwf) {
        highestRwf = priceInfo.rwfPrice;
        highest = {
          cityName: city.name,
          flag: city.flag,
          price: priceInfo.originalPrice,
          currency: priceInfo.currency,
          rwfPrice: priceInfo.rwfPrice,
        };
      }
    }

    return { lowest, highest };
  };

  // Build data for all commodities
  const priceData = commodities
    .map((commodity) => {
      const { lowest, highest } = getPrices(commodity.key);
      return { ...commodity, lowest, highest };
    })
    .filter((c) => c.lowest !== null && c.highest !== null);

  // Measure scroll widths for animation
  useEffect(() => {
    if (scrollRefLow.current && priceData.length > 0) {
      const children = scrollRefLow.current.children;
      if (children.length > 0) {
        let width = 0;
        const halfCount = Math.floor(children.length / 2);
        for (let i = 0; i < halfCount; i++) {
          width += (children[i] as HTMLElement).offsetWidth + 12;
        }
        setScrollWidthLow(width);
      }
    }
    if (scrollRefHigh.current && priceData.length > 0) {
      const children = scrollRefHigh.current.children;
      if (children.length > 0) {
        let width = 0;
        const halfCount = Math.floor(children.length / 2);
        for (let i = 0; i < halfCount; i++) {
          width += (children[i] as HTMLElement).offsetWidth + 12;
        }
        setScrollWidthHigh(width);
      }
    }
  }, [priceData]);

  if (priceData.length === 0) {
    return null;
  }

  // Duplicate items for seamless loop
  const tickerItemsLow = [...priceData, ...priceData];
  const tickerItemsHigh = [...priceData, ...priceData];

  return (
    <section className="mb-4 space-y-4" aria-label="Price comparisons across the region">
      {/* LOWEST PRICES SECTION */}
      <div>
        <div className="mb-2">
          <div className="flex items-center gap-2">
            <span className="text-[1.25rem]">📉</span>
            <h2 className="text-[14px] font-medium text-[var(--ink)]">
              Lowest prices across the region
            </h2>
          </div>
        </div>

        <div
          className="overflow-hidden"
          onMouseEnter={() => setIsPausedLow(true)}
          onMouseLeave={() => setIsPausedLow(false)}
          onTouchStart={() => setIsPausedLow(true)}
          onTouchEnd={() => setIsPausedLow(false)}
        >
          <div
            ref={scrollRefLow}
            className="flex gap-3"
            style={{
              animation: scrollWidthLow > 0 ? `ticker-low 30s linear infinite` : 'none',
              animationPlayState: isPausedLow ? 'paused' : 'running',
            }}
          >
            {tickerItemsLow.map((item, index) => (
              <PriceCard
                key={`low-${item.key}-${index}`}
                emoji={item.emoji}
                name={item.name}
                market={item.lowest!}
                type="lowest"
              />
            ))}
          </div>
        </div>
      </div>

      {/* HIGHEST PRICES SECTION */}
      <div>
        <div className="mb-2">
          <div className="flex items-center gap-2">
            <span className="text-[1.25rem]">📈</span>
            <h2 className="text-[14px] font-medium text-[var(--ink)]">
              Best prices across the region
            </h2>
          </div>
        </div>

        <div
          className="overflow-hidden"
          onMouseEnter={() => setIsPausedHigh(true)}
          onMouseLeave={() => setIsPausedHigh(false)}
          onTouchStart={() => setIsPausedHigh(true)}
          onTouchEnd={() => setIsPausedHigh(false)}
        >
          <div
            ref={scrollRefHigh}
            className="flex gap-3"
            style={{
              animation: scrollWidthHigh > 0 ? `ticker-high 30s linear infinite` : 'none',
              animationPlayState: isPausedHigh ? 'paused' : 'running',
            }}
          >
            {tickerItemsHigh.map((item, index) => (
              <PriceCard
                key={`high-${item.key}-${index}`}
                emoji={item.emoji}
                name={item.name}
                market={item.highest!}
                type="highest"
              />
            ))}
          </div>
        </div>
      </div>

      {/* CSS animations */}
      <style jsx>{`
        @keyframes ticker-low {
          0% { transform: translateX(0); }
          100% { transform: translateX(-${scrollWidthLow}px); }
        }
        @keyframes ticker-high {
          0% { transform: translateX(0); }
          100% { transform: translateX(-${scrollWidthHigh}px); }
        }
      `}</style>
    </section>
  );
}
