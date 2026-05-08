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
    () => (appointment?.scheduledAt ? formatAppointmentTimeLabel(appointment.scheduledAt) : ''),
    [appointment],
  );

  const formatCurrency = (val?: number) => {
    if (val === undefined) return '';
    return new Intl.NumberFormat('vi-VN').format(val) + ' đ';
  };

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
              'w-full min-w-[240px] rounded-2xl px-4 py-3.5 shadow-sm',
              isAdmin
                ? 'bg-emerald-600 text-white shadow-emerald-900/10'
                : 'bg-emerald-50/80 text-emerald-900 border-none',
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-6 h-6 rounded-lg flex items-center justify-center",
                  isAdmin ? "bg-white/20" : "bg-emerald-100"
                )}>
                  <Pin className="h-3 w-3" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-90">Pinned Protocol</span>
              </div>
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <div className="space-y-3">
              {(appointmentTime || appointment.location) && (
                <div className="space-y-2">
                  {appointmentTime && (
                    <div className="flex items-center gap-3">
                      <CalendarClock className="h-4 w-4 opacity-70" strokeWidth={2.5} />
                      <span className="text-[13px] font-bold tracking-tight">{appointmentTime}</span>
                    </div>
                  )}
                  
                  {appointment.location && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 mt-0.5 opacity-70" strokeWidth={2.5} />
                      <span className="text-[12px] font-medium leading-tight opacity-90">{appointment.location}</span>
                    </div>
                  )}
                </div>
              )}

              {(appointment.tradeInPrice !== undefined || appointment.amountToPay !== undefined) && (
                <div className={cn(
                  "p-3 rounded-xl space-y-2",
                  isAdmin ? "bg-black/10" : "bg-white/80 shadow-sm"
                )}>
                  {appointment.tradeInPrice !== undefined && (
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[9px] font-black uppercase tracking-wider opacity-60">Trade-in Price</span>
                      <span className="text-sm font-black tabular-nums">{formatCurrency(appointment.tradeInPrice)}</span>
                    </div>
                  )}
                  {appointment.amountToPay !== undefined && (
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[9px] font-black uppercase tracking-wider opacity-60">Net Balance</span>
                      <span className="text-sm font-black tabular-nums">{formatCurrency(appointment.amountToPay)}</span>
                    </div>
                  )}
                </div>
              )}

              {appointment.note && (
                <div className={cn(
                  "p-3 rounded-xl text-[11px] font-medium italic leading-relaxed",
                  isAdmin ? "bg-black/10 text-emerald-50" : "bg-white/60 text-emerald-800"
                )}>
                  "{appointment.note}"
                </div>
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
