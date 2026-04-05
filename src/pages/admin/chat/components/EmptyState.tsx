import { MessageSquare, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.93 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="flex-1 flex items-center justify-center"
      style={{ background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)' }}
    >
      <div className="text-center px-6">
        {/* Animated icon */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="inline-block mb-6"
        >
          <div className="relative w-24 h-24 mx-auto">
            {/* Glow */}
            <div className="absolute inset-0 bg-blue-200/50 rounded-full blur-2xl" />
            {/* Circle bg */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200/60 shadow-inner" />
            <div className="relative z-10 w-full h-full flex items-center justify-center">
              <MessageSquare className="h-11 w-11 text-[var(--color-primary)]" strokeWidth={1.5} />
            </div>
            {/* Sparkle decoration */}
            <motion.div
              animate={{ rotate: 360, scale: [1, 1.2, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              className="absolute -top-1 -right-1"
            >
              <Sparkles className="h-5 w-5 text-amber-400" />
            </motion.div>
          </div>
        </motion.div>

        <h3 className="text-base font-semibold text-gray-700 mb-1.5">
          No conversation selected
        </h3>
        <p className="text-sm text-gray-400 max-w-[220px] mx-auto leading-relaxed">
          Select a conversation from the list to start customer support
        </p>

        {/* Subtle hint chips */}
        <div className="flex items-center justify-center gap-2 mt-5">
          {['Unread', 'Active', 'Priority'].map((tag) => (
            <span
              key={tag}
              className="text-[11px] px-2.5 py-1 bg-white border border-gray-200 text-gray-500 rounded-full shadow-sm"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
