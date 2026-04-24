"use client";

import { useState, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { speakPrices, stopSpeaking, isSpeechSupported, playTapSound } from "@/lib/voiceUtils";
import {
  DualCurrency,
  CurrencyChip,
  ChangePill,
  SectionLabelPill,
  ModifierPill,
  CommodityLabel,
  type Currency,
} from "@/components/shared/Pills";

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
  const cityCurrency = city.currency as Currency;

  return (
    <div
      className="rounded-2xl p-5"
      style={{
        backgroundColor: "#FFFFFF",
        border: isGomaStyle
          ? "1px solid #EF9F27"
          : "0.5px solid rgba(0,0,0,0.08)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      }}
    >
      {/* Header */}
      <div
        className="flex justify-between items-start pb-4 mb-4"
        style={{ borderBottom: "0.5px solid rgba(0,0,0,0.08)" }}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Flag emoji BUMPED to 17px */}
            <span className="text-[17px]">{city.flag}</span>
            {/* City name BUMPED to 16px weight 500 */}
            <span className="text-[16px] font-medium text-[var(--ink)]">
              {city.name}
            </span>
            {city.specialBadge && (
              <SectionLabelPill variant="light" accentColor="#633806">
                {city.specialBadge}
              </SectionLabelPill>
            )}
          </div>
          {/* Metadata BUMPED to 12px */}
          <p className="text-[12px] font-medium text-gray-500 mt-1">{city.subtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Currency modifier pill */}
          <ModifierPill parentColor="#3B6D11">
            {city.currency}
          </ModifierPill>

          {/* Voice button */}
          {speechSupported && (
            <button
              onClick={handleVoiceClick}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
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
                <VolumeX size={18} />
              ) : (
                <Volume2 size={18} />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Commodity rows - BUMPED row padding to 16px */}
      <div className="space-y-1">
        {commodityConfig.map((commodity) => {
          const price = city.prices[commodity.key as keyof typeof city.prices];
          const hasPrice = price?.value !== null && price?.value !== undefined;

          return (
            <div
              key={commodity.key}
              className="flex justify-between items-center py-[16px]"
            >
              {/* Commodity label - BUMPED: emoji 22px, name 17px */}
              <CommodityLabel emoji={commodity.emoji} name={commodity.name} />

              <div className="flex items-center gap-2">
                {/* DUAL-CURRENCY ENFORCED: non-RWF shows companion RWF chip */}
                <DualCurrency
                  value={hasPrice ? price!.value : null}
                  currency={cityCurrency}
                  onClick={() => handlePriceClick(commodity.key)}
                  size="md"
                />
                {/* Change pill */}
                <ChangePill delta={price?.change ?? null} size="sm" showArrow={false} />
              </div>
            </div>
          );
        })}

        {/* Gold row - USD only, never converts */}
        {hasGold && (
          <div
            className="flex justify-between items-center pt-4 mt-3"
            style={{ borderTop: "0.5px dashed rgba(0,0,0,0.15)" }}
          >
            <div className="flex items-center gap-2">
              <span className="text-[22px]">{goldConfig.emoji}</span>
              <span className="text-[17px] font-medium text-[#633806]">
                {goldConfig.name}
              </span>
              <ModifierPill parentColor="#633806">
                USD/g
              </ModifierPill>
            </div>
            <div className="flex items-center gap-2">
              {/* Gold always USD - no dual currency */}
              <CurrencyChip
                value={city.prices.gold!.value}
                currency="USD"
                onClick={() => handlePriceClick("gold")}
                size="md"
              />
              <ChangePill delta={city.prices.gold?.change ?? null} size="sm" showArrow={false} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
