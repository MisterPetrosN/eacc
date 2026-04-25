"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Mic,
  Trophy,
  Ticket,
  ChevronRight,
  Volume2,
  AlertCircle,
  Grid3X3,
} from "lucide-react";
import { HeroCard } from "@/components/HeroCard";
import { SpotCard } from "@/components/SpotCard";
import { CityCard } from "@/components/CityCard";
import { BestPricesTop } from "@/components/BestPricesTop";
import { BestPriceComparison } from "@/components/BestPriceComparison";
import { DashboardSkeleton } from "@/components/Skeleton";
import type {
  DashboardData,
  CommodityType,
  CommodityRow,
  SpotWithPrice,
  AgentRow,
  SpreadRow,
} from "@/lib/types";

interface ExtendedDashboardData extends DashboardData {
  spreads: SpreadRow[];
  exchangeRates: { ugx_to_usd: number; rwf_to_usd: number };
}

// City data structure for city-first view
interface CityPriceData {
  value: number | null;
  change: number | null;
  unit?: string;
  reportedAt?: string;
}

interface CityBundle {
  id: string;
  name: string;
  country: string;
  flag: string;
  subtitle: string;
  currency: string;
  specialBadge?: string | null;
  accentBorder?: string;
  prices: {
    maize?: CityPriceData;
    beans?: CityPriceData;
    soya?: CityPriceData;
    rice?: CityPriceData;
    palm_oil?: CityPriceData;
    fuel?: CityPriceData;
    gold?: CityPriceData;
  };
}

type FilterType = "all" | CommodityType;

