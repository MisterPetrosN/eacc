"use client";

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

// Pill styles matching the design system
const pillStyles = {
  metadata: "bg-white border border-[rgba(0,0,0,0.08)] rounded-full px-2.5 py-1 text-[11px] font-medium text-gray-500",
  valueGreen: "bg-white border border-[rgba(0,0,0,0.1)] rounded-full px-2.5 py-1 font-medium text-sm text-[#3B6D11]",
  valueRed: "bg-white border border-[rgba(0,0,0,0.1)] rounded-full px-2.5 py-1 font-medium text-sm text-[#A32D2D]",
  spreadHigh: "bg-[#EAF3DE] text-[#3B6D11] rounded-full px-2.5 py-1 text-[11px] font-medium",
  spreadMedium: "bg-[#FAEEDA] text-[#854F0B] rounded-full px-2.5 py-1 text-[11px] font-medium",
  spreadLow: "bg-gray-50 text-gray-500 rounded-full px-2.5 py-1 text-[11px] font-medium",
};

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
      style={{ border: "0.5px solid rgba(0,0,0,0.08)" }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <span className="text-lg">📊</span>
        <h3 className="font-medium text-base text-[var(--ink)]">
          Best prices across the region
        </h3>
      </div>

      {/* Comparison rows */}
      <div className="space-y-3">
        {comparisons.map((item) => {
          const { cheapest, mostExpensive, spread } = item.comparison!;
          const isHighSpread = spread >= 10;
          const isMediumSpread = spread >= 5 && spread < 10;

          return (
            <div
              key={item.key}
              className="flex flex-wrap items-center gap-3 py-2 border-b border-gray-50 last:border-0"
            >
              {/* Commodity */}
              <div className="flex items-center gap-2 w-24">
                <span className="text-sm">{item.emoji}</span>
                <span className="text-sm text-gray-700">{item.name}</span>
              </div>

              {/* Cheapest */}
              <div className="flex items-center gap-2 flex-1 min-w-[140px]">
                <span className="text-sm">{cheapest.flag}</span>
                <span className="text-xs text-gray-600">{cheapest.cityName}</span>
                <span className={pillStyles.valueGreen}>
                  {cheapest.price.toLocaleString()}
                </span>
                <span className={pillStyles.metadata}>{cheapest.currency}</span>
              </div>

              {/* Most Expensive */}
              <div className="flex items-center gap-2 flex-1 min-w-[140px]">
                <span className="text-sm">{mostExpensive.flag}</span>
                <span className="text-xs text-gray-600">{mostExpensive.cityName}</span>
                <span className={pillStyles.valueRed}>
                  {mostExpensive.price.toLocaleString()}
                </span>
                <span className={pillStyles.metadata}>{mostExpensive.currency}</span>
              </div>

              {/* Spread pill */}
              <div className="flex items-center">
                <span
                  className={
                    isHighSpread
                      ? pillStyles.spreadHigh
                      : isMediumSpread
                      ? pillStyles.spreadMedium
                      : pillStyles.spreadLow
                  }
                >
                  <span className="sr-only">
                    {isHighSpread
                      ? "Arbitrage opportunity"
                      : isMediumSpread
                      ? "Watch opportunity"
                      : "Normal spread"}
                  </span>
                  <span aria-hidden="true">
                    {isHighSpread && "↗ "}
                    {spread.toFixed(1)}%
                  </span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <span className={pillStyles.spreadHigh}>↗ 10%+</span>
          <span className="text-xs text-gray-500">Arb opportunity</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={pillStyles.spreadMedium}>5%+</span>
          <span className="text-xs text-gray-500">Watch</span>
        </div>
      </div>
    </div>
  );
}
