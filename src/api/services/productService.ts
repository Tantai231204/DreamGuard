// src/api/services/productService.ts
import apiClient, { type CustomAxiosRequestConfig } from '../../lib/api';
import type { ProductResponse, CreateProductRequest, UpdateProductRequest, AdminProductPageResponse, AdminProductParams } from '../types';

const productService = {
  /** Lấy danh sách products cho admin (paginated) */
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

  /** Lấy danh sách tất cả products (404 → empty array) */
  getAll: (): Promise<ProductResponse[]> =>
    apiClient
      .get<ProductResponse[]>('/product', { _suppressToast: true } as CustomAxiosRequestConfig)
      .then((res) => res.data)
      .catch((err) => (err?.status === 404 ? [] : Promise.reject(err))),

  /** Lấy chi tiết product theo ID */
  getById: (id: string): Promise<ProductResponse> =>
    apiClient.get(`/product/${id}`).then((res) => res.data),

  /** Tạo mới product - server trả về empty, lấy ID từ header Location hoặc fetch lại theo slug */
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

  /** Cập nhật product */
  update: (id: string, data: UpdateProductRequest): Promise<ProductResponse> =>
    apiClient.put(`/product/${id}`, data).then((res) => res.data),

  /** Xóa product */
  delete: (id: string): Promise<void> =>
    apiClient.delete(`/product/${id}`).then((res) => res.data),

  /** Upload ảnh cho product */
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

  /** Xóa ảnh sản phẩm theo assetId */
  deleteImage: (assetId: string): Promise<void> =>
    apiClient.delete(`/asset/product/${assetId}`).then((res) => res.data),
};

export default productService;
