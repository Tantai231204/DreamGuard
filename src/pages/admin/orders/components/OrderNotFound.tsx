import { Package, SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface OrderNotFoundProps {
  orderId?: string;
}

export function OrderNotFound({ orderId }: OrderNotFoundProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center min-h-[500px] p-8"
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="inline-block mb-8"
      >
        <div className="relative w-28 h-28 mx-auto">
          {/* Glow */}
          <div className="absolute inset-0 bg-blue-200/50 rounded-full blur-2xl dark:bg-blue-900/30" />
          {/* Circle bg */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-800 dark:to-slate-900 border border-blue-200/60 dark:border-slate-700 shadow-inner" />

          <div className="relative z-10 w-full h-full flex items-center justify-center">
            <Package className="h-12 w-12 text-[var(--color-primary)]" strokeWidth={1.5} />
          </div>

          {/* Decorative floating icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
            className="absolute -bottom-2 -right-2 bg-white dark:bg-slate-800 rounded-full p-2 shadow-lg border border-gray-100 dark:border-slate-700"
          >
            <SearchX className="h-5 w-5 text-rose-500" />
          </motion.div>
        </div>
      </motion.div>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Order Not Found
      </h2>
      <p className="text-gray-500 dark:text-gray-400 text-center max-w-md text-sm mb-8 leading-relaxed">
        {orderId
          ? (
            <>
              We couldn't find any record for Order ID <span className="font-semibold text-gray-700 dark:text-gray-300">"{orderId}"</span>.
              The order might have been removed or the ID is incorrect.
            </>
          )
          : 'The order you are looking for does not exist or has been removed from the system.'}
      </p>

      <Button
        onClick={() => navigate('/admin/orders')}
        className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-hover)] hover:opacity-90 text-white rounded-xl px-6 py-2.5 shadow-lg shadow-blue-500/20 transition-all active:scale-95"
      >
        Back to Orders
      </Button>
    </motion.div>
  );
}
