import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { MessageCircle, X, Minus, Send, Image as ImageIcon, Phone, Video, MoreHorizontal, CalendarClock, MapPin, Pin, Clock3, Check, AlertCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useFloatingChat } from './useFloatingChat';
import { formatAppointmentTimeLabel } from '@/utils/chatPayload';

const timeFormatter = new Intl.DateTimeFormat('en-US', {
  hour: '2-digit',
  minute: '2-digit',
});

/**
 * Format ISO date string to compact time (e.g., "10:05 AM")
 */
function formatTime(isoString: string) {
  const date = new Date(isoString);
  return timeFormatter.format(date);
}

// ----------------------------------------------------------------------
// Memoized Message Bubble for Performance Optimization
// ----------------------------------------------------------------------
const MessageBubble = React.memo(({
  msg,
  isAdmin,
  showAvatar,
  isLastOutgoing,
  onRetry,
}: {
  msg: import('./useFloatingChat').ChatMessage;
  isAdmin: boolean;
  showAvatar: boolean;
  isLastOutgoing: boolean;
  onRetry: (messageId: string) => void;
}) => {
  const timeStr = formatTime(msg.createdAt);
  const canRetry = !isAdmin && msg.status === 'failed';
  const showMessengerSignal = !isAdmin && isLastOutgoing;
  const appointment = msg.appointment;
  const appointmentTime = appointment ? formatAppointmentTimeLabel(appointment.scheduledAt) : '';

  const statusSignal = !isAdmin
    ? {
      sending: { icon: <Clock3 className="h-3 w-3" />, label: 'Sending' },
      sent: { icon: <Check className="h-3 w-3" />, label: 'Sent' },
      failed: { icon: <AlertCircle className="h-3 w-3" />, label: 'Not sent' },
    }[msg.status]
    : null;

  return (
    <div className={`flex items-end gap-2.5 ${isAdmin ? 'justify-start' : 'justify-end'}`}>
      {/* Admin Avatar */}
      {isAdmin && (
        <div className="w-7 h-7 flex-shrink-0">
          {showAvatar ? (
            <img
              src="https://ui-avatars.com/api/?name=Dream+Guard&background=0D8ABC&color=fff"
              alt="Admin"
              className="w-full h-full rounded-full"
            />
          ) : null}
        </div>
      )}

      <div
        className={`group relative flex flex-col max-w-[68%] ${isAdmin ? 'items-start' : 'items-end'
          }`}
      >
        {/* Optional Image */}
        {msg.imageUrl && (
          <div className={`mb-1 overflow-hidden border border-black/5 ${isAdmin ? 'rounded-xl rounded-bl-md' : 'rounded-xl rounded-br-md'}`}>
            <img
              src={msg.imageUrl}
              alt="Attached file"
              className="w-full max-w-[260px] max-h-[260px] object-cover cursor-pointer hover:opacity-90 transition-opacity bg-gray-100"
              loading="lazy"
            />
          </div>
        )}

        {/* Text Bubble */}
        {msg.text && (
          <div
            className={`relative px-3.5 py-2 text-[14px] leading-relaxed shadow-sm ${isAdmin
              ? 'bg-white text-gray-800 border border-gray-100 rounded-xl rounded-bl-md'
              : 'bg-primary text-white border-transparent rounded-xl rounded-br-md'
              }`}
          >
            {msg.text}
          </div>
        )}

        {appointment && (
          <div
            className={`mt-1 w-full rounded-xl border px-3 py-2.5 text-[12px] shadow-sm ${
              isAdmin
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-emerald-600/95 text-white border-emerald-500'
            }`}
          >
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide">
              <Pin className="h-3.5 w-3.5" />
              Lich hen tham dinh da ghim
            </div>
            <div className="mt-2 space-y-1">
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
              {appointment.note && <p className="text-[11px] opacity-90">{appointment.note}</p>}
            </div>
          </div>
        )}

        <div className={`mt-1 px-1 h-3.5 flex items-center ${isAdmin ? 'self-start' : 'self-end'}`}>
          <span className="inline-flex items-center gap-1 text-[9px] text-gray-400 whitespace-nowrap leading-none">
            <span>{timeStr}</span>
            {showMessengerSignal && statusSignal && (
              <>
                <span className="text-gray-300">·</span>
                {statusSignal.icon}
                <span>{statusSignal.label}</span>
              </>
            )}
          </span>
        </div>

        {canRetry && (
          <button
            type="button"
            onClick={() => onRetry(msg.id)}
            className="text-[9px] text-rose-500 hover:text-rose-600 px-1 self-end whitespace-nowrap leading-none"
          >
            Failed to send - Tap to retry
          </button>
        )}
      </div>
    </div>
  );
});

