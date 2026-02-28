// src/api/apiService.ts
import apiClient from '../lib/api';
import type { ApiResponse } from './schemas/apiResponse';

const apiService = {
  get: async <T>(url: string, params?: object): Promise<ApiResponse<T>> =>
    apiClient.get(url, { params }).then((res) => res.data),
  post: async <T>(url: string, data?: object): Promise<ApiResponse<T>> =>
    apiClient.post(url, data).then((res) => res.data),
  put: async <T>(url: string, data?: object): Promise<ApiResponse<T>> =>
    apiClient.put(url, data).then((res) => res.data),
  delete: async <T>(url: string): Promise<ApiResponse<T>> =>
    apiClient.delete(url).then((res) => res.data),
};

export default apiService;
