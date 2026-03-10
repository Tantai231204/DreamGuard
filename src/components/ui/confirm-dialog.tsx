import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertCircle, Info, Trash2, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    variant?: 'danger' | 'warning' | 'info' | 'primary';
    isLoading?: boolean;
}

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
    const configs = {
        danger: {
            icon: <Trash2 className="w-5 h-5 text-rose-500" />,
            bg: 'bg-rose-50',
            button: 'bg-rose-500 hover:bg-rose-600 text-white shadow-sm',
            title: 'text-rose-950 text-xl font-bold font-sans'
        },
        warning: {
            icon: <AlertCircle className="w-5 h-5 text-amber-500" />,
            bg: 'bg-amber-50',
            button: 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm',
            title: 'text-amber-950 text-xl font-bold font-sans'
        },
        info: {
            icon: <Info className="w-5 h-5 text-blue-500" />,
            bg: 'bg-blue-50',
            button: 'bg-blue-500 hover:bg-blue-600 text-white shadow-sm',
            title: 'text-blue-950 text-xl font-bold font-sans'
        },
        primary: {
            icon: <HelpCircle className="w-5 h-5 text-[#4988c4]" />,
            bg: 'bg-blue-50',
            button: 'bg-[#4988c4] hover:bg-[#3b6fa3] text-white shadow-sm',
            title: 'text-[#4988c4] text-xl font-bold font-sans'
        }
    };

    const config = configs[variant];

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="max-w-[400px] p-6 overflow-hidden rounded-xl border border-gray-100 shadow-md bg-white">
                <AlertDialogHeader className="space-y-4 text-left">
                    <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 shadow-sm transition-none border border-black/5",
                        config.bg
                    )}>
                        {config.icon}
                    </div>
                    <div className="space-y-1">
                        <AlertDialogTitle className={cn(config.title, "m-0 leading-tight")}>
                            {title}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-[14px] text-gray-500 leading-normal font-medium">
                            {description}
                        </AlertDialogDescription>
                    </div>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-6 gap-2 sm:space-x-0">
                    <AlertDialogCancel
                        className="flex-1 h-10 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-bold text-[13px] transition-none"
                        disabled={isLoading}
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
                            "flex-1 h-10 rounded-lg font-bold text-[13px] border-none shadow-sm transition-none active:opacity-90",
                            config.button
                        )}
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Wait...</span>
                            </div>
                        ) : confirmText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
