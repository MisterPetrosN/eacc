"use client";

import { MapPin, Volume2, VolumeX, Star, TrendingUp, TrendingDown } from "lucide-react";
import { useSpeech } from "@/hooks/useSpeech";
import type { CommodityType } from "@/lib/types";

interface HeroCardProps {
  price: number;
  commodity: CommodityType;
  changePct?: number;
}

const commodityLabels: Record<CommodityType, { name: string; icon: string }> = {
  maize: { name: "Maize", icon: "🌽" },
  beans: { name: "Beans", icon: "🫘" },
  soya: { name: "Soya", icon: "🫛" },
  rice: { name: "Rice", icon: "🍚" },
  palm_oil: { name: "Palm Oil", icon: "🌴" },
  gold: { name: "Gold", icon: "🪙" },
};

export function HeroCard({ price, commodity, changePct = 0 }: HeroCardProps) {
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

      {/* Badge */}
      <div className="inline-flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1.5 mb-4">
        <Star size={12} className="text-[var(--amber)]" fill="var(--amber)" />
        <span className="text-xs uppercase tracking-wider text-white/85 font-semibold">
          Benchmark Average
        </span>
      </div>

      {/* Location */}
      <div className="flex items-center gap-1.5 text-white/65 mb-2">
        <MapPin size={14} />
        <span className="text-sm">Kigali City Average</span>
        <span className="text-lg">{commodityInfo.icon}</span>
      </div>

      {/* Price */}
      <div className="font-outfit font-black text-[72px] text-white leading-none price-display mb-2 relative z-10">
        {price.toLocaleString()} <span className="text-4xl">RWF</span>
      </div>

      {/* Change pill */}
      {changePct !== 0 && (
        <div
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${
            isPositive ? "bg-[var(--green-light)]" : "bg-[var(--red)]"
          }`}
        >
          {isPositive ? (
            <TrendingUp size={14} className="text-white" />
          ) : (
            <TrendingDown size={14} className="text-white" />
          )}
          <span className="text-sm font-bold text-white">
            {isPositive ? "+" : ""}
            {changePct.toFixed(1)}%
          </span>
        </div>
      )}
    </div>
  );
}
