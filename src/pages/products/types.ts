export interface Product {
  id: string;
  name: string;
  slug: string;
  summary?: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating: number;
  reviewCount: number;
  image: string;
  category: string;
  material?: string;
  ageRange?: string;
  inStock: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;
  stockQuantity?: number;
  /** Product status: 0='Draft', 1='Published', 2='OutOfStock', 3='Hidden', but API may return string */
  status?: number | string;
}

export interface FilterOptions {
  ages: string[];
  colors: string[];
  sizes: string[];
  priceRange: { min: number | null; max: number | null };
  sortBy: "default" | "price-asc" | "price-desc" | "newest" | "rating";
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}
