// src/api/services/productService.ts
import apiClient, { type CustomAxiosRequestConfig } from '../../lib/api';
import type {
  ProductResponse,
  CreateProductRequest,
  UpdateProductRequest,
  AdminProductPageResponse,
  AdminProductParams,
  ProductParams,
  UpdateProductStatusParams,
  FullyCustomizedProductResponse,
  CreateFullyCustomizedProductRequest,
} from '../types';

const productService = {
  /** Get paginated products for admin */
  getAllAdmin: (params: AdminProductParams = {}): Promise<AdminProductPageResponse> =>
    apiClient
      .get<AdminProductPageResponse>('/product/admin', { params, _suppressToast: true } as CustomAxiosRequestConfig)
      .then((res) => res.data)
      .catch((err) => {
        if (err?.status === 404) {
          return { items: [], pageNumber: 1, pageSize: 10, totalPages: 0, totalCount: 0, hasPreviousPage: false, hasNextPage: false };
        }
        return Promise.reject(err);
      }),

  /** Get all products (non-paginated, empty array on 404) */
  getAll: (): Promise<ProductResponse[]> =>
    apiClient
      .get<ProductResponse[]>('/product', { _suppressToast: true } as CustomAxiosRequestConfig)
      .then((res) => res.data)
      .catch((err) => (err?.status === 404 ? [] : Promise.reject(err))),

  /** Get products by filter (public, for /products page) */
  getByFilter: (params: ProductParams = {}): Promise<ProductResponse[]> =>
    apiClient
      .get('/product', { params, _suppressToast: true } as CustomAxiosRequestConfig)
      .then((res) => {
        // The API might wrap the response: { data: { items: [...] } } or { items: [...] } or directly [...]
        const raw = res.data?.data ?? res.data;
        if (Array.isArray(raw)) return raw;
        if (raw?.items && Array.isArray(raw.items)) return raw.items;
        return [];
      })
      .catch((err) => (err?.status === 404 ? [] : Promise.reject(err))),

  /** Get eligible trade-in products by filter */
  getAllProductToTradeIn: (params: ProductParams = {}): Promise<ProductResponse[]> =>
    apiClient
      .get('/product/GetAllProductToTradeIn', { params, _suppressToast: true } as CustomAxiosRequestConfig)
      .then((res) => {
        const raw = res.data?.data ?? res.data;
        if (Array.isArray(raw)) return raw;
        if (raw?.items && Array.isArray(raw.items)) return raw.items;
        return [];
      })
      .catch((err) => (err?.status === 404 ? [] : Promise.reject(err))),

  /** Get product detail by ID */
  getById: (id: string): Promise<ProductResponse> =>
    apiClient.get(`/product/${id}`).then((res) => res.data),

  /** Get product detail by Slug - merges missing trade-in fields from ID-based fetch for stability */
  getBySlug: async (slug: string): Promise<ProductResponse> => {
    const res = await apiClient.get<ProductResponse>(`/product/slug/${slug}`);
    const product = res.data;

    if (product?.id) {
      try {
        const fullDetails = await apiClient.get<ProductResponse>(`/product/${product.id}`).then((r) => r.data);
        return {
          ...product,
          cateId: product.cateId || fullDetails.cateId,
          categoryName: product.categoryName || fullDetails.categoryName,
          isTradeInEligible: product.isTradeInEligible ?? fullDetails.isTradeInEligible,
          minTradeInPrice: product.minTradeInPrice ?? fullDetails.minTradeInPrice,
          depositAmount: product.depositAmount ?? fullDetails.depositAmount,
          variants: product.variants || fullDetails.variants,
        };
      } catch (err) {
        console.warn("[productService.getBySlug] Failed to fetch secondary details by ID:", err);
        return product;
      }
    }
    return product;
  },

  /** Create new product - returns ID from Location header or refetches by name */
  create: async (data: CreateProductRequest): Promise<ProductResponse> => {
    const res = await apiClient.post('/product', data);
    console.log('[productService.create] status:', res.status, 'headers:', JSON.stringify(res.headers), 'data:', JSON.stringify(res.data));

    // Try to get ID from Location header (e.g. /api/product/{id})
    const location = res.headers?.location || res.headers?.Location;
    if (location) {
      const id = location.split('/').pop();
      if (id) return apiClient.get(`/product/${id}`).then((r) => r.data);
    }

    // Fallback: fetch by slug
    const bySlug = await apiClient
      .get<AdminProductPageResponse>('/product/admin', {
        params: { name: data.name, pageSize: 1, pageNumber: 1 },
        _suppressToast: true,
      } as CustomAxiosRequestConfig)
      .then((r) => r.data.items?.[0]);

    if (bySlug) return bySlug;

    // Last resort: return stub with slug so upload can use it
    return res.data;
  },

  /** Update product */
  update: (data: UpdateProductRequest): Promise<ProductResponse> =>
    apiClient.put('/product', data).then((res) => res.data),

  /** Update product status */
  updateStatus: ({ productId, status }: UpdateProductStatusParams): Promise<void> =>
    apiClient.put('/product', { id: productId, status }).then((res) => res.data),

  /** Delete product */
  delete: (id: string): Promise<void> =>
    apiClient.delete(`/product/${id}`).then((res) => res.data),

  /** Upload images for product */
  uploadImage: (productId: string, files: File[]): Promise<{ message: string; urls: string[] }> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('File', file);
    });

    console.log('[productService.uploadImage] productId:', productId, 'files:', files.length);

    return apiClient
      .post(`/asset/product/upload/${productId}`, formData, {
        headers: { 'Content-Type': null },
      })
      .then((res) => res.data);
  },

  /** Delete product image by assetId */
  deleteImage: (assetId: string): Promise<void> =>
    apiClient.delete(`/asset/product/${assetId}`).then((res) => res.data),

  /** Get all fully customized products */
  getAllFullyCustomize: (): Promise<FullyCustomizedProductResponse[]> =>
    apiClient.get<FullyCustomizedProductResponse[]>('/product/fully-customized').then(res => res.data),

  /** Create new fully customized product */
  createFullyCustomize: (data: CreateFullyCustomizedProductRequest): Promise<FullyCustomizedProductResponse> =>
    apiClient.post<FullyCustomizedProductResponse>('/product/fully-customize', data).then(res => res.data),

  /** Update fully customized product */
  updateFullyCustomize: (id: string, data: Partial<CreateFullyCustomizedProductRequest>): Promise<FullyCustomizedProductResponse> =>
    apiClient.put<FullyCustomizedProductResponse>(`/product/fully-customize/${id}`, data).then(res => res.data),

  /** Delete fully customized product */
  deleteFullyCustomize: (id: string): Promise<void> =>
    apiClient.delete(`/product/fully-customize/${id}`).then(res => res.data),
};

export default productService;
