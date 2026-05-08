import {
  memo,
  useRef,
  useState,
  useCallback,
  useEffect,
} from 'react';
import { Send, Paperclip, Smile, Image as ImageIcon, Zap, X, CalendarClock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { useAdminTradeInOrderDetail } from '@/hooks/queries/useTradeInOrder';
import { formatNumber, unformatNumber } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { QUICK_REPLIES, MAX_MESSAGE_LENGTH } from '../constants';
import type { ChatPayloadAppointment } from '@/utils/chatPayload';

const COMMON_EMOJIS = [
  '😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😍', '🤩', '😘', '😋', '😎', 
  '👍', '👎', '👌', '🤝', '👋', '🙌', '👏', '🙏', '❤️', '✨', '🔥', '💡',
  '💰', '📦', '✅', '❌', '🔄', '💎', '🏠', '🛠️', '📞', '📅', '🚀', '🎁'
];

interface MessageInputProps {
  draft: string;
  isSending: boolean;
  uploadProgress?: number | null;
  onDraftChange: (val: string) => void;
  onSend: (payload: { text: string; imageFile?: File | null; appointment?: ChatPayloadAppointment }) => void | Promise<void>;
  onTyping?: (isTyping: boolean) => void;
  tradeInOrderId?: string | null;
}

function MessageInputInner({
  draft,
  isSending,
  uploadProgress = null,
  onDraftChange,
  onSend,
  onTyping,
  tradeInOrderId,
}: MessageInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastTypingSignal = useRef<boolean>(false);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [charCount, setCharCount] = useState(0);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [isAppointmentOpen, setIsAppointmentOpen] = useState(false);
  const [appointmentDateTime, setAppointmentDateTime] = useState('');
  const [appointmentLocation, setAppointmentLocation] = useState('');
  const [appointmentNote, setAppointmentNote] = useState('');
  const [appointmentTradeInPrice, setAppointmentTradeInPrice] = useState('');
  const [appointmentAmountToPay, setAppointmentAmountToPay] = useState('');

  // Fetch trade-in order for validation if ID is provided
  const { data: tradeInOrder } = useAdminTradeInOrderDetail(tradeInOrderId || '', {
    enabled: !!tradeInOrderId
  });

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

  const clearImagePreview = useCallback(() => {
    if (previewImageUrl) {
      URL.revokeObjectURL(previewImageUrl);
    }
    setPreviewImageUrl(null);
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [previewImageUrl]);

  const handleSend = useCallback(async () => {
    const normalizedText = draft.trim();
    if ((!normalizedText && !selectedImage) || isSending) return;

    try {
      await Promise.resolve(onSend({ text: normalizedText, imageFile: selectedImage }));

      onDraftChange('');
      setCharCount(0);
      clearTimeout(typingTimeout.current);
      lastTypingSignal.current = false;
      onTyping?.(false);
      clearImagePreview();

      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.focus();
      }
    } catch (error) {
      console.error('[Chat] Failed to send message:', error);
    }
  }, [draft, selectedImage, isSending, onSend, onDraftChange, onTyping, clearImagePreview]);

  const resetAppointmentDraft = useCallback(() => {
    setAppointmentDateTime('');
    setAppointmentLocation('');
    setAppointmentNote('');
    setAppointmentTradeInPrice('');
    setAppointmentAmountToPay('');
    setIsAppointmentOpen(false);
  }, []);

  const handlePinAppointment = useCallback(async () => {
    if (isSending) return;
    
    const normalizedDateTime = appointmentDateTime.trim();
    const normalizedNote = appointmentNote.trim();
    const normalizedLocation = appointmentLocation.trim();
    const tradeInPrice = appointmentTradeInPrice.trim() ? unformatNumber(appointmentTradeInPrice) : undefined;
    const amountToPay = appointmentAmountToPay.trim() ? unformatNumber(appointmentAmountToPay) : undefined;

    // Check if we have at least something
    if (!normalizedDateTime && !normalizedLocation && !normalizedNote && tradeInPrice === undefined && amountToPay === undefined) {
      return;
    }

    // Validation for price if order is available
    if (tradeInOrder && tradeInPrice !== undefined) {
      const min = tradeInOrder.minTradeInPrice || 0;
      const max = tradeInOrder.maxTradeInPrice || 0;
      if (tradeInPrice < min || tradeInPrice > max) {
        toast.error(`Price must be between ${new Intl.NumberFormat('vi-VN').format(min)}đ and ${new Intl.NumberFormat('vi-VN').format(max)}đ`);
        return;
      }
    }

    let isoDate: string | undefined = undefined;
    if (normalizedDateTime) {
      const scheduledAt = new Date(normalizedDateTime);
      if (!Number.isNaN(scheduledAt.getTime())) {
        isoDate = scheduledAt.toISOString();
      }
    }

    const appointmentPayload: ChatPayloadAppointment = {
      kind: 'appointment',
      scheduledAt: isoDate,
      location: normalizedLocation || undefined,
      note: normalizedNote || undefined,
      tradeInPrice,
      amountToPay,
      pinned: true,
    };

    const fallbackText = isoDate 
      ? `Lich hen tham dinh: ${new Date(isoDate).toLocaleString('vi-VN')}`
      : 'Giao thuc thu mua duoc thiet lap';

    await Promise.resolve(onSend({
      text: normalizedNote || fallbackText,
      appointment: appointmentPayload,
      imageFile: null,
    }));

    resetAppointmentDraft();
  }, [
    appointmentDateTime,
    appointmentLocation,
    appointmentNote,
    appointmentTradeInPrice,
    appointmentAmountToPay,
    tradeInOrder,
    isSending,
    onSend,
    resetAppointmentDraft,
  ]);

  const handleEmojiSelect = useCallback((emoji: string) => {
    const el = textareaRef.current;
    if (!el) {
      onDraftChange(draft + emoji);
      return;
    }

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const text = draft;
    const before = text.substring(0, start);
    const after = text.substring(end);
    const newVal = before + emoji + after;

    onDraftChange(newVal);
    setCharCount(newVal.length);

    // Reposition cursor after the emoji
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + emoji.length, start + emoji.length);
    }, 0);
  }, [draft, onDraftChange]);

  /* ---- Keyboard send -------------------------------------- */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleImagePick = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (previewImageUrl) {
      URL.revokeObjectURL(previewImageUrl);
    }

    setSelectedImage(file);
    setPreviewImageUrl(URL.createObjectURL(file));
  }, [previewImageUrl]);

  useEffect(() => {
    return () => {
      if (previewImageUrl) {
        URL.revokeObjectURL(previewImageUrl);
      }
    };
  }, [previewImageUrl]);

  const isOverLimit = charCount > MAX_MESSAGE_LENGTH * 0.9;
  const canSend = !!draft.trim() || !!selectedImage;

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

      {/* Image preview */}
      {previewImageUrl && (
        <div className="mb-2.5 rounded-lg border border-gray-200 bg-gray-50/80 p-2 flex items-end gap-2">
          <div className="relative">
            <img
              src={previewImageUrl}
              alt="Selected"
              className="w-14 h-14 rounded-md object-cover border border-gray-200"
            />
            <button
              type="button"
              onClick={clearImagePreview}
              disabled={isSending}
              className="absolute -top-2 -right-2 rounded-full bg-gray-800 text-white p-0.5 hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Remove image"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-gray-500 truncate max-w-[220px]">{selectedImage?.name}</p>
            {isSending && uploadProgress !== null && (
              <>
                <p className="text-[10px] text-gray-500 mt-1">Uploading {Math.round(uploadProgress)}%</p>
                <div className="mt-1 h-1.5 w-full rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className="h-full bg-[var(--color-primary)] transition-all duration-150"
                    style={{ width: `${Math.max(5, Math.min(100, uploadProgress))}%` }}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Input bar */}
      <div className="chat-input-wrapper flex items-end gap-2 border border-gray-200 rounded-xl bg-gray-50/60 px-3 py-2">
        {/* Tool buttons */}
        <div className="flex items-center flex-shrink-0 mb-0.5">
          <Button
            variant="ghost" size="sm"
            className="h-7 w-7 p-0 rounded-lg text-gray-400 hover:text-[var(--color-primary)] hover:bg-blue-50 transition-all"
            title="Attach file"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSending}
          >
            <Paperclip className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost" size="sm"
            className="h-7 w-7 p-0 rounded-lg text-gray-400 hover:text-[var(--color-primary)] hover:bg-blue-50 transition-all"
            title="Upload image"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSending}
          >
            <ImageIcon className="h-3.5 w-3.5" />
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost" size="sm"
                className="h-7 w-7 p-0 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-50 transition-all"
                title="Emoji"
                disabled={isSending}
              >
                <Smile className="h-3.5 w-3.5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              align="start" 
              side="top" 
              className="w-[280px] p-2 rounded-2xl shadow-xl border-gray-100 bg-white"
            >
              <div className="grid grid-cols-8 gap-1">
                {COMMON_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleEmojiSelect(emoji)}
                    className="h-8 w-8 flex items-center justify-center text-lg hover:bg-gray-100 rounded-lg transition-colors active:scale-90"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Quick replies */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost" size="sm"
                className="h-7 w-7 p-0 rounded-lg text-gray-400 hover:text-violet-500 hover:bg-violet-50 transition-all"
                title="Quick replies"
                disabled={isSending}
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
                    disabled={isSending}
                    className="w-full text-left text-xs text-gray-700 px-2.5 py-2 rounded-lg
                               hover:bg-blue-50 hover:text-[var(--color-primary)] transition-colors truncate"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <Popover open={isAppointmentOpen} onOpenChange={setIsAppointmentOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost" size="sm"
                className="h-7 w-7 p-0 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
                title="Pin appointment"
                disabled={isSending}
              >
                <CalendarClock className="h-3.5 w-3.5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              side="top"
              className="w-80 p-0 overflow-hidden rounded-[24px] shadow-2xl border-none bg-white ring-1 ring-black/[0.05]"
            >
              <div className="p-5 bg-slate-50/50 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shadow-sm">
                    <CalendarClock className="h-5 w-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900 tracking-tight">SET PROTOCOL</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Administrative Pin</p>
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Event Horizon</label>
                    <input
                      type="datetime-local"
                      value={appointmentDateTime}
                      onChange={(event) => setAppointmentDateTime(event.target.value)}
                      className="w-full rounded-xl bg-slate-50 border-0 px-3 py-2.5 text-xs text-slate-700 focus:ring-2 focus:ring-slate-500/20 focus:bg-white transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Operations Hub</label>
                    <input
                      type="text"
                      value={appointmentLocation}
                      onChange={(event) => setAppointmentLocation(event.target.value)}
                      placeholder="Site address"
                      className="w-full rounded-xl bg-slate-50 border-0 px-3 py-2.5 text-xs text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-slate-500/20 focus:bg-white transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Trade-in Price</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formatNumber(appointmentTradeInPrice)}
                        onChange={(event) => setAppointmentTradeInPrice(event.target.value)}
                        placeholder="0"
                        className="w-full rounded-xl bg-slate-50 border-0 px-3 py-2.5 text-xs font-bold text-slate-900 placeholder:text-slate-300 focus:ring-2 focus:ring-slate-500/20 focus:bg-white transition-all outline-none pr-8"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-300">đ</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Net Balance</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formatNumber(appointmentAmountToPay)}
                        onChange={(event) => setAppointmentAmountToPay(event.target.value)}
                        placeholder="0"
                        className="w-full rounded-xl bg-slate-50 border-0 px-3 py-2.5 text-xs font-bold text-slate-900 placeholder:text-slate-300 focus:ring-2 focus:ring-slate-500/20 focus:bg-white transition-all outline-none pr-8"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-300">đ</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 border-t border-slate-50 pt-4">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Special Directives</label>
                  <input
                    type="text"
                    value={appointmentNote}
                    onChange={(event) => setAppointmentNote(event.target.value)}
                    placeholder="Instructions for the client"
                    className="w-full rounded-xl bg-slate-50 border-0 px-3 py-2.5 text-xs text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-slate-500/20 focus:bg-white transition-all outline-none"
                  />
                </div>

                <Button
                  type="button"
                  className="w-full h-10 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 shadow-lg transition-all active:scale-[0.98] mt-2"
                  disabled={isSending}
                  onClick={handlePinAppointment}
                >
                  Pin Protocol
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-gray-200 self-center flex-shrink-0" />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleImagePick}
          className="hidden"
          disabled={isSending}
        />

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
          {canSend ? (
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
