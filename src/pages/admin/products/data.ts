import type { Product, ProductVariant, Combo } from './types';

// ── Mock Variants ────────────────────────────────────────
const variantsForProduct1: ProductVariant[] = [
  { id: 'v1-1', sku: 'BD-SET-001-S', basePrice: 599000, salePrice: 499000, weight: 0.5, attributes: { color: 'White', colorHex: '#FFFFFF' }, size: 'S (0-6M)', status: 'Active', createdAt: '2026-01-15T10:00:00Z', isNew: false, productId: 'a1b2c3d4-0001-0000-0000-000000000001' },
  { id: 'v1-2', sku: 'BD-SET-001-M', basePrice: 629000, salePrice: 529000, weight: 0.6, attributes: { color: 'White', colorHex: '#FFFFFF' }, size: 'M (6-12M)', status: 'Active', createdAt: '2026-01-15T10:00:00Z', isNew: false, productId: 'a1b2c3d4-0001-0000-0000-000000000001' },
  { id: 'v1-3', sku: 'BD-SET-001-PK', basePrice: 599000, salePrice: 499000, weight: 0.5, attributes: { color: 'Pink', colorHex: '#F9A8D4' }, size: 'S (0-6M)', status: 'Active', createdAt: '2026-01-15T10:00:00Z', isNew: true, productId: 'a1b2c3d4-0001-0000-0000-000000000001' },
];

const variantsForProduct2: ProductVariant[] = [
  { id: 'v2-1', sku: 'UC-PIL-002-NB', basePrice: 299000, salePrice: 299000, weight: 0.3, attributes: { color: 'White', colorHex: '#FFFFFF' }, size: 'Newborn', status: 'Inactive', createdAt: '2026-01-20T09:00:00Z', isNew: false, productId: 'a1b2c3d4-0002-0000-0000-000000000002' },
  { id: 'v2-2', sku: 'UC-PIL-002-PK', basePrice: 299000, salePrice: 279000, weight: 0.3, attributes: { color: 'Pink', colorHex: '#F9A8D4' }, size: 'Newborn', status: 'Active', createdAt: '2026-01-20T09:00:00Z', isNew: true, productId: 'a1b2c3d4-0002-0000-0000-000000000002' },
];

const variantsForProduct3: ProductVariant[] = [
  { id: 'v3-1', sku: 'CF-BLK-003-S', basePrice: 450000, salePrice: 380000, weight: 0.8, attributes: { color: 'Grey', colorHex: '#D1D5DB' }, size: 'S (0-6M)', status: 'Active', createdAt: '2026-01-10T11:00:00Z', isNew: false, productId: 'a1b2c3d4-0003-0000-0000-000000000003' },
  { id: 'v3-2', sku: 'CF-BLK-003-M', basePrice: 480000, salePrice: 400000, weight: 0.9, attributes: { color: 'Grey', colorHex: '#D1D5DB' }, size: 'M (6-12M)', status: 'Active', createdAt: '2026-01-10T11:00:00Z', isNew: false, productId: 'a1b2c3d4-0003-0000-0000-000000000003' },
  { id: 'v3-3', sku: 'CF-BLK-003-L', basePrice: 520000, salePrice: 430000, weight: 1.0, attributes: { color: 'Mint', colorHex: '#A7F3D0' }, size: 'L (1-2Y)', status: 'Active', createdAt: '2026-01-10T11:00:00Z', isNew: true, productId: 'a1b2c3d4-0003-0000-0000-000000000003' },
];

const variantsForProduct4: ProductVariant[] = [
  { id: 'v4-1', sku: 'SP-SHT-004-S', basePrice: 320000, salePrice: 320000, weight: 0.4, attributes: { color: 'Blue', colorHex: '#93C5FD' }, size: 'S (0-6M)', status: 'Active', createdAt: '2026-01-25T13:00:00Z', isNew: false, productId: 'a1b2c3d4-0004-0000-0000-000000000004' },
  { id: 'v4-2', sku: 'SP-SHT-004-M', basePrice: 350000, salePrice: 350000, weight: 0.5, attributes: { color: 'Blue', colorHex: '#93C5FD' }, size: 'M (6-12M)', status: 'Active', createdAt: '2026-01-25T13:00:00Z', isNew: true, productId: 'a1b2c3d4-0004-0000-0000-000000000004' },
];

