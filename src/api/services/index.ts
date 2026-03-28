// src/api/services/index.ts
export { authService } from './auth.service';
export type { VerifyOtpRequest, ResetPasswordRequest, ChangePasswordRequest } from './auth.service';
export { default as userService } from './userService';
export { default as categoryService } from './categoryService';
export { default as voucherService } from './voucherService';
export { default as productService } from './productService';
export { default as variantService } from './variantService';
export { default as comboService } from './comboService';
export { default as cartService } from './cartService';
export { default as orderService } from './orderService';
export { default as customizeTypeService } from './customizeTypeService';
export { default as certificateService } from './certificateService';
export * as addressService from './address.service';

export type {
    CreateVariantRequest,
    UpdateVariantRequest,
    VariantResponse,
} from './variantService';
export type {
    CreateComboRequest,
    UpdateComboRequest,
    ComboResponse,
    ComboItemResponse,
    ComboItemRequest,
    ComboPageResponse,
    ComboParams,
} from './comboService';
export { isComboParent } from './comboService';

export type {
    AddCartItemRequest,
    CartItemResponse,
    CartResponse,
} from './cartService';
