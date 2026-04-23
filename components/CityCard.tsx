"use client";

import { useState, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { speakPrices, stopSpeaking, isSpeechSupported, playTapSound } from "@/lib/voiceUtils";

interface PriceData {
  value: number | null;
  change: number | null;
  unit?: string;
  reportedAt?: string;
}

interface CityData {
  id: string;
  name: string;
  country: string;
  flag: string;
  subtitle: string;
  currency: string;
  specialBadge?: string | null;
  accentBorder?: string;
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

interface CityCardProps {
  city: CityData;
}

const commodityConfig = [
  { key: "maize", name: "Maize", emoji: "🌽" },
  { key: "beans", name: "Beans", emoji: "🫘" },
  { key: "soya", name: "Soya", emoji: "🌱" },
  { key: "rice", name: "Rice", emoji: "🍚" },
  { key: "palm_oil", name: "Palm oil", emoji: "🌴" },
  { key: "fuel", name: "Fuel", emoji: "⛽" },
];

const goldConfig = { key: "gold", name: "Gold", emoji: "🥇" };

export function CityCard({ city }: CityCardProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  useEffect(() => {
    setSpeechSupported(isSpeechSupported());
  }, []);

  const handleVoiceClick = () => {
    playTapSound();

    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      speakPrices(city.name, city.prices, city.currency, "en");

      // Reset speaking state when done (approximate based on content length)
      const commodityCount = Object.keys(city.prices).filter(
        (k) => city.prices[k as keyof typeof city.prices]?.value !== null
      ).length;
      const duration = 2000 + commodityCount * 2500;

      setTimeout(() => {
        setIsSpeaking(false);
      }, duration);
    }
  };

  const hasGold = city.prices.gold?.value !== null && city.prices.gold?.value !== undefined;
  const isGomaStyle = city.specialBadge === "GOLD HUB";

  const formatPrice = (price: PriceData | undefined, isGold = false): string => {
    if (!price || price.value === null) return "—";
    if (isGold) {
      return `$${price.value.toFixed(2)}`;
    }
    return price.value.toLocaleString();
  };

  const formatChange = (change: number | null): { text: string; color: string } => {
    if (change === null || change === undefined) {
      return { text: "—", color: "text-gray-400" };
    }
    if (change > 0) {
      return { text: `+${change.toFixed(1)}%`, color: "text-[#3B6D11]" };
    }
    if (change < 0) {
      return { text: `${change.toFixed(1)}%`, color: "text-[#A32D2D]" };
    }
    return { text: "0%", color: "text-gray-400" };
  };

  return (
    <div
      className="rounded-xl bg-[#FEF9E7] p-4"
      style={{
        border: isGomaStyle
          ? "1px solid #EF9F27"
          : "0.5px solid rgba(0,0,0,0.08)",
      }}
    >
      {/* Header */}
      <div
        className="flex justify-between items-start pb-3 mb-3"
        style={{ borderBottom: "0.5px solid rgba(0,0,0,0.08)" }}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-lg">{city.flag}</span>
            <span className="font-medium text-[15px] text-[var(--ink)]">
              {city.name}
            </span>
            {city.specialBadge && (
              <span
                className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                style={{ backgroundColor: "#FAEEDA", color: "#633806" }}
              >
                {city.specialBadge}
              </span>
            )}
          </div>
          <p className="text-[11px] text-gray-500 mt-0.5">{city.subtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-gray-500">
            {city.currency}
          </span>
          {speechSupported && (
            <button
              onClick={handleVoiceClick}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
              style={{ backgroundColor: "rgba(0,0,0,0.04)" }}
              title={isSpeaking ? "Stop" : "Listen to prices"}
            >
              {isSpeaking ? (
                <VolumeX size={16} className="text-gray-600" />
              ) : (
                <Volume2 size={16} className="text-gray-600" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Commodity rows */}
      <div className="space-y-0">
        {commodityConfig.map((commodity) => {
          const price = city.prices[commodity.key as keyof typeof city.prices];
          const changeInfo = formatChange(price?.change ?? null);

          return (
            <div
              key={commodity.key}
              className="flex justify-between items-center py-[7px]"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">{commodity.emoji}</span>
                <span className="text-[13px] text-gray-600">
                  {commodity.name}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-[15px] text-[var(--ink)]">
                  {formatPrice(price)}
                </span>
                <span className={`text-xs ${changeInfo.color}`}>
                  {changeInfo.text}
                </span>
              </div>
            </div>
          );
        })}

        {/* Gold row - special styling */}
        {hasGold && (
          <div
            className="flex justify-between items-center pt-3 mt-1"
            style={{ borderTop: "0.5px dashed rgba(0,0,0,0.15)" }}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm">{goldConfig.emoji}</span>
              <span
                className="text-[13px] font-medium"
                style={{ color: "#633806" }}
              >
                {goldConfig.name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[15px] text-[var(--ink)]">
                {formatPrice(city.prices.gold, true)}
              </span>
              <span className="text-[10px] text-gray-400">USD/g</span>
              <span className={`text-xs ${formatChange(city.prices.gold?.change ?? null).color}`}>
                {formatChange(city.prices.gold?.change ?? null).text}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
