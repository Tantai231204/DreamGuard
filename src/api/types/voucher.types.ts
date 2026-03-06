// src/api/types/voucher.types.ts

export interface VoucherResponse {
  voucherId: string;
  code: string;
  name: string;
  description: string;
  discountValue: number;
  discountType: "percent" | "fixed";
  minDiscountAmount: number;
  maxDiscountAmount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface CreateVoucherRequest {
  code: string;
  name: string;
  description: string;
  discountValue: number;
  discountType: "percent" | "fixed";
  minDiscountAmount: number;
  maxDiscountAmount: number;
  startDate: string;
  endDate: string;
  isActive?: boolean;
}

export interface UpdateVoucherRequest {
  code?: string;
  name?: string;
  description?: string;
  discountValue?: number;
  discountType?: "percent" | "fixed";
  minDiscountAmount?: number;
  maxDiscountAmount?: number;
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
