// API Base URL
export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
// Route Constants
export const AppRoute = {
  // Public Routes
  HOME: "/",
  
  // Auth Routes
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  VERIFY_OTP: "/verify-otp",
  RESET_PASSWORD: "/reset-password",
  RESET_PASSWORD_SUCCESS: "/reset-password-success",
  
  // Shop Routes
  PRODUCTS: "/products",
  PRODUCT_DETAIL: "/products/:id",
  SERVICES: "/services",
  CART: "/cart",
  CHECKOUT: "/checkout",
  
  // User Routes
  PROFILE: "/profile",
  
  // Admin Routes
  ADMIN: "/admin",
  
  // Error Routes
  NOT_FOUND: "*",
} as const;

export type AppRoute = (typeof AppRoute)[keyof typeof AppRoute];

// Helper function to generate product detail route
export const getProductDetailRoute = (id: string | number) => `/products/${id}`;

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
