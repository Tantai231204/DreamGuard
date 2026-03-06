import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { CloudsBackground } from './CloudsBackground';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  fullScreen?: boolean;
}

const sizeMap = {
  sm: { img: 'h-8 w-8', sparkle: 'h-4 w-4' },
  md: { img: 'h-16 w-16', sparkle: 'h-5 w-5' },
  lg: { img: 'h-24 w-24', sparkle: 'h-6 w-6' },
  xl: { img: 'h-32 w-32', sparkle: 'h-8 w-8' },
};

export function LoadingSpinner({
  size = 'md',
  text,
  fullScreen = false
}: LoadingSpinnerProps) {
  const content = (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center gap-4 relative z-10"
    >
      {/* Logo with floating animation */}
      <div className="relative">
        <motion.div
          animate={{
            y: [0, -10, 0],
            rotate: [-3, 3, -3]
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="relative"
        >
          <img
            src="/images/logo_no_name.svg"
            alt="Loading"
            className={`${sizeMap[size].img} drop-shadow-lg`}
          />
        </motion.div>

        {/* Sparkles decoration */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -top-2 -right-2"
        >
          <Sparkles className={`${sizeMap[size].sparkle} text-purple-500`} />
        </motion.div>
      </div>

      {text && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-sm font-medium bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
        >
          {text}
        </motion.p>
      )}
    </motion.div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-purple-50/80 via-pink-50/80 to-blue-50/80 backdrop-blur-sm flex items-center justify-center z-50 overflow-hidden">
        <CloudsBackground />
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center w-full h-full min-h-[200px]">
      {content}
    </div>
  );
}

