// src/lib/api.ts
import axios from "axios";
import { ApiErrorCode } from "./constants";
import { useAuthStore } from "../store/authStore";

export type ApiErrorCodeType = (typeof ApiErrorCode)[keyof typeof ApiErrorCode];

/* ======================
   ApiError
====================== */
export class ApiError extends Error {
  code: ApiErrorCodeType;
  status?: number;

  constructor(message: string, code: ApiErrorCodeType, status?: number) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

/* ======================
   Axios instance
====================== */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ======================
   Request interceptor
====================== */
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/* ======================
   Response interceptor
====================== */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Có response từ server
    if (error.response) {
      const status: number = error.response.status;

      const message =
        error.response.data?.message ||
        error.response.data?.error ||
        error.message ||
        "Đã xảy ra lỗi";

      let code: ApiErrorCodeType = ApiErrorCode.UNKNOWN;

      if (status === 422 || status === 400) code = ApiErrorCode.VALIDATION;
      else if (status === 401) code = ApiErrorCode.UNAUTHORIZED;
      else if (status === 403) code = ApiErrorCode.FORBIDDEN;
      else if (status === 404) code = ApiErrorCode.NOT_FOUND;
      else if (status >= 500) code = ApiErrorCode.SERVER_ERROR;

      // Auto logout nếu 401
      if (code === ApiErrorCode.UNAUTHORIZED) {
        useAuthStore.getState().clearToken();
      }

      return Promise.reject(new ApiError(message, code, status));
    }

    // Không có response (mất mạng / timeout)
    if (error.request) {
      return Promise.reject(
        new ApiError("Network error", ApiErrorCode.NETWORK_ERROR)
      );
    }

    return Promise.reject(new ApiError(error.message, ApiErrorCode.UNKNOWN));
  }
);

export default api;
