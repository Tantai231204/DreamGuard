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
});

/* ======================
   Helpers
====================== */
function extractMessage(data: unknown, fallback: string): string {
  if (!data || typeof data !== "object") return fallback;
  const d = data as Record<string, unknown>;
  
  // High-reliability extraction across multiple backend standards
  const raw = 
    d.message ?? 
    d.error ?? 
    d.title ?? 
    d.detail ?? 
    d.description ??
    (d.data as Record<string, unknown>)?.message ?? 
    fallback;

  if (Array.isArray(raw)) return raw.join(". ");
  if (typeof raw === "string") {
    // Attempt to parse stringified arrays like '["Error message"]'
    if (raw.trim().startsWith('[') && raw.trim().endsWith(']')) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.join(". ");
      } catch {
        // Ignore parse errors
      }
    }
    return raw;
  }
  return fallback;
}

function toNumericStatus(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.trim());
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

function resolveStatusCode(data: unknown, httpStatus?: number): number | undefined {
  if (typeof httpStatus === "number" && Number.isFinite(httpStatus)) return httpStatus;
  if (!data || typeof data !== "object") return undefined;

  const d = data as Record<string, unknown>;
  const nested = d.data && typeof d.data === "object" ? (d.data as Record<string, unknown>) : undefined;

  return (
    toNumericStatus(d.errorCode) ??
    toNumericStatus(d.statusCode) ??
    toNumericStatus(d.code) ??
    toNumericStatus(nested?.errorCode) ??
    toNumericStatus(nested?.statusCode) ??
    toNumericStatus(nested?.code)
  );
}

function mapStatusToErrorCode(status?: number): ApiErrorCode {
  if (status === 422 || status === 400) return ApiErrorCode.VALIDATION;
  if (status === 401) return ApiErrorCode.UNAUTHORIZED;
  if (status === 403) return ApiErrorCode.FORBIDDEN;
  if (status === 404) return ApiErrorCode.NOT_FOUND;
  if (status === 409) return ApiErrorCode.CONFLICT;
  if (typeof status === "number" && status >= 500) return ApiErrorCode.SERVER_ERROR;
  return ApiErrorCode.UNKNOWN;
}

export const ERROR_TITLES: Partial<Record<ApiErrorCode, string>> = {
  [ApiErrorCode.VALIDATION]: "Invalid Data",
  [ApiErrorCode.UNAUTHORIZED]: "Unauthorized",
  [ApiErrorCode.FORBIDDEN]: "Access Denied",
  [ApiErrorCode.NOT_FOUND]: "Not Found",
  [ApiErrorCode.CONFLICT]: "Conflict",
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
   Response Interceptor
====================== */
api.interceptors.response.use(
  (response) => {
    const businessStatus = resolveStatusCode(response.data);
    if (typeof businessStatus === "number" && businessStatus >= 400) {
      const message = extractMessage(response.data, "An unexpected error occurred");
      const code = mapStatusToErrorCode(businessStatus);
      return Promise.reject(new ApiError(message, code, businessStatus));
    }

    return response;
  },
  async (error) => {
    // 🛡️ Safety Guard: Avoid crashing on cancels/network timeouts without config
    if (!error?.config) {
      return Promise.reject(error);
    }

    const originalRequest = error.config as CustomAxiosRequestConfig;
    const status = error.response?.status;

    // Handle 401 Unauthorized - Attempt Token Refresh
    if (
      status === 401 &&
      !originalRequest._retry &&
      !useAuthStore.getState().isLoggingOut &&
      useAuthStore.getState().isAuthenticated &&
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
        const refreshRes = await api.post("/auths/refreshToken", {});
        const newToken = refreshRes.data?.data?.accessToken || refreshRes.data?.accessToken;
        if (newToken) {
          sessionStorage.setItem('signalr_token', newToken);
        }
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        // If refresh fails (401, 404), force logout immediately to stop loops
        useAuthStore.getState().clearAuth('session_expired');
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Normal Error Handling
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      const resolvedStatus = resolveStatusCode(data, status);
      const message = extractMessage(data, error.message || "An unexpected error occurred");
      const code = mapStatusToErrorCode(resolvedStatus);

      return Promise.reject(new ApiError(message, code, resolvedStatus));
    } else if (error.request) {
      // Network/Timeout error
      const message = "Unable to connect to the server. Please check your network.";
      return Promise.reject(new ApiError(message, ApiErrorCode.NETWORK_ERROR));
    }

    return Promise.reject(error);
  }
);

export default api;
