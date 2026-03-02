// src/api/types/apiResponse.ts
// Schema response chung cho toàn hệ thống

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
