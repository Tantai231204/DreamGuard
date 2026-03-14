// src/lib/api.ts
import axios, { type AxiosRequestConfig } from "axios";
import { useAuthStore } from "../store/authStore";
import { ApiErrorCode } from "./constants";

/* ======================
   ApiError Class
====================== */
export class ApiError extends Error {
  code: ApiErrorCode;
  status?: number;

  constructor(message: string, code: ApiErrorCode, status?: number) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

/* ======================
   Custom Config Types
====================== */
export interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
  _suppressToast?: boolean;
  skipAuth?: boolean;
}

/* ======================
   Axios instance
====================== */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 30000,
  withCredentials: true, // Crucial for cookie-based auth
  headers: {
    "Content-Type": "application/json",
  },
});

/* ======================
   Helpers
====================== */
function extractMessage(data: unknown, fallback: string): string {
  if (!data || typeof data !== "object") return fallback;
  const d = data as Record<string, unknown>;
  // Support various backend error formats
  const raw = d.message ?? d.error ?? (d.data as Record<string, unknown>)?.message ?? fallback;
  if (Array.isArray(raw)) return raw.join(". ");
  if (typeof raw === "string") return raw;
  return fallback;
}

export const ERROR_TITLES: Partial<Record<ApiErrorCode, string>> = {
  [ApiErrorCode.VALIDATION]: "Invalid Data",
  [ApiErrorCode.UNAUTHORIZED]: "Unauthorized",
  [ApiErrorCode.FORBIDDEN]: "Access Denied",
  [ApiErrorCode.NOT_FOUND]: "Not Found",
  [ApiErrorCode.SERVER_ERROR]: "Internal Server Error",
  [ApiErrorCode.NETWORK_ERROR]: "Connection Error",
  [ApiErrorCode.UNKNOWN]: "Something went wrong",
};

/* ======================
   Refresh-token state management
   ====================== */
let isRefreshing = false;
let failedQueue: {
  resolve: () => void;
  reject: (error: unknown) => void;
}[] = [];

const processQueue = (error: unknown) => {
  failedQueue.forEach((prom) => {
    if (!error) {
      prom.resolve();
    } else {
      prom.reject(error);
    }
  });
  failedQueue = [];
};

/* ======================
   Request Interceptor
====================== */
api.interceptors.request.use((config) => {
  // Pure Cookie Approach: No manual Authorization header.
  // Implementation: 'withCredentials: true' handles all token transport.
  return config;
});

/* ======================
   Response Interceptor
====================== */
api.interceptors.response.use(
  (response) => {
    // console.log("[API Debug] Response Success:", response.config.url);
    return response;
  },
  async (error) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;
    const status = error.response?.status;

    // Handle 401 Unauthorized - Attempt Token Refresh
    if (
      status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auths/refreshToken') &&
      !originalRequest.url?.includes('/auths/login')
    ) {
      if (isRefreshing) {
        return new Promise<void>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Pure Cookie Refresh:
        // No body payload needed, server will read HTTP-only RefreshToken cookie.
        await api.post("/auths/refreshToken");

        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        useAuthStore.getState().clearAuth();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Normal Error Handling
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      let code: ApiErrorCode = ApiErrorCode.UNKNOWN;

      const message = extractMessage(data, error.message || "An unexpected error occurred");

      if (status === 422 || status === 400) code = ApiErrorCode.VALIDATION;
      else if (status === 401) code = ApiErrorCode.UNAUTHORIZED;
      else if (status === 403) code = ApiErrorCode.FORBIDDEN;
      else if (status === 404) code = ApiErrorCode.NOT_FOUND;
      else if (status >= 500) code = ApiErrorCode.SERVER_ERROR;

      return Promise.reject(new ApiError(message, code, status));
    } else if (error.request) {
      // Network/Timeout error
      const message = "Unable to connect to the server. Please check your network.";
      return Promise.reject(new ApiError(message, ApiErrorCode.NETWORK_ERROR));
    }

    return Promise.reject(error);
  }
);

export default api;