const variantsForProduct5: ProductVariant[] = [
  { id: 'v5-1', sku: 'PR-MAT-005-M', basePrice: 1200000, salePrice: 1200000, weight: 3.0, attributes: { color: 'White', colorHex: '#FFFFFF' }, size: 'M (6-12M)', status: 'Active', createdAt: '2026-01-05T08:00:00Z', isNew: false, productId: 'a1b2c3d4-0005-0000-0000-000000000005' },
  { id: 'v5-2', sku: 'PR-MAT-005-L', basePrice: 1350000, salePrice: 1350000, weight: 3.5, attributes: { color: 'White', colorHex: '#FFFFFF' }, size: 'L (1-2Y)', status: 'Active', createdAt: '2026-01-05T08:00:00Z', isNew: false, productId: 'a1b2c3d4-0005-0000-0000-000000000005' },
  { id: 'v5-3', sku: 'PR-MAT-005-XL', basePrice: 1500000, salePrice: 1400000, weight: 4.0, attributes: { color: 'Grey', colorHex: '#D1D5DB' }, size: 'XL (2Y+)', status: 'Active', createdAt: '2026-01-05T08:00:00Z', isNew: true, productId: 'a1b2c3d4-0005-0000-0000-000000000005' },
];

// ── Mock Products ────────────────────────────────────────
export const mockProducts: Product[] = [
  {
    id: 'a1b2c3d4-0001-0000-0000-000000000001',
    name: 'Bộ chăn ga gối Baby Dream',
    slug: 'bo-chan-ga-goi-baby-dream',
    summary: 'Bộ chăn ga gối cao cấp cho bé từ 0-3 tuổi, chất liệu cotton 100%',
    description: 'Bộ chăn ga gối Baby Dream được làm từ cotton 100% cao cấp, mềm mại và an toàn cho làn da nhạy cảm của bé.',
    material: 'Cotton',
    ageGroup: 0,
    warrantyPolicyDay: 30,
    returnPolicyDay: 7,
    status: 'Active',
    createdAt: '2026-01-15T10:00:00Z',
    averageRating: 4.8,
    cateId: 1,
    categoryName: 'Bedding Sets',
    variants: variantsForProduct1,
  },
  {
    id: 'a1b2c3d4-0002-0000-0000-000000000002',
    name: 'Gối ôm thú bông Unicorn',
    slug: 'goi-om-thu-bong-unicorn',
    summary: 'Gối ôm hình unicorn siêu dễ thương, an toàn cho trẻ em',
    description: 'Gối ôm thú bông hình unicorn với chất liệu cao cấp, không gây dị ứng.',
    material: 'Silk',
    ageGroup: 1,
    warrantyPolicyDay: 15,
    returnPolicyDay: 7,
    status: 'Inactive',
    createdAt: '2026-01-20T09:00:00Z',
    averageRating: 4.5,
    cateId: 2,
    categoryName: 'Pillows',
    variants: variantsForProduct2,
  },
  {
    id: 'a1b2c3d4-0003-0000-0000-000000000003',
    name: 'Chăn mền 4 mùa Comfort',
    slug: 'chan-men-4-mua-comfort',
    summary: 'Chăn mền 4 mùa ấm áp, thấm hút tốt',
    description: 'Chăn mền 4 mùa Comfort có khả năng giữ ấm tốt vào mùa đông và thoáng mát vào mùa hè.',
    material: 'Fleece',
    ageGroup: 0,
    warrantyPolicyDay: 30,
    returnPolicyDay: 14,
    status: 'Active',
    createdAt: '2026-01-10T11:00:00Z',
    averageRating: 4.7,
    cateId: 3,
    categoryName: 'Blankets',
    variants: variantsForProduct3,
  },
  {
    id: 'a1b2c3d4-0004-0000-0000-000000000004',
    name: 'Ga giường họa tiết vũ trụ',
    slug: 'ga-giuong-hoa-tiet-vu-tru',
    summary: 'Ga giường cotton với họa tiết vũ trụ độc đáo',
    description: 'Ga giường với họa tiết vũ trụ dành cho bé yêu thích khám phá không gian.',
    material: 'Organic Cotton',
    ageGroup: 2,
    warrantyPolicyDay: 30,
    returnPolicyDay: 7,
    status: 'Active',
    createdAt: '2026-01-25T13:00:00Z',
    averageRating: 4.3,
    cateId: 1,
    categoryName: 'Bedding Sets',
    variants: variantsForProduct4,
  },
  {
    id: 'a1b2c3d4-0005-0000-0000-000000000005',
    name: 'Nệm cao su non Premium',
    slug: 'nem-cao-su-non-premium',
    summary: 'Nệm cao su non chống ẩm mốc, an toàn cho bé',
    description: 'Nệm cao su non Premium với công nghệ chống ẩm mốc, đàn hồi tốt, hỗ trợ giấc ngủ sâu.',
    material: 'Natural Latex',
    ageGroup: null,
    warrantyPolicyDay: 365,
    returnPolicyDay: 30,
    status: 'Draft',
    createdAt: '2026-01-05T08:00:00Z',
    averageRating: 4.9,
    cateId: 4,
    categoryName: 'Mattresses',
    variants: variantsForProduct5,
  },
];

