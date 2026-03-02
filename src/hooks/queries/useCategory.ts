// src/hooks/queries/useCategory.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoryService } from "@/api";
import type { CreateCategoryRequest, UpdateCategoryRequest } from "@/api";

// ========================
// Query Keys
// ========================
export const categoryKeys = {
  all: ["categories"] as const,
  detail: (id: number) => ["categories", id] as const,
};

// ========================
// Queries
// ========================

/** Lấy toàn bộ danh sách categories */
export const useCategories = () => {
  return useQuery({
    queryKey: categoryKeys.all,
    queryFn: categoryService.getAll,
  });
};

/** Lấy chi tiết 1 category theo ID */
export const useCategoryDetail = (id: number) => {
  return useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: () => categoryService.getById(id),
    enabled: !!id,
  });
};

// ========================
// Mutations
// ========================

/** Tạo mới category */
export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoryRequest) => categoryService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
    },
  });
};

/** Cập nhật category */
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCategoryRequest }) =>
      categoryService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
    },
  });
};

/** Xóa category */
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => categoryService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
    },
  });
};
