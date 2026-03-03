import { Clock, CheckCheck, UserCircle2 } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  content: string;
  timestamp: string;
  senderRole: 'admin' | 'customer';
  isRead?: boolean;
  formatTime: (date: string) => string;
}

export default function MessageBubble({
  content,
  timestamp,
  senderRole,
  isRead = false,
  formatTime,
}: MessageBubbleProps) {
  const isAdmin = senderRole === 'admin';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={cn('flex items-start gap-2', isAdmin ? 'flex-row-reverse' : 'flex-row')}
    >
      {!isAdmin && (
        <Avatar className="h-8 w-8 bg-gray-200 flex items-center justify-center flex-shrink-0">
          <UserCircle2 className="h-5 w-5 text-gray-600" />
        </Avatar>
      )}

      <motion.div
        whileHover={{ scale: 1.01 }}
        className={cn(
          'max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm',
          isAdmin
            ? 'bg-gradient-to-br from-[var(--color-primary)] to-blue-600 text-white'
            : 'bg-white text-gray-900 border border-gray-200'
        )}
      >
        <p className="text-sm whitespace-pre-wrap leading-relaxed">
          {content}
        </p>

        <div
          className={cn(
            'flex items-center gap-1.5 mt-1.5 text-xs',
            isAdmin ? 'text-blue-100 justify-end' : 'text-gray-500'
          )}
        >
          <Clock className="h-3 w-3" />
          <span>{formatTime(timestamp)}</span>
          {isAdmin && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              {isRead ? (
                <CheckCheck className="h-3.5 w-3.5 ml-1 text-blue-200" />
              ) : (
                <CheckCheck className="h-3.5 w-3.5 ml-1 opacity-50" />
              )}
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
