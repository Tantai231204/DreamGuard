/**
 * combo-dialog barrel — shared types, helpers, constants & component re-exports
 */

import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────
// STYLE CONSTANTS
// ─────────────────────────────────────────────────────────
export const INPUT_CLS =
  "h-11 rounded-xl border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-primary-500/60 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 transition-all text-sm font-medium text-slate-900 placeholder:text-slate-400 shadow-[0_1px_2px_-1px_rgba(0,0,0,0.05)] disabled:opacity-60 disabled:hover:bg-slate-50/50";

export const SELECT_TRIGGER_CLS = cn(
  INPUT_CLS,
  "px-3.5 [&>span]:!flex [&>span]:!items-center [&>span]:!gap-2 [&>span]:!truncate [&>span_*]:!truncate data-[state=open]:border-primary-500 data-[state=open]:ring-4 data-[state=open]:ring-primary-500/10 data-[state=open]:bg-white",
);

// ─────────────────────────────────────────────────────────
// COLOR HELPERS
// ─────────────────────────────────────────────────────────
const COLOR_HEX_MAP: Record<string, string> = {
  white: "#f5f5f5",
  pink: "#ffc0cb",
  blue: "#add8e6",
  red: "#ff6b6b",
  green: "#90ee90",
  yellow: "#ffeb3b",
  orange: "#ffa500",
  purple: "#dda0dd",
  black: "#333333",
  gray: "#9e9e9e",
  grey: "#9e9e9e",
  brown: "#a0522d",
  beige: "#f5f5dc",
  mint: "#98ff98",
};

const HEX_NAME_MAP: Record<string, string> = {
  "#f5f5f5": "White",
  "#ffc0cb": "Pink",
  "#add8e6": "Blue",
  "#ff6b6b": "Red",
  "#90ee90": "Green",
  "#ffeb3b": "Yellow",
  "#ffa500": "Orange",
  "#dda0dd": "Purple",
  "#333333": "Black",
  "#9e9e9e": "Gray",
  "#a0522d": "Brown",
  "#f5f5dc": "Beige",
  "#98ff98": "Mint",
};

export function colorHex(c?: string): string | undefined {
  if (!c) return undefined;
  if (c.startsWith("#")) return c;
  return COLOR_HEX_MAP[c.toLowerCase().trim()] ?? "#e5e7eb";
}

export function colorLabel(c?: string): string | undefined {
  if (!c) return undefined;
  if (c.startsWith("#")) return HEX_NAME_MAP[c.toLowerCase()] ?? undefined;
  return c.charAt(0).toUpperCase() + c.slice(1);
}

// ─────────────────────────────────────────────────────────
// COMBO DIALOG MODE
// ─────────────────────────────────────────────────────────
export type ComboDialogMode = 'parent' | 'variant';

// ─────────────────────────────────────────────────────────
// COMBO ITEM ENTRY
// ─────────────────────────────────────────────────────────
import { type ComboItemValues } from './comboSchema';
export type ComboItemEntry = ComboItemValues;

// ─────────────────────────────────────────────────────────
// FORM STATE & REDUCER
// ─────────────────────────────────────────────────────────
import type { ComboFormValues as ZodComboFormValues } from './comboSchema';
export type ComboFormValues = ZodComboFormValues;

import { normalizeStatus, getAllowedStatusTransitions } from "../../types";

// ── Status Helpers (Re-exported from types.ts) ─────────
export { normalizeStatus, getAllowedStatusTransitions };

export function toSlug(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

let _id = 0;
export const nextItemId = () => `item-${++_id}-${Date.now()}`;

import type { Combo } from "../../types";
import type { ComboResponse } from "@/api/services/comboService";

export function getInitialState(
  combo?: Combo | ComboResponse | null,
): ComboFormValues {
  if (combo) {
    const images = combo.images ?? [];
    const imageUrl = combo.imageUrl ?? images[0] ?? "";

    // Senior Data Normalization: Handle both lightweight table objects and full response objects
    const items: ComboItemEntry[] = [];

    if ('productItems' in combo && Array.isArray(combo.productItems)) {
      // Full ComboResponse mapping
      combo.productItems.forEach((pi, idx) => {
        items.push({
          id: `existing-${idx}-${pi.productVariantId}`,
          productVariantId: pi.productVariantId,
          quantity: pi.quantity,
          label: pi.productName,
          productName: pi.productName,
          sku: pi.sku,
          color: undefined,
          size: undefined,
          salePrice: pi.salePrice,
          basePrice: pi.basePrice,
        });
      });
    } else if (Array.isArray(combo.items)) {
      // Fallback for limited Combo objects
      combo.items.forEach((item, idx) => {
        items.push({
          id: `existing-${idx}-${item.variantId || item.productId}`,
          productVariantId: item.variantId || item.productId,
          quantity: item.quantity,
          label: `${item.productName}${item.variantLabel ? ` — ${item.variantLabel}` : ""}`,
          productName: item.productName,
          sku: item.variantId || "",
          color: undefined,
          size: item.variantLabel,
          salePrice: 0,
          basePrice: 0,
        });
      });
    }

    return {
      name: combo.name ?? "",
      slug: combo.slug ?? "",
      ageGroup: combo.ageGroup || 0,
      color: combo.color ?? "",
      size: combo.size ?? "",
      basePrice: combo.basePrice ?? 0,
      salePrice: Number(combo.salePrice ?? ('baseSalePrice' in combo ? combo.baseSalePrice : 0) ?? 0),
      description: combo.description ?? "",
      imageUrl: imageUrl,
      imagePublicId: "",
      comboParentId: combo.comboParentId ?? "",
      // Senior Mapping Logic: Status context recovery (handle raw, wrapped, or aliased data)
      status: normalizeStatus(
        combo.status ??
        (combo as { data?: { status?: unknown } }).data?.status ??
        (combo as { isActive?: unknown }).isActive ??
        (combo as { isPublished?: unknown }).isPublished
      ),
      items,
    };
  }
  return {
    name: "",
    slug: "",
    ageGroup: 1,
    color: "",
    size: "",
    basePrice: 0,
    salePrice: 0,
    description: "",
    imageUrl: "",
    imagePublicId: "",
    comboParentId: "",
    status: normalizeStatus(null),
    items: [],
  };
}

// ─────────────────────────────────────────────────────────
// COMPONENT RE-EXPORTS
// ─────────────────────────────────────────────────────────
export { default as ComboDialog, type ComboDialogProps } from "./ComboDialog";
export { default as ComboFormFields } from "./ComboFormFields";
export { default as ComboItemsPanel } from "./ComboItemsPanel";
export { default as VirtualVariantSelect } from "./VirtualVariantSelect";
export { default as ComboModeSelector } from "./ComboModeSelector";
export { default as ComboDialogHeader } from "./ComboDialogHeader";
export { default as ComboDialogFooter } from "./ComboDialogFooter";
export { useComboForm } from "./useComboForm";
