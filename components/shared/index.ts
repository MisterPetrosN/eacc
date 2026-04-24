// Shared design system components
// Used by both public and admin routes

// Legacy pill exports (for backwards compatibility)
export { Pill, PricePill, MetadataPill, COUNTRY_COLORS } from "./Pill";

// New pill system (EACC visual identity spec)
export {
  SectionLabelPill,
  EntityPill,
  ModifierPill,
  StatusPill,
  ChangePill,
  SpreadPill,
  CurrencyChip,
  DualCurrency,
  ConvertedPrice,
  CommodityLabel,
  toRWF,
} from "./Pills";

// Currency utilities
export { CHIP_COLORS, CURRENCY_FLAGS } from "./CurrencyChip";
export type { Currency } from "./CurrencyChip";

// Metric components
export { MetricCard, MetricStripItem } from "./MetricCard";
