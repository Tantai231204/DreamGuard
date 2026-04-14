// src/api/types/voucher.types.ts

export type VoucherType = "Both" | "Product" | "Service";

export interface VoucherResponse {
  voucherId: string;
  code: string;
  name: string;
  description: string;
  discountValue: number;
  maxDiscountAmount: number;
  requiredCoin: number;
  voucherType: VoucherType;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface CreateVoucherRequest {
  code: string;
  name: string;
  description: string;
  discountValue: number;
  maxDiscountAmount: number;
  requiredCoin: number;
  voucherType: VoucherType;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface UpdateVoucherRequest {
  code?: string;
  name?: string;
  description?: string;
  discountValue?: number;
  maxDiscountAmount?: number;
  requiredCoin?: number;
  voucherType?: VoucherType;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}

export interface VoucherPageResponse {
  items: VoucherResponse[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface UserVoucherResponse {
  userVoucherId: string;
  voucherId?: string;
  code: string;
  name: string;
  description: string;
  discountValue: number;
  maxDiscountAmount: number;
  requiredCoin?: number;
  voucherType: VoucherType;
  startDate?: string;
  endDate?: string;
  expiredAt?: string;
  isActive?: boolean;
  isClaimed?: boolean;
  claimedAt?: string | null;
  isUsed?: boolean;
  usedAt?: string | null;
}

export interface UserVoucherPageResponse {
  items: UserVoucherResponse[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface ClaimVoucherRequest {
  code: string;
}
