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
}

/* ======================
   Axios instance
====================== */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 30000,
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
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token);
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
  const token = useAuthStore.getState().token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

/* ======================
   Response Interceptor
====================== */
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    // Handle 401 Unauthorized - Attempt Token Refresh
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auths/refresh-token') &&
      !originalRequest.url?.includes('/auths') // Avoid loops in login/register
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers!.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = useAuthStore.getState().refreshToken;

      if (!refreshToken) {
        useAuthStore.getState().clearAuth();
        // Skip toast if it's already a clean state
        return Promise.reject(error);
      }

      try {
        // Use a clean axios instance to avoid interceptor loops if needed, 
        // but here we just use the relative path
        const response = await api.post("/auths/refresh-token", {
          refreshToken,
        });

        // Backend might return { data: { accessToken, refreshToken, ... } } or just { accessToken, ... }
        const tokenData = response.data?.data ?? response.data;
        const { accessToken, refreshToken: newRefreshToken, roleName } = tokenData;

        // Update Store
        useAuthStore.getState().setAuth({
          accessToken,
          refreshToken: newRefreshToken || refreshToken,
          roleName: roleName || useAuthStore.getState().role || "",
        });

        processQueue(null, accessToken);

        originalRequest.headers!.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
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
