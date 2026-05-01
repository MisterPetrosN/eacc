"use client";

import { useState, useEffect, useMemo } from "react";
import { TrendingUp, TrendingDown, Info } from "lucide-react";
import type { SpotWithPrices, SpreadRow } from "@/lib/types";

interface DashboardData {
  spots: SpotWithPrices[];
  spreads: SpreadRow[];
  config: Record<string, string>;
  exchangeRates: { ugx_to_usd: number; rwf_to_usd: number; source: 'sheet' | 'api' | 'default' };
}

export default function SpreadPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // Cost sliders - initialize with spread defaults or fallbacks
  const [freight, setFreight] = useState(65);
  const [phyto, setPhyto] = useState(12);
  const [customs, setCustoms] = useState(12);
  const [agentFee, setAgentFee] = useState(10);
  const [contingency, setContingency] = useState(8);
  const [volume, setVolume] = useState(150);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/dashboard");
        const dashboardData = await res.json();
        setData(dashboardData);

        // Apply defaults from spread data if available
        if (dashboardData.spreads?.[0]) {
          const spread = dashboardData.spreads[0];
          setFreight(spread.freight_default || 65);
          setPhyto(spread.phyto_default || 12);
          setCustoms(spread.customs_default || 12);
          setAgentFee(spread.agent_fee_default || 10);
          setContingency(spread.contingency_default || 8);
        }
      } catch (err) {
        console.error("Spread fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Find buy and sell spots
  const buySpot = useMemo(() => {
    if (!data) return null;
    // Look for Uganda spot (Kampala Owino)
    return data.spots.find(
      (s) => s.country === "UG" && s.name.toLowerCase().includes("owino")
    ) || data.spots.find((s) => s.country === "UG");
  }, [data]);

  const sellSpot = useMemo(() => {
    if (!data) return null;
    // Look for Kimironko
    return data.spots.find(
      (s) => s.name.toLowerCase().includes("kimironko")
    ) || data.spots.find((s) => s.country === "RW");
  }, [data]);

  // Calculate prices in USD/MT
  const rates = data?.exchangeRates || { ugx_to_usd: 1 / 3700, rwf_to_usd: 1 / 1280, source: 'default' as const };
  const rateSource = data?.exchangeRates?.source || 'default';

  // Find maize prices from long format
  const buyMaizePrice = buySpot?.prices.find((p) => p.commodity_id === "maize");
  const sellMaizePrice = sellSpot?.prices.find((p) => p.commodity_id === "maize");
  const buyPricePerKg = buyMaizePrice?.price || 0;
  const sellPricePerKg = sellMaizePrice?.price || 0;

  // Convert to USD per MT (1 MT = 1000 kg)
  const buyPriceUsdMt = buyPricePerKg * rates.ugx_to_usd * 1000;
  const sellPriceUsdMt = sellPricePerKg * rates.rwf_to_usd * 1000;

  // Total logistics cost
  const totalLogistics = freight + phyto + customs + agentFee + contingency;

  // Net spread
  const grossSpread = sellPriceUsdMt - buyPriceUsdMt;
  const netSpread = grossSpread - totalLogistics;
  const isProfit = netSpread > 0;

  // Monthly calculations
  const monthlyNet = netSpread * volume;
  const workingCapital = buyPriceUsdMt * volume + totalLogistics * volume;
  const roc = workingCapital > 0 ? (monthlyNet / workingCapital) * 100 : 0;

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="h-8 bg-[var(--border)] rounded animate-pulse" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-24 bg-[var(--border)] rounded-xl animate-pulse" />
          <div className="h-24 bg-[var(--border)] rounded-xl animate-pulse" />
        </div>
        <div className="h-64 bg-[var(--border)] rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div>
        <h1 className="font-outfit font-bold text-lg text-[var(--ink)]">
          Uganda → Rwanda spread calculator
        </h1>
        <p className="text-xs text-[var(--ink3)] mt-1">
          Live prices from {buySpot?.name || "Kampala"} and {sellSpot?.name || "Kimironko"}.
          Adjust costs to model your trade.
        </p>
        <div className="flex items-center gap-2 mt-2">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${
            rateSource === 'sheet'
              ? 'bg-[var(--green-pale)] text-[var(--green)]'
              : rateSource === 'api'
              ? 'bg-blue-50 text-blue-600'
              : 'bg-[var(--surface)] text-[var(--ink4)]'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              rateSource === 'sheet'
                ? 'bg-[var(--green)]'
                : rateSource === 'api'
                ? 'bg-blue-500'
                : 'bg-[var(--ink4)]'
            }`} />
            FX: {rateSource === 'sheet' ? 'Google Sheet' : rateSource === 'api' ? 'Live API' : 'Default'}
          </span>
          <span className="text-[10px] text-[var(--ink4)]">
            1 USD = {Math.round(1 / rates.ugx_to_usd).toLocaleString()} UGX / {Math.round(1 / rates.rwf_to_usd).toLocaleString()} RWF
          </span>
        </div>
      </div>

      {/* Price display */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[var(--surface)] rounded-xl p-3.5">
          <p className="text-[9px] uppercase tracking-wider text-[var(--ink4)] mb-1">
            Buy — {buySpot?.name || "Kampala Owino"}
          </p>
          <p className="font-outfit font-black text-xl text-[var(--ink)] price-display">
            ${buyPriceUsdMt.toFixed(1)}
            <span className="text-sm font-normal text-[var(--ink3)]">/MT</span>
          </p>
          <p className="text-[10px] text-[var(--ink4)] mt-0.5">
            UGX {Math.round(buyPricePerKg).toLocaleString()}/kg
          </p>
        </div>

        <div className="bg-[var(--surface)] rounded-xl p-3.5">
          <p className="text-[9px] uppercase tracking-wider text-[var(--ink4)] mb-1">
            Sell — {sellSpot?.name || "Kimironko, Kigali"}
          </p>
          <p className="font-outfit font-black text-xl text-[var(--ink)] price-display">
            ${sellPriceUsdMt.toFixed(1)}
            <span className="text-sm font-normal text-[var(--ink3)]">/MT</span>
          </p>
          <p className="text-[10px] text-[var(--ink4)] mt-0.5">
            RWF {Math.round(sellPricePerKg).toLocaleString()}/kg
          </p>
        </div>
      </div>

      {/* Cost sliders */}
      <div className="bg-white rounded-2xl border border-[var(--border)] p-4">
        <h2 className="font-outfit font-bold text-sm text-[var(--ink)] mb-4">
          Logistics costs
        </h2>

        <div className="space-y-4">
          {[
            { label: "Freight — Kampala to Kigali (~500km)", value: freight, setValue: setFreight, min: 30, max: 120 },
            { label: "Phyto cert + aflatoxin test", value: phyto, setValue: setPhyto, min: 5, max: 25 },
            { label: "Rwanda customs + RICA inspection", value: customs, setValue: setCustoms, min: 5, max: 25 },
            { label: "Local agent / broker fee", value: agentFee, setValue: setAgentFee, min: 5, max: 25 },
            { label: "Contingency (spoilage, delays)", value: contingency, setValue: setContingency, min: 2, max: 20 },
          ].map((slider) => (
            <div key={slider.label} className="flex items-center gap-3">
              <span className="flex-1 text-xs text-[var(--ink2)]">{slider.label}</span>
              <input
                type="range"
                min={slider.min}
                max={slider.max}
                value={slider.value}
                onChange={(e) => slider.setValue(parseInt(e.target.value))}
                className="w-24"
              />
              <span className="font-outfit font-bold text-sm text-[var(--ink)] w-12 text-right mono-nums">
                ${slider.value}
              </span>
            </div>
          ))}

          {/* Total */}
          <div className="flex items-center gap-3 pt-3 border-t border-[var(--border)]">
            <span className="flex-1 text-xs font-bold text-[var(--ink)]">
              Total logistics
            </span>
            <span className="font-outfit font-bold text-sm text-[var(--ink)] mono-nums">
              ${totalLogistics}/MT
            </span>
          </div>
        </div>
      </div>

      {/* Volume slider */}
      <div className="bg-white rounded-2xl border border-[var(--border)] p-4">
        <div className="flex items-center gap-3">
          <span className="flex-1 text-xs text-[var(--ink2)]">Monthly volume (MT)</span>
          <input
            type="range"
            min={30}
            max={600}
            step={30}
            value={volume}
            onChange={(e) => setVolume(parseInt(e.target.value))}
            className="w-32"
          />
          <span className="font-outfit font-bold text-sm text-[var(--ink)] w-16 text-right mono-nums">
            {volume} MT
          </span>
        </div>
      </div>

      {/* Result box */}
      <div
        className={`rounded-2xl p-5 ${
          isProfit
            ? "bg-[#EAF3DE] border-2 border-[#97C459]"
            : "bg-[#FCEBEB] border-2 border-[#F09595]"
        }`}
      >
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p
              className={`font-outfit font-black text-[22px] price-display ${
                isProfit ? "text-[var(--green)]" : "text-[var(--red)]"
              }`}
            >
              {isProfit ? "" : "-"}${Math.abs(netSpread).toFixed(1)}
            </p>
            <p
              className={`text-[10px] uppercase font-bold ${
                isProfit ? "text-[var(--green)]" : "text-[var(--red)]"
              }`}
            >
              Net/MT
            </p>
          </div>
          <div>
            <p
              className={`font-outfit font-black text-[22px] price-display ${
                isProfit ? "text-[var(--green)]" : "text-[var(--red)]"
              }`}
            >
              {isProfit ? "" : "-"}${Math.abs(Math.round(monthlyNet)).toLocaleString()}
            </p>
            <p
              className={`text-[10px] uppercase font-bold ${
                isProfit ? "text-[var(--green)]" : "text-[var(--red)]"
              }`}
            >
              Monthly net
            </p>
          </div>
          <div>
            <p
              className={`font-outfit font-black text-[22px] price-display ${
                isProfit ? "text-[var(--green)]" : "text-[var(--red)]"
              }`}
            >
              {roc.toFixed(1)}%
            </p>
            <p
              className={`text-[10px] uppercase font-bold ${
                isProfit ? "text-[var(--green)]" : "text-[var(--red)]"
              }`}
            >
              ROC
            </p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-black/10">
          {isProfit ? (
            <p className="text-xs text-[var(--ink2)] text-center">
              <span className="font-medium">Working capital required:</span>{" "}
              <span className="font-bold">${Math.round(workingCapital).toLocaleString()}</span>
            </p>
          ) : (
            <div className="flex items-center justify-center gap-2 text-center">
              <Info size={14} className="text-[var(--red)]" />
              <p className="text-xs text-[var(--ink2)]">
                Spread inverted — wait for lean season (Jul–Sep)
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Spread summary */}
      <div className="bg-white rounded-2xl border border-[var(--border)] p-4">
        <div className="flex items-center gap-2 mb-3">
          {isProfit ? (
            <TrendingUp size={16} className="text-[var(--green)]" />
          ) : (
            <TrendingDown size={16} className="text-[var(--red)]" />
          )}
          <span className="font-outfit font-bold text-sm text-[var(--ink)]">
            Spread breakdown
          </span>
        </div>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-[var(--ink3)]">Sell price</span>
            <span className="font-medium">${sellPriceUsdMt.toFixed(1)}/MT</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--ink3)]">Buy price</span>
            <span className="font-medium">-${buyPriceUsdMt.toFixed(1)}/MT</span>
          </div>
          <div className="flex justify-between border-t border-[var(--border)] pt-1 mt-1">
            <span className="text-[var(--ink3)]">Gross spread</span>
            <span className={`font-bold ${grossSpread >= 0 ? "text-[var(--green)]" : "text-[var(--red)]"}`}>
              ${grossSpread.toFixed(1)}/MT
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--ink3)]">Logistics</span>
            <span className="font-medium">-${totalLogistics}/MT</span>
          </div>
          <div className="flex justify-between border-t border-[var(--border)] pt-1 mt-1">
            <span className="font-bold text-[var(--ink)]">Net spread</span>
            <span className={`font-bold ${isProfit ? "text-[var(--green)]" : "text-[var(--red)]"}`}>
              ${netSpread.toFixed(1)}/MT
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
