export interface Voucher {
  code: string;
  label: string;
  discountPct: number; // e.g. 10 = 10 %
}

export const MOCK_VOUCHERS: Voucher[] = [
  { code: "DREAM10", label: "New Customer", discountPct: 10 },
  { code: "FAMILY20", label: "Family Deal", discountPct: 20 },
  { code: "VIP30", label: "VIP Exclusive", discountPct: 30 },
  { code: "NEWUSER", label: "First Booking", discountPct: 15 },
];

export function findVoucher(code: string): Voucher | null {
  return (
    MOCK_VOUCHERS.find((v) => v.code === code.trim().toUpperCase()) ?? null
  );
}
