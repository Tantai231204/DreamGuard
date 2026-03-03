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

export interface ComboResponse {
  id: string;
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
  discount: number;
  totalStock: number;
  status: number;
  featured: boolean;
  images: string[];
  category: string;
  sales: number;
  sku: string;
  items: ComboItemResponse[];
  createdAt: string;
  updatedAt: string;
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
  status?: number;
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

  /** Lấy tất cả combos (non-paginated) */
  getAllList: (): Promise<ComboResponse[]> =>
    apiClient
      .get<ComboResponse[]>('/combo', { _suppressToast: true } as CustomAxiosRequestConfig)
      .then((res) => res.data)
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
