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
import { certificateKeys } from "./useCertificate";
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
  AssignVariantCustomizeTypeRequest,
  UpdateVariantCustomizeTypePriceRequest,
  VariantCustomizeTypeResponse,
  CreateVariantWithCustomizeRequest,
  ProductResponse,
  CreateFullyCustomizedProductRequest,
} from "@/api";
import { useAuthStore } from "@/store/authStore";
import { isAdminOrManager } from "@/lib/role";
import type { ProductStatus } from "@/pages/admin/products/types";

// ========================
// Query Keys
// ========================
export const productKeys = {
  all: ["products"] as const,
  admin: (params: AdminProductParams) => ["products", "admin", params] as const,
  byFilter: (params: ProductParams) => ["products", "filter", params] as const,
  fullyCustomized: () => ["products", "fully-customized"] as const,
  detail: (slug: string) => ["products", slug] as const,
};

export const variantKeys = {
  all: ["variants"] as const,
  byProduct: (productId: string) => ["variants", "product", productId] as const,
  adminByProduct: (productId: string) =>
    ["variants", "admin", productId] as const,
  detail: (id: string) => ["variants", id] as const,
  customizeTypes: (id: string) => ["variants", id, "customize-types"] as const,
};

// ========================
// Queries
// ========================

export const useAdminProducts = (params: AdminProductParams = {}) => {
  const role = useAuthStore((s) => s.role);

  return useQuery({
    queryKey: productKeys.admin(params),
    queryFn: async () => {
      const response = await productService.getAllAdmin(params);
      if (!response.items || response.items.length === 0) return response;

      // 🔥 Senior Optimization: Fetch full details for each product in the current page 
      // in parallel to retrieve missing images/assets that the admin list API lacks.
      const enrichedItems = await Promise.all(
        response.items.map(async (item) => {
          try {
            // Fetch by ID is usually faster than Slug for primary lookups
            const fullDetail = await productService.getById(item.id);
            return {
              ...item,
              ...fullDetail,
              // Prioritize detail images over list data (which might be empty)
              imageUrls: fullDetail.imageUrls || item.imageUrls,
              assets: fullDetail.assets || item.assets,
            };
          } catch (err) {
            console.warn(`[useAdminProducts] Failed to enrich item ${item.id}:`, err);
            return item;
          }
        })
      );

      return {
        ...response,
        items: enrichedItems,
      };
    },
    placeholderData: keepPreviousData,
    enabled: isAdminOrManager(role),
    staleTime: 2 * 60 * 1000, // 2 min stale time to avoid excessive detail fetching
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

/** Fetch ALL products to trade in (eligible products in category) */
export const useAllProductToTradeIn = (params: ProductParams, enabled = true) => {
  return useQuery({
    queryKey: ['products', 'trade-in', params],
    queryFn: () => productService.getAllProductToTradeIn(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: enabled && !!params.cateId,
  });
};

/** Fetch all fully customized products (for 3D Studio) */
export const useFullyCustomizedProducts = () => {
  return useQuery({
    queryKey: productKeys.fullyCustomized(),
    queryFn: () => productService.getAllFullyCustomize(),
  });
};

/** 
 * Complex Hook: Fetch product templates by:
 * 1. GET /product/fully-customized
 * 2. GET /product/{id} for each
 * 3. GET /product/admin/variants/{id} for each
 * Then map them to a unified Product type for the admin table.
 */
export const useAdminProductTemplates = () => {
  const role = useAuthStore((s) => s.role);

  return useQuery({
    queryKey: ["products", "admin", "templates"],
    queryFn: async () => {
      // 1. Get base customized products
      const bases = await productService.getAllFullyCustomize();
      if (!bases || bases.length === 0) return [];

      // 2. Fetch full details and variants for each in parallel
      const fullProducts = await Promise.all(
        bases.map(async (base) => {
          try {
            const [detail, variantData] = await Promise.all([
              productService.getById(base.id),
              variantService.getAdminByProductId(base.id)
            ]);

            // Flatten variants from colorGroups for the Product object
            const flattenedVariants = variantData.colorGroups.flatMap(group =>
              group.variants.map(v => ({
                ...v,
                isNew: v.isNew ?? false,
                isCustomizable: v.isCustomizable ?? v.is_customizable ?? false,
                productId: base.id,
                status: v.status as ProductStatus,
              }))
            );

            // Map to the Product type expected by the UI
            return {
              ...detail,
              fullyCustomizedProductType: base.fullyCustomizedProductType || detail.fullyCustomizedProductType,
              variants: flattenedVariants,
              variantCount: flattenedVariants.length,
            } as ProductResponse;
          } catch (err) {
            console.error(`Failed to fetch details for template ${base.id}:`, err);
            return {
              ...base,
              description: base.description || '',
              material: base.material || '',
              status: base.status || 'Draft',
              createdAt: base.createdAt || new Date().toISOString(),
              averageRating: base.averageRating || 0,
              cateId: null,
              variants: [],
              variantCount: 0
            } as unknown as ProductResponse;
          }
        })
      );

      return fullProducts;
    },
    enabled: isAdminOrManager(role),
    staleTime: 5 * 60 * 1000,
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
    select?: (data: AdminVariantsByProductResponse) => T;
    staleTime?: number;
    gcTime?: number;
  }
) => {
  const role = useAuthStore((s) => s.role);

  return useQuery({
    queryKey: variantKeys.adminByProduct(productId),
    queryFn: () => variantService.getAdminByProductId(productId),
    enabled: !!productId && isAdminOrManager(role) && (options?.enabled !== false),
    select: options?.select,
    staleTime: options?.staleTime,
    gcTime: options?.gcTime,
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

/** Fetch customization types linked to a variant */
export const useVariantCustomizeTypes = (variantId: string, enabled = true) => {
  return useQuery({
    queryKey: variantKeys.customizeTypes(variantId),
    queryFn: () => variantService.getCustomizeTypes(variantId),
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

/** Optimized version for table usage with long cache */
export const useStableRichVariants = (productId: string, enabled = true) => {
  return useAdminProductVariants(productId, {
    enabled,
    select: transformAdminVariants,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
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
      queryClient.invalidateQueries({ queryKey: certificateKeys.byProduct(variables.id) });
      queryClient.invalidateQueries({ queryKey: certificateKeys.all });
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
// Fully Customized Product Mutations
// ========================

/** Create fully customized product template */
export const useCreateFullyCustomize = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFullyCustomizedProductRequest) => productService.createFullyCustomize(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
};

/** Update fully customized product template */
export const useUpdateFullyCustomize = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateFullyCustomizedProductRequest> }) =>
      productService.updateFullyCustomize(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
};

/** Delete fully customized product template */
export const useDeleteFullyCustomize = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productService.deleteFullyCustomize(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
};

/** Get AI customization recommendations based on baby profile */
export const useCustomizationRecommendation = () => {
  return useMutation({
    mutationFn: ({ babyId, productId }: { babyId: string; productId: string }) =>
      productService.getCustomizationRecommendation(babyId, productId),
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

/** Create variant with custom options */
export const useCreateVariantWithCustomize = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateVariantWithCustomizeRequest) =>
      variantService.createWithCustomize(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      queryClient.invalidateQueries({ queryKey: variantKeys.byProduct(variables.productId) });
      queryClient.invalidateQueries({ queryKey: variantKeys.adminByProduct(variables.productId) });
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
      queryClient.invalidateQueries({ queryKey: variantKeys.adminByProduct(data.productId) });
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

/* ─── Variant Customization Mutations ─── */

/** Link a customize type to variant */
export const useAssignVariantCustomizeType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ variantId, data }: { variantId: string; data: AssignVariantCustomizeTypeRequest }) =>
      variantService.assignCustomizeType(variantId, data),

    // 🔥 Senior Dev Optimization: Optimistic Update
    onMutate: async ({ variantId }) => {
      await queryClient.cancelQueries({ queryKey: variantKeys.customizeTypes(variantId) });
      const previous = queryClient.getQueryData(variantKeys.customizeTypes(variantId));
      return { previous };
    },
    onSuccess: (_, { variantId }) => {
      queryClient.invalidateQueries({ queryKey: variantKeys.customizeTypes(variantId) });
    },
    onError: (_err, { variantId }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(variantKeys.customizeTypes(variantId), context.previous);
      }
    },
  });
};

/** Update override price for a customize type on a variant */
export const useUpdateVariantCustomizeTypePrice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ variantId, customizeTypeId, data }: {
      variantId: string;
      customizeTypeId: string;
      data: UpdateVariantCustomizeTypePriceRequest
    }) => variantService.updateCustomizeTypePrice(variantId, customizeTypeId, data),

    // 🔥 Senior Dev Optimization: Optimistic Update
    onMutate: async ({ variantId, customizeTypeId, data }) => {
      await queryClient.cancelQueries({ queryKey: variantKeys.customizeTypes(variantId) });
      const previous = queryClient.getQueryData<VariantCustomizeTypeResponse[]>(variantKeys.customizeTypes(variantId));

      if (previous) {
        queryClient.setQueryData(variantKeys.customizeTypes(variantId),
          previous.map(item => item.customizeTypeId === customizeTypeId
            ? { ...item, overridePrice: data.overridePrice, finalPrice: data.overridePrice }
            : item
          )
        );
      }
      return { previous };
    },
    onSuccess: (_, { variantId }) => {
      queryClient.invalidateQueries({ queryKey: variantKeys.customizeTypes(variantId) });
    },
    onError: (_err, { variantId }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(variantKeys.customizeTypes(variantId), context.previous);
      }
    },
  });
};

/** Unlink a customize type from variant */
export const useRemoveVariantCustomizeType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ variantId, customizeTypeId }: { variantId: string; customizeTypeId: string }) =>
      variantService.removeCustomizeType(variantId, customizeTypeId),

    // 🔥 Senior Dev Optimization: Optimistic Update
    onMutate: async ({ variantId, customizeTypeId }) => {
      await queryClient.cancelQueries({ queryKey: variantKeys.customizeTypes(variantId) });
      const previous = queryClient.getQueryData<VariantCustomizeTypeResponse[]>(variantKeys.customizeTypes(variantId));

      if (previous) {
        queryClient.setQueryData(variantKeys.customizeTypes(variantId),
          previous.filter(item => item.customizeTypeId !== customizeTypeId)
        );
      }
      return { previous };
    },
    onSuccess: (_, { variantId }) => {
      queryClient.invalidateQueries({ queryKey: variantKeys.customizeTypes(variantId) });
    },
    onError: (_err, { variantId }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(variantKeys.customizeTypes(variantId), context.previous);
      }
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

