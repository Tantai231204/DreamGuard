// src/api/services/productService.ts
import apiClient from '../../lib/api';
import type { ProductResponse, CreateProductRequest, UpdateProductRequest, AdminProductPageResponse, AdminProductParams } from '../types';

const productService = {
  /** Lấy danh sách products cho admin (paginated) */
  getAllAdmin: (params: AdminProductParams = {}): Promise<AdminProductPageResponse> =>
    apiClient
      .get('/product/admin', { params, _suppressToast: true } as any)
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
      .get('/product', { _suppressToast: true } as any)
      .then((res) => res.data)
      .catch((err) => (err?.status === 404 ? [] : Promise.reject(err))),

  /** Lấy chi tiết product theo ID */
  getById: (id: string): Promise<ProductResponse> =>
    apiClient.get(`/product/${id}`).then((res) => res.data),

  /** Tạo mới product */
  create: (data: CreateProductRequest): Promise<ProductResponse> =>
    apiClient.post('/product', data).then((res) => res.data),

  /** Cập nhật product */
  update: (id: string, data: UpdateProductRequest): Promise<ProductResponse> =>
    apiClient.put(`/product/${id}`, data).then((res) => res.data),

  /** Xóa product */
  delete: (id: string): Promise<void> =>
    apiClient.delete(`/product/${id}`).then((res) => res.data),
};

export default productService;
