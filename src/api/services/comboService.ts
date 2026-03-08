// src/api/services/comboService.ts
import apiClient, { type CustomAxiosRequestConfig } from '../../lib/api';

// ── API Types ────────────────────────────────────────────

export interface ComboItemRequest {
  productVariantId: string;
  quantity: number;
}

export interface CreateComboRequest {
  name: string;
  slug: string;
  ageGroup: number;
  color: string;
  size: string;
  basePrice: number;
  salePrice: number;
  description: string;
  imageUrl: string;
  imagePublicId: string;
  comboParentId?: string;
  status: string;
  items: ComboItemRequest[];
}

export type UpdateComboRequest = Partial<CreateComboRequest>;

export interface ComboItemResponse {
  productId: string;
  productName: string;
  variantId?: string;
  variantLabel?: string;
  quantity: number;
}

export interface ProductItemResponse {
  productVariantId: string;
  sku: string;
  productName: string;
  basePrice: number;
  salePrice: number;
  quantity: number;
}

export interface ComboResponse {
  id: string;
  name: string;
  slug: string;
  ageGroup: number | null;
  color: string;
  size: string;
  basePrice: number;
  salePrice: number;
  description: string;
  imageUrl: string;
  imagePublicId: string;
  comboParentId?: string | null;
  discount: number;
  totalStock: number;
  status: string;
  featured: boolean;
  images: string[] | null;
  category: string;
  sales: number;
  sku: string;
  items: ComboItemResponse[];
  productItems?: ProductItemResponse[] | null;
  averageRating?: number;
  createdAt: string;
  updatedAt: string;
  childCombos?: ComboResponse[] | null;
}

/** Check if a combo is a parent (no comboParentId, typically no items) */
export function isComboParent(c: ComboResponse): boolean {
  return !c.comboParentId;
}

export interface ComboPageResponse {
  items: ComboResponse[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface ComboParams {
  pageNumber?: number;
  pageSize?: number;
  name?: string;
  status?: string;
}

// ── Service ──────────────────────────────────────────────

const comboService = {
  /** Get paginated combos for admin */
  getAll: (params: ComboParams = {}): Promise<ComboPageResponse> =>
    apiClient
      .get<ComboPageResponse>('/combo/admin', { params, _suppressToast: true } as CustomAxiosRequestConfig)
      .then((res) => res.data)
      .catch((err) => {
        if (err?.status === 404) {
          return { items: [], pageNumber: 1, pageSize: 10, totalPages: 0, totalCount: 0, hasPreviousPage: false, hasNextPage: false };
        }
        return Promise.reject(err);
      }),

  /** Get all combos (uses admin endpoint with large pageSize) */
  getAllList: (): Promise<ComboResponse[]> =>
    apiClient
      .get<ComboPageResponse>('/combo/admin', {
        params: { pageNumber: 1, pageSize: 1000 },
        _suppressToast: true
      } as CustomAxiosRequestConfig)
      .then((res) => res.data.items || [])
      .catch((err) => (err?.status === 404 ? [] : Promise.reject(err))),

  /** Get combo detail by ID */
  getById: (id: string): Promise<ComboResponse> =>
    apiClient.get(`/combo/${id}`).then((res) => res.data),

  /** Create new combo */
  create: async (data: CreateComboRequest): Promise<ComboResponse> => {
    const res = await apiClient.post('/combo', data);

    // Try to get ID from Location header
    const location = res.headers?.location || res.headers?.Location;
    if (location) {
      const id = location.split('/').pop();
      if (id) return apiClient.get(`/combo/${id}`).then((r) => r.data);
    }

    return res.data;
  },

  /** Update combo */
  update: (id: string, data: UpdateComboRequest): Promise<ComboResponse> =>
    apiClient.put(`/combo/${id}`, data).then((res) => res.data),

  /** Update combo line items (products inside combo) */
  updateItems: (id: string, data: { items: ComboItemRequest[] }): Promise<void> =>
    apiClient.put(`/combo/${id}/products`, data).then((res) => res.data),

  /** Delete combo */
  delete: (id: string): Promise<void> =>
    apiClient.delete(`/combo/${id}`).then((res) => res.data),

  /** Upload images for combo */
  uploadImage: (comboId: string, files: File[]): Promise<{ message: string; urls: string[] }> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('File', file);
    });

    console.log('[comboService.uploadImage] comboId:', comboId, 'files:', files.length);

    return apiClient
      .post(`/asset/combo/upload/${comboId}`, formData, {
        headers: { 'Content-Type': null },
      })
      .then((res) => res.data);
  },

  /** Delete combo image by assetId */
  deleteImage: (assetId: string): Promise<void> =>
    apiClient.delete(`/asset/combo/${assetId}`).then((res) => res.data),
};

export default comboService;
