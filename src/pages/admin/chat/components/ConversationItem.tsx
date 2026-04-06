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
  const { id, customerName, lastMessage, lastMessageTime, unreadCount, isOnline } = conversation;

  const gradient = useMemo(() => getAvatarGradient(customerName), [customerName]);
  const initials = useMemo(
    () =>
      customerName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2),
    [customerName]
  );
  const timeStr = useMemo(() => formatTime(lastMessageTime), [lastMessageTime, formatTime]);

  return (
    <motion.button
      layout
      whileHover={{ x: 2 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => onSelect(id)}
      className={cn(
        'w-full px-4 py-3.5 flex items-start gap-3 transition-colors duration-150',
        'border-b border-gray-100/80 border-l-[3px] text-left relative',
        isSelected
          ? 'conv-item-selected'
          : 'border-l-transparent bg-white hover:bg-blue-50/30'
      )}
    >
      {/* Unread pulse bar */}
      {unreadCount > 0 && !isSelected && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 bg-[var(--color-primary)] rounded-r-full" />
      )}

      {/* Avatar */}
      <div className="relative flex-shrink-0 mt-0.5">
        <div
          className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center text-white',
            'text-sm font-bold shadow-sm select-none bg-gradient-to-br',
            gradient
          )}
        >
          {initials}
        </div>
        {isOnline !== false && (
          <span className="online-dot absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full" />
        )}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span
            className={cn(
              'text-sm truncate',
              unreadCount > 0 ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'
            )}
          >
            {customerName}
          </span>
          <span
            className={cn(
              'text-[10px] flex-shrink-0 ml-2',
              unreadCount > 0 ? 'text-[var(--color-primary)] font-semibold' : 'text-gray-400'
            )}
          >
            {timeStr}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <p
            className={cn(
              'text-xs truncate flex-1 leading-snug',
              unreadCount > 0 ? 'text-gray-700 font-medium' : 'text-gray-400'
            )}
          >
            {lastMessage}
          </p>

          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              className="badge-unread flex-shrink-0 min-w-[18px] h-4 px-1 flex items-center justify-center
                         bg-[var(--color-primary)] text-white text-[10px] font-bold rounded-full"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.span>
          )}
        </div>
      </div>
    </motion.button>
  );
}

export const ConversationItem = memo(ConversationItemInner);
ConversationItem.displayName = 'ConversationItem';
export default ConversationItem;
