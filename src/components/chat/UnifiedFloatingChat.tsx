import React, { useState, useRef, memo, useMemo } from 'react';
import {
    MessageCircle, Sparkles, X, Send,
    CalendarClock, MapPin, Pin,
    Image as ImageIcon,
    Info
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useFloatingChat } from './useFloatingChat';
import type { ChatMessage } from './useFloatingChat';
import { useFloatingAIChat } from './useFloatingAIChat';
import type { AIChatMessage } from './useFloatingAIChat';
import { formatAppointmentTimeLabel } from '@/utils/chatPayload';
import { cn } from '@/lib/utils';

const timeFormatter = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
});

function formatTime(isoString: string) {
    return timeFormatter.format(new Date(isoString));
}

// ----------------------------------------------------------------------
// SHARED MESSAGE BUBBLE
// ----------------------------------------------------------------------
const MessageBubble = memo(({
    msg,
    mode,
    isFirstInGroup,
}: {
    msg: ChatMessage | AIChatMessage;
    mode: 'support' | 'ai';
    isFirstInGroup: boolean;
    onRetry?: (id: string) => void;
}) => {
    const isIncoming = msg.role === 'admin' || msg.role === 'ai';
    const timeStr = formatTime(msg.createdAt);
    const appointment = 'appointment' in msg ? msg.appointment : undefined;

    return (
        <div className={cn("flex items-end gap-2.5 mb-1", isIncoming ? "justify-start" : "justify-end")}>
            {isIncoming && (
                <div className="w-7 h-7 flex-shrink-0">
                    {isFirstInGroup ? (
                        <div className={cn(
                            "w-full h-full rounded-full flex items-center justify-center shadow-sm border",
                            mode === 'ai' ? "bg-slate-900 border-slate-700" : "bg-[#4988c4] border-[#4988c4]/20"
                        )}>
                            {mode === 'ai' ? (
                                <Sparkles className="w-4 h-4 text-[#4988c4] animate-pulse" />
                            ) : (
                                <img src="/images/logo_no_name.svg" className="w-5 h-5 object-contain brightness-0 invert" alt="S" />
                            )}
                        </div>
                    ) : <div className="w-7" />}
                </div>
            )}

            <div className={cn("flex flex-col max-w-[70%]", isIncoming ? "items-start" : "items-end")}>
                {'imageUrl' in msg && msg.imageUrl && (
                    <div className={cn(
                        "mb-1 overflow-hidden border border-black/5 shadow-sm",
                        isIncoming ? "rounded-2xl rounded-bl-none" : "rounded-2xl rounded-br-none"
                    )}>
                        <img src={msg.imageUrl} alt="Attached" className="max-w-[200px] hover:opacity-90 transition-opacity" />
                    </div>
                )}

                {msg.text && (
                    <div className={cn(
                        "px-4 py-2 text-[13.5px] leading-relaxed shadow-sm",
                        isIncoming
                            ? "bg-white text-slate-800 border border-slate-100 rounded-2xl rounded-bl-none"
                            : cn("text-white rounded-2xl rounded-br-none", mode === 'ai' ? "bg-slate-800" : "bg-primary")
                    )}>
                        {msg.text}
                    </div>
                )}

                {appointment && (
                    <div className={cn(
                        "mt-1 w-full rounded-2xl border px-3 py-2.5 text-[11px] shadow-sm",
                        isIncoming ? "bg-emerald-50 text-emerald-800 border-emerald-100" : "bg-emerald-600 text-white border-none"
                    )}>
                        <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider mb-2">
                            <Pin className="h-3 w-3" /> Appointment Secured
                        </div>
                        <div className="space-y-1 opacity-90">
                            <div className="flex items-center gap-1.5"><CalendarClock className="h-3 w-3" /> {formatAppointmentTimeLabel(appointment.scheduledAt)}</div>
                            {appointment.location && <div className="flex items-center gap-1.5"><MapPin className="h-3 w-3" /> {appointment.location}</div>}
                        </div>
                    </div>
                )}

                <span className="mt-1 text-[9px] text-slate-400 px-1">{timeStr}</span>
            </div>
        </div>
    );
});

