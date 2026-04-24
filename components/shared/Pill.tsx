"use client";

import { ReactNode } from "react";

// Country color map
export const COUNTRY_COLORS = {
  RW: "#639922",
  CD: "#EF9F27",
  UG: "#378ADD",
  TZ: "#A32D2D",
} as const;

type PillVariant = "white" | "green" | "red" | "amber" | "gray" | "orange" | "gold";
type PillSize = "sm" | "md" | "lg";

interface PillProps {
  variant?: PillVariant;
  size?: PillSize;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  asButton?: boolean;
  ariaLabel?: string;
}

const variantStyles: Record<PillVariant, string> = {
  white: "bg-white border border-[rgba(0,0,0,0.08)] text-gray-500",
  green: "bg-[#EAF3DE] text-[#3B6D11] border-transparent",
  red: "bg-[#FCEBEB] text-[#A32D2D] border-transparent",
  amber: "bg-[#FAEEDA] text-[#854F0B] border-transparent",
  gray: "bg-gray-50 text-gray-500 border-transparent",
  orange: "bg-[#EF9F27] text-[#4A1B0C] border-transparent",
  gold: "bg-[#FAEEDA] text-[#633806] border border-[#EF9F27]",
};

const sizeStyles: Record<PillSize, string> = {
  sm: "px-2 py-0.5 text-[10px]",
  md: "px-2.5 py-1 text-[11px]",
  lg: "px-3 py-1.5 text-[13px]",
};

export function Pill({
  variant = "white",
  size = "md",
  children,
  className = "",
  onClick,
  asButton = false,
  ariaLabel,
}: PillProps) {
  const baseStyles = "rounded-full font-medium tracking-wide transition-all inline-flex items-center gap-1";
  const combinedStyles = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

  if (asButton || onClick) {
    return (
      <button
        onClick={onClick}
        className={`${combinedStyles} hover:translate-y-[-1px] hover:shadow-sm cursor-pointer`}
        aria-label={ariaLabel}
      >
        {children}
      </button>
    );
  }

  return <span className={combinedStyles}>{children}</span>;
}

// Specialized price pill
interface PricePillProps {
  value: number | null;
  currency?: string;
  isGold?: boolean;
  onClick?: () => void;
  size?: PillSize;
}

export function PricePill({ value, currency, isGold = false, onClick, size = "md" }: PricePillProps) {
  const displayValue = value === null ? "—" : isGold ? value.toFixed(2) : value.toLocaleString();

  const baseStyle = isGold
    ? "bg-white border border-[#EF9F27] text-[#633806]"
    : "bg-white border border-[rgba(0,0,0,0.1)] text-[var(--ink)]";

  const sizeStyle = size === "sm" ? "px-2 py-0.5 text-xs" : size === "lg" ? "px-3.5 py-1.5 text-base" : "px-3 py-1 text-sm";

  return (
    <button
      onClick={onClick}
      className={`${baseStyle} ${sizeStyle} rounded-full font-medium hover:translate-y-[-1px] hover:shadow-sm transition-all`}
      aria-label={`Price: ${displayValue}${currency ? ` ${currency}` : ""}`}
    >
      {displayValue}
    </button>
  );
}

// Specialized change pill with arrow
interface ChangePillProps {
  delta: number | null;
  size?: PillSize;
  showArrow?: boolean;
}

export function ChangePill({ delta, size = "md", showArrow = true }: ChangePillProps) {
  if (delta === null || delta === undefined) {
    return <Pill variant="gray" size={size}>—</Pill>;
  }

  const isPositive = delta > 0;
  const isNegative = delta < 0;
  const arrow = showArrow ? (isPositive ? "↗ " : isNegative ? "↘ " : "") : "";
  const srText = isPositive
    ? `up ${Math.abs(delta).toFixed(1)} percent`
    : isNegative
    ? `down ${Math.abs(delta).toFixed(1)} percent`
    : "unchanged";

  if (delta === 0) {
    return <Pill variant="gray" size={size}>0%</Pill>;
  }

  return (
    <Pill variant={isPositive ? "green" : "red"} size={size}>
      <span className="sr-only">{srText}</span>
      <span aria-hidden="true">
        {arrow}{Math.abs(delta).toFixed(1)}%
      </span>
    </Pill>
  );
}

// Metadata pill (currency codes, units, labels)
interface MetadataPillProps {
  children: ReactNode;
  size?: PillSize;
}

export function MetadataPill({ children, size = "md" }: MetadataPillProps) {
  return <Pill variant="white" size={size}>{children}</Pill>;
}
