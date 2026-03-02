// src/hooks/queries/useProduct.ts
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { productService } from "@/api";
import type {
  CreateProductRequest,
  UpdateProductRequest,
  AdminProductParams,
} from "@/api";

// ========================
// Query Keys
// ========================
export const productKeys = {
  all: ["products"] as const,
  admin: (params: AdminProductParams) => ["products", "admin", params] as const,
  detail: (id: string) => ["products", id] as const,
};

// ========================
// Queries
// ========================

/** Fetch admin paginated products list */
export const useAdminProducts = (params: AdminProductParams = {}) => {
  return useQuery({
    queryKey: productKeys.admin(params),
    queryFn: () => productService.getAllAdmin(params),
    placeholderData: keepPreviousData,
  });
};

/** Fetch all products (non-paginated) */
export const useProducts = () => {
  return useQuery({
    queryKey: productKeys.all,
    queryFn: productService.getAll,
  });
};

/** Lấy chi tiết 1 product theo ID */
export const useProductDetail = (id: string) => {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productService.getById(id),
    enabled: !!id,
  });
};

// ========================
// Mutations
// ========================

/** Tạo mới product */
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductRequest) => productService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
};

/** Cập nhật product */
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductRequest }) =>
      productService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
};

/** Xóa product */
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
};
