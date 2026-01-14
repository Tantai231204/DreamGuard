export const AppRoute = {
  HOME: "/",
  EXAMPLE: "/example",
  ZUSTAND: "/zustand",
  LOGIN: "/login",
  PROFILE: "/profile",
  ADMIN: "/admin",
  NOT_FOUND: "*",
} as const;

export type AppRoute = (typeof AppRoute)[keyof typeof AppRoute];

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
