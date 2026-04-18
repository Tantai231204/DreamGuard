import type { UserVoucherResponse } from '@/api';

type VoucherScope = 'order' | 'service';

interface VoucherDiscountInput {
  discountValue: number;
  maxDiscountAmount?: number;
}

const normalizeRatio = (value: number): number => {
  if (!Number.isFinite(value) || value <= 0) return 0;
  const ratio = value > 1 ? value / 100 : value;
  return Math.min(Math.max(ratio, 0), 1);
};

export const getVoucherExpiryDate = (voucher: Pick<UserVoucherResponse, 'endDate' | 'expiredAt'>): string | null => {
  return voucher.endDate || voucher.expiredAt || null;
};

export const isVoucherExpired = (voucher: Pick<UserVoucherResponse, 'endDate' | 'expiredAt'>): boolean => {
  const expiry = getVoucherExpiryDate(voucher);
  if (!expiry) return false;

  const expiryTime = new Date(expiry).getTime();
  if (!Number.isFinite(expiryTime)) return false;

  return expiryTime < Date.now();
};

export const getVoucherDiscountRatio = (voucher: Pick<UserVoucherResponse, 'discountValue'>): number => {
  return normalizeRatio(voucher.discountValue);
};

export const calculateVoucherDiscount = (subtotal: number, voucher: VoucherDiscountInput): number => {
  if (!Number.isFinite(subtotal) || subtotal <= 0) return 0;

  const ratio = normalizeRatio(voucher.discountValue);
  if (ratio <= 0) return 0;

  const rawDiscount = subtotal * ratio;
  const cap =
    typeof voucher.maxDiscountAmount === 'number' && Number.isFinite(voucher.maxDiscountAmount) && voucher.maxDiscountAmount > 0
      ? voucher.maxDiscountAmount
      : rawDiscount;

  return Math.max(0, Math.min(Math.round(rawDiscount), Math.round(cap), Math.round(subtotal)));
};

export const isUserVoucherClaimable = (voucher: UserVoucherResponse): boolean => {
  if (!voucher.code) return false;
  if (voucher.isClaimed === true || !!voucher.claimedAt) return false;
  if (voucher.isUsed || !!voucher.usedAt) return false;
  if (voucher.isActive === false) return false;
  if (isVoucherExpired(voucher)) return false;

  return true;
};

export const isUserVoucherUsable = (voucher: UserVoucherResponse, scope: VoucherScope): boolean => {
  if (!voucher.userVoucherId || !voucher.code) return false;
  if (voucher.isClaimed === false) return false;
  if (voucher.isUsed || !!voucher.usedAt) return false;
  if (voucher.isActive === false) return false;
  if (isVoucherExpired(voucher)) return false;

  const type = voucher.voucherType;
  if (scope === 'order') {
    return type === 'Both' || type === 'Product';
  }

  return type === 'Both' || type === 'Service';
};
