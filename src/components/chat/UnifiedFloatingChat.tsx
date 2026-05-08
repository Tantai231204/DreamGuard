import React, { useState, useRef, memo, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    MessageCircle, Sparkles, X, Send,
    CalendarClock, MapPin, Pin, Package,
    Image as ImageIcon, DollarSign, Wallet, ArrowRight
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useFloatingChat } from './useFloatingChat';
import type { ChatMessage } from './useFloatingChat';
import { useFloatingAIChat } from './useFloatingAIChat';
import type { AIChatMessage } from './useFloatingAIChat';
import { formatAppointmentTimeLabel } from '@/utils/chatPayload';
import { cn, formatPrice } from '@/lib/utils';
import { useChatStore } from '@/store/useChatStore';

const timeFormatter = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
});

function formatTime(isoString: string) {
    return timeFormatter.format(new Date(isoString));
}

/**
 * Renders AI response text with rich formatting:
 * - **bold** → <strong>
 * - Bullet lines (• or -) → styled list items
 * - Numbered lines (1. 2.) → styled list items
 * - Blank lines → paragraph breaks
 * - Emojis preserved inline
 */
function formatAIText(text: string): React.ReactNode {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let key = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        // Skip empty lines — add spacing
        if (!trimmed) {
            elements.push(<div key={key++} className="h-2" />);
            continue;
        }

        // Process inline bold: **text** → <strong>
        const formatInline = (str: string): React.ReactNode[] => {
            const parts: React.ReactNode[] = [];
            const regex = /\*\*(.*?)\*\*/g;
            let lastIndex = 0;
            let match;

            while ((match = regex.exec(str)) !== null) {
                if (match.index > lastIndex) {
                    parts.push(str.slice(lastIndex, match.index));
                }
                parts.push(
                    <strong key={`b-${key++}`} className="font-bold text-slate-900">
                        {match[1]}
                    </strong>
                );
                lastIndex = regex.lastIndex;
            }
            if (lastIndex < str.length) {
                parts.push(str.slice(lastIndex));
            }
            return parts;
        };

        // Strikethrough: ~~text~~ → <del>
        const formatStrikethrough = (nodes: React.ReactNode[]): React.ReactNode[] => {
            return nodes.map((node, idx) => {
                if (typeof node !== 'string') return node;
                const strikeParts: React.ReactNode[] = [];
                const regex = /~~(.*?)~~/g;
                let lastIdx = 0;
                let m;
                while ((m = regex.exec(node)) !== null) {
                    if (m.index > lastIdx) strikeParts.push(node.slice(lastIdx, m.index));
                    strikeParts.push(
                        <del key={`s-${key++}-${idx}`} className="text-slate-400 line-through">{m[1]}</del>
                    );
                    lastIdx = regex.lastIndex;
                }
                if (lastIdx < node.length) strikeParts.push(node.slice(lastIdx));
                return strikeParts.length > 0 ? <React.Fragment key={`sf-${idx}`}>{strikeParts}</React.Fragment> : node;
            });
        };

        const processText = (str: string) => formatStrikethrough(formatInline(str));

        // Bullet points: • or - at start
        if (/^[•-]\s/.test(trimmed)) {
            const content = trimmed.replace(/^[•-]\s*/, '');
            elements.push(
                <div key={key++} className="flex items-start gap-2 pl-1 py-0.5">
                    <span className="text-primary mt-0.5 text-[10px]">●</span>
                    <span className="flex-1">{processText(content)}</span>
                </div>
            );
            continue;
        }

        // Numbered items: 1. or 2. at start
        if (/^\d+\.\s/.test(trimmed)) {
            const numMatch = trimmed.match(/^(\d+)\.\s*(.*)/);
            if (numMatch) {
                elements.push(
                    <div key={key++} className="flex items-start gap-2.5 pl-1 py-0.5">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-black flex items-center justify-center mt-0.5">
                            {numMatch[1]}
                        </span>
                        <span className="flex-1 font-medium">{processText(numMatch[2])}</span>
                    </div>
                );
                continue;
            }
        }

        // Indented detail lines (start with spaces + emoji like 📝💰👶📂)
        if (/^\s{2,}/.test(line) && /^[\s]*[📝💰👶📂🌟✅❌⚡🎯🔥💡]/u.test(trimmed)) {
            elements.push(
                <div key={key++} className="pl-8 py-0.5 text-slate-600">
                    {processText(trimmed)}
                </div>
            );
            continue;
        }

        // Regular line
        elements.push(
            <div key={key++} className="py-0.5">
                {processText(trimmed)}
            </div>
        );
    }

    return <>{elements}</>;
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
    const navigate = useNavigate();

    // Safely extract recommendedProducts only from AI messages
    const recommendedProducts = (mode === 'ai' && 'recommendedProducts' in msg)
        ? (msg as AIChatMessage).recommendedProducts
        : undefined;
    const hasProducts = recommendedProducts && recommendedProducts.length > 0;

    return (
        <div className={cn("flex flex-col gap-1 mb-1.5", isIncoming ? "items-start" : "items-end")}>
            {/* Main message row */}
            <div className={cn("flex items-end gap-2.5 w-full", isIncoming ? "justify-start" : "justify-end")}>
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

                <div className={cn("flex flex-col max-w-[80%]", isIncoming ? "items-start" : "items-end")}>
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
                            "px-4 py-3 text-[13px] leading-relaxed shadow-sm",
                            isIncoming
                                ? "bg-white text-slate-700 border border-slate-100 rounded-2xl rounded-bl-none"
                                : cn("text-white rounded-2xl rounded-br-none", mode === 'ai' ? "bg-slate-800" : "bg-primary")
                        )}>
                            {(isIncoming && mode === 'ai') ? formatAIText(msg.text) : msg.text}
                        </div>
                    )}

                    {appointment && (
                        <div className={cn(
                            "mt-1 w-full rounded-2xl border px-3 py-3 text-[11px] shadow-sm",
                            isIncoming ? "bg-emerald-50 text-emerald-800 border-emerald-100" : "bg-emerald-600 text-white border-none"
                        )}>
                            <div className="flex items-center gap-1.5 font-black uppercase tracking-wider mb-2.5">
                                <Pin className="h-3 w-3" /> Appointment Secured
                            </div>
                            <div className="space-y-2 opacity-90">
                                {appointment.scheduledAt && (
                                    <div className="flex items-center gap-2">
                                        <CalendarClock className="h-3.5 w-3.5 shrink-0" /> 
                                        <span>{formatAppointmentTimeLabel(appointment.scheduledAt)}</span>
                                    </div>
                                )}
                                {appointment.location && (
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-3.5 w-3.5 shrink-0" /> 
                                        <span>{appointment.location}</span>
                                    </div>
                                )}
                                
                                {(appointment.tradeInPrice !== undefined || appointment.amountToPay !== undefined) && (
                                    <div className="pt-2 mt-2 border-t border-black/5 space-y-1.5">
                                        {appointment.tradeInPrice !== undefined && (
                                            <div className="flex justify-between items-center">
                                                <span className="flex items-center gap-1.5 font-bold uppercase tracking-tighter opacity-70">
                                                    <DollarSign className="h-3 w-3" /> Valuation
                                                </span>
                                                <span className="font-black">{formatPrice(appointment.tradeInPrice)}</span>
                                            </div>
                                        )}
                                        {appointment.amountToPay !== undefined && (
                                            <div className="flex justify-between items-center">
                                                <span className="flex items-center gap-1.5 font-bold uppercase tracking-tighter opacity-70">
                                                    <Wallet className="h-3 w-3" /> Net Balance
                                                </span>
                                                <span className="font-black text-[13px]">{formatPrice(appointment.amountToPay)}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <span className="mt-1 text-[9px] text-slate-400 px-1">{timeStr}</span>
                </div>
            </div>

            {/* Product recommendation cards — full width, outside the bubble */}
            {hasProducts && (
                <div className={cn("w-full space-y-2", isIncoming ? "pl-9" : "pr-0")}>
                    {recommendedProducts.map((product, idx) => (
                        <button
                            key={`${product.ProductId}-${idx}`}
                            onClick={() => navigate(`/products/${product.Slug}`)}
                            className="w-full text-left bg-white border border-slate-100 rounded-xl overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all duration-300 group/prod"
                        >
                            <div className="p-3 flex gap-3 items-center">
                                <div className="w-12 h-12 rounded-lg bg-slate-50 flex-shrink-0 flex items-center justify-center border border-slate-100">
                                    {product.ImageUrl ? (
                                        <img src={product.ImageUrl} className="w-full h-full object-cover rounded-lg" alt={product.ProductName} />
                                    ) : (
                                        <Package className="w-5 h-5 text-slate-300" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-[12px] font-bold text-slate-900 truncate group-hover/prod:text-primary transition-colors">
                                        {product.ProductName}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[11px] font-black text-primary">
                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.SalePrice)}
                                        </span>
                                        {product.BasePrice > product.SalePrice && (
                                            <span className="text-[9px] text-slate-300 line-through font-bold">
                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.BasePrice)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                    <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 bg-primary/5 text-primary rounded-full border border-primary/10">
                                        {product.CategoryName}
                                    </span>
                                    <span className="text-[8px] font-bold text-slate-400">
                                        {'<'} {Math.floor(product.AgeGroup / 12)}Y Old
                                    </span>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
});

export default function UnifiedFloatingChat() {
    const { isLocked } = useChatStore();
    const [mode, setMode] = useState<'support' | 'ai'>('support');
    const navigate = useNavigate();

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
                                        <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 shadow-sm text-emerald-800">
                                            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-700 mb-3">
                                                <Pin className="h-3 w-3" />
                                                Pinned Appointment
                                            </div>
                                            <div className="space-y-2.5">
                                                {pinnedAppointmentMessage.appointment.scheduledAt && (
                                                    <p className="flex items-center gap-2 text-[12px] font-medium">
                                                        <CalendarClock className="h-4 w-4 text-emerald-600/50" />
                                                        {formatAppointmentTimeLabel(pinnedAppointmentMessage.appointment.scheduledAt)}
                                                    </p>
                                                )}
                                                {pinnedAppointmentMessage.appointment.location && (
                                                    <p className="flex items-center gap-2 text-[12px] font-medium leading-tight">
                                                        <MapPin className="h-4 w-4 text-emerald-600/50" />
                                                        {pinnedAppointmentMessage.appointment.location}
                                                    </p>
                                                )}

                                                {(pinnedAppointmentMessage.appointment.tradeInPrice !== undefined || pinnedAppointmentMessage.appointment.amountToPay !== undefined) && (
                                                    <div className="pt-2.5 mt-2 border-t border-emerald-200/50 space-y-1.5">
                                                        {pinnedAppointmentMessage.appointment.tradeInPrice !== undefined && (
                                                            <div className="flex justify-between items-center text-[11px]">
                                                                <span className="font-bold uppercase tracking-widest opacity-60">Valuation</span>
                                                                <span className="font-black text-emerald-700">{formatPrice(pinnedAppointmentMessage.appointment.tradeInPrice)}</span>
                                                            </div>
                                                        )}
                                                        {pinnedAppointmentMessage.appointment.amountToPay !== undefined && (
                                                            <div className="flex justify-between items-center text-[11px]">
                                                                <span className="font-bold uppercase tracking-widest opacity-60">Net Balance</span>
                                                                <span className="font-black text-blue-700 text-xs">{formatPrice(pinnedAppointmentMessage.appointment.amountToPay)}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {(mode === 'support' ? support.messages : ai.messages).map((msg: ChatMessage | AIChatMessage, idx: number, arr: (ChatMessage | AIChatMessage)[]) => (
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

                        {/* SUGGESTIONS AREA — between messages and input */}
                        {mode === 'ai' && ai.suggestions.length > 0 && !ai.isThinking && (
                            <div className="px-3 py-2.5 bg-white border-t border-slate-100 flex-shrink-0">
                                <div className="overflow-x-auto custom-scrollbar-hidden">
                                    <div className="flex gap-1.5 w-max">
                                        {ai.suggestions.map((suggestion: string, idx: number) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => ai.sendMessage(suggestion)}
                                                className="px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-[11px] font-bold text-slate-600 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 shadow-sm whitespace-nowrap"
                                            >
                                                {suggestion}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

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

                            {mode === 'support' && isLocked ? (
                                <div className="p-1 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <button 
                                        onClick={() => {
                                            support.closeChat();
                                            navigate('/profile/orders');
                                        }}
                                        className="w-full h-11 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-between px-4 group hover:bg-white hover:border-primary/30 transition-all shadow-sm"
                                    >
                                        <span className="text-[11px] font-bold text-slate-500 group-hover:text-primary transition-colors">
                                            Xem chi tiết đơn hàng để kết nối...
                                        </span>
                                        <ArrowRight size={14} className="text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSend} className="flex gap-2 items-end">
                                    {mode === 'support' && (
                                        <button
                                            type="button"
                                            onClick={() => !isLocked && fileInputRef.current?.click()}
                                            disabled={isLocked}
                                            className={cn(
                                                "h-11 w-11 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-100 transition-colors mb-0.5",
                                                isLocked && "opacity-40 cursor-not-allowed hover:bg-slate-50"
                                            )}
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
                                                disabled={(mode === 'support' ? (support.isSending || isLocked) : ai.isThinking)}
                                                className={cn(
                                                    "h-11 w-11 rounded-xl flex items-center justify-center shadow-lg transition-shadow disabled:opacity-60",
                                                    (mode === 'support' && isLocked) ? "bg-slate-200 text-slate-400 shadow-none" : "bg-gradient-to-br from-[#4988c4] to-[#3a73a8] text-white"
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
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