export default function FloatingChat() {
  const {
    isOpen,
    openChat,
    closeChat,
    messages,
    isSending,
    uploadProgress,
    isTyping,
    sendTypingSignal,
    sendMessage,
    retryFailedMessage,
    messagesEndRef,
  } = useFloatingChat();

  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasTypingSignalRef = useRef(false);

  const queueTypingStop = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (hasTypingSignalRef.current) {
        sendTypingSignal(false);
        hasTypingSignalRef.current = false;
      }
    }, 1500);
  }, [sendTypingSignal]);

  const handleInputChange = useCallback(
    (value: string) => {
      setInputText(value);

      const hasText = value.trim().length > 0;

      if (!hasText) {
        if (hasTypingSignalRef.current) {
          sendTypingSignal(false);
          hasTypingSignalRef.current = false;
        }
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = null;
        }
        return;
      }

      if (!hasTypingSignalRef.current) {
        sendTypingSignal(true);
        hasTypingSignalRef.current = true;
      }

      queueTypingStop();
    },
    [queueTypingStop, sendTypingSignal],
  );

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (hasTypingSignalRef.current) {
        sendTypingSignal(false);
      }
    };
  }, [sendTypingSignal]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() && !selectedFile) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    if (hasTypingSignalRef.current) {
      sendTypingSignal(false);
      hasTypingSignalRef.current = false;
    }

    try {
      // Await sending so we disable button during mutation
      await sendMessage(inputText, selectedFile);

      // Clear input
      setInputText('');
      setSelectedFile(null);
      setPreviewImage(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      console.error('[FloatingChat] Send failed:', error);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const removePreview = () => {
    if (previewImage) {
      URL.revokeObjectURL(previewImage);
    }
    setSelectedFile(null);
    setPreviewImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  useEffect(() => {
    return () => {
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  const pinnedAppointmentMessage = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      const candidate = messages[i];
      if (candidate.appointment && candidate.appointment.pinned !== false) {
        return candidate;
      }
    }
    return null;
  }, [messages]);

  const latestOutgoingMessageId = useMemo(() => {
    for (let index = messages.length - 1; index >= 0; index -= 1) {
      if (messages[index].role === 'user') {
        return messages[index].id;
      }
    }
    return null;
  }, [messages]);

  const canSend = !!inputText.trim() || !!previewImage;

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => openChat()}
            className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-xl shadow-primary/30 transition-colors focus:outline-none"
            title="Chat with DreamGuard"
          >
            <MessageCircle size={28} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9, transition: { duration: 0.2 } }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 right-4 sm:bottom-4 sm:right-6 lg:right-10 z-[100] flex w-[350px] sm:w-[380px] max-w-[calc(100vw-2rem)] flex-col rounded-none border border-gray-200 bg-white shadow-2xl overflow-hidden h-[500px] max-h-[80vh]"
          >
            {/* Header (Facebook Messenger Style) */}
            <div className="flex items-center justify-between bg-white border-b px-3 py-3 shadow-sm z-10 relative">
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 shrink-0">
                  <img
                    src="/images/logo.png"
                    alt="DreamGuard Admin"
                    className="h-full w-full rounded-full object-cover border border-gray-100"
                    onError={(e) => {
                      e.currentTarget.src = "https://ui-avatars.com/api/?name=Dream+Guard&background=0D8ABC&color=fff";
                    }}
                  />
                  <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500"></div>
                </div>
                <div className="flex flex-col">
                  <h3 className="text-[15px] font-semibold leading-none text-gray-900">DreamGuard Support</h3>
                  <span className="text-[12px] text-gray-500 mt-1">Typically replies instantly</span>
                </div>
              </div>

              <div className="flex items-center gap-1 text-primary">
                <button className="rounded-lg p-2 hover:bg-gray-100 transition-colors hidden sm:block" title="Call">
                  <Phone size={18} />
                </button>
                <button className="rounded-lg p-2 hover:bg-gray-100 transition-colors hidden sm:block" title="Video Chat">
                  <Video size={18} />
                </button>
                <button onClick={closeChat} className="rounded-lg p-2 hover:bg-gray-100 transition-colors" title="Minimize">
                  <Minus size={20} />
                </button>
                <button
                  onClick={closeChat}
                  className="rounded-lg p-2 hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
                  title="Close"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div
              className="flex-1 overflow-y-auto px-4 py-4 custom-scrollbar scrollbar-profile flex flex-col gap-3"
              style={{ background: 'linear-gradient(180deg, #eef1f5 0%, #e9edf3 100%)' }}
            >
              <div className="text-center text-xs text-gray-400 my-2">
                Today {new Date().toLocaleDateString()}
              </div>

              {pinnedAppointmentMessage?.appointment && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-3 shadow-sm text-emerald-800">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
                    <Pin className="h-3.5 w-3.5" />
                    Pinned Appointment
                  </div>
                  <div className="mt-2 space-y-1 text-[12px]">
                    <p className="flex items-center gap-1.5">
                      <CalendarClock className="h-3.5 w-3.5" />
                      {formatAppointmentTimeLabel(pinnedAppointmentMessage.appointment.scheduledAt)}
                    </p>
                    {pinnedAppointmentMessage.appointment.location && (
                      <p className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" />
                        {pinnedAppointmentMessage.appointment.location}
                      </p>
                    )}
                    {pinnedAppointmentMessage.appointment.note && (
                      <p className="text-[11px] text-emerald-700/90">{pinnedAppointmentMessage.appointment.note}</p>
                    )}
                  </div>
                </div>
              )}

              {messages.map((msg, idx) => {
                const isAdmin = msg.role === 'admin';
                const showAvatar = isAdmin && (idx === messages.length - 1 || messages[idx + 1]?.role !== 'admin');

                return (
                  <MessageBubble
                    key={msg.id}
                    msg={msg}
                    isAdmin={isAdmin}
                    showAvatar={showAvatar}
                    isLastOutgoing={msg.id === latestOutgoingMessageId}
                    onRetry={retryFailedMessage}
                  />
                );
              })}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex items-end gap-2.5 justify-start">
                  <div className="w-7 h-7 flex-shrink-0">
                    <img
                      src="https://ui-avatars.com/api/?name=Dream+Guard&background=0D8ABC&color=fff"
                      alt="Admin"
                      className="w-full h-full rounded-full"
                    />
                  </div>
                  <div className="bg-white border border-gray-100 shadow-sm rounded-xl rounded-bl-md px-3.5 py-2.5 flex items-center justify-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white px-3 py-3 border-t border-gray-100 relative z-20">
              {/* Image Preview Overlay */}
              <AnimatePresence>
                {previewImage && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute bottom-full left-0 w-full px-3 py-2 bg-white/95 backdrop-blur-md border-t shadow-[0_-5px_10px_rgba(0,0,0,0.02)] flex items-end gap-2"
                  >
                    <div className="relative inline-block border rounded-lg p-1 bg-gray-50 shadow-sm">
                      <img src={previewImage} alt="Preview" className="h-16 w-16 md:h-20 md:w-20 object-cover rounded-md" />
                      <button
                        onClick={removePreview}
                        disabled={isSending}
                        className="absolute -top-2 -right-2 bg-gray-800 text-white rounded-full p-0.5 hover:bg-gray-900 shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Remove image"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-gray-500 truncate">
                        {selectedFile?.name}
                      </div>
                      {isSending && uploadProgress !== null && (
                        <>
                          <div className="text-[10px] text-gray-500 mt-1">
                            Uploading {Math.round(uploadProgress)}%
                          </div>
                          <div className="mt-1 h-1.5 w-full rounded-full bg-gray-200 overflow-hidden">
                            <div
                              className="h-full bg-[var(--color-primary)] transition-all duration-150"
                              style={{ width: `${Math.max(5, Math.min(100, uploadProgress))}%` }}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <div className="flex items-center flex-shrink-0 mb-0.5">
                  <button
                    type="button"
                    className="h-7 w-7 inline-flex items-center justify-center p-0 rounded-lg text-gray-400 hover:text-[var(--color-primary)] hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    title="More options"
                    disabled={isSending}
                  >
                    <MoreHorizontal size={15} />
                  </button>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleImageSelect}
                    disabled={isSending}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isSending}
                    className="h-7 w-7 inline-flex items-center justify-center p-0 rounded-lg text-gray-400 hover:text-[var(--color-primary)] hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Attach an image"
                  >
                    <ImageIcon size={15} />
                  </button>
                </div>

                <div className="w-px h-5 bg-gray-200 self-center flex-shrink-0" />

                <div className="flex-1 min-h-[36px] border border-gray-200 bg-gray-50/70 rounded-xl flex items-center pr-1">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => handleInputChange(e.target.value)}
                    placeholder="Type a message..."
                    className="w-full bg-transparent border-0 focus:ring-0 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 outline-none"
                    autoComplete="off"
                    disabled={isSending}
                  />
                  <AnimatePresence mode="wait">
                    {canSend ? (
                      <motion.button
                        key="active"
                        type="submit"
                        initial={{ scale: 0.6, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.6, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                        disabled={isSending}
                        className="flex-shrink-0 h-8 w-8 rounded-xl flex items-center justify-center
                                   bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-hover)]
                                   text-white shadow-md hover:shadow-lg transition-shadow disabled:opacity-60"
                        title="Send"
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
              </form>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
