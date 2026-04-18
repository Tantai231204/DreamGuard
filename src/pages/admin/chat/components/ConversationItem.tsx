import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { Conversation } from '../types';
import { getAvatarGradient } from '../constants';

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onSelect: (id: string) => void;
  formatTime: (iso: string) => string;
}

function ConversationItemInner({
  conversation,
  isSelected,
  onSelect,
  formatTime,
}: ConversationItemProps) {
  const { id, customerName, lastMessage, lastMessageTime, unreadCount, hasUnread, isOnline } = conversation;
  const isUnread = !!(hasUnread || (unreadCount && unreadCount > 0));

  const gradient = useMemo(() => getAvatarGradient(customerName), [customerName]);
  const initials = useMemo(
    () =>
      (customerName || 'Customer')
        .split(' ')
        .map((n) => n[0] || '')
        .join('')
        .toUpperCase()
        .slice(0, 2) || '?',
    [customerName]
  );
  const timeStr = useMemo(() => formatTime(lastMessageTime), [lastMessageTime, formatTime]);

  return (
    <motion.button
      layout
      whileTap={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}
      onClick={() => onSelect(id)}
      className={cn(
        'w-full px-4 py-3 flex items-start gap-4 transition-all duration-300',
        'border-l-[3px] text-left relative group my-0.5 rounded-xl mx-2 w-[calc(100%-1rem)]',
        isSelected
          ? 'conv-item-selected'
          : isUnread 
            ? 'border-l-blue-500 bg-white shadow-sm' 
            : 'border-l-transparent bg-transparent hover:bg-gray-100/80'
      )}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0 mt-0.5">
        <div
          className={cn(
            'w-12 h-12 rounded-full flex items-center justify-center text-white',
            'text-sm font-black shadow-md select-none bg-gradient-to-br transition-transform group-hover:scale-105',
            gradient
          )}
        >
          {initials}
        </div>
        {isOnline !== false && (
          <span className="online-dot absolute bottom-0.5 right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full shadow-sm" />
        )}
      </div>

      {/* Text Content */}
      <div className="flex-1 min-w-0 py-0.5 [backface-visibility:hidden] [-webkit-font-smoothing:subpixel-antialiased]">
        <div className="flex items-center justify-between mb-1">
          <span
            className={cn(
              'text-sm truncate transition-colors',
              isUnread ? 'font-black text-gray-900' : 'font-semibold text-gray-600'
            )}
          >
            {customerName}
          </span>
          <span
            className={cn(
              'text-[10px] flex-shrink-0 ml-2 transition-colors',
              isUnread ? 'text-[var(--color-primary)] font-black' : 'text-gray-400'
            )}
          >
            {timeStr}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <p
            className={cn(
              'text-[13px] truncate flex-1 leading-snug transition-colors',
              isUnread ? 'text-gray-900 font-bold' : 'text-gray-500 font-medium'
            )}
          >
            {lastMessage}
          </p>

          <div className="flex items-center gap-2 flex-shrink-0">
            {isUnread && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-2.5 h-2.5 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"
              />
            )}
            
            {unreadCount !== undefined && unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="min-w-[18px] h-4.5 px-1.5 flex items-center justify-center
                           bg-blue-600 text-white text-[9px] font-black rounded-full shadow-sm"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </motion.span>
            )}
          </div>
        </div>
      </div>
    </motion.button>
  );
}

export const ConversationItem = memo(ConversationItemInner);
ConversationItem.displayName = 'ConversationItem';
export default ConversationItem;
