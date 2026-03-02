// src/api/services/categoryService.ts
import apiClient from '../../lib/api';
import type { CategoryResponse, CreateCategoryRequest, UpdateCategoryRequest } from '../types';

const categoryService = {
  /** Lấy danh sách tất cả categories */
  getAll: (): Promise<CategoryResponse[]> =>
    apiClient.get('/category').then((res) => res.data),

  /** Lấy chi tiết category theo ID */
  getById: (id: number): Promise<CategoryResponse> =>
    apiClient.get(`/category/${id}`).then((res) => res.data),

  /** Tạo mới category */
  create: (data: CreateCategoryRequest): Promise<CategoryResponse> =>
    apiClient.post('/category', data).then((res) => res.data),

  /** Cập nhật category */
  update: (id: number, data: UpdateCategoryRequest): Promise<CategoryResponse> =>
    apiClient.put(`/category/${id}`, data).then((res) => res.data),

  /** Xóa category */
  delete: (id: number): Promise<void> =>
    apiClient.delete(`/category/${id}`).then((res) => res.data),
};

export default categoryService;
