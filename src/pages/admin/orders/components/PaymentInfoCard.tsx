import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { formatPrice } from '@/pages/profile/utils';

interface PaymentInfoCardProps {
  paymentMethod: string;
  total: number;
  delay?: number;
}

export function PaymentInfoCard({ paymentMethod, total, delay = 0 }: PaymentInfoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className="p-5 border border-gray-200 rounded-xl">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full"></div>
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
            Payment
          </h2>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="font-medium text-gray-900 mb-3">{paymentMethod}</div>
          <div className="flex items-center justify-between pt-3 border-t border-gray-200">
            <span className="text-sm text-gray-600">Amount Paid</span>
            <span className="text-lg font-bold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-hover)] bg-clip-text text-transparent">
              {formatPrice(total)}
            </span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
