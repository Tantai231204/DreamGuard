import {
  memo,
  useRef,
  useState,
  useCallback,
  useEffect,
} from 'react';
import { Send, Paperclip, Smile, Image as ImageIcon, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { QUICK_REPLIES, MAX_MESSAGE_LENGTH } from '../constants';

interface MessageInputProps {
  draft: string;
  isSending: boolean;
  onDraftChange: (val: string) => void;
  onSend: () => void;
  onTyping?: (isTyping: boolean) => void;
}

function MessageInputInner({
  draft,
  isSending,
  onDraftChange,
  onSend,
  onTyping,
}: MessageInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastTypingSignal = useRef<boolean>(false);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [charCount, setCharCount] = useState(0);

  /* ---- Auto-grow textarea --------------------------------- */
  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
  }, []);

  useEffect(() => autoResize(), [draft, autoResize]);

  /* ---- Handle input --------------------------------------- */
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const val = e.target.value;
      if (val.length > MAX_MESSAGE_LENGTH) return;
      onDraftChange(val);
      setCharCount(val.length);

      // Emit typing events (throttled start, debounced stop)
      if (!lastTypingSignal.current) {
        lastTypingSignal.current = true;
        onTyping?.(true);
      }
      
      clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => {
        lastTypingSignal.current = false;
        onTyping?.(false);
      }, 2000);
    },
    [onDraftChange, onTyping]
  );

  /* ---- Keyboard send -------------------------------------- */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [draft, isSending]
  );

  const handleSend = useCallback(() => {
    if (!draft.trim() || isSending) return;
    onSend();
    setCharCount(0);
    clearTimeout(typingTimeout.current);
    lastTypingSignal.current = false;
    onTyping?.(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.focus();
    }
  }, [draft, isSending, onSend, onTyping]);

  const isOverLimit = charCount > MAX_MESSAGE_LENGTH * 0.9;

  return (
    <div className="flex-shrink-0 bg-white border-t border-gray-100 px-4 pt-2.5 pb-4">
      {/* Hint bar */}
      <div className="flex items-center justify-between h-5 mb-2 px-0.5">
        <p className="text-[10px] text-gray-300 select-none">
          <kbd className="px-1 py-0.5 bg-gray-50 border border-gray-200 rounded text-[10px] font-mono">Enter</kbd>
          {' '}to send ·{' '}
          <kbd className="px-1 py-0.5 bg-gray-50 border border-gray-200 rounded text-[10px] font-mono">⇧ Enter</kbd>
          {' '}new line
        </p>
        {charCount > 0 && (
          <span className={`text-[10px] tabular-nums ${isOverLimit ? 'text-amber-500' : 'text-gray-300'}`}>
            {charCount}/{MAX_MESSAGE_LENGTH}
          </span>
        )}
      </div>

      {/* Input bar */}
      <div className="chat-input-wrapper flex items-end gap-2 border border-gray-200 rounded-2xl bg-gray-50/60 px-3 py-2">
        {/* Tool buttons */}
        <div className="flex items-center flex-shrink-0 mb-0.5">
          <Button
            variant="ghost" size="sm"
            className="h-7 w-7 p-0 rounded-lg text-gray-400 hover:text-[var(--color-primary)] hover:bg-blue-50 transition-all"
            title="Attach file"
          >
            <Paperclip className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost" size="sm"
            className="h-7 w-7 p-0 rounded-lg text-gray-400 hover:text-[var(--color-primary)] hover:bg-blue-50 transition-all"
            title="Upload image"
          >
            <ImageIcon className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost" size="sm"
            className="h-7 w-7 p-0 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-50 transition-all"
            title="Emoji"
          >
            <Smile className="h-3.5 w-3.5" />
          </Button>

          {/* Quick replies */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost" size="sm"
                className="h-7 w-7 p-0 rounded-lg text-gray-400 hover:text-violet-500 hover:bg-violet-50 transition-all"
                title="Quick replies"
              >
                <Zap className="h-3.5 w-3.5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              side="top"
              className="w-72 p-2 rounded-xl shadow-xl border-gray-100"
            >
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-2 mb-1.5">
                Quick Replies
              </p>
              <div className="space-y-0.5 max-h-48 overflow-y-auto custom-scrollbar scrollbar-admin">
                {QUICK_REPLIES.map((reply) => (
                  <button
                    key={reply}
                    onClick={() => {
                      onDraftChange(reply);
                      setCharCount(reply.length);
                      textareaRef.current?.focus();
                    }}
                    className="w-full text-left text-xs text-gray-700 px-2.5 py-2 rounded-lg
                               hover:bg-blue-50 hover:text-[var(--color-primary)] transition-colors truncate"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-gray-200 self-center flex-shrink-0" />

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          rows={1}
          value={draft}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          disabled={isSending}
          className="flex-1 resize-none bg-transparent border-0 outline-none text-sm text-gray-800
                     placeholder:text-gray-400 leading-relaxed py-0.5 max-h-32 custom-scrollbar scrollbar-admin
                     disabled:opacity-50"
          style={{ minHeight: '28px' }}
        />

        {/* Send button */}
        <AnimatePresence mode="wait">
          {draft.trim() ? (
            <motion.button
              key="active"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              onClick={handleSend}
              disabled={isSending}
              className="flex-shrink-0 h-8 w-8 rounded-xl flex items-center justify-center
                         bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-hover)]
                         text-white shadow-md hover:shadow-lg transition-shadow disabled:opacity-60"
            >
              {isSending ? (
                <span className="flex gap-0.5">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1 h-1 bg-white rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </span>
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
            </motion.button>
          ) : (
            <motion.div
              key="inactive"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.4 }}
              exit={{ scale: 0.6, opacity: 0 }}
              className="flex-shrink-0 h-8 w-8 rounded-xl flex items-center justify-center text-gray-400"
            >
              <Send className="h-3.5 w-3.5" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export const MessageInput = memo(MessageInputInner);
MessageInput.displayName = 'MessageInput';
export default MessageInput;
