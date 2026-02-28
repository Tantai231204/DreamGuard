import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface ConversationItemProps {
  id: string;
  customerName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isSelected: boolean;
  onClick: () => void;
  formatTime: (date: string) => string;
}

export default function ConversationItem({
  customerName,
  lastMessage,
  lastMessageTime,
  unreadCount,
  isSelected,
  onClick,
  formatTime,
}: ConversationItemProps) {
  return (
    <motion.button
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={cn(
        'w-full p-3 flex items-start gap-3 transition-all duration-200 border-b border-gray-100 relative',
        'hover:bg-blue-50/50',
        isSelected && 'bg-blue-50 border-l-[3px] border-l-[var(--color-primary)]',
        !isSelected && 'border-l-[3px] border-l-transparent'
      )}
    >
      {/* Status Indicator */}
      {unreadCount > 0 && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[var(--color-primary)] rounded-r-full" />
      )}

      <Avatar className="h-10 w-10 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold flex-shrink-0 shadow-sm">
        {customerName.charAt(0)}
      </Avatar>

      <div className="flex-1 text-left min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className={cn(
            'font-medium text-sm truncate',
            unreadCount > 0 && 'font-semibold text-gray-900'
          )}>
            {customerName}
          </span>
          <span className={cn(
            'text-xs flex-shrink-0 ml-2',
            unreadCount > 0 ? 'text-[var(--color-primary)] font-medium' : 'text-gray-500'
          )}>
            {formatTime(lastMessageTime)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <p className={cn(
            'text-sm truncate flex-1',
            unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-600'
          )}>
            {lastMessage}
          </p>
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              <Badge className="bg-[var(--color-primary)] text-white text-xs px-2 py-0.5 min-w-[20px] flex items-center justify-center">
                {unreadCount}
              </Badge>
            </motion.div>
          )}
        </div>
      </div>
    </motion.button>
  );
}
