import { memo, useMemo } from 'react';
import { Check, CheckCheck, Clock, AlertCircle, CalendarClock, MapPin, Pin } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Message } from '../types';
import { getAvatarGradient } from '../constants';
import { formatAppointmentTimeLabel } from '@/utils/chatPayload';

interface MessageBubbleProps {
  message: Message;
  formatTime: (iso: string) => string;
  isLastOutgoing?: boolean;
  onRetry?: (message: Message) => void;
}

const isIdentifierLike = (value?: string): boolean => {
  if (!value) return true;
  const trimmed = value.trim();
  if (!trimmed) return true;

  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (uuidPattern.test(trimmed)) return true;

  const longTokenPattern = /^[A-Za-z0-9_-]{16,}$/;
  return longTokenPattern.test(trimmed);
};

const STATUS_ICON = {
  sending:   <Clock       className="h-3 w-3 text-gray-300"                   />,
  sent:      <Check       className="h-3 w-3 text-gray-300"                   />,
  delivered: <CheckCheck  className="h-3 w-3 text-gray-300"                   />,
  read:      <CheckCheck  className="h-3 w-3 text-[var(--color-primary)]"     />,
  failed:    <AlertCircle className="h-3 w-3 text-red-400"                    />,
};

const STATUS_LABEL: Record<NonNullable<Message['status']>, string> = {
  sending: 'Sending',
  sent: 'Sent',
  delivered: 'Delivered',
  read: 'Seen',
  failed: 'Not sent',
};

function MessageBubbleInner({ message, formatTime, isLastOutgoing = false, onRetry }: MessageBubbleProps) {
  const { content, timestamp, senderRole, senderName, status, attachments } = message;
  const isAdmin = senderRole === 'admin';
  const hasText = content.trim().length > 0;
  const appointment = message.appointment;
  const resolvedStatus = status ?? 'sent';
  const canRetry = isAdmin && resolvedStatus === 'failed' && !!onRetry && isLastOutgoing;
  const showMessengerSignal = isAdmin && isLastOutgoing;

  const imageAttachment = useMemo(
    () => attachments?.find((attachment) => attachment.type === 'image' && !!attachment.url),
    [attachments],
  );

  const safeSenderName = senderName || 'User';
  const displaySenderName = useMemo(() => {
    if (isAdmin) return 'Support';
    return isIdentifierLike(safeSenderName) ? 'Customer' : safeSenderName;
  }, [isAdmin, safeSenderName]);
  const avatarGradient = useMemo(() => getAvatarGradient(displaySenderName), [displaySenderName]);
  const initial = displaySenderName.charAt(0).toUpperCase();
  const timeStr        = useMemo(() => formatTime(timestamp), [timestamp, formatTime]);
  const appointmentTime = useMemo(
    () => (appointment ? formatAppointmentTimeLabel(appointment.scheduledAt) : ''),
    [appointment],
  );

  return (
    <div
      className={cn(
        'flex items-end gap-2.5 w-full',
        isAdmin ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <div
        title={displaySenderName}
        className={cn(
          'w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center',
          'text-[11px] font-bold shadow-sm mb-4 select-none',
          isAdmin ? `bg-gradient-to-br ${avatarGradient} text-white` : 'bg-gray-200 text-gray-600'
        )}
      >
        {isAdmin ? 'A' : initial}
      </div>

      {/* Content column */}
      <div
        className={cn(
          'flex flex-col max-w-[68%] gap-1',
          isAdmin ? 'items-end msg-anim-admin' : 'items-start msg-anim-customer'
        )}
      >
        {imageAttachment && (
          <div
            className={cn(
              'overflow-hidden shadow-sm border',
              isAdmin
                ? 'rounded-xl rounded-br-md border-black/5'
                : 'rounded-xl rounded-bl-md border-gray-200 bg-white',
            )}
          >
            <img
              src={imageAttachment.url}
              alt={imageAttachment.fileName || 'Attached image'}
              className="max-w-[260px] max-h-[260px] object-cover"
              loading="lazy"
            />
          </div>
        )}

        {appointment && (
          <div
            className={cn(
              'w-full rounded-xl border px-3 py-2.5 shadow-sm',
              isAdmin
                ? 'bg-emerald-600/95 text-white border-emerald-500'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200',
            )}
          >
            <div className="flex items-center gap-1.5 text-[11px] font-semibold">
              <Pin className="h-3.5 w-3.5" />
              Lich hen tham dinh da ghim
            </div>

            <div className="mt-2 space-y-1.5 text-[12px]">
              <p className="flex items-center gap-1.5">
                <CalendarClock className="h-3.5 w-3.5" />
                {appointmentTime}
              </p>
              {appointment.location && (
                <p className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {appointment.location}
                </p>
              )}
              {appointment.note && (
                <p className="text-[11px] opacity-90">{appointment.note}</p>
              )}
            </div>
          </div>
        )}

        {/* Bubble */}
        {hasText && (
          <div
            className={cn(
              'relative px-3.5 py-2 rounded-xl text-sm leading-relaxed shadow-sm',
              'whitespace-pre-wrap break-words',
              isAdmin
                ? 'bg-gradient-to-br from-[#4988c4] to-[#3a73a8] text-white rounded-br-md bubble-admin'
                : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md bubble-customer'
            )}
          >
            {content}
          </div>
        )}

        {/* Time + status */}
        <div
          className={cn(
            'flex items-center gap-1 text-[9px] text-gray-400 px-1 whitespace-nowrap leading-none',
            isAdmin ? 'self-end' : 'self-start'
          )}
        >
          <span>{timeStr}</span>
          {showMessengerSignal && (
            <>
              {STATUS_ICON[resolvedStatus]}
              <span>{STATUS_LABEL[resolvedStatus]}</span>
            </>
          )}
        </div>

        {canRetry && (
          <button
            type="button"
            onClick={() => onRetry?.(message)}
            className="text-[9px] text-rose-500 hover:text-rose-600 px-1 self-end whitespace-nowrap leading-none"
          >
            Failed to send - Tap to retry
          </button>
        )}
      </div>
    </div>
  );
}

export const MessageBubble = memo(MessageBubbleInner);
MessageBubble.displayName = 'MessageBubble';
export default MessageBubble;
