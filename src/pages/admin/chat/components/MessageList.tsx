import { memo, useEffect, useRef, useCallback, useState, useMemo } from 'react';
import { ArrowDown, Loader2, CalendarClock, MapPin, Pin } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageBubble } from './MessageBubble';
import type { Message } from '../types';
import { formatAppointmentTimeLabel } from '@/utils/chatPayload';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  isTyping?: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onRetryMessage?: (message: Message) => void;
  formatTime: (iso: string) => string;
  formatDate: (iso: string) => string;
}

function MessageListInner({
  messages,
  isLoading,
  isTyping = false,
  hasMore,
  onLoadMore,
  onRetryMessage,
  formatTime,
  formatDate,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevLenRef = useRef(0);
  const [showScrollFab, setShowScrollFab] = useState(false);

  /* ---- Scroll listener for FAB visibility (Throttled) ------- */
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    
    // Use requestAnimationFrame to avoid layout thrashing
    requestAnimationFrame(() => {
      if (!container) return;
      const isOffBottom = 
        container.scrollHeight - container.scrollTop - container.clientHeight > 300;
      setShowScrollFab(isOffBottom);
    });
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  /* ---- Auto-scroll to bottom on new messages -------------- */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const isNewMessage = messages.length > prevLenRef.current;
    prevLenRef.current = messages.length;

    if (isNewMessage) {
      const isNearBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight < 250;

      if (isNearBottom) {
        requestAnimationFrame(() => {
          bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        });
      }
    }
  }, [messages]);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    });
  }, []);

  /* ---- Group messages by date ----------------------------- */
  const grouped = useMemo(
    () => messages.reduce<{ date: string; items: Message[] }[]>((acc, msg) => {
      const d = formatDate(msg.timestamp);
      if (acc.length === 0 || acc[acc.length - 1].date !== d) {
        acc.push({ date: d, items: [msg] });
      } else {
        acc[acc.length - 1].items.push(msg);
      }
      return acc;
    }, []),
    [messages, formatDate],
  );

  const pinnedAppointmentMessage = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      const message = messages[i];
      if (message.appointment && message.appointment.pinned !== false) {
        return message;
      }
    }
    return null;
  }, [messages]);

  const latestOutgoingMessageId = useMemo(() => {
    for (let index = messages.length - 1; index >= 0; index -= 1) {
      if (messages[index].senderRole === 'admin') {
        return messages[index].id;
      }
    }
    return null;
  }, [messages]);

  return (
    <div
      ref={containerRef}
      className="flex-1 min-h-0 overflow-y-auto custom-scrollbar scrollbar-admin relative"
      style={{ background: 'linear-gradient(180deg, #eef1f5 0%, #e9edf3 100%)' }}
    >
      {/* Load more button */}
      {hasMore && (
        <div className="flex justify-center pt-4 pb-2">
          <button
            onClick={onLoadMore}
            disabled={isLoading}
            className="flex items-center gap-1.5 text-xs text-[var(--color-primary)] hover:underline
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <ArrowDown className="h-3 w-3 rotate-180" />
            )}
            Load earlier messages
          </button>
        </div>
      )}

      {/* Loading skeleton on initial load */}
      {isLoading && messages.length === 0 && (
        <div className="p-5 space-y-4">
          {([1, 0, 1, 0, 1] as const).map((isRight, i) => (
            <div key={i} className={`flex items-end gap-2.5 ${isRight ? 'flex-row-reverse' : ''}`}>
              <div className="w-7 h-7 rounded-full bg-gray-200 animate-pulse flex-shrink-0" />
              <div
                className={`h-10 rounded-xl bg-gray-200 animate-pulse ${isRight ? 'rounded-br-md' : 'rounded-bl-md'}`}
                style={{ width: `${[45, 60, 38, 55, 42][i]}%` }}
              />
            </div>
          ))}
        </div>
      )}


      {/* Message groups */}
      {messages.length > 0 && (
        <div className="px-4 py-4 space-y-4">
          {pinnedAppointmentMessage?.appointment && (
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm mb-2">
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
                <Pin className="h-3 w-3" />
                Pinned Appointment
              </div>
              <div className="space-y-2.5">
                {pinnedAppointmentMessage.appointment.scheduledAt && (
                  <p className="flex items-center gap-2 text-[12px] font-bold text-slate-700">
                    <CalendarClock className="h-4 w-4 text-slate-300" />
                    {formatAppointmentTimeLabel(pinnedAppointmentMessage.appointment.scheduledAt)}
                  </p>
                )}
                {pinnedAppointmentMessage.appointment.location && (
                  <p className="flex items-center gap-2 text-[12px] font-medium text-slate-600 leading-tight">
                    <MapPin className="h-4 w-4 text-slate-300" />
                    {pinnedAppointmentMessage.appointment.location}
                  </p>
                )}

                {(pinnedAppointmentMessage.appointment.tradeInPrice !== undefined || pinnedAppointmentMessage.appointment.amountToPay !== undefined) && (
                  <div className="pt-2.5 mt-2 border-t border-slate-100 space-y-1.5">
                    {pinnedAppointmentMessage.appointment.tradeInPrice !== undefined && (
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="font-bold uppercase tracking-widest opacity-40">Valuation</span>
                        <span className="font-black text-slate-900">
                          {new Intl.NumberFormat('vi-VN').format(pinnedAppointmentMessage.appointment.tradeInPrice)}đ
                        </span>
                      </div>
                    )}
                    {pinnedAppointmentMessage.appointment.amountToPay !== undefined && (
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="font-bold uppercase tracking-widest opacity-40">Net Balance</span>
                        <span className="font-black text-blue-700 text-xs">
                          {new Intl.NumberFormat('vi-VN').format(pinnedAppointmentMessage.appointment.amountToPay)}đ
                        </span>
                      </div>
                    )}
                  </div>
                )}
                
                {pinnedAppointmentMessage.appointment.note && (
                  <p className="text-[11px] text-slate-400 font-medium italic pt-1 line-clamp-2 border-t border-slate-50 mt-2">
                    &ldquo;{pinnedAppointmentMessage.appointment.note}&rdquo;
                  </p>
                )}
              </div>
            </div>
          )}

          {grouped.map(({ date, items }, groupIdx) => (
            <div key={`${date}-${groupIdx}`}>
              {/* Date separator */}
              <div className="flex items-center justify-center my-4">
                <span className="date-chip">{date}</span>
              </div>

              <div className="space-y-3">
                {items.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    formatTime={formatTime}
                    isLastOutgoing={msg.id === latestOutgoingMessageId}
                    onRetry={onRetryMessage}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Typing indicator (show when remote user is typing) */}
          {isTyping && (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="flex items-end gap-2.5"
              >
                <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-[10px] flex-shrink-0" />
                <div className="bg-white border border-gray-100 shadow-sm rounded-xl rounded-bl-md px-3.5 py-2.5 flex items-center justify-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                </div>
              </motion.div>
            </AnimatePresence>
          )}

          <div ref={bottomRef} />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && messages.length === 0 && (
        <div className="h-full flex items-center justify-center">
          <div className="text-center text-gray-400">
            <p className="text-sm font-medium">No messages yet</p>
            <p className="text-xs mt-1">Start the conversation below</p>
          </div>
        </div>
      )}

      {/* Scroll-to-bottom FAB: Floating at bottom center */}
      <AnimatePresence>
        {showScrollFab && (
          <motion.button
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.8 }}
            onClick={scrollToBottom}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 w-9 h-9 bg-white 
                       border border-gray-100 rounded-full shadow-2xl flex items-center justify-center 
                       text-[var(--color-primary)] hover:bg-blue-50 transition-colors z-20 group"
            title="Scroll to bottom"
          >
            <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
            
            {/* Soft pulse effect */}
            <span className="absolute inset-0 rounded-full bg-[var(--color-primary)] opacity-10 animate-ping pointer-events-none" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

export const MessageList = memo(MessageListInner);
MessageList.displayName = 'MessageList';
export default MessageList;
