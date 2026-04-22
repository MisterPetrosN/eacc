"use client";

import { MapPin, Volume2, VolumeX, TrendingUp, TrendingDown } from "lucide-react";
import type { SpotWithPrice, CommodityType } from "@/lib/types";
import { useSpeech } from "@/hooks/useSpeech";

interface SpotCardProps {
  spot: SpotWithPrice;
  commodity: CommodityType;
}

export function SpotCard({ spot, commodity }: SpotCardProps) {
  const { speakPrice, isSpeaking, stop } = useSpeech();

  const price = spot.price;
  const isPriority = spot.priority;

  // Get the price for current commodity
  const getPriceValue = (): number | null => {
    if (!price) return null;
    switch (commodity) {
      case "maize":
        return price.maize_rwf;
      case "beans":
        return price.beans_rwf;
      case "soya":
        return price.soya_rwf;
      case "rice":
        return price.rice_rwf;
      case "palm_oil":
        return price.palm_oil_rwf;
      case "gold":
        return price.gold_usd;
      default:
        return price.maize_rwf;
    }
  };

  const priceValue = getPriceValue();
  const changePct = price?.change_pct || 0;
  const isPositive = changePct >= 0;

  // Format price based on country
  const formatPrice = (): string => {
    if (!priceValue) return "—";
    if (spot.country === "UG") {
      return `UGX ${Math.round(priceValue).toLocaleString()}`;
    }
    if (commodity === "gold" && price?.gold_usd) {
      return `$${price.gold_usd.toFixed(2)}`;
    }
    return `RWF ${Math.round(priceValue).toLocaleString()}`;
  };

  // Format time ago
  const formatTimeAgo = (): string => {
    if (!price?.updated_at) return "";
    const updatedDate = new Date(price.updated_at);
    const now = new Date();
    const diffMs = now.getTime() - updatedDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  const getCurrency = () => {
    if (commodity === "gold") return "USD";
    if (spot.country === "UG") return "UGX";
    return "RWF";
  };

  const handleSpeak = () => {
    if (isSpeaking) {
      stop();
    } else {
      speakPrice(spot.name, commodity, priceValue, getCurrency());
    }
  };

  const commodityEmoji =
    {
      maize: "🌽",
      beans: "🫘",
      soya: "🫛",
      rice: "🍚",
      palm_oil: "🌴",
      gold: "🪙",
    }[commodity] || "🌽";

  return (
    <div
      className={`rounded-2xl border bg-white p-4 card-hover ${
        isPriority ? "spot-card-priority" : "border-[var(--border)]"
      }`}
    >
      {/* Header with price on right */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xl">{spot.flag}</span>
            <span className="font-outfit font-bold text-base text-[var(--ink)]">
              {spot.name}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[var(--ink4)]">
            <MapPin size={12} />
            <span className="text-xs">{spot.region}</span>
          </div>
        </div>
        {/* Price moved to top right */}
        <div className="text-right">
          <div className="font-outfit font-black text-2xl text-[var(--ink)] price-display">
            {formatPrice()}
          </div>
          <div className="text-xs uppercase tracking-wider text-[var(--ink4)]">
            {commodityEmoji} {commodity.replace("_", " ")}
          </div>
        </div>
      </div>

      {/* Bottom row: sound button on left, change % on right */}
      <div className="flex justify-between items-center">
        <button
          onClick={handleSpeak}
          className="w-[34px] h-[34px] rounded-full bg-[var(--surface)] flex items-center justify-center hover:bg-[var(--border)] transition-colors"
          title={isSpeaking ? "Stop" : "Listen to price"}
        >
          {isSpeaking ? (
            <VolumeX size={16} className="text-[var(--ink3)]" />
          ) : (
            <Volume2 size={16} className="text-[var(--ink3)]" />
          )}
        </button>
        <div className="text-right">
          {price?.status === "pending" || !price?.updated_at ? (
            <span className="text-xs font-bold text-[var(--amber)]">Pending</span>
          ) : (
            <>
              <div
                className={`flex items-center gap-0.5 text-sm font-bold ${
                  isPositive ? "text-[var(--green-light)]" : "text-[var(--red)]"
                }`}
              >
                {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                <span>{isPositive ? "+" : ""}{changePct.toFixed(1)}%</span>
              </div>
              <div className="text-xs text-[var(--ink4)]">
                Reported {formatTimeAgo()}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
