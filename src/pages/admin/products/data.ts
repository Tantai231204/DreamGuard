import type { Combo } from "./types";

// ── Mock Combos (kept) ───────────────────────────────────
export const mockCombos: Combo[] = [
  {
    id: "CMB001",
    name: "Combo Sweet Dreams",
    sku: "SD-CMB-001",
    type: "combo",
    category: "Combo",
    basePrice: 1500000,
    baseSalePrice: 1200000,
    totalStock: 15,
    status: "Active",
    images: [
      "https://i.pinimg.com/736x/7c/aa/33/7caa33bf8eca070ee8a1dd20f86723ec.jpg",
    ],
    description: "Bộ combo hoàn hảo cho phòng ngủ bé yêu",
    featured: true,
    createdAt: "2026-01-12T10:00:00Z",
    updatedAt: "2026-02-05T15:00:00Z",
    sales: 67,
    items: [
      {
        productId: "PRD001",
        productName: "Bộ chăn ga gối Baby Dream",
        variantId: "V001-1",
        variantLabel: "White / S",
        quantity: 1,
      },
      {
        productId: "PRD002",
        productName: "Gối ôm thú bông Unicorn",
        variantId: "V002-1",
        variantLabel: "White / Newborn",
        quantity: 1,
      },
      {
        productId: "PRD003",
        productName: "Chăn mền 4 mùa Comfort",
        variantId: "V003-1",
        variantLabel: "Grey / S",
        quantity: 1,
      },
    ],
    discount: 20,
  },
  {
    id: "CMB002",
    name: "Combo Starter Kit",
    sku: "SK-CMB-002",
    type: "combo",
    category: "Combo",
    basePrice: 900000,
    baseSalePrice: 750000,
    totalStock: 28,
    status: "Active",
    images: [
      "https://i.pinimg.com/736x/a0/6f/59/a06f596cd15e4a3b0b4c3e5e2d9a7e8f.jpg",
    ],
    description: "Bộ combo cơ bản cho bé sơ sinh",
    featured: false,
    createdAt: "2026-01-18T11:00:00Z",
    updatedAt: "2026-02-02T09:00:00Z",
    sales: 92,
    items: [
      {
        productId: "PRD001",
        productName: "Bộ chăn ga gối Baby Dream",
        variantId: "V001-3",
        variantLabel: "Pink / S",
        quantity: 1,
      },
      {
        productId: "PRD004",
        productName: "Ga giường họa tiết vũ trụ",
        variantId: "V004-1",
        variantLabel: "Blue / S",
        quantity: 2,
      },
    ],
    discount: 16,
  },
];

export const categories = [
  { id: 1, name: "Bedding Sets" },
  { id: 2, name: "Pillows" },
  { id: 3, name: "Blankets" },
  { id: 4, name: "Mattresses" },
];
