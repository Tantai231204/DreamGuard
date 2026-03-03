// src/lib/api.ts
import axios, { type AxiosRequestConfig } from "axios";
import { toast } from "sonner";
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
   Custom Config Types
====================== */
export interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  _suppressToast?: boolean;
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
  const storeToken = useAuthStore.getState().token;

  const devToken =
    typeof window !== "undefined"
      ? localStorage.getItem("accessToken") // đổi key nếu bạn dùng key khác
      : null;

  // ✅ ưu tiên token thật
  const token = storeToken || devToken;
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/* ======================
   Helpers
====================== */
function extractMessage(data: unknown, fallback: string): string {
  if (!data || typeof data !== "object") return fallback;
  const d = data as Record<string, unknown>;
  const raw = d.message ?? d.error ?? fallback;
  if (Array.isArray(raw)) return raw.join(". ");
  if (typeof raw === "string") return raw;
  return fallback;
}

const ERROR_TITLES: Partial<Record<ApiErrorCodeType, string>> = {
  [ApiErrorCode.VALIDATION]: "Validation Error",
  [ApiErrorCode.UNAUTHORIZED]: "Unauthorized",
  [ApiErrorCode.FORBIDDEN]: "Access Denied",
  [ApiErrorCode.NOT_FOUND]: "Not Found",
  [ApiErrorCode.SERVER_ERROR]: "Server Error",
  [ApiErrorCode.NETWORK_ERROR]: "Network Error",
  [ApiErrorCode.UNKNOWN]: "Error",
};

/* ======================
   Refresh-token state
====================== */
let isRefreshing = false;
let failedQueue: {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}[] = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((p) => {
    if (token) p.resolve(token);
    else p.reject(error);
  });
  failedQueue = [];
}

/* ======================
   Response interceptor
====================== */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // ── 401 → attempt refresh token ──────────────────
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh-token") &&
      !originalRequest.url?.includes("/auth")
    ) {
      const storedRefreshToken = useAuthStore.getState().refreshToken;

      // No refresh token available → logout
      if (!storedRefreshToken) {
        useAuthStore.getState().logout();
        return Promise.reject(
          new ApiError("Session expired", ApiErrorCode.UNAUTHORIZED, 401),
        );
      }

      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await api.post("/auth/refresh-token", {
          refreshToken: storedRefreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } =
          res.data?.data ?? res.data;

        useAuthStore
          .getState()
          .setTokens(
            accessToken,
            newRefreshToken,
            useAuthStore.getState().role,
          );

        // Replay queued requests with the fresh token
        processQueue(null, accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // ── Normal error handling ────────────────────────
    if (error.response) {
      const status: number = error.response.status;
      const message = extractMessage(
        error.response.data,
        error.message || "Đã xảy ra lỗi",
      );

      let code: ApiErrorCodeType = ApiErrorCode.UNKNOWN;

      if (status === 422 || status === 400) code = ApiErrorCode.VALIDATION;
      else if (status === 401) code = ApiErrorCode.UNAUTHORIZED;
      else if (status === 403) code = ApiErrorCode.FORBIDDEN;
      else if (status === 404) code = ApiErrorCode.NOT_FOUND;
      else if (status >= 500) code = ApiErrorCode.SERVER_ERROR;

      // Global toast (skip if caller opted out)
      if (!originalRequest?._suppressToast) {
        toast.error(ERROR_TITLES[code] || "Error", { description: message });
      }

      return Promise.reject(new ApiError(message, code, status));
    }

    // Không có response (mất mạng / timeout)
    if (error.request) {
      const msg = "Unable to connect. Please check your network.";
      toast.error("Network Error", { description: msg });
      return Promise.reject(new ApiError(msg, ApiErrorCode.NETWORK_ERROR));
    }

    toast.error("Error", { description: error.message });
    return Promise.reject(new ApiError(error.message, ApiErrorCode.UNKNOWN));
  },
);

export default api;
