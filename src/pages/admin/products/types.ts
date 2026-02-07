export type ProductStatus = 'active' | 'inactive' | 'out_of_stock';
export type ProductType = 'single' | 'combo';

export interface Product {
  id: string;
  name: string;
  sku: string;
  type: ProductType;
  category: string;
  price: number;
  salePrice?: number;
  stock: number;
  status: ProductStatus;
  images: string[];
  description: string;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  sales: number;
}

export interface ComboItem {
  productId: string;
  productName: string;
  quantity: number;
}

export interface Combo extends Omit<Product, 'type'> {
  type: 'combo';
  items: ComboItem[];
  discount: number;
}
