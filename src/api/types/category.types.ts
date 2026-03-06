// src/api/types/category.types.ts
// Dựa trên response thực tế từ API: GET /api/category

export interface CategoryResponse {
  cateId: number;
  name: string;
  isActive: boolean;
  slug: string;
  childCategoryList: CategoryResponse[];
}

export interface CreateCategoryRequest {
  name: string;
  slug: string;
  isActive?: boolean;
  cateParentId?: number;
}

export interface UpdateCategoryRequest {
  name?: string;
  slug?: string;
  isActive?: boolean;
}
