import { motion } from 'framer-motion';
import { Package } from 'lucide-react';

export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-6"
      >
        {/* Animated Logo */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="h-20 w-20 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-blue-600 flex items-center justify-center shadow-lg"
        >
          <Package className="h-10 w-10 text-white" />
        </motion.div>

        {/* Loading Bar */}
        <div className="w-64 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[var(--color-primary)] to-blue-600 rounded-full"
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        {/* Loading Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="text-sm font-medium text-gray-600"
        >
          Loading DreamGuard...
        </motion.p>
      </motion.div>
    </div>
  );
}
