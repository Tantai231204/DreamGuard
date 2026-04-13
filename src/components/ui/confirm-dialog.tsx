import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogTitle,
    AlertDialogDescription,
} from '@/components/ui/alert-dialog';
import { AlertTriangle, Trash2, Info, ShieldCheck, HelpCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import React from 'react';

interface ConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string | React.ReactNode;
    description: string | React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    variant?: 'danger' | 'warning' | 'info' | 'primary' | 'success' | 'tradein';
    isLoading?: boolean;
}

const configs = {
    danger: {
        icon: Trash2,
        iconColor: 'text-rose-500',
        iconBg: 'bg-rose-100/50',
        ring: 'ring-rose-100',
        glow: 'shadow-rose-500/20',
        btn: 'bg-rose-500 hover:bg-rose-600 focus-visible:ring-rose-500 text-white',
        gradient: 'from-rose-500/10 via-transparent to-transparent',
        highlight: 'bg-rose-100 text-rose-800 border-rose-200',
    },
    warning: {
        icon: AlertTriangle,
        iconColor: 'text-amber-500',
        iconBg: 'bg-amber-100/50',
        ring: 'ring-amber-100',
        glow: 'shadow-amber-500/20',
        btn: 'bg-amber-500 hover:bg-amber-600 focus-visible:ring-amber-500 text-white',
        gradient: 'from-amber-500/10 via-transparent to-transparent',
        highlight: 'bg-amber-100 text-amber-800 border-amber-200',
    },
    success: {
        icon: ShieldCheck,
        iconColor: 'text-emerald-500',
        iconBg: 'bg-emerald-100/50',
        ring: 'ring-emerald-100',
        glow: 'shadow-emerald-500/20',
        btn: 'bg-emerald-500 hover:bg-emerald-600 focus-visible:ring-emerald-500 text-white',
        gradient: 'from-emerald-500/10 via-transparent to-transparent',
        highlight: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
    info: {
        icon: Info,
        iconColor: 'text-blue-500',
        iconBg: 'bg-blue-100/50',
        ring: 'ring-blue-100',
        glow: 'shadow-blue-500/20',
        btn: 'bg-blue-500 hover:bg-blue-600 focus-visible:ring-blue-500 text-white',
        gradient: 'from-blue-500/10 via-transparent to-transparent',
        highlight: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    primary: {
        icon: HelpCircle,
        iconColor: 'text-primary',
        iconBg: 'bg-primary/10',
        ring: 'ring-primary/20',
        glow: 'shadow-primary/20',
        btn: 'bg-primary hover:bg-primary/90 focus-visible:ring-primary text-white',
        gradient: 'from-primary/15 via-transparent to-transparent',
        highlight: 'bg-primary/10 text-primary border-primary/20',
    },
    tradein: {
        icon: ShieldCheck,
        iconColor: 'text-[#3D5140]',
        iconBg: 'bg-[#ECF4ED]',
        ring: 'ring-[#DDE9DF]',
        glow: 'shadow-[#3D5140]/20',
        btn: 'bg-[#455A48] hover:bg-[#3D5140] focus-visible:ring-[#455A48] text-white',
        gradient: 'from-[#3D5140]/15 via-transparent to-transparent',
        highlight: 'bg-[#ECF4ED] text-[#3D5140] border-[#DDE9DF]',
    },
};

// Auto-parser for emphasis: highlights any text inside "quotes" or **double asterisks**
const parseHighlight = (text: string, highlightClass: string) => {
    const regex = /"([^"]+)"|\*\*([^*]+)\*\*/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            parts.push(text.substring(lastIndex, match.index));
        }
        const content = match[1] || match[2];
        parts.push(
            <span
                key={match.index}
                className={cn(
                    "font-bold px-1.5 py-0.5 rounded-md border mx-0.5 whitespace-nowrap shadow-sm align-baseline",
                    highlightClass
                )}
            >
                {content}
            </span>
        );
        lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
        parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
};

export function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    variant = 'warning',
    isLoading = false,
}: ConfirmDialogProps) {
    const c = configs[variant];
    const Icon = c.icon;

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="max-w-[420px] p-0 border-0 rounded-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] bg-white overflow-hidden">
                {/* Decorative Background Gradient */}
                <div className={cn("absolute inset-0 bg-gradient-to-br opacity-50 pointer-events-none", c.gradient)} />

                <div className="relative p-8 flex flex-col items-center text-center">
                    {/* Animated Icon Container */}
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0, y: 10 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 20,
                            delay: 0.1
                        }}
                        className={cn(
                            "w-16 h-16 rounded-2xl flex items-center justify-center mb-5 ring-8",
                            c.iconBg,
                            c.ring
                        )}
                    >
                        <Icon className={cn("w-7 h-7", c.iconColor)} strokeWidth={2.5} />
                    </motion.div>

                    {/* Text Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15, duration: 0.3 }}
                    >
                        <AlertDialogTitle asChild>
                            <h3 className="text-[17px] font-bold text-slate-800 tracking-tight mb-3 leading-tight">
                                {title}
                            </h3>
                        </AlertDialogTitle>
                        <AlertDialogDescription asChild>
                            <div className="text-[14.5px] font-medium text-slate-500 leading-relaxed mb-8 px-2 max-w-[340px]">
                                {typeof description === 'string'
                                    ? parseHighlight(description, c.highlight)
                                    : description}
                            </div>
                        </AlertDialogDescription>
                    </motion.div>

                    {/* Actions */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.3 }}
                        className="flex w-full gap-3 flex-col-reverse sm:flex-row"
                    >
                        <AlertDialogCancel
                            disabled={isLoading}
                            className="flex-1 h-12 rounded-lg text-[14px] font-bold border-0 bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800 transition-all focus:ring-0 sm:mt-0 mt-2"
                        >
                            {cancelText}
                        </AlertDialogCancel>

                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                onConfirm();
                            }}
                            disabled={isLoading}
                            className={cn(
                                "flex-1 h-12 rounded-lg text-[14px] font-bold transition-all shadow-lg focus:ring-2 focus:ring-offset-2 flex justify-center items-center border-0 border-transparent",
                                c.btn,
                                c.glow
                            )}
                        >
                            {isLoading ? (
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex items-center gap-2"
                                >
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Processing</span>
                                </motion.span>
                            ) : (
                                <span>{confirmText}</span>
                            )}
                        </AlertDialogAction>
                    </motion.div>
                </div>
            </AlertDialogContent>
        </AlertDialog>
    );
}