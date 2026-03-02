// src/api/index.ts
// Central export cho tất cả API services và types

// Services
export {
  authService,
  userService,
  categoryService,
  voucherService,
  productService,
  variantService,
} from "./services";

// Variant Types (exported from service)
export type {
  CreateVariantRequest,
  UpdateVariantRequest,
  VariantResponse,
} from "./services/variantService";

// Types
export type {
  ApiResponse,
  PaginatedResponse,
  Token,
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  VerifyTokenRequest,
  ResendTokenRequest,
  UserProfile,
  UpdateUserProfileRequest,
  CategoryResponse,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  VoucherResponse,
  CreateVoucherRequest,
  UpdateVoucherRequest,
  VoucherPageResponse,
  ProductResponse,
  ProductVariantResponse,
  CreateProductRequest,
  UpdateProductRequest,
  AdminProductPageResponse,
  AdminProductParams,
} from "./types";
