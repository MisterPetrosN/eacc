"use client";

import { useState, useEffect } from "react";
import {
  Clock,
  Users,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  Activity,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

interface DashboardMetrics {
  activeUsers: number;
  activeUsersDelta: number;
  reportsToday: number;
  reportsDelta: number;
  arbAlerts: number;
  pendingModeration: number;
}

interface QuorumData {
  total: number;
  reporting: number;
  atRisk: string[];
}

interface FixPreviewRow {
  commodity: string;
  emoji: string;
  kigaliAvg: number;
  change: number;
  reportCount: number;
}

interface PendingItem {
  id: string;
  commodity: string;
  spot: string;
  value: number;
  deviation: number;
  reporter: string;
  time: string;
}

interface SystemService {
  name: string;
  status: "ok" | "warning" | "error";
  latency?: string;
  lastRun?: string;
}

interface AdminData {
  metrics: DashboardMetrics;
  quorum: QuorumData;
  fixPreview: FixPreviewRow[];
  pendingItems: PendingItem[];
  services: SystemService[];
}

// ============================================================================
// COUNTDOWN HOOK
// ============================================================================

function useFixCountdown() {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const target = new Date();

      // Target: 08:00 CAT (06:00 UTC)
      target.setUTCHours(6, 0, 0, 0);

      // If we're past 08:00 CAT today, target tomorrow
      if (now.getTime() > target.getTime()) {
        target.setUTCDate(target.getUTCDate() + 1);
      }

      const diff = target.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      return { hours, minutes, seconds };
    };

    setTimeLeft(calculateTimeLeft());
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return timeLeft;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockData: AdminData = {
  metrics: {
    activeUsers: 47,
    activeUsersDelta: 12,
    reportsToday: 156,
    reportsDelta: 8,
    arbAlerts: 3,
    pendingModeration: 5,
  },
  quorum: {
    total: 14,
    reporting: 11,
    atRisk: ["Bukavu", "Rusumo", "Mbarara"],
  },
  fixPreview: [
    { commodity: "Maize", emoji: "🌽", kigaliAvg: 322, change: 2.3, reportCount: 8 },
    { commodity: "Beans", emoji: "🫘", kigaliAvg: 572, change: 1.8, reportCount: 7 },
    { commodity: "Soya", emoji: "🌱", kigaliAvg: 415, change: 1.5, reportCount: 6 },
    { commodity: "Rice", emoji: "🍚", kigaliAvg: 845, change: 0.9, reportCount: 5 },
  ],
  pendingItems: [
    { id: "1", commodity: "Maize", spot: "Kimironko", value: 450, deviation: 38, reporter: "Jean", time: "2m ago" },
    { id: "2", commodity: "Beans", spot: "Goma", value: 720, deviation: 26, reporter: "Omar", time: "5m ago" },
    { id: "3", commodity: "Rice", spot: "Mbarara", value: 2500, deviation: 18, reporter: "Sarah", time: "12m ago" },
  ],
  services: [
    { name: "Google Sheets API", status: "ok", latency: "142ms" },
    { name: "WhatsApp Gateway", status: "ok", latency: "89ms" },
    { name: "Price Fix Cron", status: "ok", lastRun: "07:55 CAT" },
    { name: "Arb Alert Cron", status: "ok", lastRun: "30m ago" },
  ],
};

// ============================================================================
// COMPONENTS
// ============================================================================

function MetricCard({
  label,
  value,
  delta,
  sub,
  icon,
  variant = "default",
}: {
  label: string;
  value: number;
  delta?: number;
  sub: string;
  icon: React.ReactNode;
  variant?: "default" | "warning" | "danger" | "success";
}) {
  const bgColors = {
    default: "bg-white",
    warning: "bg-[#FAEEDA]",
    danger: "bg-[#FCEBEB]",
    success: "bg-[#EAF3DE]",
  };

  const textColors = {
    default: "text-[var(--ink)]",
    warning: "text-[#854F0B]",
    danger: "text-[#A32D2D]",
    success: "text-[#3B6D11]",
  };

  return (
    <div className={`${bgColors[variant]} rounded-xl p-4 border border-[rgba(0,0,0,0.08)] min-w-0`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-gray-500">{icon}</span>
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide truncate">{label}</span>
      </div>
      <div className="flex items-baseline gap-2 min-w-0">
        <span className={`text-2xl font-bold ${textColors[variant]} tabular-nums`}>{value}</span>
        {delta !== undefined && delta !== 0 && (
          <span className={`text-sm font-medium ${delta > 0 ? "text-[#3B6D11]" : "text-[#A32D2D]"}`}>
            {delta > 0 ? "+" : ""}{delta}
          </span>
        )}
      </div>
      <p className="text-xs text-gray-500 mt-1 truncate">{sub}</p>
    </div>
  );
}

function Pill({
  children,
  variant = "default",
  size = "sm",
}: {
  children: React.ReactNode;
  variant?: "default" | "green" | "amber" | "red";
  size?: "sm" | "lg";
}) {
  const colors = {
    default: "bg-gray-100 text-gray-600",
    green: "bg-[#EAF3DE] text-[#3B6D11]",
    amber: "bg-[#FAEEDA] text-[#854F0B]",
    red: "bg-[#FCEBEB] text-[#A32D2D]",
  };

  const sizes = {
    sm: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${colors[variant]} ${sizes[size]}`}>
      {children}
    </span>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function AdminOverviewPage() {
  const [data, setData] = useState<AdminData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const countdown = useFixCountdown();

  useEffect(() => {
    // Simulate API fetch
    const timer = setTimeout(() => {
      setData(mockData);
      setLoading(false);
      // Uncomment to test error banner:
      // setError("Failed to sync with Google Sheets. Last successful sync: 5 minutes ago.");
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-10 w-48 bg-gray-200 rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="h-40 bg-gray-200 rounded-xl" />
          <div className="h-40 bg-gray-200 rounded-xl" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6 min-w-0">
      {/* Error Banner - Inline, prominent */}
      {error && (
        <div className="bg-[#FCEBEB] border border-[#A32D2D]/20 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="text-[#A32D2D] flex-shrink-0 mt-0.5" size={20} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#A32D2D]">Sync Error</p>
            <p className="text-sm text-[#A32D2D]/80 mt-0.5">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg text-sm font-medium text-[#A32D2D] hover:bg-[#A32D2D]/5 transition-colors flex-shrink-0"
          >
            <RefreshCw size={14} />
            Retry
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl lg:text-2xl font-bold text-[var(--ink)] truncate">Admin Overview</h1>
          <p className="text-sm text-gray-500 mt-1 truncate">
            Monitor price collection, moderation queue, and system health
          </p>
        </div>
        <Pill variant="green" size="lg">
          <Activity size={14} />
          Live
        </Pill>
      </div>

      {/* Fix Countdown + Quorum Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Countdown Card */}
        <div className="bg-[var(--green)] rounded-xl p-5 text-white min-w-0">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={18} />
            <span className="text-sm font-medium opacity-85">Next price fix</span>
          </div>
          <div className="flex items-baseline gap-1 font-outfit">
            <span className="text-4xl lg:text-5xl font-bold tabular-nums">
              {String(countdown.hours).padStart(2, "0")}
            </span>
            <span className="text-xl lg:text-2xl opacity-60">h</span>
            <span className="text-4xl lg:text-5xl font-bold tabular-nums ml-2">
              {String(countdown.minutes).padStart(2, "0")}
            </span>
            <span className="text-xl lg:text-2xl opacity-60">m</span>
            <span className="text-4xl lg:text-5xl font-bold tabular-nums ml-2">
              {String(countdown.seconds).padStart(2, "0")}
            </span>
            <span className="text-xl lg:text-2xl opacity-60">s</span>
          </div>
          <p className="text-sm opacity-75 mt-3">08:00 CAT daily</p>
        </div>

        {/* Quorum Status */}
        <div className="bg-white rounded-xl border border-[rgba(0,0,0,0.08)] p-5 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">Market Quorum</span>
            <Pill variant={data.quorum.reporting >= data.quorum.total * 0.8 ? "green" : "amber"}>
              {data.quorum.reporting}/{data.quorum.total} reporting
            </Pill>
          </div>
          {/* Progress bar */}
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-[var(--green)] rounded-full transition-all"
              style={{ width: `${(data.quorum.reporting / data.quorum.total) * 100}%` }}
            />
          </div>
          {data.quorum.atRisk.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              <span className="text-xs text-gray-500">At risk:</span>
              {data.quorum.atRisk.map((market) => (
                <Pill key={market} variant="amber">{market}</Pill>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <MetricCard
          label="Active Users"
          value={data.metrics.activeUsers}
          delta={data.metrics.activeUsersDelta}
          sub="Last 24 hours"
          icon={<Users size={16} />}
        />
        <MetricCard
          label="Reports Today"
          value={data.metrics.reportsToday}
          delta={data.metrics.reportsDelta}
          sub="Since midnight CAT"
          icon={<FileText size={16} />}
        />
        <MetricCard
          label="Arb Alerts"
          value={data.metrics.arbAlerts}
          variant={data.metrics.arbAlerts > 0 ? "warning" : "default"}
          sub="Active opportunities"
          icon={<TrendingUp size={16} />}
        />
        <MetricCard
          label="Pending Review"
          value={data.metrics.pendingModeration}
          variant={data.metrics.pendingModeration > 0 ? "danger" : "success"}
          sub="Outlier reports"
          icon={<AlertTriangle size={16} />}
        />
      </div>

      {/* Fix Preview Table */}
      <div className="bg-white rounded-xl border border-[rgba(0,0,0,0.08)] overflow-hidden min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 lg:p-5 border-b border-gray-100 gap-2">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-[var(--ink)] truncate">
              Tomorrow&apos;s Fix Preview
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Values to be published at 08:00 CAT
            </p>
          </div>
          <Pill variant="amber">
            <Clock size={12} />
            Preview
          </Pill>
        </div>

        {/* Responsive table wrapper */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 lg:px-5 py-3 font-medium text-gray-500">Commodity</th>
                <th className="text-right px-4 lg:px-5 py-3 font-medium text-gray-500">Kigali Avg</th>
                <th className="text-right px-4 lg:px-5 py-3 font-medium text-gray-500">Change</th>
                <th className="text-right px-4 lg:px-5 py-3 font-medium text-gray-500">Reports</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.fixPreview.map((row) => (
                <tr key={row.commodity} className="hover:bg-gray-50/50">
                  <td className="px-4 lg:px-5 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{row.emoji}</span>
                      <span className="font-medium text-[var(--ink)]">{row.commodity}</span>
                    </div>
                  </td>
                  <td className="px-4 lg:px-5 py-3 text-right font-bold tabular-nums">
                    {row.kigaliAvg} <span className="text-gray-400 font-normal">RWF</span>
                  </td>
                  <td className="px-4 lg:px-5 py-3 text-right">
                    <span className={`font-medium ${row.change >= 0 ? "text-[#3B6D11]" : "text-[#A32D2D]"}`}>
                      {row.change >= 0 ? "+" : ""}{row.change}%
                    </span>
                  </td>
                  <td className="px-4 lg:px-5 py-3 text-right text-gray-500 tabular-nums">
                    {row.reportCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Two-column: Pending Moderation + System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pending Moderation */}
        <div className="bg-white rounded-xl border border-[rgba(0,0,0,0.08)] p-4 lg:p-5 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[var(--ink)]">
              Pending Moderation
            </h2>
            <Pill variant={data.pendingItems.length > 0 ? "red" : "green"}>
              {data.pendingItems.length} items
            </Pill>
          </div>

          <div className="space-y-3">
            {data.pendingItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[var(--ink)] truncate">{item.commodity}</span>
                    <span className="text-gray-400">·</span>
                    <span className="text-gray-500 truncate">{item.spot}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    by {item.reporter} · {item.time}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold tabular-nums">{item.value} RWF</p>
                  <Pill variant="red">+{item.deviation}%</Pill>
                </div>
              </div>
            ))}

            {data.pendingItems.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">
                No items pending review
              </p>
            )}
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white rounded-xl border border-[rgba(0,0,0,0.08)] p-4 lg:p-5 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[var(--ink)]">
              System Health
            </h2>
            <Pill variant="green">
              <CheckCircle size={12} />
              All Systems Go
            </Pill>
          </div>

          <div className="space-y-3">
            {data.services.map((service) => (
              <div
                key={service.name}
                className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 gap-3"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {service.status === "ok" ? (
                    <CheckCircle size={14} className="text-[#3B6D11] flex-shrink-0" />
                  ) : service.status === "warning" ? (
                    <AlertTriangle size={14} className="text-[#854F0B] flex-shrink-0" />
                  ) : (
                    <XCircle size={14} className="text-[#A32D2D] flex-shrink-0" />
                  )}
                  <span className="text-sm text-[var(--ink)] truncate">{service.name}</span>
                </div>
                <span className="text-xs text-gray-500 flex-shrink-0">
                  {service.latency || service.lastRun}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
