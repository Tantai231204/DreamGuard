import { memo, useEffect, useRef, useCallback } from 'react';
import { ArrowDown, Loader2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageBubble } from './MessageBubble';
import type { Message } from '../types';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  formatTime: (iso: string) => string;
  formatDate: (iso: string) => string;
}

function MessageListInner({
  messages,
  isLoading,
  hasMore,
  onLoadMore,
  formatTime,
  formatDate,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevLenRef = useRef(0);

  /* ---- Auto-scroll to bottom on new messages -------------- */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const isNewMessage = messages.length > prevLenRef.current;
    prevLenRef.current = messages.length;

    // Only auto-scroll if user is near the bottom (< 120px away)
    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 120;

    if (isNewMessage && isNearBottom) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  /* ---- Group messages by date ----------------------------- */
  const grouped = messages.reduce<{ date: string; items: Message[] }[]>((acc, msg) => {
    const d = formatDate(msg.timestamp);
    if (acc.length === 0 || acc[acc.length - 1].date !== d) {
      acc.push({ date: d, items: [msg] });
    } else {
      acc[acc.length - 1].items.push(msg);
    }
    return acc;
  }, []);

  /* ---- Typing indicator placeholder ----------------------- */
  const lastTypingConvId = null; // wire from useSignalR if needed

  return (
    <div
      ref={containerRef}
      className="flex-1 min-h-0 overflow-y-auto chat-scrollbar relative"
      style={{ background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)' }}
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
                className={`h-10 rounded-2xl bg-gray-200 animate-pulse ${isRight ? 'rounded-br-sm' : 'rounded-bl-sm'}`}
                style={{ width: `${[45, 60, 38, 55, 42][i]}%` }}
              />
            </div>
          ))}
        </div>
      )}


      {/* Message groups */}
      {messages.length > 0 && (
        <div className="px-4 py-4 space-y-4">
          {grouped.map(({ date, items }) => (
            <div key={date}>
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
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Typing indicator (show when remote user is typing) */}
          {lastTypingConvId && (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="flex items-end gap-2.5"
              >
                <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-[10px] flex-shrink-0" />
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-3.5 py-2.5 flex items-center gap-1">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
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

      {/* Scroll-to-bottom FAB */}
      <button
        onClick={scrollToBottom}
        className="absolute bottom-4 right-4 w-8 h-8 bg-white border border-gray-200 rounded-full
                   shadow-md flex items-center justify-center text-gray-500 hover:text-[var(--color-primary)]
                   hover:border-[var(--color-primary)] transition-all opacity-60 hover:opacity-100"
        title="Scroll to bottom"
      >
        <ArrowDown className="h-4 w-4" />
      </button>
    </div>
  );
}

export const MessageList = memo(MessageListInner);
MessageList.displayName = 'MessageList';
export default MessageList;
