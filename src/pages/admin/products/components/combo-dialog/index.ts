/**
 * combo-dialog barrel — shared types, helpers, constants & component re-exports
 */

import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────
// STYLE CONSTANTS
// ─────────────────────────────────────────────────────────
export const INPUT_CLS =
  "h-11 rounded-xl border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-[#4988c4]/60 focus:bg-white focus:border-[#4988c4] focus:ring-4 focus:ring-[#4988c4]/20 transition-all text-sm font-medium text-slate-900 placeholder:text-slate-400 shadow-[0_1px_2px_-1px_rgba(0,0,0,0.05)] disabled:opacity-60 disabled:hover:bg-slate-50/50";

export const SELECT_TRIGGER_CLS = cn(
  INPUT_CLS,
  "px-3.5 [&>span]:!flex [&>span]:!items-center [&>span]:!gap-2 [&>span]:!truncate [&>span_*]:!truncate data-[state=open]:border-purple-500 data-[state=open]:ring-4 data-[state=open]:ring-purple-500/10 data-[state=open]:bg-white",
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
export interface ComboItemEntry {
  id: string;
  productVariantId: string;
  quantity: number;
  label: string;
  productName: string;
  sku: string;
  color?: string;
  size?: string;
  salePrice: number;
  basePrice: number;
}

// ─────────────────────────────────────────────────────────
// FORM STATE & REDUCER
// ─────────────────────────────────────────────────────────
export interface ComboFormState {
  name: string;
  slug: string;
  ageGroup: string;
  color: string;
  size: string;
  basePrice: string;
  salePrice: string;
  description: string;
  imageUrl: string;
  imagePublicId: string;
  comboParentId: string;
  status: string;
  items: ComboItemEntry[];
}

export type FormAction =
  | {
    type: "SET_FIELD";
    field: keyof Omit<ComboFormState, "items">;
    payload: string;
  }
  | { type: "SET_ITEMS"; payload: ComboItemEntry[] }
  | { type: "RESET"; payload: ComboFormState };

let _id = 0;
export const nextItemId = () => `item-${++_id}-${Date.now()}`;

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

export function getInitialState(
  combo?: import("../../types").Combo | null,
): ComboFormState {
  if (combo) {
    const images = combo.images ?? [];
    const imageUrl = combo.imageUrl ?? images[0] ?? "";

    return {
      name: combo.name ?? "",
      slug: combo.slug ?? "",
      ageGroup: combo.ageGroup ? String(combo.ageGroup) : "",
      color: combo.color ?? "",
      size: combo.size ?? "",
      basePrice: String(combo.basePrice ?? ""),
      salePrice: String(combo.salePrice ?? combo.baseSalePrice ?? ""),
      description: combo.description ?? "",
      imageUrl: imageUrl,
      imagePublicId: "", // Currently not available in Combo type, keep empty or map if added
      comboParentId: combo.comboParentId ?? "",
      status: combo.status ?? "Published",
      items:
        combo.items?.map((item, idx) => ({
          id: `existing-${idx}`,
          productVariantId: item.variantId || item.productId,
          quantity: item.quantity,
          label: `${item.productName}${item.variantLabel ? ` — ${item.variantLabel}` : ""}`,
          productName: item.productName,
          sku: item.variantId || "",
          color: undefined,
          size: undefined,
          salePrice: 0,
          basePrice: 0,
        })) ?? [],
    };
  }
  return {
    name: "",
    slug: "",
    ageGroup: "",
    color: "",
    size: "",
    basePrice: "",
    salePrice: "",
    description: "",
    imageUrl: "",
    imagePublicId: "",
    comboParentId: "",
    status: "Published",
    items: [],
  };
}

export function formReducer(
  state: ComboFormState,
  action: FormAction,
): ComboFormState {
  switch (action.type) {
    case "SET_FIELD":
      return state[action.field] === action.payload
        ? state
        : { ...state, [action.field]: action.payload };
    case "SET_ITEMS":
      return { ...state, items: action.payload };
    case "RESET":
      return action.payload;
    default:
      return state;
  }
}

// ─────────────────────────────────────────────────────────
// COMPONENT RE-EXPORTS
// ─────────────────────────────────────────────────────────
export { default as ComboDialog } from "./ComboDialog";
export { default as ComboFormFields } from "./ComboFormFields";
export { default as ComboItemsPanel } from "./ComboItemsPanel";
export { default as VirtualVariantSelect } from "./VirtualVariantSelect";
export { default as ComboModeSelector } from "./ComboModeSelector";
export { default as ComboDialogHeader } from "./ComboDialogHeader";
export { default as ComboDialogFooter } from "./ComboDialogFooter";
export { useComboForm } from "./useComboForm";

