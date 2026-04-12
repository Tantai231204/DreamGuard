import type { Voucher } from '../types';
import VoucherVisualCard from '@/components/common/VoucherVisualCard';

interface VoucherCardProps {
  voucher: Voucher;
}

export default function VoucherCard({ voucher }: VoucherCardProps) {
  return (
    <VoucherVisualCard
      code={voucher.code}
      name={voucher.name}
      voucherType={voucher.voucherType}
      discountValue={voucher.discountValue}
      maxDiscountAmount={voucher.maxDiscountAmount}
      requiredCoin={voucher.requiredCoin}
      endDate={voucher.endDate}
      state={voucher.isActive ? 'active' : 'draft'}
      statusLabel={voucher.isActive ? 'ACTIVE' : 'DRAFT'}
    />
  );
}
