import { Card } from '@/components/ui/card';
import { Separator } from '@radix-ui/react-separator';

interface OrderSummaryProps {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

export function OrderSummary({ subtotal, shipping, tax, total }: OrderSummaryProps) {
  return (
    <Card className="p-5 border border-gray-200 rounded-xl bg-gray-50">
      <h3 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wide">
        Summary
      </h3>
      <div className="space-y-2.5">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium text-gray-900">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Shipping</span>
          <span className="font-medium text-gray-900">${shipping.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tax</span>
          <span className="font-medium text-gray-900">${tax.toFixed(2)}</span>
        </div>
        <Separator className="my-3 h-px bg-gray-300" />
        <div className="flex justify-between items-baseline pt-1">
          <span className="font-semibold text-gray-900">Total</span>
          <span className="text-2xl font-bold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-hover)] bg-clip-text text-transparent">
            ${total.toFixed(2)}
          </span>
        </div>
      </div>
    </Card>
  );
}
