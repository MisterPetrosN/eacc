"use client";

import { Volume2, VolumeX, Star, TrendingUp, TrendingDown } from "lucide-react";
import { useSpeech } from "@/hooks/useSpeech";
import type { CommodityType } from "@/lib/types";
import { SectionLabelPill, EntityPill } from "@/components/shared/Pills";

interface HeroCardProps {
  price: number;
  commodity: CommodityType;
  changePct?: number;
  currency?: "RWF" | "UGX" | "TZS" | "USD";
}

const commodityLabels: Record<CommodityType, { name: string; icon: string }> = {
  maize: { name: "Maize", icon: "🌽" },
  beans: { name: "Beans", icon: "🫘" },
  soya: { name: "Soya", icon: "🫛" },
  rice: { name: "Rice", icon: "🍚" },
  palm_oil: { name: "Palm Oil", icon: "🌴" },
  gold: { name: "Gold", icon: "🪙" },
};

export function HeroCard({ price, commodity, changePct = 0, currency = "RWF" }: HeroCardProps) {
  const { speak, isSpeaking, stop } = useSpeech();
  const isPositive = changePct >= 0;
  const commodityInfo = commodityLabels[commodity] || commodityLabels.maize;

  const handleSpeak = () => {
    if (isSpeaking) {
      stop();
    } else {
      speak(
        `The Kigali City average ${commodityInfo.name} price is ${price} Rwandan Francs per kilogram`
      );
    }
  };

  return (
    <div className="hero-card bg-[var(--green)] rounded-2xl min-h-[188px] p-5 relative overflow-hidden">
      {/* Mute button */}
      <button
        onClick={handleSpeak}
        className="absolute top-4 right-4 w-[30px] h-[30px] rounded-full bg-white/15 flex items-center justify-center hover:bg-white/25 transition-colors z-10"
        title={isSpeaking ? "Stop" : "Listen to price"}
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
          Kigali city average
        </EntityPill>
        {/* Section label pill */}
        <SectionLabelPill variant="dark" accentColor="rgba(255,255,255,0.85)">
          <Star size={12} className="text-[var(--amber)]" fill="var(--amber)" />
          Benchmark
        </SectionLabelPill>
      </div>

      {/* Commodity entity pill */}
      <div className="mb-3">
        <EntityPill icon={commodityInfo.icon} variant="dark" accentColor="rgba(255,255,255,0.75)">
          {commodityInfo.name}
        </EntityPill>
      </div>

      {/* Price - LOCKED: 76px hero number, 34px currency */}
      <div className="font-outfit font-bold text-[76px] text-white leading-none price-display mb-3 relative z-10">
        {price.toLocaleString()}
        <span className="text-[34px] font-bold ml-2">{currency}</span>
      </div>

      {/* Delta pill - status pill variant */}
      {changePct !== 0 && (
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
