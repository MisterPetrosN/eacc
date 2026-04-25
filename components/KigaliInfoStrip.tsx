"use client";

import { useState, useEffect } from "react";
import { Clock, Sun, Cloud, CloudRain, CloudSnow, Zap, Thermometer, Droplets } from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

interface WeatherData {
  temperature: number;
  weatherCode: number;
  highTemp: number;
  lowTemp: number;
  rainChance: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

// WMO Weather Codes mapping
const getWeatherInfo = (code: number): { icon: typeof Sun; label: string; color: string } => {
  if (code === 0) return { icon: Sun, label: "Clear sky", color: "#F59E0B" };
  if (code >= 1 && code <= 3) return { icon: Cloud, label: "Partly cloudy", color: "#6B7280" };
  if (code >= 45 && code <= 48) return { icon: Cloud, label: "Foggy", color: "#9CA3AF" };
  if (code >= 51 && code <= 67) return { icon: CloudRain, label: "Rain", color: "#0D47A1" };
  if (code >= 71 && code <= 77) return { icon: CloudSnow, label: "Snow", color: "#60A5FA" };
  if (code >= 80 && code <= 82) return { icon: CloudRain, label: "Showers", color: "#0D47A1" };
  if (code >= 95 && code <= 99) return { icon: Zap, label: "Thunderstorm", color: "#7C3AED" };
  return { icon: Cloud, label: "Cloudy", color: "#6B7280" };
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Africa/Kigali",
  });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "Africa/Kigali",
  });
}

function isMarketOpen(date: Date): boolean {
  const hours = parseInt(
    date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      hour12: false,
      timeZone: "Africa/Kigali",
    })
  );
  return hours >= 6 && hours < 18;
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function Divider() {
  return <div className="w-px h-8 bg-[#E8DCC4]" />;
}

function TimeSegment({ time, date }: { time: string; date: string }) {
  return (
    <div className="flex items-center gap-2">
      <Clock size={16} className="text-[#1B5E20]" />
      <div>
        <div className="text-[18px] font-bold text-black tabular-nums leading-tight">
          {time}
        </div>
        <div className="text-[11px] text-[#4A4A4A]">CAT · {date}</div>
      </div>
    </div>
  );
}

function WeatherSegment({
  temperature,
  weatherCode,
  loading,
}: {
  temperature: number | null;
  weatherCode: number | null;
  loading: boolean;
}) {
  if (loading || temperature === null || weatherCode === null) {
    return (
      <div className="flex items-center gap-2">
        <Cloud size={16} className="text-[#6B7280]" />
        <div>
          <div className="text-[18px] font-bold text-black tabular-nums leading-tight">
            --°C
          </div>
          <div className="text-[11px] text-[#4A4A4A]">Kigali · Loading...</div>
        </div>
      </div>
    );
  }

  const { icon: WeatherIcon, label, color } = getWeatherInfo(weatherCode);

  return (
    <div className="flex items-center gap-2">
      <WeatherIcon size={16} style={{ color }} />
      <div>
        <div className="text-[18px] font-bold text-black tabular-nums leading-tight">
          {Math.round(temperature)}°C
        </div>
        <div className="text-[11px] text-[#4A4A4A]">Kigali · {label}</div>
      </div>
    </div>
  );
}

function ForecastSegment({
  highTemp,
  lowTemp,
  rainChance,
  loading,
}: {
  highTemp: number | null;
  lowTemp: number | null;
  rainChance: number | null;
  loading: boolean;
}) {
  if (loading || highTemp === null || lowTemp === null) {
    return (
      <div className="flex items-center gap-2">
        <Thermometer size={16} className="text-[#6B7280]" />
        <div>
          <div className="text-[14px] font-bold text-black tabular-nums leading-tight">
            H --° · L --°
          </div>
          <div className="text-[11px] text-[#4A4A4A]">--% rain</div>
        </div>
      </div>
    );
  }

  const rainColor = (rainChance ?? 0) > 50 ? "#0D47A1" : "#4A4A4A";

  return (
    <div className="flex items-center gap-2">
      <Droplets size={16} className="text-[#0D47A1]" />
      <div>
        <div className="text-[14px] font-bold text-black tabular-nums leading-tight">
          H {Math.round(highTemp)}° · L {Math.round(lowTemp)}°
        </div>
        <div className="text-[11px]" style={{ color: rainColor }}>
          {rainChance ?? 0}% rain
        </div>
      </div>
    </div>
  );
}

function MarketSession({ isOpen }: { isOpen: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className={`w-2 h-2 rounded-full ${isOpen ? "bg-[#10B981]" : "bg-[#F59E0B]"}`}
      />
      <span className="text-[11px] font-medium text-[#4A4A4A]">
        {isOpen ? "Market Open" : "Closed"}
      </span>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function KigaliInfoStrip() {
  const [time, setTime] = useState<string>("--:--");
  const [date, setDate] = useState<string>("---");
  const [marketOpen, setMarketOpen] = useState<boolean>(true);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  // Update time every minute
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(formatTime(now));
      setDate(formatDate(now));
      setMarketOpen(isMarketOpen(now));
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Fetch weather on mount and every 15 minutes
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch(
          "https://api.open-meteo.com/v1/forecast?latitude=-1.9536&longitude=30.0606&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Africa/Kigali&forecast_days=1"
        );

        if (!response.ok) {
          throw new Error("Weather fetch failed");
        }

        const data = await response.json();

        setWeather({
          temperature: data.current?.temperature_2m ?? null,
          weatherCode: data.current?.weather_code ?? null,
          highTemp: data.daily?.temperature_2m_max?.[0] ?? null,
          lowTemp: data.daily?.temperature_2m_min?.[0] ?? null,
          rainChance: data.daily?.precipitation_probability_max?.[0] ?? null,
        });
        setLoading(false);
      } catch (error) {
        console.error("Weather fetch error:", error);
        setLoading(false);
        // Silently fail - don't show error states
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 15 * 60 * 1000); // 15 minutes
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="bg-white rounded-2xl border border-[#E8DCC4] py-3 px-4 flex items-center justify-between gap-4"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
    >
      {/* Desktop: all segments */}
      <div className="hidden sm:flex items-center gap-4">
        <TimeSegment time={time} date={date} />
        <Divider />
        <WeatherSegment
          temperature={weather?.temperature ?? null}
          weatherCode={weather?.weatherCode ?? null}
          loading={loading}
        />
        <Divider />
        <ForecastSegment
          highTemp={weather?.highTemp ?? null}
          lowTemp={weather?.lowTemp ?? null}
          rainChance={weather?.rainChance ?? null}
          loading={loading}
        />
      </div>

      {/* Mobile: just time + weather */}
      <div className="flex sm:hidden items-center gap-4">
        <TimeSegment time={time} date={date} />
        <Divider />
        <WeatherSegment
          temperature={weather?.temperature ?? null}
          weatherCode={weather?.weatherCode ?? null}
          loading={loading}
        />
      </div>

      {/* Market session - desktop only, right-aligned */}
      <div className="hidden sm:block">
        <MarketSession isOpen={marketOpen} />
      </div>
    </div>
  );
}
