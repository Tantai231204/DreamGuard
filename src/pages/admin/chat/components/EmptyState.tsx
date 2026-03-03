import { MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

export default function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex-1 flex items-center justify-center"
    >
      <div className="text-center">
        <motion.div
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="inline-block mb-6"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-blue-200 rounded-full blur-2xl opacity-50" />
            <MessageSquare className="h-20 w-20 text-[var(--color-primary)] relative z-10" />
          </div>
        </motion.div>

        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          No conversation selected
        </h3>
        <p className="text-sm text-gray-500 max-w-xs mx-auto">
          Choose a conversation from the list to start chatting with customers
        </p>
      </div>
    </motion.div>
  );
}
