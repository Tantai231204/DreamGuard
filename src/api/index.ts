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
  cartService,
  customizeTypeService,
  type VerifyOtpRequest,
  type ResetPasswordRequest,
  type ChangePasswordRequest,
} from "./services";

// Variant Types (exported from service)
export type {
  CreateVariantRequest,
  UpdateVariantRequest,
  VariantResponse,
  AdminVariantsByProductResponse,
  UpdateVariantStatusParams,
  AssignVariantCustomizeTypeRequest,
  UpdateVariantCustomizeTypePriceRequest,
  VariantCustomizeTypeResponse,
  CreateVariantWithCustomizeRequest,
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
  AddCartItemRequest,
  CartItemResponse,
  CartResponse,
} from "./services";

// Types
export type {
  ApiResponse,
  PaginatedResponse,
  Token,
  LoginRequest,
  AuthResponse,
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
