"use client";

import { useState, useEffect } from "react";
import { ChangePill, Pill, COUNTRY_COLORS } from "@/components/shared/Pill";

interface FixPreviewRow {
  market: string;
  country: "RW" | "CD" | "UG" | "TZ";
  flag: string;
  currency: string;
  maize: { value: number | null; delta: number | null; reports: number };
  beans: { value: number | null; delta: number | null; reports: number };
  soya: { value: number | null; delta: number | null; reports: number };
  rice: { value: number | null; delta: number | null; reports: number };
  status: "ready" | "partial" | "missing";
}

export function FixPreviewTable() {
  const [data, setData] = useState<FixPreviewRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with actual API call
    setData([
      {
        market: "Kigali",
        country: "RW",
        flag: "🇷🇼",
        currency: "RWF",
        maize: { value: 325, delta: 2.1, reports: 3 },
        beans: { value: 785, delta: 1.5, reports: 3 },
        soya: { value: 655, delta: -0.8, reports: 2 },
        rice: { value: 1250, delta: 0.4, reports: 3 },
        status: "ready",
      },
      {
        market: "Goma",
        country: "CD",
        flag: "🇨🇩",
        currency: "RWF",
        maize: { value: 342, delta: 3.2, reports: 2 },
        beans: { value: 802, delta: 2.8, reports: 2 },
        soya: { value: null, delta: null, reports: 0 },
        rice: { value: null, delta: null, reports: 0 },
        status: "partial",
      },
      {
        market: "Kampala",
        country: "UG",
        flag: "🇺🇬",
        currency: "UGX",
        maize: { value: 1150, delta: 1.8, reports: 4 },
        beans: { value: 2400, delta: -1.2, reports: 3 },
        soya: { value: 1850, delta: 0.5, reports: 2 },
        rice: { value: 3200, delta: 0.9, reports: 4 },
        status: "ready",
      },
      {
        market: "Bukavu",
        country: "CD",
        flag: "🇨🇩",
        currency: "RWF",
        maize: { value: 338, delta: 2.5, reports: 1 },
        beans: { value: 790, delta: 1.2, reports: 1 },
        soya: { value: null, delta: null, reports: 0 },
        rice: { value: null, delta: null, reports: 0 },
        status: "partial",
      },
      {
        market: "Mbarara",
        country: "UG",
        flag: "🇺🇬",
        currency: "UGX",
        maize: { value: null, delta: null, reports: 0 },
        beans: { value: null, delta: null, reports: 0 },
        soya: { value: null, delta: null, reports: 0 },
        rice: { value: null, delta: null, reports: 0 },
        status: "missing",
      },
    ]);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-12 bg-gray-100 rounded-lg" />
        ))}
      </div>
    );
  }

  const statusStyles = {
    ready: { bg: "bg-[#EAF3DE]", text: "text-[#3B6D11]", label: "Ready" },
    partial: { bg: "bg-[#FAEEDA]", text: "text-[#854F0B]", label: "Partial" },
    missing: { bg: "bg-[#FCEBEB]", text: "text-[#A32D2D]", label: "Missing" },
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
            <th className="pb-3 font-medium">Market</th>
            <th className="pb-3 font-medium text-center">🌽 Maize</th>
            <th className="pb-3 font-medium text-center">🫘 Beans</th>
            <th className="pb-3 font-medium text-center">🌱 Soya</th>
            <th className="pb-3 font-medium text-center">🍚 Rice</th>
            <th className="pb-3 font-medium text-right">Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => {
            const status = statusStyles[row.status];

            return (
              <tr key={row.market} className="border-b border-gray-50 last:border-0">
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-1 h-8 rounded-full"
                      style={{ backgroundColor: COUNTRY_COLORS[row.country] }}
                    />
                    <span className="text-base">{row.flag}</span>
                    <div>
                      <span className="font-medium text-[var(--ink)]">{row.market}</span>
                      <span className="text-xs text-gray-400 ml-2">{row.currency}</span>
                    </div>
                  </div>
                </td>
                <td className="py-3 text-center">
                  <PriceCell data={row.maize} />
                </td>
                <td className="py-3 text-center">
                  <PriceCell data={row.beans} />
                </td>
                <td className="py-3 text-center">
                  <PriceCell data={row.soya} />
                </td>
                <td className="py-3 text-center">
                  <PriceCell data={row.rice} />
                </td>
                <td className="py-3 text-right">
                  <Pill
                    variant={
                      row.status === "ready"
                        ? "green"
                        : row.status === "partial"
                        ? "amber"
                        : "red"
                    }
                    size="sm"
                  >
                    {status.label}
                  </Pill>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// Sub-component for price cells
function PriceCell({
  data,
}: {
  data: { value: number | null; delta: number | null; reports: number };
}) {
  if (data.value === null) {
    return <span className="text-gray-300">—</span>;
  }

  return (
    <div className="flex items-center justify-center gap-1.5">
      <span className="font-medium text-[var(--ink)]">
        {data.value.toLocaleString()}
      </span>
      <ChangePill delta={data.delta} size="sm" showArrow={false} />
      <span className="text-[10px] text-gray-400">({data.reports})</span>
    </div>
  );
}
