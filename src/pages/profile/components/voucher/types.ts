import type { VoucherType } from "@/api";

export type VoucherStatus = "claimable" | "active" | "used" | "expired";

export interface ProfileVoucher {
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
  isActive?: boolean;
  status: VoucherStatus;
  isClaimed?: boolean;
  claimedAt?: string | null;
  usedAt?: string | null;
}