export default function UnifiedFloatingChat() {
    const [mode, setMode] = useState<'support' | 'ai'>('support');

    // --- MODE: SUPPORT ---
    const support = useFloatingChat();
    const [supportInput, setSupportInput] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Typing management
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const hasSentTypingRef = useRef(false);

    const handleSupportInputChange = (val: string) => {
        setSupportInput(val);
        if (!hasSentTypingRef.current && val.trim().length > 0) {
            support.sendTypingSignal(true);
            hasSentTypingRef.current = true;
        }

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            if (hasSentTypingRef.current) {
                support.sendTypingSignal(false);
                hasSentTypingRef.current = false;
            }
        }, 1500);
    };

    const handleImageSelect = (f: File) => {
        setSelectedFile(f); 
        setPreviewImage(URL.createObjectURL(f));
        if (!hasSentTypingRef.current) {
            support.sendTypingSignal(true);
            hasSentTypingRef.current = true;
        }
    };

    // --- MODE: AI ---
    const ai = useFloatingAIChat();
    const [aiInput, setAiInput] = useState('');

    const isOpen = support.isOpen; // Shared open state

    const pinnedAppointmentMessage = useMemo(() => {
        const msgs = mode === 'support' ? support.messages : [];
        for (let i = msgs.length - 1; i >= 0; i -= 1) {
            const candidate = msgs[i];
            if (candidate.appointment && candidate.appointment.pinned !== false) {
                return candidate;
            }
        }
        return null;
    }, [support.messages, mode]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (mode === 'support') {
            if (!supportInput.trim() && !selectedFile) return;
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            support.sendTypingSignal(false);
            hasSentTypingRef.current = false;

            await support.sendMessage(supportInput, selectedFile);
            setSupportInput('');
            setSelectedFile(null);
            setPreviewImage(null);
        } else {
            if (!aiInput.trim()) return;
            await ai.sendMessage(aiInput);
            setAiInput('');
        }
    };

    return (
        <>
            {/* Unified Toggle Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => support.openChat()}
                        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-[#4988c4] text-white shadow-2xl flex items-center justify-center border border-white/20 active:scale-95 transition-all group"
                    >
                        <MessageCircle className="w-7 h-7 text-white group-hover:scale-110 transition-transform shadow-sm" />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Main Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9, transformOrigin: 'bottom right' }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 30, scale: 0.95 }}
                        className="fixed bottom-0 right-4 sm:bottom-4 sm:right-6 lg:right-10 z-[100] w-[360px] max-w-[calc(100vw-2rem)] flex flex-col rounded-[24px] border border-slate-200 bg-white shadow-2xl overflow-hidden h-[520px] max-h-[85vh]"
                    >
                        {/* HEADER - MODE SWITCHER */}
                        <div className="p-2.5 border-b bg-white border-slate-100">
                            <div className="flex items-center justify-between mb-2.5 px-1">
                                <div className="flex items-center gap-2">
                                    <div className={cn(
                                        "h-7 w-7 rounded-lg flex items-center justify-center shadow-sm border overflow-hidden",
                                        mode === 'ai' ? "bg-slate-900 border-slate-700" : "bg-white border-slate-100"
                                    )}>
                                        {mode === 'ai' ? (
                                            <Sparkles className="w-5 h-5 text-[#4988c4]" />
                                        ) : (
                                            <img src="/images/logo_no_name.svg" className="w-6 h-6 object-contain" alt="DG" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-bold leading-none text-slate-900">
                                            {mode === 'ai' ? "Growth Advisor" : "DreamGuard Support"}
                                        </h3>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <div className={cn(
                                                "h-1.5 w-1.5 rounded-full",
                                                (mode === 'support' ? support.isTyping : ai.isThinking)
                                                    ? "bg-amber-400 animate-pulse"
                                                    : "bg-emerald-500"
                                            )} />
                                            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                                                {(mode === 'support' ? support.isTyping : ai.isThinking) ? "Typing…" : "Active Now"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => support.closeChat()} className="p-2 rounded-xl text-slate-400 hover:bg-slate-50 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* TABBED MODE SWITCHER */}
                            <div className="flex p-1 rounded-xl gap-1 transition-all bg-slate-100">
                                <button
                                    onClick={() => setMode('support')}
                                    className={cn(
                                        "flex-1 flex items-center justify-center gap-2 h-8 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                                        mode === 'support'
                                            ? "bg-white text-[#4988c4] shadow-sm"
                                            : "text-slate-400 hover:text-slate-600"
                                    )}
                                >
                                    <MessageCircle size={14} /> Support
                                </button>
                                <button
                                    onClick={() => setMode('ai')}
                                    className={cn(
                                        "flex-1 flex items-center justify-center gap-2 h-8 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                                        mode === 'ai'
                                            ? "bg-[#4988c4] text-white shadow-sm"
                                            : "text-slate-400 hover:text-slate-600"
                                    )}
                                >
                                    <Sparkles size={14} /> AI Advisor
                                </button>
                            </div>
                        </div>

                        {/* MESSAGES AREA */}
                        <div className={cn(
                            "flex-1 overflow-y-auto px-4 py-5 flex flex-col transition-colors duration-500 custom-scrollbar",
                            mode === 'ai' ? "bg-slate-50/50" : "bg-slate-50"
                        )}>
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={mode}
                                    initial={{ opacity: 0, x: mode === 'ai' ? 10 : -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: mode === 'ai' ? -10 : 10 }}
                                    className="flex-1 space-y-2"
                                >
                                    {/* PINNED APPOINTMENT */}
                                    {pinnedAppointmentMessage?.appointment && (
                                        <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-3.5 py-3 shadow-sm text-emerald-800">
                                            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-700">
                                                <Pin className="h-3 w-3" />
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
                                            </div>
                                        </div>
                                    )}

                                    {(mode === 'support' ? support.messages : ai.messages).map((msg, idx, arr) => (
                                        <MessageBubble
                                            key={msg.id}
                                            msg={msg}
                                            mode={mode}
                                            isFirstInGroup={idx === 0 || arr[idx - 1].role !== msg.role}
                                            onRetry={mode === 'support' ? support.retryFailedMessage : undefined}
                                        />
                                    ))}

                                    {(mode === 'support' ? support.isTyping : ai.isThinking) && (
                                        <div className="flex items-end gap-2 mt-1 animate-in fade-in slide-in-from-bottom-2">
                                            <div className={cn(
                                                "w-7 h-7 rounded-full flex items-center justify-center shadow-md border",
                                                mode === 'ai' ? "bg-slate-900 border-slate-700" : "bg-[#4988c4] border-[#4988c4]/20"
                                            )}>
                                                {mode === 'ai' ? <Sparkles className="w-4 h-4 text-[#4988c4] animate-pulse" /> : <img src="/images/logo_no_name.svg" className="w-5 h-5 object-contain brightness-0 invert" alt="DG" />}
                                            </div>
                                            <div className="bg-white border border-slate-100 shadow-sm rounded-2xl rounded-bl-none px-3 py-2 flex items-center justify-center gap-1.2">
                                                <span className="w-1.2 h-1.2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                                <span className="w-1.2 h-1.2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                                <span className="w-1.2 h-1.2 bg-slate-400 rounded-full animate-bounce" />
                                            </div>
                                        </div>
                                    )}
                                    <div ref={mode === 'support' ? support.messagesEndRef : ai.messagesEndRef} />
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* INPUT AREA */}
                        <div className="p-3 bg-white border-t border-slate-100 relative">
                            {/* Support specific attachments */}
                            {mode === 'support' && previewImage && (
                                <div className="absolute bottom-full left-0 w-full p-3 bg-white/95 border-t flex items-center gap-3">
                                    <div className="relative border rounded-lg p-1 bg-slate-50">
                                        <img src={previewImage} className="h-14 w-14 object-cover rounded-md" alt="p" />
                                        <button onClick={() => { setPreviewImage(null); setSelectedFile(null); }} className="absolute -top-2 -right-2 bg-slate-900 text-white rounded-full p-0.5 shadow-md hover:bg-slate-800"><X size={12} /></button>
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase truncate">{selectedFile?.name}</p>
                                </div>
                            )}

                            {mode === 'ai' && (
                                <div className="absolute bottom-full left-0 w-full px-4 py-2 bg-[#4988c4]/5 border-t border-[#4988c4]/10 flex items-center gap-2">
                                    <Info className="w-3 h-3 text-[#4988c4]" />
                                    <p className="text-[9px] font-bold text-[#4988c4] uppercase tracking-wider">AI Growth Advisor active</p>
                                </div>
                            )}

                            <form onSubmit={handleSend} className="flex gap-2 items-end">
                                {mode === 'support' && (
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="h-11 w-11 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-100 transition-colors mb-0.5"
                                    >
                                        <ImageIcon size={20} />
                                        <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => {
                                            const f = e.target.files?.[0];
                                            if (f) handleImageSelect(f);
                                        }} />
                                    </button>
                                )}
                                <div className="flex-1 min-h-[44px] bg-slate-100 border border-transparent rounded-xl flex items-center px-4 focus-within:bg-white focus-within:border-slate-200 transition-all">
                                    <input
                                        value={mode === 'support' ? supportInput : aiInput}
                                        onChange={(e) => mode === 'support' ? handleSupportInputChange(e.target.value) : setAiInput(e.target.value)}
                                        placeholder={mode === 'ai' ? "Ask the advisor..." : "Type your message..."}
                                        className="w-full bg-transparent border-none outline-none text-[13.5px] font-medium text-slate-700 placeholder:text-slate-400"
                                    />
                                </div>

                                <AnimatePresence mode="wait">
                                    {(mode === 'support' ? (supportInput.trim() || selectedFile) : aiInput.trim()) ? (
                                        <motion.button
                                            key="active"
                                            type="submit"
                                            initial={{ scale: 0.6, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            exit={{ scale: 0.6, opacity: 0 }}
                                            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                                            disabled={(mode === 'support' ? support.isSending : ai.isThinking)}
                                            className={cn(
                                                "h-11 w-11 rounded-xl flex items-center justify-center shadow-lg transition-shadow disabled:opacity-60",
                                                "bg-gradient-to-br from-[#4988c4] to-[#3a73a8] text-white"
                                            )}
                                        >
                                            {(mode === 'support' ? support.isSending : ai.isThinking) ? (
                                                <div className="flex gap-0.5">
                                                    {[0, 1, 2].map((i) => (
                                                        <div
                                                            key={i}
                                                            className="w-1 h-1 bg-white rounded-full animate-bounce"
                                                            style={{ animationDelay: `${i * 0.15}s` }}
                                                        />
                                                    ))}
                                                </div>
                                            ) : <Send size={18} />}
                                        </motion.button>
                                    ) : (
                                        <motion.div
                                            key="inactive"
                                            initial={{ scale: 0.6, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 0.4 }}
                                            exit={{ scale: 0.6, opacity: 0 }}
                                            className="h-11 w-11 rounded-xl flex items-center justify-center text-slate-400"
                                        >
                                            <Send size={18} />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
