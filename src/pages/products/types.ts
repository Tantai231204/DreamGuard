export interface Product {
  id: string;
  name: string;
  slug: string;
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
}

export interface FilterOptions {
  materials: string[];
  ages: string[];
  categories: string[];
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
