import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { CloudsBackground } from './CloudsBackground';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string | string[];
  fullScreen?: boolean;
}

const sizeMap = {
  sm: { img: 'h-8 w-8', ring: 44 },
  md: { img: 'h-16 w-16', ring: 72 },
  lg: { img: 'h-24 w-24', ring: 104 },
  xl: { img: 'h-32 w-32', ring: 136 },
};

export function LoadingSpinner({
  size = 'md',
  text,
  fullScreen = false,
}: LoadingSpinnerProps) {
  const messages = Array.isArray(text) ? text : text ? [text] : [];
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    if (messages.length <= 1) return;
    const id = setInterval(() => {
      setMsgIndex(i => (i + 1) % messages.length);
    }, 2500);
    return () => clearInterval(id);
  }, [messages.length]);

  const ringSize = sizeMap[size].ring;

  const content = (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center gap-5 relative z-10"
    >
      {/* Spinner + Logo */}
      <div className="relative flex items-center justify-center">
        {/* Soft Core Overlay Shadow */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute h-[90%] w-[90%] rounded-full bg-[#4988c4]/15 filter blur-md"
        />

        {/* Modern Rotating Arc Circle */}
        <motion.svg
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
          style={{ width: ringSize + 12, height: ringSize + 12 }}
          className="absolute"
          viewBox={`0 0 ${ringSize + 12} ${ringSize + 12}`}
        >
          <circle
            cx={(ringSize + 12) / 2}
            cy={(ringSize + 12) / 2}
            r={ringSize / 2}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth="3"
          />
          <circle
            cx={(ringSize + 12) / 2}
            cy={(ringSize + 12) / 2}
            r={ringSize / 2}
            fill="none"
            stroke="#4988c4"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${(ringSize / 2) * 2 * Math.PI}`}
            strokeDashoffset={`${(ringSize / 2) * 2 * Math.PI * 0.75}`}
          />
        </motion.svg>

        {/* Static Logo Icon */}
        <div className="relative z-10 flex items-center justify-center p-1.5 bg-white rounded-full shadow-[0_4px_16px_rgba(73,136,196,0.12)]">
          <img
            src="/images/logo_no_name.svg"
            alt="Loading"
            className={sizeMap[size].img}
          />
        </div>
      </div>

      {/* Cycling text */}
      {messages.length > 0 && (
        <div className="h-5 flex flex-col items-center justify-center overflow-hidden gap-1.5">
          <AnimatePresence mode="wait">
            <motion.p
              key={msgIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="text-[11px] font-bold text-[#4988c4] tracking-widest uppercase whitespace-nowrap"
            >
              {messages[msgIndex]}
            </motion.p>
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-50/95 via-[#4988c4]/8 to-white backdrop-blur-md flex items-center justify-center z-50 overflow-hidden">
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
