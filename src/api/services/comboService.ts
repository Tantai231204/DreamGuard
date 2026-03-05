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
  /** Lấy danh sách combos cho admin (paginated) */
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

  /** Lấy tất cả combos (sử dụng admin endpoint với pageSize lớn) */
  getAllList: (): Promise<ComboResponse[]> =>
    apiClient
      .get<ComboPageResponse>('/combo/admin', {
        params: { pageNumber: 1, pageSize: 1000 },
        _suppressToast: true
      } as CustomAxiosRequestConfig)
      .then((res) => res.data.items || [])
      .catch((err) => (err?.status === 404 ? [] : Promise.reject(err))),

  /** Lấy chi tiết 1 combo theo ID */
  getById: (id: string): Promise<ComboResponse> =>
    apiClient.get(`/combo/${id}`).then((res) => res.data),

  /** Tạo mới combo */
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

  /** Cập nhật combo */
  update: (id: string, data: UpdateComboRequest): Promise<ComboResponse> =>
    apiClient.put(`/combo/${id}`, data).then((res) => res.data),

  /** Xóa combo */
  delete: (id: string): Promise<void> =>
    apiClient.delete(`/combo/${id}`).then((res) => res.data),
};

export default comboService;
