/**
 * combo-dialog barrel — shared types, helpers, constants & component re-exports
 */

import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────
// STYLE CONSTANTS
// ─────────────────────────────────────────────────────────
export const INPUT_CLS =
  "h-10 rounded-lg border-gray-200 bg-white hover:border-violet-300 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/15 transition-all text-sm";

export const SELECT_TRIGGER_CLS = cn(
  INPUT_CLS,
  "px-3 [&>span]:!flex [&>span]:!items-center [&>span]:!gap-2",
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
    .replace(/(^-|-$)/g, "");
}

export function getInitialState(
  combo?: import("../../types").Combo | null,
): ComboFormState {
  if (combo) {
    return {
      name: combo.name ?? "",
      slug: combo.sku ?? "",
      ageGroup: "",
      color: "",
      size: "",
      basePrice: String(combo.basePrice ?? ""),
      salePrice: String(combo.baseSalePrice ?? ""),
      description: combo.description ?? "",
      imageUrl: combo.images?.[0] ?? "",
      imagePublicId: "",
      comboParentId: "",
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
