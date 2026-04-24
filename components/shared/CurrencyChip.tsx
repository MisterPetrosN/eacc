"use client";

type Currency = "RWF" | "UGX" | "CDF" | "TZS" | "USD" | "ETB" | "KES";

// Currency color mapping - matches CSS variables
const CHIP_COLORS: Record<Currency, string> = {
  RWF: "bg-[#EAF3DE] text-[#3B6D11]",
  UGX: "bg-[#E6F1FB] text-[#185FA5]",
  CDF: "bg-[#FAEEDA] text-[#854F0B]",
  TZS: "bg-[#FBE4E4] text-[#8F2222]",
  USD: "bg-[#F1EFE8] text-[#444441]",
  ETB: "bg-[#FAECE7] text-[#4A1B0C]",
  KES: "bg-[#FBEAF0] text-[#72243E]",
};

// Flag mapping for currencies
const CURRENCY_FLAGS: Record<Currency, string> = {
  RWF: "🇷🇼",
  UGX: "🇺🇬",
  CDF: "🇨🇩",
  TZS: "🇹🇿",
  USD: "🇺🇸",
  ETB: "🇪🇹",
  KES: "🇰🇪",
};

// Hardcoded P2P rates (TODO: fetch from /api/rates)
// These are fallback rates - will be replaced by live P2P scraper
const P2P_RATES: Record<Currency, number> = {
  RWF: 1,
  UGX: 0.343,  // 1 UGX = 0.343 RWF
  CDF: 0.47,   // 1 CDF = 0.47 RWF (approximate)
  TZS: 0.52,   // 1 TZS = 0.52 RWF (approximate)
  USD: 1280,   // 1 USD = 1280 RWF
  ETB: 22,     // 1 ETB = 22 RWF (approximate)
  KES: 9.5,    // 1 KES = 9.5 RWF (approximate)
};

interface CurrencyChipProps {
  value: number | null;
  currency: Currency;
  muted?: boolean;
  prefix?: string;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  showCurrency?: boolean;
  className?: string;
}

function formatNumber(value: number | null, currency: Currency): string {
  if (value === null) return "—";
  // Gold/USD uses 2 decimal places
  if (currency === "USD") {
    return value.toFixed(2);
  }
  return value.toLocaleString();
}

// Convert any currency to RWF
export function toRWF(value: number, fromCurrency: Currency): number {
  if (fromCurrency === "RWF") return value;
  return Math.round(value * P2P_RATES[fromCurrency]);
}

export function CurrencyChip({
  value,
  currency,
  muted = false,
  prefix,
  size = "md",
  onClick,
  showCurrency = true,
  className = "",
}: CurrencyChipProps) {
  const colorClasses = CHIP_COLORS[currency] || CHIP_COLORS.USD;

  // BUMPED SIZES for mobile readability
  const sizeClasses = {
    sm: "px-[10px] py-[4px] text-[14px]",           // was: px-2 py-0.5 text-xs
    md: "px-[14px] py-[6px] text-[17px]",           // was: px-3 py-1 text-[15px]
    lg: "px-[16px] py-[8px] text-[19px]",           // was: px-3.5 py-1.5 text-base
  };

  // Currency suffix sizes - BUMPED
  const suffixSizes = {
    sm: "text-[11px]",
    md: "text-[12px]",  // was 10.5px
    lg: "text-[13px]",
  };

  const baseClasses = `
    inline-flex items-baseline gap-1
    rounded-full font-bold tabular-nums
    ${sizeClasses[size]}
    ${colorClasses}
    ${muted ? "opacity-85" : ""}
    ${onClick ? "cursor-pointer hover:translate-y-[-1px] hover:shadow-sm transition-all" : ""}
    ${className}
  `.trim().replace(/\s+/g, " ");

  const content = (
    <>
      {prefix && <span className={`${suffixSizes[size]} font-semibold opacity-85`}>{prefix}</span>}
      <span>{formatNumber(value, currency)}</span>
      {showCurrency && (
        <span className={`${suffixSizes[size]} font-semibold opacity-85`}>{currency}</span>
      )}
    </>
  );

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={baseClasses}
        aria-label={`Price: ${formatNumber(value, currency)} ${currency}`}
      >
        {content}
      </button>
    );
  }

  return <span className={baseClasses}>{content}</span>;
}

// Dual currency display - ENFORCED for non-RWF currencies
interface DualCurrencyProps {
  value: number | null;
  currency: Currency;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
}

export function DualCurrency({ value, currency, size = "md", onClick }: DualCurrencyProps) {
  // Gold (USD) never converts - show single chip
  if (currency === "USD" || currency === "RWF" || value === null) {
    return <CurrencyChip value={value} currency={currency} size={size} onClick={onClick} />;
  }

  // Convert to RWF for companion chip
  const rwfValue = toRWF(value, currency);

  return (
    <div className="inline-flex items-center gap-1.5">
      <CurrencyChip value={value} currency={currency} size={size} onClick={onClick} />
      <CurrencyChip value={rwfValue} currency="RWF" size={size} muted prefix="≈" />
    </div>
  );
}

// Standalone converted price (for below primary price)
interface ConvertedPriceProps {
  value: number | null;
  currency: Currency;
  className?: string;
}

export function ConvertedPrice({ value, currency, className = "" }: ConvertedPriceProps) {
  if (value === null) return null;

  return (
    <span className={`text-[12px] font-medium text-gray-500 ${className}`}>
      ≈ {formatNumber(value, currency)} {currency}
    </span>
  );
}

// Export utilities
export { CHIP_COLORS, CURRENCY_FLAGS, P2P_RATES };
export type { Currency };
