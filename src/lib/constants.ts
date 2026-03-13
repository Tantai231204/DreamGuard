// API Base URL
export const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";
// Route Constants
export const AppRoute = {
  // Public Routes
  HOME: "/",

  // Auth Routes
  LOGIN: "/login",
  REGISTER: "/register",
  REGISTER_BASIC: "/register",
  REGISTER_COMPLETE: "/register-complete",
  FORGOT_PASSWORD: "/forgot-password",
  VERIFY_OTP: "/verify-otp",
  RESET_PASSWORD: "/reset-password",
  RESET_PASSWORD_SUCCESS: "/reset-password-success",

  // Shop Routes
  PRODUCTS: "/products",
  PRODUCT_DETAIL: "/products/:slug",
  COMBOS: "/combos",
  COMBO_DETAIL: "/combos/:id",
  SERVICES: "/services",
  CART: "/cart",
  CHECKOUT: "/checkout",
  CHECKOUT_RESULT: "/checkout/result",

  // User Routes
  PROFILE: "/profile",

  // Admin Routes
  ADMIN: "/admin",

  // Error Routes
  NOT_FOUND: "*",
} as const;

export type AppRoute = (typeof AppRoute)[keyof typeof AppRoute];

// Helper function to generate product detail route
export const getProductDetailRoute = (slug: string) => `/products/${slug}`;
export const getComboDetailRoute = (id: string) => `/combos/${id}`;

export const ApiErrorCode = {
  NETWORK_ERROR: "NETWORK_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  SERVER_ERROR: "SERVER_ERROR",
  VALIDATION: "VALIDATION",
  UNKNOWN: "UNKNOWN",
} as const;

export type ApiErrorCode = (typeof ApiErrorCode)[keyof typeof ApiErrorCode];
