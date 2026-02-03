import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import type { OrderItem } from '../../types';

interface OrderItemsListProps {
  items: OrderItem[];
}

export function OrderItemsList({ items }: OrderItemsListProps) {
  return (
    <Card className="p-6 border border-gray-200 rounded-xl">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-6 bg-gradient-to-b from-[var(--color-primary)] to-[var(--color-primary-hover)] rounded-full"></div>
        <h2 className="text-lg font-semibold text-gray-900 tracking-tight">
          Order Items
        </h2>
      </div>
      <div className="space-y-3">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex gap-4 p-3 rounded-lg bg-gray-50 hover:bg-white border border-transparent hover:border-gray-200 transition-all"
          >
            <div className="relative flex-shrink-0">
              <img
                src={item.image}
                alt={item.name}
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold rounded-full flex items-center justify-center shadow-sm">
                {item.quantity}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
              <p className="text-sm text-gray-500 mt-0.5">
                ${item.price.toFixed(2)} × {item.quantity}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-base font-semibold text-[var(--color-primary)]">
                ${(item.price * item.quantity).toFixed(2)}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}
