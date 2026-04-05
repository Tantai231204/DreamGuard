import { memo, useMemo } from 'react';
import { Check, CheckCheck, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Message } from '../types';
import { getAvatarGradient } from '../constants';

interface MessageBubbleProps {
  message: Message;
  formatTime: (iso: string) => string;
}

const STATUS_ICON = {
  sending:   <Clock       className="h-3 w-3 text-gray-300"                   />,
  sent:      <Check       className="h-3 w-3 text-gray-300"                   />,
  delivered: <CheckCheck  className="h-3 w-3 text-gray-300"                   />,
  read:      <CheckCheck  className="h-3 w-3 text-[var(--color-primary)]"     />,
  failed:    <AlertCircle className="h-3 w-3 text-red-400"                    />,
};

function MessageBubbleInner({ message, formatTime }: MessageBubbleProps) {
  const { content, timestamp, senderRole, senderName, status } = message;
  const isAdmin = senderRole === 'admin';

  const avatarGradient = useMemo(() => getAvatarGradient(senderName), [senderName]);
  const initial        = senderName.charAt(0).toUpperCase();
  const timeStr        = useMemo(() => formatTime(timestamp), [timestamp, formatTime]);

  return (
    <div
      className={cn(
        'flex items-end gap-2.5 w-full group',
        isAdmin ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <div
        title={senderName}
        className={cn(
          'w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center',
          'text-[11px] font-bold shadow-sm mb-5 select-none',
          isAdmin ? `bg-gradient-to-br ${avatarGradient} text-white` : 'bg-gray-200 text-gray-600'
        )}
      >
        {isAdmin ? 'A' : initial}
      </div>

      {/* Content column */}
      <div
        className={cn(
          'flex flex-col max-w-[68%]',
          isAdmin ? 'items-end msg-anim-admin' : 'items-start msg-anim-customer'
        )}
      >
        {/* Sender label */}
        <span
          className={cn(
            'text-[10px] font-semibold mb-1 tracking-wide uppercase',
            isAdmin ? 'text-[var(--color-primary)] opacity-80 mr-1' : 'text-gray-400 ml-1'
          )}
        >
          {isAdmin ? 'Support' : senderName}
        </span>

        {/* Bubble */}
        <div
          className={cn(
            'relative px-3.5 py-2 rounded-2xl text-sm leading-relaxed shadow-sm',
            'whitespace-pre-wrap break-words',
            isAdmin
              ? 'bg-gradient-to-br from-[#4988c4] to-[#3a73a8] text-white rounded-br-sm bubble-admin'
              : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm bubble-customer'
          )}
        >
          {content}

          {/* Failed retry hint */}
          {status === 'failed' && (
            <span className="block text-[10px] text-red-300 mt-1">
              Failed to send — tap to retry
            </span>
          )}
        </div>

        {/* Time + status */}
        <div
          className={cn(
            'flex items-center gap-1 mt-1 text-[10px] text-gray-400',
            'opacity-0 group-hover:opacity-100 transition-opacity duration-200',
            isAdmin ? 'flex-row-reverse mr-1' : 'ml-1'
          )}
        >
          <span>{timeStr}</span>
          {isAdmin && STATUS_ICON[status ?? 'sent']}
        </div>
      </div>
    </div>
  );
}

export const MessageBubble = memo(MessageBubbleInner);
MessageBubble.displayName = 'MessageBubble';
export default MessageBubble;
