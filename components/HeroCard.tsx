"use client";

import { Volume2, VolumeX, Star, TrendingUp, TrendingDown } from "lucide-react";
import { useSpeech } from "@/hooks/useSpeech";
import { SectionLabelPill, EntityPill } from "@/components/shared/Pills";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface HeroCardProps {
  price: number | null;
  commodityName: string;
  commodityId: string; // Added for TTS lookup
  commodityIcon: string;
  changePct?: number;
  currency?: "RWF" | "UGX" | "TZS" | "USD";
  unit?: string; // "kg" for grains/produce, "L" for diesel/petrol
}

export function HeroCard({
  price,
  commodityName,
  commodityId,
  commodityIcon,
  changePct = 0,
  currency = "RWF",
  unit = "kg"
}: HeroCardProps) {
  const { speakAverage, isSpeaking, stop } = useSpeech();
  const { t } = useLanguage();
  const isPositive = changePct >= 0;
  const hasPrice = price !== null && price > 0;

  const handleSpeak = () => {
    if (isSpeaking) {
      stop();
    } else if (hasPrice) {
      // Use Kinyarwanda TTS via Hugging Face
      speakAverage(commodityId, price, unit === "L" ? "L" : "kg");
    }
  };

  return (
    <div className="hero-card bg-[var(--green)] rounded-2xl min-h-[188px] p-5 relative overflow-hidden">
      {/* Mute button */}
      <button
        onClick={handleSpeak}
        className="absolute top-4 right-4 w-[30px] h-[30px] rounded-full bg-white/15 flex items-center justify-center hover:bg-white/25 transition-colors z-10"
        title={isSpeaking ? t("hero.stop") : t("hero.listen")}
      >
        {isSpeaking ? (
          <VolumeX size={14} className="text-white" />
        ) : (
          <Volume2 size={14} className="text-white" />
        )}
      </button>

      {/* Header pills row - using new pill system */}
      <div className="flex items-center gap-2 mb-4">
        {/* Entity pill (location) */}
        <EntityPill icon="📍" variant="light" accentColor="#374151">
          {t("hero.kigaliAverage")}
        </EntityPill>
        {/* Section label pill */}
        <SectionLabelPill variant="dark" accentColor="rgba(255,255,255,0.85)">
          <Star size={12} className="text-[var(--amber)]" fill="var(--amber)" />
          {t("hero.benchmark")}
        </SectionLabelPill>
      </div>

      {/* Commodity entity pill */}
      <div className="mb-3">
        <EntityPill icon={commodityIcon} variant="dark" accentColor="rgba(255,255,255,0.75)">
          {commodityName}
        </EntityPill>
      </div>

      {/* Price - LOCKED: 76px hero number, 34px currency, EXTRA BOLD (900) */}
      <div className="font-outfit font-black text-[76px] text-white leading-none price-display mb-3 relative z-10">
        {hasPrice ? price.toLocaleString() : "—"}
        <span className="text-[34px] font-black ml-2">{currency}</span>
      </div>

      {/* Delta pill - status pill variant */}
      {hasPrice && changePct !== 0 && (
        <div
          className={`inline-flex items-center gap-1.5 px-[14px] py-[7px] rounded-full ${
            isPositive ? "bg-[var(--green-light)]" : "bg-[var(--red)]"
          }`}
        >
          {isPositive ? (
            <TrendingUp size={14} className="text-white" />
          ) : (
            <TrendingDown size={14} className="text-white" />
          )}
          <span className="text-[14px] font-bold text-white">
            {isPositive ? "+" : ""}
            {changePct.toFixed(1)}%
          </span>
        </div>
      )}
    </div>
  );
}
