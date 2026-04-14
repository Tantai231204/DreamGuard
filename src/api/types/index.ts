// src/api/types/index.ts
// Central export cho tất cả types

export type { ApiResponse, PaginatedResponse } from "./apiResponse";
export type {
  Token,
  LoginRequest,
  AuthResponse,
  RegisterRequest,
  ForgotPasswordRequest,
  VerifyTokenRequest,
  ResendTokenRequest,
} from "./auth.types";
export type { UserProfile, UpdateUserProfileRequest, ChangePhoneNumberRequest, ConfirmChangePhoneNumberRequest } from "./userProfile";
export type {
  CategoryResponse,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "./category.types";
export type {
  VoucherType,
  VoucherResponse,
  CreateVoucherRequest,
  UpdateVoucherRequest,
  VoucherPageResponse,
  UserVoucherResponse,
  UserVoucherPageResponse,
  ClaimVoucherRequest,
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
  FullyCustomizedProductResponse,
  CreateFullyCustomizedProductRequest,
  UpdateFullyCustomizedProductRequest,
} from "./product.types";
export type { PaymentResponse, PaymentDetailResponse } from "./payment";
export type {
  RatingPayload,
  RatingResponse,
  RatingSearchParams,
  RatingListResponse,
} from "./rating";
export type {
  ProductFeedbackPayload,
  ProductFeedbackResponse,
} from "./feedback";
export type {
  AdminTradeInOrderListResponse,
  AdminTradeInOrderSearchParams,
  CalculateTradeInOrderPriceRequest,
  CalculateTradeInOrderPriceResponse,
  CreateTradeInOrderRequest,
  TradeInOrderListItem,
  TradeInOrderResponse,
  UploadTradeInOrderImagesResponse,
} from "./tradeInOrder";
