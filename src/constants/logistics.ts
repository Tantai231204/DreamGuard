/**
 * Standardized reasons for return and exchange workflows.
 * Used across Order and Trade-In management modules.
 */

export const RETURN_REASONS = [
  "Pristine condition, original tags attached",
  "Minor packaging damage, product intact",
  "Slight surface scratches or scuffs",
  "Technical defect/Manufacturer defect",
  "Other (Provide details below)",
] as const;

export const EXCHANGE_REASONS = [
  "Customer changed mind (Color/Size preference)",
  "Defective item, exchange for identical replacement",
  "Mismatched item, exchange for correct variant",
  "Customer upgrade to higher-tier product",
  "Other (Provide details below)",
] as const;

export const OTHER_REASON_LABEL = "Other (Provide details below)";

export type ReturnReason = (typeof RETURN_REASONS)[number];
export type ExchangeReason = (typeof EXCHANGE_REASONS)[number];
