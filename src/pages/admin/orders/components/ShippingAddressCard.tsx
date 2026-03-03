import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Separator } from '@radix-ui/react-separator';
import type { Address } from '../../types';

interface ShippingAddressCardProps {
  address: Address;
  delay?: number;
}

export function ShippingAddressCard({ address, delay = 0 }: ShippingAddressCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className="p-5 border border-gray-200 rounded-xl">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 bg-gradient-to-b from-green-500 to-green-600 rounded-full"></div>
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
            Delivery Address
          </h2>
        </div>
        <div className="text-sm text-gray-700 space-y-1.5 bg-gray-50 p-4 rounded-lg">
          <div className="font-semibold text-gray-900">{address.fullName}</div>
          <div>{address.phone}</div>
          <Separator className="my-2 h-px bg-gray-200" />
          <div>{address.street}</div>
          <div>
            {address.ward}, {address.district}
          </div>
          <div className="font-medium text-gray-900 pt-1">{address.city}</div>
        </div>
      </Card>
    </motion.div>
  );
}
