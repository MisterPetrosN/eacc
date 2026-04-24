"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, TrendingUp } from "lucide-react";
import { type Currency } from "@/components/shared/Pills";

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

const commodities = [
  { key: "maize", name: "Maize", emoji: "🌽" },
  { key: "beans", name: "Beans", emoji: "🫘" },
  { key: "soya", name: "Soya", emoji: "🌱" },
  { key: "rice", name: "Rice", emoji: "🍚" },
  { key: "palm_oil", name: "Palm oil", emoji: "🌴" },
  { key: "fuel", name: "Fuel", emoji: "⛽" },
];

interface CityPrice {
  cityName: string;
  flag: string;
  price: number;
  currency: Currency;
}

// Simulated FX rate data (TODO: fetch from /api/rates)
interface FxRateInfo {
  rate: number;
  updatedAt: Date;
  isStale: boolean;
}

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

function toRWF(value: number, fromCurrency: Currency): number {
  if (fromCurrency === "RWF") return value;
  return Math.round(value * P2P_RATES[fromCurrency]);
}

function useFxRate(): FxRateInfo {
  const [rateInfo] = useState<FxRateInfo>({
    rate: 0.343,
    updatedAt: new Date(),
    isStale: false,
  });
  return rateInfo;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Africa/Kigali",
  }) + " CAT";
}

function formatNumber(value: number | null): string {
  if (value === null) return "—";
  return value.toLocaleString();
}

// ============================================================================
// SEMANTIC PILL COMPONENTS FOR PRICE COMPARISON
// ============================================================================

