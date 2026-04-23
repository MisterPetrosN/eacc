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
  onReportPrice?: (cityId: string, commodity: string) => void;
  onPlayVoice?: (cityId: string) => void;
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

// Pill component styles
const pillStyles = {
  metadata: "bg-white border border-[rgba(0,0,0,0.08)] rounded-full px-2.5 py-1 text-[11px] font-medium text-gray-500 tracking-wide",
  value: "bg-white border border-[rgba(0,0,0,0.1)] rounded-full px-3 py-1 font-medium text-sm text-[var(--ink)] hover:translate-y-[-1px] hover:shadow-sm transition-all",
  valueGold: "bg-white border border-[#EF9F27] rounded-full px-3 py-1 font-medium text-sm text-[#633806] hover:translate-y-[-1px] hover:shadow-sm transition-all",
  changePositive: "bg-[#EAF3DE] text-[#3B6D11] rounded-full px-2 py-0.5 text-[11px] font-medium",
  changeNegative: "bg-[#FCEBEB] text-[#A32D2D] rounded-full px-2 py-0.5 text-[11px] font-medium",
  changeNeutral: "text-gray-400 text-[11px] font-medium",
  goldUnit: "bg-[#FAEEDA] text-[#633806] rounded-full px-2 py-0.5 text-[10px] font-medium",
  goldHubBadge: "bg-[#FAEEDA] text-[#633806] rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
};

export function CityCard({ city, onReportPrice, onPlayVoice }: CityCardProps) {
  const [isSpeakingState, setIsSpeakingState] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  useEffect(() => {
    setSpeechSupported(isSpeechSupported());
  }, []);

  const handleVoiceClick = () => {
    playTapSound();

    if (isSpeakingState) {
      stopSpeaking();
      setIsSpeakingState(false);
    } else {
      setIsSpeakingState(true);
      onPlayVoice?.(city.id);
      speakPrices(city.name, city.prices, city.currency, "en");

      // Reset speaking state when done
      const commodityCount = Object.keys(city.prices).filter(
        (k) => city.prices[k as keyof typeof city.prices]?.value !== null
      ).length;
      const duration = 2000 + commodityCount * 2500;

      setTimeout(() => {
        setIsSpeakingState(false);
      }, duration);
    }
  };

  const handlePriceClick = (commodity: string) => {
    playTapSound();
    onReportPrice?.(city.id, commodity);
  };

  const hasGold = city.prices.gold?.value !== null && city.prices.gold?.value !== undefined;
  const isGomaStyle = city.specialBadge === "GOLD HUB";

  const formatPrice = (price: PriceData | undefined, isGold = false): string => {
    if (!price || price.value === null) return "—";
    if (isGold) {
      return price.value.toFixed(2);
    }
    return price.value.toLocaleString();
  };

  const renderChangePill = (change: number | null, isGold = false) => {
    if (change === null || change === undefined) {
      return <span className={pillStyles.changeNeutral}>—</span>;
    }

    const isPositive = change > 0;
    const isNegative = change < 0;
    const arrow = isPositive ? "↗" : isNegative ? "↘" : "";
    const srText = isPositive
      ? `up ${Math.abs(change).toFixed(1)} percent`
      : isNegative
      ? `down ${Math.abs(change).toFixed(1)} percent`
      : "unchanged";

    if (change === 0) {
      return <span className={pillStyles.changeNeutral}>0%</span>;
    }

    return (
      <span
        className={
          isPositive ? pillStyles.changePositive : pillStyles.changeNegative
        }
      >
        <span className="sr-only">{srText}</span>
        <span aria-hidden="true">
          {arrow} {Math.abs(change).toFixed(1)}%
        </span>
      </span>
    );
  };

  return (
    <div
      className="rounded-2xl p-4"
      style={{
        backgroundColor: "#FEF9E7",
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
            <span className="font-medium text-base text-[var(--ink)]">
              {city.name}
            </span>
            {city.specialBadge && (
              <span className={pillStyles.goldHubBadge}>
                {city.specialBadge}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">{city.subtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Currency metadata pill */}
          <span className={pillStyles.metadata}>{city.currency}</span>

          {/* Voice button */}
          {speechSupported && (
            <button
              onClick={handleVoiceClick}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                isSpeakingState
                  ? "bg-[var(--green)] text-white animate-pulse"
                  : "bg-white border border-[rgba(0,0,0,0.08)] text-gray-600 hover:bg-gray-50"
              }`}
              aria-label={
                isSpeakingState
                  ? `Stop playing prices for ${city.name}`
                  : `Play prices for ${city.name}`
              }
            >
              {isSpeakingState ? (
                <VolumeX size={16} />
              ) : (
                <Volume2 size={16} />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Commodity rows */}
      <div className="space-y-1.5">
        {commodityConfig.map((commodity) => {
          const price = city.prices[commodity.key as keyof typeof city.prices];
          const hasPrice = price?.value !== null && price?.value !== undefined;

          return (
            <div
              key={commodity.key}
              className="flex justify-between items-center py-1.5"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">{commodity.emoji}</span>
                <span className="text-sm text-gray-600">{commodity.name}</span>
              </div>
              <div className="flex items-center gap-2">
                {/* Price value pill - tappable */}
                <button
                  onClick={() => handlePriceClick(commodity.key)}
                  className={pillStyles.value}
                  aria-label={`${commodity.name} price: ${
                    hasPrice ? `${formatPrice(price)} ${city.currency}` : "no data"
                  }. Tap to report update.`}
                >
                  {formatPrice(price)}
                </button>
                {/* Change pill */}
                {renderChangePill(price?.change ?? null)}
              </div>
            </div>
          );
        })}

        {/* Gold row - special styling */}
        {hasGold && (
          <div
            className="flex justify-between items-center pt-3 mt-2"
            style={{ borderTop: "0.5px dashed rgba(0,0,0,0.15)" }}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm">{goldConfig.emoji}</span>
              <span className="text-sm font-medium text-[#633806]">
                {goldConfig.name}
              </span>
              {/* Gold unit badge */}
              <span className={pillStyles.goldUnit}>USD/g</span>
            </div>
            <div className="flex items-center gap-2">
              {/* Gold price pill - orange bordered */}
              <button
                onClick={() => handlePriceClick("gold")}
                className={pillStyles.valueGold}
                aria-label={`Gold price: ${formatPrice(
                  city.prices.gold,
                  true
                )} USD per gram. Tap to report update.`}
              >
                {formatPrice(city.prices.gold, true)}
              </button>
              {/* Change pill */}
              {renderChangePill(city.prices.gold?.change ?? null, true)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
