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
  ProductParams,
  CreateVariantRequest,
  UpdateVariantRequest,
  UpdateProductStatusParams,
  UpdateVariantStatusParams,
  AdminVariantsByProductResponse,
} from "@/api";

// ========================
// Query Keys
// ========================
export const productKeys = {
  all: ["products"] as const,
  admin: (params: AdminProductParams) => ["products", "admin", params] as const,
  byFilter: (params: ProductParams) => ["products", "filter", params] as const,
  detail: (slug: string) => ["products", slug] as const,
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

/** Lấy chi tiết 1 product theo ID hoặc slug */
export const useProductDetail = (identifier: string, enabled = true) => {
  const isGuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);

  return useQuery({
    queryKey: productKeys.detail(identifier),
    queryFn: () =>
      isGuid
        ? productService.getById(identifier)
        : productService.getBySlug(identifier),
    enabled: !!identifier && enabled,
  });
};

/** Fetch products by filter (cateId, color, maxPrice, maxAgeGroup, key...) – public */
export const useProductsByFilter = (params: ProductParams, enabled = true) => {
  return useQuery({
    queryKey: productKeys.byFilter(params),
    queryFn: () => productService.getByFilter(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
    enabled,
  });
};

/** Fetch variants by product ID */
export const useProductVariants = (productId: string, enabled = true) => {
  const isGuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productId);

  return useQuery({
    queryKey: variantKeys.byProduct(productId),
    queryFn: () => variantService.getByProductId(productId),
    enabled: !!productId && isGuid && enabled,
  });
};

/** Fetch admin variants grouped by color */
export const useAdminProductVariants = <T = AdminVariantsByProductResponse>(
  productId: string, 
  options?: { 
    enabled?: boolean; 
    select?: (data: AdminVariantsByProductResponse) => T 
  }
) => {
  return useQuery({
    queryKey: variantKeys.adminByProduct(productId),
    queryFn: () => variantService.getAdminByProductId(productId),
    enabled: !!productId && (options?.enabled !== false),
    select: options?.select,
  });
};

/** Fetch individual variant detail by ID */
export const useVariantDetail = (variantId: string, enabled = true) => {
  return useQuery({
    queryKey: variantKeys.detail(variantId),
    queryFn: () => variantService.getById(variantId),
    enabled: !!variantId && enabled,
  });
};

/** 
 * Senior-optimized hook: Returns fully transformed and memoized variant data 
 * mapped specifically for UI components.
 */
import { transformAdminVariants } from '@/pages/admin/products/utils/variant-utils';

export const useRichAdminVariants = (productId: string, enabled = true) => {
  return useAdminProductVariants(productId, {
    enabled,
    select: transformAdminVariants,
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
    mutationFn: (data: UpdateProductRequest) => productService.update(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.id) });
    },
  });
};

/** Cập nhật trạng thái product */
export const useUpdateProductStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: UpdateProductStatusParams) =>
      productService.updateStatus(params),
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      queryClient.invalidateQueries({ queryKey: productKeys.detail(productId) });
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
        queryKey: variantKeys.byProduct(variables.productid),
      });
      queryClient.invalidateQueries({
        queryKey: variantKeys.adminByProduct(variables.productid),
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
    onSuccess: (_, { data }) => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      queryClient.invalidateQueries({ queryKey: variantKeys.all });
      queryClient.invalidateQueries({ queryKey: variantKeys.adminByProduct(data.productid) });
    },
  });
};

/** Update variant status */
export const useUpdateVariantStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: UpdateVariantStatusParams) =>
      variantService.updateStatus(params),
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

// ========================
// Combo helpers
// ========================

/** Flattened variant option for combo item picker */
export interface VariantOption {
  variantId: string;
  productId: string;
  productName: string;
  sku: string;
  color?: string;
  size?: string;
  basePrice: number;
  salePrice: number;
  stockQuantity: number;
  stockStatus: string;
  status: string;
  label: string;
}

/**
 * Fetch all products (admin endpoint) then use admin variant endpoint
 * (`GET /variants/admin/product/:id`) per product.
 * Returns a flat VariantOption[] cached by React Query.
 */
export const useAllVariantOptions = (enabled = true) => {
  return useQuery({
    queryKey: [...variantKeys.all, "all-options"] as const,
    queryFn: async (): Promise<VariantOption[]> => {
      // 1. Fetch product list from admin endpoint (large page)
      const page = await productService.getAllAdmin({
        pageSize: 200,
        pageNumber: 1,
      });
      const products = page?.items ?? [];
      if (products.length === 0) return [];

      // 2. Fetch admin variants per product in parallel batches
      const results: VariantOption[] = [];
      const batchSize = 5;

      for (let i = 0; i < products.length; i += batchSize) {
        const batch = products.slice(i, i + batchSize);
        const batchResults = await Promise.allSettled(
          batch.map((p) =>
            variantService
              .getAdminByProductId(p.id)
              .then((res) => flattenAdminVariants(res, p.name)),
          ),
        );
        for (const r of batchResults) {
          if (r.status === "fulfilled") results.push(...r.value);
        }
      }
      return results;
    },
    enabled,
    staleTime: 2 * 60 * 1000, // cache 2 min
  });
};

/** Convert AdminVariantsByProductResponse → flat VariantOption[] */
function flattenAdminVariants(
  res: AdminVariantsByProductResponse,
  fallbackName?: string,
): VariantOption[] {
  const options: VariantOption[] = [];
  // Use API productName if available, otherwise fall back to the product name
  // from the product list (the admin variant endpoint sometimes returns empty name)
  const productName = res.productName || fallbackName || "Unknown Product";

  for (const group of res.colorGroups) {
    for (const v of group.variants) {
      const parts = [productName];
      const attrs: string[] = [];
      if (group.color) attrs.push(group.color);
      if (v.size) attrs.push(v.size);
      if (attrs.length > 0) parts.push(attrs.join(" / "));
      parts.push(`(${v.sku})`);

      options.push({
        variantId: v.id,
        productId: res.productId,
        productName: productName,
        sku: v.sku,
        color: group.color || undefined,
        size: v.size || undefined,
        basePrice: v.basePrice,
        salePrice: v.salePrice,
        stockQuantity: v.stockQuantity,
        stockStatus: v.stockStatus,
        status: v.status,
        label: parts.join(" — "),
      });
    }
  }
  return options;
}
