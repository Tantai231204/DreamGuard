// src/hooks/queries/useProduct.ts
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { productService, variantService } from "@/api";
import {
  inventoryService,
  type AddStockRequest,
  type ReduceStockRequest,
} from "@/api/services/inventoryService";
import type {
  CreateProductRequest,
  UpdateProductRequest,
  AdminProductParams,
  CreateVariantRequest,
  UpdateVariantRequest,
} from "@/api";

// ========================
// Query Keys
// ========================
export const productKeys = {
  all: ["products"] as const,
  admin: (params: AdminProductParams) => ["products", "admin", params] as const,
  detail: (id: string) => ["products", id] as const,
};

export const variantKeys = {
  all: ["variants"] as const,
  byProduct: (productId: string) => ["variants", "product", productId] as const,
  adminByProduct: (productId: string) =>
    ["variants", "admin", productId] as const,
  detail: (id: string) => ["variants", id] as const,
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
export const useProductDetail = (id: string, enabled = true) => {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productService.getById(id),
    enabled: !!id && enabled,
  });
};

/** Fetch variants by product ID */
export const useProductVariants = (productId: string, enabled = true) => {
  return useQuery({
    queryKey: variantKeys.byProduct(productId),
    queryFn: () => variantService.getByProductId(productId),
    enabled: !!productId && enabled,
  });
};

/** Fetch admin variants grouped by color */
export const useAdminProductVariants = (productId: string, enabled = true) => {
  return useQuery({
    queryKey: variantKeys.adminByProduct(productId),
    queryFn: () => variantService.getAdminByProductId(productId),
    enabled: !!productId && enabled,
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

/** Upload images for product */
export const useUploadProductImages = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, files }: { productId: string; files: File[] }) =>
      productService.uploadImage(productId, files),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.productId) });
    },
  });
};

// ========================
// Variant Mutations
// ========================

/** Create variant */
export const useCreateVariant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateVariantRequest) => variantService.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      queryClient.invalidateQueries({
        queryKey: variantKeys.byProduct(variables.productId),
      });
      queryClient.invalidateQueries({
        queryKey: variantKeys.adminByProduct(variables.productId),
      });
    },
  });
};

/** Update variant */
export const useUpdateVariant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateVariantRequest }) =>
      variantService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      queryClient.invalidateQueries({ queryKey: variantKeys.all });
    },
  });
};

/** Delete variant */
export const useDeleteVariant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => variantService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      queryClient.invalidateQueries({ queryKey: variantKeys.all });
    },
  });
};

// ========================
// Inventory Mutations
// ========================

/** Add stock to a variant */
export const useAddStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddStockRequest) => inventoryService.addStock(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      queryClient.invalidateQueries({ queryKey: variantKeys.all });
    },
  });
};

/** Reduce stock from a variant */
export const useReduceStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ReduceStockRequest) =>
      inventoryService.reduceStock(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      queryClient.invalidateQueries({ queryKey: variantKeys.all });
    },
  });
};

// ========================
// Product Image Mutations
// ========================

/** Upload ảnh sản phẩm */
export const useUploadProductImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, files }: { productId: string; files: File[] }) =>
      productService.uploadImage(productId, files),
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({ queryKey: productKeys.detail(productId) });
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
};

/** Xóa ảnh sản phẩm */
export const useDeleteProductImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (assetId: string) => productService.deleteImage(assetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
};