export default function DashboardPage() {
  const [data, setData] = useState<ExtendedDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stale, setStale] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchDashboard = async () => {
      try {
        const res = await fetch("/api/dashboard");
        if (!res.ok) throw new Error("Failed to fetch");
        const newData = await res.json();
        if (isMounted) {
          setData(newData);
          setError(null);
          setStale(false);
          setLoading(false);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        if (isMounted) {
          setData((prevData) => {
            if (prevData) {
              setStale(true);
            } else {
              setError("Failed to load dashboard data");
            }
            return prevData;
          });
          setLoading(false);
        }
      }
    };

    fetchDashboard();
    const interval = setInterval(fetchDashboard, 60000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Countdown to Sunday 6pm EAT
  useEffect(() => {
    const calculateCountdown = () => {
      const now = new Date();
      const target = new Date();

      target.setUTCHours(15, 0, 0, 0);
      const daysUntilSunday = (7 - now.getUTCDay()) % 7;
      target.setUTCDate(now.getUTCDate() + (daysUntilSunday || 7));

      if (target <= now) {
        target.setUTCDate(target.getUTCDate() + 7);
      }

      const diff = target.getTime() - now.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      return `${days}d ${hours}h ${minutes}m`;
    };

    setCountdown(calculateCountdown());
    const interval = setInterval(() => {
      setCountdown(calculateCountdown());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Transform spots data into city bundles
  const transformToCityBundles = (): CityBundle[] => {
    if (!data) return [];

    // Group spots by city/region
    const cityMap = new Map<string, CityBundle>();

    // Define city configurations
    const cityConfigs: Record<string, Partial<CityBundle>> = {
      kigali: {
        name: "Kigali",
        subtitle: "Rwanda · 3 markets live",
        currency: "RWF",
        flag: "🇷🇼",
        country: "RW",
      },
      goma: {
        name: "Goma",
        subtitle: "DRC · border market",
        currency: "RWF",
        flag: "🇨🇩",
        country: "CD",
        specialBadge: "GOLD HUB",
        accentBorder: "#EF9F27",
      },
      bukavu: {
        name: "Bukavu",
        subtitle: "DRC · South Kivu",
        currency: "RWF",
        flag: "🇨🇩",
        country: "CD",
      },
      kampala: {
        name: "Kampala",
        subtitle: "Uganda · capital market",
        currency: "UGX",
        flag: "🇺🇬",
        country: "UG",
      },
      mbarara: {
        name: "Mbarara",
        subtitle: "Uganda · western hub",
        currency: "UGX",
        flag: "🇺🇬",
        country: "UG",
      },
      rusumo: {
        name: "Rusumo",
        subtitle: "Rwanda · Tanzania border",
        currency: "RWF",
        flag: "🇷🇼",
        country: "XB",
      },
    };

    // Process spots into cities
    for (const spot of data.spots) {
      let cityKey = spot.id.toLowerCase();

      // Map spots to cities
      if (spot.id === "kimironko" || spot.id === "nyabugogo" || spot.id === "remera") {
        cityKey = "kigali";
      } else if (spot.id === "owino") {
        cityKey = "kampala";
      }

      const config = cityConfigs[cityKey];
      if (!config) continue;

      if (!cityMap.has(cityKey)) {
        cityMap.set(cityKey, {
          id: cityKey,
          name: config.name || spot.name,
          country: config.country || spot.country,
          flag: config.flag || spot.flag,
          subtitle: config.subtitle || `${spot.region}`,
          currency: config.currency || (spot.country === "UG" ? "UGX" : "RWF"),
          specialBadge: config.specialBadge,
          accentBorder: config.accentBorder,
          prices: {},
        });
      }

      const city = cityMap.get(cityKey)!;
      const price = spot.price;

      if (price) {
        // Update prices, taking the most recent or averaging
        if (price.maize_rwf) {
          city.prices.maize = {
            value: price.maize_rwf,
            change: price.change_pct || null,
            reportedAt: price.updated_at ?? undefined,
          };
        }
        if (price.beans_rwf) {
          city.prices.beans = {
            value: price.beans_rwf,
            change: price.change_pct || null,
          };
        }
        if (price.soya_rwf) {
          city.prices.soya = {
            value: price.soya_rwf,
            change: price.change_pct || null,
          };
        }
        if (price.rice_rwf) {
          city.prices.rice = {
            value: price.rice_rwf,
            change: price.change_pct || null,
          };
        }
        if (price.palm_oil_rwf) {
          city.prices.palm_oil = {
            value: price.palm_oil_rwf,
            change: price.change_pct || null,
          };
        }
        // Gold only for specific cities
        if (price.gold_usd && (cityKey === "kigali" || cityKey === "goma" || cityKey === "bukavu")) {
          city.prices.gold = {
            value: price.gold_usd,
            change: price.change_pct || null,
            unit: "USD/g",
          };
        }
      }
    }

    return Array.from(cityMap.values());
  };

  if (loading && !data) {
    return <DashboardSkeleton />;
  }

  if (error && !data) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto mb-4 text-[var(--red)]" />
          <p className="text-[var(--ink2)]">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-[var(--green)] text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const cityBundles = transformToCityBundles();
  const sortedCommodities = [...data.commodities].sort(
    (a, b) => a.tab_order - b.tab_order
  );

  const isCityFirstView = activeFilter === "all";

  const getAvgPrice = (): number => {
    if (activeFilter === "all") return data.kigali_avg_maize;
    switch (activeFilter) {
      case "maize":
        return data.kigali_avg_maize;
      case "beans":
        return data.kigali_avg_beans;
      case "soya":
        return data.kigali_avg_soya || 0;
      case "rice":
        return data.kigali_avg_rice || 0;
      default:
        return data.kigali_avg_maize;
    }
  };

  const getChangePct = (): number => {
    const commodity = activeFilter === "all" ? "maize" : activeFilter;
    const key = `hero_change_${commodity}`;
    return parseFloat(data.config[key] || "0");
  };

  // Get spread data - find biggest spread
  const spreadValue = parseFloat(data.config.spread_usd || "0");
  const spreadStatus = data.config.spread_status || "";
  const spreadIsPositive = spreadValue >= 0;

  // Get active spots for commodity-first view
  const activeSpots = data.spots.filter((s) => s.active);
  const displaySpots = activeSpots.slice(0, 8);

  // Top agents for mini leaderboard
  const topAgents = [...data.agents]
    .filter((a) => a.active)
    .sort((a, b) => b.tickets_month - a.tickets_month)
    .slice(0, 3);

  // Filter pills config
  const filterPills = [
    { key: "all" as FilterType, label: "All cities", emoji: "🏙️" },
    ...sortedCommodities
      .filter((c) => c.status === "live")
      .map((c) => ({
        key: c.id as FilterType,
        label: c.name,
        emoji: c.icon,
      })),
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {/* Stale data banner */}
      {stale && (
        <div className="bg-[var(--amber-bg)] border border-[var(--amber)] rounded-xl p-3 flex items-center gap-2">
          <AlertCircle size={16} className="text-[var(--amber)]" />
          <span className="text-sm text-[var(--ink2)]">
            Data may be stale. Retrying...
          </span>
        </div>
      )}

      {/* Top Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Greeting pill - Marigold yellow */}
        <div className="bg-[#F4B400] rounded-2xl py-3 px-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path
                d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                fill="white"
              />
            </svg>
          </div>
          <div>
            <p className="font-outfit font-bold text-lg text-black">
              {data.config.greeting || "Good morning"}
            </p>
            <div className="flex items-center gap-1.5">
              <span className="text-sm text-black/70">
                EACC Intelligence · {data.active_agents} Agents Live Now
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] live-pulse" />
            </div>
          </div>
        </div>

        {/* Voice search box - White with subtle warm border */}
        <div className="bg-white rounded-2xl border border-[#E8DCC4] py-3.5 px-5 flex items-center gap-3">
          <Mic size={20} className="text-[var(--ink4)]" />
          <span className="text-sm text-[var(--ink4)]">
            Ask &quot;What is the price in Goma?&quot;
          </span>
        </div>
      </div>

      {/* Commodity Filter Pills - using pill design system */}
      <div className="flex flex-wrap gap-2">
        {filterPills.map((pill) => {
          const isActive = activeFilter === pill.key;

          return (
            <button
              key={pill.key}
              onClick={() => setActiveFilter(pill.key)}
              className={`px-3 py-1.5 rounded-full text-[13px] font-medium transition-all tracking-wide ${
                isActive
                  ? "bg-[#EF9F27] text-[#4A1B0C]"
                  : "bg-[#FAF6EE] border border-[#E8DCC4] text-gray-600 hover:border-[#D4C4A8]"
              }`}
              aria-pressed={isActive}
            >
              {pill.emoji} {pill.label}
            </button>
          );
        })}
      </div>

      {/* Best Prices Top - Simplified highest prices only */}
      {isCityFirstView && <BestPricesTop cities={cityBundles} />}

      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-3">
        {/* Main hero card */}
        <HeroCard
          price={getAvgPrice()}
          commodity={activeFilter === "all" ? "maize" : activeFilter}
          changePct={getChangePct()}
        />

        {/* Right side cards */}
        <div className="grid grid-rows-2 gap-2.5">
          {/* Lean season card */}
          <div className="bg-[var(--amber)] rounded-2xl p-4 relative">
            <button className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/10 flex items-center justify-center">
              <Volume2 size={14} className="text-black/50" />
            </button>
            <p className="text-xs uppercase tracking-widest text-black/45 mb-1">
              Lean Season Alerts
            </p>
            <p className="font-outfit font-black text-6xl text-[var(--ink)] leading-none">
              {data.config.lean_season_days || "45"}
              <span className="text-2xl ml-1">Days</span>
            </p>
            <div className="inline-block bg-black/9 rounded-full px-3 py-1 mt-2">
              <span className="text-sm font-bold text-black/55">
                {data.config.lean_season_window || "Jul 15 – Aug 30"}
              </span>
            </div>
          </div>

          {/* Spread card */}
          <Link
            href="/spread"
            className="bg-white rounded-2xl border border-[rgba(0,0,0,0.08)] p-4 hover:border-[var(--orange)] hover:translate-x-0.5 transition-all"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
          >
            <div className="flex justify-between items-start mb-1">
              <span className="text-xs uppercase tracking-wider text-[var(--ink3)]">
                🌽 UG → RW Cross-Border
              </span>
              <ChevronRight size={16} className="text-[var(--ink4)]" />
            </div>
            <p className="font-outfit font-black text-[32px] leading-none price-display">
              <span className={spreadIsPositive ? "text-[var(--green)]" : "text-[var(--red)]"}>
                ${Math.abs(spreadValue)}
              </span>
              <span className="text-base text-[var(--ink3)] font-normal">/MT</span>
            </p>
            <div className="flex items-center gap-1.5 mt-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  spreadIsPositive ? "bg-[var(--green-light)]" : "bg-[var(--orange)]"
                }`}
              />
              <span
                className={`text-sm font-bold ${
                  spreadIsPositive ? "text-[var(--green-light)]" : "text-[var(--orange)]"
                }`}
              >
                {spreadStatus}
              </span>
            </div>
          </Link>
        </div>
      </div>

      {/* Live Prices Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Grid3X3 size={20} className="text-[var(--green)]" />
            <h2 className="font-outfit font-bold text-lg text-[var(--ink)]">
              {isCityFirstView ? (
                "Live City Prices"
              ) : (
                <>
                  Live {(activeFilter as string).charAt(0).toUpperCase() + (activeFilter as string).slice(1).replace("_", " ")}{" "}
                  {
                    {
                      maize: "🌽",
                      beans: "🫘",
                      soya: "🫛",
                      rice: "🍚",
                      palm_oil: "🌴",
                      gold: "🪙",
                    }[activeFilter as CommodityType]
                  }{" "}
                  Prices
                </>
              )}
            </h2>
          </div>
          <span className="text-sm uppercase text-[var(--ink4)]">
            {isCityFirstView ? "All commodities" : "Values in RWF / UGX"}
          </span>
        </div>

        {/* City-first grid OR Commodity-first grid */}
        {isCityFirstView ? (
          // City-first view: 2-column fixed grid (3×2 layout on desktop)
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {cityBundles.map((city) => (
              <CityCard
                key={city.id}
                city={city}
                onReportPrice={(cityId, commodity) => {
                  // TODO: Open price report modal
                  console.log(`Report price for ${commodity} in ${cityId}`);
                }}
                onPlayVoice={(cityId) => {
                  console.log(`Playing voice for ${cityId}`);
                }}
              />
            ))}
          </div>
        ) : (
          // Commodity-first view: original SpotCard grid
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {displaySpots.map((spot: SpotWithPrice) => (
              <SpotCard
                key={spot.id}
                spot={spot}
                commodity={activeFilter as CommodityType}
              />
            ))}
          </div>
        )}
      </div>

      {/* Coming Soon Section - Only in commodity-first view */}
      {!isCityFirstView && sortedCommodities.some((c: CommodityRow) => c.status === "coming") && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-sm uppercase text-[var(--ink4)]">
              Other commodities
            </span>
            <div className="flex-1 h-px bg-[var(--border)]" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {sortedCommodities
              .filter((c: CommodityRow) => c.status === "coming")
              .map((commodity: CommodityRow) => {
                const isGold = commodity.id === "gold";

                return (
                  <div
                    key={commodity.id}
                    className={`rounded-2xl border overflow-hidden min-h-[120px] relative ${
                      isGold
                        ? "border-[var(--amber)] bg-[var(--amber-bg)]"
                        : "border-[rgba(0,0,0,0.08)] bg-white"
                    }`}
                    style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
                  >
                    <div className="p-4 filter blur-[5px] opacity-45 pointer-events-none">
                      <p className="text-xs uppercase tracking-wider text-[var(--ink4)]">
                        {commodity.name} Price {commodity.icon}
                      </p>
                      <p className="font-outfit font-black text-2xl text-[var(--ink)] price-display mt-1">
                        RWF 450
                      </p>
                      <p className="text-sm font-bold text-[var(--green-light)]">
                        +2.3%
                      </p>
                    </div>

                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                      <span
                        className={`px-3 py-1 rounded text-xs uppercase font-bold ${
                          isGold
                            ? "bg-[var(--amber)] text-[var(--ink)]"
                            : "bg-[var(--ink)] text-white"
                        }`}
                      >
                        {isGold ? "Goma agents only" : "Coming soon"}
                      </span>
                      <span className="text-xs text-[var(--ink4)]">
                        {commodity.launch_note}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Arb Opportunities - Full comparison at footer */}
      {isCityFirstView && <BestPriceComparison cities={cityBundles} />}

      {/* Bottom Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Mini leaderboard */}
        <div className="bg-white rounded-2xl border border-[rgba(0,0,0,0.08)] p-5" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <div className="flex items-center gap-2 mb-4">
            <Trophy size={20} className="text-[var(--green)]" />
            <span className="font-outfit font-bold text-base text-[var(--ink)]">
              Top reporters this week
            </span>
          </div>
          <div className="space-y-3">
            {topAgents.map((agent: AgentRow, idx: number) => {
              const initials = agent.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);

              return (
                <div key={agent.name} className="flex items-center gap-3">
                  <span className="font-outfit font-bold text-base text-[var(--green)] w-5">
                    {idx + 1}
                  </span>
                  <div className="w-9 h-9 rounded-full bg-[var(--green)] flex items-center justify-center text-white text-sm font-bold">
                    {initials}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[var(--ink)]">
                      {agent.name.split(" ")[0]}
                    </p>
                    <p className="text-xs text-[var(--ink4)]">{agent.spot_id}</p>
                  </div>
                  <span className="text-sm font-bold text-[var(--green)]">
                    {agent.accuracy_pct}%
                  </span>
                  <span className="bg-[var(--surface)] px-2 py-1 rounded text-sm font-medium text-[var(--ink3)]">
                    {agent.tickets_month}
                  </span>
                </div>
              );
            })}
          </div>
          <Link
            href="/leaderboard"
            className="block mt-4 text-sm text-[var(--green)] font-medium hover:underline"
          >
            View full leaderboard →
          </Link>
        </div>

        {/* Prize pool card */}
        <div className="bg-white rounded-2xl border border-[rgba(0,0,0,0.08)] p-5" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <div className="flex items-center gap-2 mb-4">
            <Ticket size={20} className="text-[var(--amber)]" />
            <span className="font-outfit font-bold text-base text-[var(--ink)]">
              This week&apos;s draw
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-outfit font-black text-[42px] text-[var(--green)] price-display">
              ${parseInt(data.config.weekly_jackpot_usd || "15") + (data.gold_active_this_week ? 10 : 0)}
            </span>
            {data.gold_active_this_week && (
              <span className="bg-[var(--amber)] px-2.5 py-1 rounded text-xs uppercase font-bold text-[var(--ink)] ml-2">
                Gold Bonus Active
              </span>
            )}
          </div>
          <p className="text-sm text-[var(--ink3)] mt-3">
            Next draw: <span className="font-bold text-[var(--ink)]">{countdown}</span>
          </p>
          <Link
            href="/lottery"
            className="inline-block mt-4 px-5 py-2.5 bg-[var(--surface)] rounded-lg text-sm font-medium text-[var(--ink2)] hover:bg-[var(--border)] transition-colors"
          >
            See all entries →
          </Link>
        </div>
      </div>
    </div>
  );
}
