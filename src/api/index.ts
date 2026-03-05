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
  comboService,
} from "./services";

// Variant Types (exported from service)
export type {
  CreateVariantRequest,
  UpdateVariantRequest,
  VariantResponse,
  AdminVariantsByProductResponse,
  UpdateVariantStatusParams,
  UpdateVariantStockStatusParams,
} from "./services/variantService";

// Combo Types (exported from service)
export type {
  CreateComboRequest,
  UpdateComboRequest,
  ComboResponse,
  ComboItemResponse,
  ComboItemRequest,
  ComboPageResponse,
  ComboParams,
} from "./services";

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
  AssetResponse,
  ProductResponse,
  ProductVariantResponse,
  CreateProductRequest,
  UpdateProductRequest,
  AdminProductPageResponse,
  AdminProductParams,
  ProductParams,
  UpdateProductStatusParams,
} from "./types";
