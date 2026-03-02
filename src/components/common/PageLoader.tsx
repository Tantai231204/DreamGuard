import { motion } from 'framer-motion';
import { Star, Sparkles } from 'lucide-react';
import { CloudsBackground } from './CloudsBackground';

export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 relative overflow-hidden">
      <CloudsBackground />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-8"
      >
        {/* DreamGuard Logo with Stars */}
        <div className="relative z-10">
          {/* Logo */}
          <motion.div
            animate={{
              y: [0, -15, 0],
              rotate: [-2, 2, -2],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="relative"
          >
            <img 
              src="/images/logo_no_name.svg" 
              alt="DreamGuard" 
              className="h-32 w-32 drop-shadow-2xl"
            />
          </motion.div>

          {/* Floating Stars - adjusted for logo */}
          <motion.div
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute inset-0 w-32 h-32 mx-auto"
          >
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.6, 1, 0.6],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0
              }}
              className="absolute -top-3 right-0"
            >
              <Star className="h-6 w-6 text-yellow-400" fill="#fbbf24" />
            </motion.div>

            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.6, 1, 0.6],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
              }}
              className="absolute -bottom-2 -left-4"
            >
              <Star className="h-5 w-5 text-pink-400" fill="#f472b6" />
            </motion.div>

            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.6, 1, 0.6],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
              className="absolute top-8 -right-6"
            >
              <Sparkles className="h-5 w-5 text-blue-400" />
            </motion.div>
          </motion.div>
        </div>

        {/* Playful Loading Dots */}
        <div className="flex items-center gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -12, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.15,
              }}
              className="h-3 w-3 rounded-full bg-gradient-to-r from-purple-400 to-pink-400"
            />
          ))}
        </div>

        {/* Sweet Loading Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="text-center z-10"
        >
          <p className="text-lg font-semibold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
            Sweet Dreams Loading...
          </p>
          <p className="text-xs text-gray-500 mt-1">Preparing your DreamGuard experience</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
