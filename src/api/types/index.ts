// src/api/types/index.ts
// Central export cho tất cả types

export type { ApiResponse, PaginatedResponse } from "./apiResponse";
export type {
  Token,
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  VerifyTokenRequest,
  ResendTokenRequest,
} from "./auth.types";
export type { UserProfile, UpdateUserProfileRequest } from "./user.types";
export type {
  CategoryResponse,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "./category.types";
export type {
  VoucherResponse,
  CreateVoucherRequest,
  UpdateVoucherRequest,
  VoucherPageResponse,
} from "./voucher.types";
export type {
  AssetResponse, ProductResponse,
  ProductVariantResponse,
  CreateProductRequest,
  UpdateProductRequest,
  AdminProductPageResponse,
  AdminProductParams,
  ProductParams,
  UpdateProductStatusParams,
} from "./product.types";
export type { PaymentResponse, PaymentDetailResponse } from "./payment";
