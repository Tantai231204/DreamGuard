// src/api/schemas/commonApiSchemas.ts

// Định nghĩa response chung cho toàn hệ thống
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data: T;
  // Có thể mở rộng thêm các trường như code, error, ...
}
