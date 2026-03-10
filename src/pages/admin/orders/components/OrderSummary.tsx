import { Card } from '@/components/ui/card';
import { Separator } from '@radix-ui/react-separator';
import { formatPrice } from '@/pages/profile/utils';

interface OrderSummaryProps {
  subTotal?: number;
  discountAmount?: number;
  totalAmount: number;
}

export function OrderSummary({ subTotal, discountAmount, totalAmount }: OrderSummaryProps) {
  return (
    <Card className="p-5 border border-gray-200 rounded-xl bg-gray-50">
      <h3 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wide">
        Order Summary
      </h3>
      <div className="space-y-2.5">
        {subTotal !== undefined && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium text-gray-900">{formatPrice(subTotal)}</span>
          </div>
        )}
        {discountAmount !== undefined && discountAmount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 font-medium">Discount</span>
            <span className="font-bold text-red-500">-{formatPrice(discountAmount)}</span>
          </div>
        )}
        <Separator className="my-3 h-px bg-gray-200" />
        <div className="flex justify-between items-baseline pt-1">
          <span className="font-semibold text-gray-900">Total</span>
          <span className="text-2xl font-bold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-hover)] bg-clip-text text-transparent">
            {formatPrice(totalAmount)}
          </span>
        </div>
      </div>
    </Card>
  );
}