// Source city pill (cheapest) - Green
function SourceCityPill({ flag, name }: { flag: string; name: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-[#C8E6C9] text-[#1B5E20] rounded-full px-[14px] py-[8px] text-[15px] font-semibold">
      <span className="text-[16px]">{flag}</span>
      {name}
    </span>
  );
}

// Destination city pill (most expensive) - Blue
function DestinationCityPill({ flag, name }: { flag: string; name: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-[#BBDEFB] text-[#0D47A1] rounded-full px-[14px] py-[8px] text-[15px] font-semibold">
      <span className="text-[16px]">{flag}</span>
      {name}
    </span>
  );
}

// Source price pill - Green (matches source city)
function SourcePricePill({ value, currency }: { value: number; currency: Currency }) {
  return (
    <span className="inline-flex items-baseline gap-1 bg-[#C8E6C9] text-[#1B5E20] rounded-full px-[12px] py-[5px] text-[16px] font-bold tabular-nums">
      {formatNumber(value)}
      <span className="text-[11px] font-semibold opacity-85">{currency}</span>
    </span>
  );
}

// Destination price pill - Blue (matches destination city)
function DestinationPricePill({ value, currency }: { value: number; currency: Currency }) {
  return (
    <span className="inline-flex items-baseline gap-1 bg-[#BBDEFB] text-[#0D47A1] rounded-full px-[12px] py-[5px] text-[16px] font-bold tabular-nums">
      {formatNumber(value)}
      <span className="text-[11px] font-semibold opacity-85">{currency}</span>
    </span>
  );
}

// RWF conversion pill - Warm cream/peach
function ConversionPill({ value }: { value: number }) {
  return (
    <span className="inline-flex items-baseline gap-1 bg-[#FFE0B2] text-[#BF360C] rounded-full px-[10px] py-[4px] text-[14px] font-bold tabular-nums">
      <span className="text-[10px] font-semibold opacity-85">≈</span>
      {formatNumber(value)}
      <span className="text-[10px] font-semibold opacity-85">RWF</span>
    </span>
  );
}

// Arb percentage pill - Green for high, peach for low
function ArbPill({ spread }: { spread: number }) {
  const isHighSpread = spread >= 10;

  if (isHighSpread) {
    return (
      <span className="inline-flex items-center gap-1 bg-[#A5D6A7] text-[#1B5E20] rounded-full px-[14px] py-[7px] text-[15px] font-bold">
        <TrendingUp size={14} />
        {spread.toFixed(1)}%
      </span>
    );
  }

  return (
    <span className="inline-flex items-center bg-[#FFF3E0] text-[#E65100] rounded-full px-[14px] py-[7px] text-[15px] font-bold">
      {spread.toFixed(1)}%
    </span>
  );
}

// Commodity label
function CommodityLabel({ emoji, name }: { emoji: string; name: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[22px]">{emoji}</span>
      <span className="text-[17px] font-medium text-gray-700">{name}</span>
    </div>
  );
}

export function BestPriceComparison({ cities }: BestPriceComparisonProps) {
  const fxRate = useFxRate();
  const [currentTime, setCurrentTime] = useState(formatTime(fxRate.updatedAt));

  useEffect(() => {
    setCurrentTime(formatTime(fxRate.updatedAt));
  }, [fxRate.updatedAt]);

  const getBestPrices = (commodityKey: string) => {
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

    citiesWithPrice.sort((a, b) => a.price - b.price);

    const cheapest = citiesWithPrice[0];
    const mostExpensive = citiesWithPrice[citiesWithPrice.length - 1];
    const spread = ((mostExpensive.price - cheapest.price) / cheapest.price) * 100;

    return {
      cheapest,
      mostExpensive,
      spread,
    };
  };

  const comparisons = commodities
    .map((commodity) => ({
      ...commodity,
      comparison: getBestPrices(commodity.key),
    }))
    .filter((c) => c.comparison !== null);

  if (comparisons.length === 0) {
    return null;
  }

  return (
    <div
      className="rounded-2xl bg-white p-5 mb-4"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
    >
      {/* Card title - LOCKED: 17px weight 500 */}
      <div className="flex items-center gap-2 mb-5">
        <span className="text-[20px]">📊</span>
        <h3 className="text-[17px] font-medium text-[var(--ink)]">
          Best prices across the region
        </h3>
      </div>

      {/* Comparison rows */}
      <div className="space-y-2">
        {comparisons.map((item) => {
          const { cheapest, mostExpensive, spread } = item.comparison!;
          const cheapestNeedsConversion = cheapest.currency !== "RWF";
          const expensiveNeedsConversion = mostExpensive.currency !== "RWF";

          return (
            <div
              key={item.key}
              className="flex flex-wrap items-center gap-3 py-[16px] border-b border-gray-100 last:border-0"
            >
              {/* Commodity label - BUMPED: emoji 22px, name 17px */}
              <div className="w-32">
                <CommodityLabel emoji={item.emoji} name={item.name} />
              </div>

              {/* Cheapest city (source) - GREEN */}
              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <SourceCityPill flag={cheapest.flag} name={cheapest.cityName} />
                <SourcePricePill value={cheapest.price} currency={cheapest.currency} />
                {cheapestNeedsConversion && (
                  <ConversionPill value={toRWF(cheapest.price, cheapest.currency)} />
                )}
              </div>

              {/* Most expensive city (destination) - BLUE */}
              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <DestinationCityPill flag={mostExpensive.flag} name={mostExpensive.cityName} />
                <DestinationPricePill value={mostExpensive.price} currency={mostExpensive.currency} />
                {expensiveNeedsConversion && (
                  <ConversionPill value={toRWF(mostExpensive.price, mostExpensive.currency)} />
                )}
              </div>

              {/* Spread pill */}
              <ArbPill spread={spread} />
            </div>
          );
        })}
      </div>

      {/* Legend - Updated colors */}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 bg-[#A5D6A7] text-[#1B5E20] rounded-full px-[10px] py-[4px] text-[13px] font-bold">
            <TrendingUp size={12} />
            12.0%
          </span>
          <span className="text-[12px] font-medium text-gray-500">Arb opportunity</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center bg-[#FFE0B2] text-[#BF360C] rounded-full px-[10px] py-[4px] text-[13px] font-bold">
            6.0%
          </span>
          <span className="text-[12px] font-medium text-gray-500">Watch</span>
        </div>
      </div>

      {/* FX source disclosure - TRUST BUILDER */}
      <div className="mt-4 pt-4 border-t border-gray-50">
        {fxRate.isStale ? (
          <p className="text-[12px] font-medium text-[#854F0B] flex items-center gap-1.5">
            <AlertTriangle size={14} />
            FX rate may be stale · last updated {currentTime}
          </p>
        ) : (
          <p className="text-[12px] font-medium text-gray-400">
            UGX converted at today&apos;s P2P mid rate · 1 UGX ≈ {fxRate.rate} RWF · updated {currentTime}
          </p>
        )}
      </div>
    </div>
  );
}