/** Add defect stock to a variant */
export const useAddDefectStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddStockRequest) => inventoryService.addDefectStock(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      queryClient.invalidateQueries({ queryKey: variantKeys.all });
    },
  });
};

/** Reduce defect stock from a variant */
export const useReduceDefectStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ReduceStockRequest) =>
      inventoryService.reduceDefectStock(data),
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
  isVariantCustomizable?: boolean;
}

export const useAllVariantOptions = (enabled = true) => {
  return useQuery({
    queryKey: [...variantKeys.all, "all-options"] as const,
    queryFn: async (): Promise<VariantOption[]> => {
      // 1. Fetch product list from admin endpoint (large page)
      const page = await productService.getAllAdmin({
        pageSize: 200,
        pageNumber: 1,
      });
      const products = (page?.items ?? []).filter((p: ProductResponse & { isCustomable?: boolean; isCustomizable?: boolean; is_customizable?: boolean }) => !p.isCustomable && !p.isCustomizable && !p.is_customizable);
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
  const productName = res.productName || fallbackName || "Unknown Product";

  // 🔥 Senior Refactor: Use the centralized robust transformer to detect bespoke/custom flags
  const transformed = transformAdminVariants(res);
  if (!transformed?.colorGroups) return options;

  for (const group of transformed.colorGroups) {
    for (const v of group.variants) {
      // Don't allow customizable/bespoke variants to be added to combos.
      // This single flag guarantees parity with the Variant Data Table logic!
      if (v.isVariantCustomizable) continue;

      // 🔥 Senior Update: Allow adding variants even if they are Draft or OOS. 
      // The publishing guard in useComboForm.ts will prevent the combo itself from being published 
      // if its constituents are not ready. This allows pre-building combos!

      // 🔥 Senior Filtering: Exclude variants with missing/null attributes
      const hasValidColor = group.color && group.color !== 'Unknown';
      const hasValidSize = v.dimensions && v.dimensions !== 'N/A';
      if (!hasValidColor || !hasValidSize) continue;

      const parts = [productName];
      const attrs: string[] = [];
      if (group.color && group.color !== 'Unknown') attrs.push(group.color);
      if (v.dimensions && v.dimensions !== 'N/A') attrs.push(v.dimensions);
      if (attrs.length > 0) parts.push(attrs.join(" / "));
      parts.push(`(${v.sku})`);

      options.push({
        variantId: v.id,
        productId: res.productId,
        productName: productName,
        sku: v.sku,
        color: group.color !== 'Unknown' ? group.color : undefined,
        size: v.dimensions !== 'N/A' ? v.dimensions : undefined,
        basePrice: v.basePrice,
        salePrice: v.salePrice,
        stockQuantity: v.stockQuantity,
        stockStatus: v.stockStatus,
        status: v.status,
        label: parts.join(" — "),
        isVariantCustomizable: v.isVariantCustomizable,
      });
    }
  }
  return options;
}
