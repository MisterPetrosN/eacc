"use client";

import { TrendingUp } from "lucide-react";

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
  currency: string;
}

export function BestPriceComparison({ cities }: BestPriceComparisonProps) {
  const getBestPrices = (commodityKey: string) => {
    const citiesWithPrice: CityPrice[] = [];

    for (const city of cities) {
      const priceData = city.prices[commodityKey as keyof typeof city.prices];
      if (priceData?.value !== null && priceData?.value !== undefined) {
        citiesWithPrice.push({
          cityName: city.name,
          flag: city.flag,
          price: priceData.value,
          currency: city.currency,
        });
      }
    }

    if (citiesWithPrice.length < 2) {
      return null;
    }

    // Sort by price
    citiesWithPrice.sort((a, b) => a.price - b.price);

    const cheapest = citiesWithPrice[0];
    const mostExpensive = citiesWithPrice[citiesWithPrice.length - 1];

    // Calculate spread percentage
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
      className="rounded-xl bg-white p-4 mb-4"
      style={{ border: "0.5px solid rgba(0,0,0,0.08)" }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">📊</span>
        <h3 className="font-medium text-base text-[var(--ink)]">
          Best prices across the region
        </h3>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
              <th className="pb-2 font-medium">Commodity</th>
              <th className="pb-2 font-medium">Cheapest</th>
              <th className="pb-2 font-medium">Most Expensive</th>
              <th className="pb-2 font-medium text-right">Spread</th>
            </tr>
          </thead>
          <tbody>
            {comparisons.map((item) => {
              const { cheapest, mostExpensive, spread } = item.comparison!;
              const isHighSpread = spread >= 10;
              const isMediumSpread = spread >= 5 && spread < 10;

              return (
                <tr key={item.key} className="border-b border-gray-50 last:border-0">
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{item.emoji}</span>
                      <span className="text-[13px] text-gray-700">{item.name}</span>
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">{cheapest.flag}</span>
                      <span className="text-[13px] text-[var(--ink)]">
                        {cheapest.cityName}
                      </span>
                      <span className="text-[13px] font-semibold text-[#3B6D11]">
                        {cheapest.price.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {cheapest.currency}
                      </span>
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">{mostExpensive.flag}</span>
                      <span className="text-[13px] text-[var(--ink)]">
                        {mostExpensive.cityName}
                      </span>
                      <span className="text-[13px] font-semibold text-[#A32D2D]">
                        {mostExpensive.price.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {mostExpensive.currency}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 text-right">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                        isHighSpread
                          ? "bg-[#EAF3DE] text-[#3B6D11]"
                          : isMediumSpread
                          ? "bg-[#FEF9E7] text-[#8B6914]"
                          : "bg-gray-50 text-gray-500"
                      }`}
                    >
                      {isHighSpread && <TrendingUp size={12} />}
                      {spread.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-[#EAF3DE]" />
          <span className="text-[11px] text-gray-500">{">"} 10% = Arb opportunity</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-[#FEF9E7]" />
          <span className="text-[11px] text-gray-500">{">"} 5% = Watch</span>
        </div>
      </div>
    </div>
  );
}
