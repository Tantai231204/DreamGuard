// src/pages/admin/vouchers/types.ts
import type { VoucherResponse, VoucherType } from '@/api';

// Re-export VoucherResponse as Voucher cho tiện sử dụng trong admin
export type Voucher = VoucherResponse;

export interface VoucherFormValues {
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
