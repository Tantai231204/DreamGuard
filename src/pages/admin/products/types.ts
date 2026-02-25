export type ProductStatus = 'active' | 'inactive' | 'out_of_stock';
export type ProductType = 'single' | 'combo';
export type VariantStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export interface ProductVariant {
  id: string;
  sku: string;
  color: string;
  colorHex: string;
  size: string;
  price: number;
  salePrice?: number;
  stock: number;
  status: VariantStatus;
  image?: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  type: ProductType;
  category: string;
  material: string;
  basePrice: number;
  baseSalePrice?: number;
  totalStock: number;
  status: ProductStatus;
  images: string[];
  description: string;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  sales: number;
  variants: ProductVariant[];
}

export interface ComboItem {
  productId: string;
  productName: string;
  variantId?: string;
  variantLabel?: string;
  quantity: number;
}

export interface Combo extends Omit<Product, 'type' | 'variants' | 'material'> {
  type: 'combo';
  items: ComboItem[];
  discount: number;
}