// ── Mock Combos (kept) ───────────────────────────────────
export const mockCombos: Combo[] = [
  {
    id: 'CMB001',
    name: 'Combo Sweet Dreams',
    sku: 'SD-CMB-001',
    type: 'combo',
    category: 'Combo',
    basePrice: 1500000,
    baseSalePrice: 1200000,
    totalStock: 15,
    status: 'Active',
    images: ['https://i.pinimg.com/736x/7c/aa/33/7caa33bf8eca070ee8a1dd20f86723ec.jpg'],
    description: 'Bộ combo hoàn hảo cho phòng ngủ bé yêu',
    featured: true,
    createdAt: '2026-01-12T10:00:00Z',
    updatedAt: '2026-02-05T15:00:00Z',
    sales: 67,
    items: [
      { productId: 'PRD001', productName: 'Bộ chăn ga gối Baby Dream', variantId: 'V001-1', variantLabel: 'White / S', quantity: 1 },
      { productId: 'PRD002', productName: 'Gối ôm thú bông Unicorn', variantId: 'V002-1', variantLabel: 'White / Newborn', quantity: 1 },
      { productId: 'PRD003', productName: 'Chăn mền 4 mùa Comfort', variantId: 'V003-1', variantLabel: 'Grey / S', quantity: 1 },
    ],
    discount: 20,
  },
  {
    id: 'CMB002',
    name: 'Combo Starter Kit',
    sku: 'SK-CMB-002',
    type: 'combo',
    category: 'Combo',
    basePrice: 900000,
    baseSalePrice: 750000,
    totalStock: 28,
    status: 'Active',
    images: ['https://i.pinimg.com/736x/a0/6f/59/a06f596cd15e4a3b0b4c3e5e2d9a7e8f.jpg'],
    description: 'Bộ combo cơ bản cho bé sơ sinh',
    featured: false,
    createdAt: '2026-01-18T11:00:00Z',
    updatedAt: '2026-02-02T09:00:00Z',
    sales: 92,
    items: [
      { productId: 'PRD001', productName: 'Bộ chăn ga gối Baby Dream', variantId: 'V001-3', variantLabel: 'Pink / S', quantity: 1 },
      { productId: 'PRD004', productName: 'Ga giường họa tiết vũ trụ', variantId: 'V004-1', variantLabel: 'Blue / S', quantity: 2 },
    ],
    discount: 16,
  },
];

export const categories = [
  { id: 1, name: 'Bedding Sets' },
  { id: 2, name: 'Pillows' },
  { id: 3, name: 'Blankets' },
  { id: 4, name: 'Mattresses' },
];
