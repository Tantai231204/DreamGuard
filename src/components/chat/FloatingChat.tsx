import React, { useState, useRef } from 'react';
import { MessageCircle, X, Minus, Send, Image as ImageIcon, Phone, Video, MoreHorizontal } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useFloatingChat } from './useFloatingChat';

/**
 * Format ISO date string to compact time (e.g., "10:05 AM")
 */
function formatTime(isoString: string) {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ----------------------------------------------------------------------
// Memoized Message Bubble for Performance Optimization
// ----------------------------------------------------------------------
const MessageBubble = React.memo(({ msg, isAdmin, showAvatar }: { msg: import('./useFloatingChat').ChatMessage; isAdmin: boolean; showAvatar: boolean }) => {
  const timeStr = formatTime(msg.createdAt);

  return (
    <div className={`flex items-end gap-2 ${isAdmin ? 'justify-start' : 'justify-end'}`}>
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
        className={`group relative flex flex-col max-w-[70%] ${isAdmin ? 'items-start' : 'items-end'
          }`}
      >
        {/* Optional Image */}
        {msg.imageUrl && (
          <div className={`mb-1 overflow-hidden border border-black/5 ${isAdmin ? 'rounded-2xl rounded-bl-sm' : 'rounded-2xl rounded-br-sm'}`}>
            <img
              src={msg.imageUrl}
              alt="Attached file"
              className="w-full max-w-[200px] object-cover cursor-pointer hover:opacity-90 transition-opacity bg-gray-100"
            />
          </div>
        )}

        {/* Text Bubble */}
        {msg.text && (
          <div
            className={`relative px-3.5 py-2 text-[14px] leading-relaxed shadow-sm ${isAdmin
              ? 'bg-white text-gray-800 border border-gray-100 rounded-2xl rounded-bl-none'
              : 'bg-primary text-white border-transparent rounded-2xl rounded-br-none'
              }`}
          >
            {msg.text}
          </div>
        )}

        <span className={`text-[10px] text-gray-400 mt-1 absolute ${isAdmin ? '-right-14' : '-left-14'} bottom-0 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap`}>
          {timeStr}
        </span>
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
    isLoading,
    sendMessage,
    messagesEndRef,
  } = useFloatingChat();

  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() && !selectedFile) return;

    // Await sending so we disable button during mutation
    await sendMessage(inputText, selectedFile);

    // Clear input
    setInputText('');
    setSelectedFile(null);
    setPreviewImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => setPreviewImage(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removePreview = () => {
    setSelectedFile(null);
    setPreviewImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

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
            className="fixed bottom-0 right-4 sm:bottom-4 sm:right-6 lg:right-10 z-[100] flex w-[350px] sm:w-[380px] max-w-[calc(100vw-2rem)] flex-col rounded-t-xl sm:rounded-2xl border border-gray-200 bg-white shadow-2xl overflow-hidden h-[500px] max-h-[80vh]"
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
                <button className="rounded-full p-2 hover:bg-gray-100 transition-colors hidden sm:block" title="Call">
                  <Phone size={18} />
                </button>
                <button className="rounded-full p-2 hover:bg-gray-100 transition-colors hidden sm:block" title="Video Chat">
                  <Video size={18} />
                </button>
                <button onClick={closeChat} className="rounded-full p-2 hover:bg-gray-100 transition-colors" title="Minimize">
                  <Minus size={20} />
                </button>
                <button
                  onClick={closeChat}
                  className="rounded-full p-2 hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
                  title="Close"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-4 bg-[#F0F2F5] custom-scrollbar scrollbar-profile flex flex-col gap-3">
              <div className="text-center text-xs text-gray-400 my-2">
                Today {new Date().toLocaleDateString()}
              </div>

              {messages.map((msg, idx) => {
                const isAdmin = msg.role === 'admin';
                const showAvatar = isAdmin && (idx === messages.length - 1 || messages[idx + 1]?.role !== 'admin');

                return (
                  <MessageBubble
                    key={msg.id}
                    msg={msg}
                    isAdmin={isAdmin}
                    showAvatar={showAvatar}
                  />
                );
              })}

              {/* Typing Indicator */}
              {isLoading && (
                <div className="flex items-end gap-2 justify-start">
                  <div className="w-7 h-7 flex-shrink-0">
                    <img
                      src="https://ui-avatars.com/api/?name=Dream+Guard&background=0D8ABC&color=fff"
                      alt="Admin"
                      className="w-full h-full rounded-full"
                    />
                  </div>
                  <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-bl-none px-4 py-3 flex items-center justify-center gap-1">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white px-3 py-3 border-t relative z-20">
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
                        className="absolute -top-2 -right-2 bg-gray-800 text-white rounded-full p-0.5 hover:bg-gray-900 shadow-md transition-colors"
                        title="Remove image"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <div className="text-xs font-medium text-gray-500 mb-2 truncate max-w-[150px]">
                      {selectedFile?.name}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                <div className="flex items-center text-primary/80 mb-1">
                  <button type="button" className="p-2 hover:bg-gray-100 hover:text-primary rounded-full transition-colors" title="More options">
                    <MoreHorizontal size={20} />
                  </button>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleImageSelect}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 hover:bg-gray-100 hover:text-primary rounded-full transition-colors"
                    title="Attach an image"
                  >
                    <ImageIcon size={20} />
                  </button>
                </div>

                <div className="flex-1 bg-[#F0F2F5] rounded-[20px] flex items-center pr-1 min-h-[40px]">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Aa"
                    className="w-full bg-transparent border-none focus:ring-0 px-4 py-2 text-[14px] text-gray-800 placeholder-gray-500 outline-none"
                    autoComplete="off"
                  />
                  <button
                    type="submit"
                    disabled={(!inputText.trim() && !previewImage) || isLoading}
                    className="p-1.5 mb-1 rounded-full text-white bg-primary hover:bg-primary/90 transition-colors disabled:bg-transparent disabled:text-primary/40"
                    title="Send"
                  >
                    <Send size={16} className="translate-x-[1px]" />
                  </button>
                </div>
              </form>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
