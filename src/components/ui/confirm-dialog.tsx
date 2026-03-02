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
import { AlertTriangle, Info } from 'lucide-react';

interface ConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    variant?: 'danger' | 'warning' | 'info';
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
    const icons = {
        danger: <AlertTriangle className="w-6 h-6 text-red-600" />,
        warning: <AlertTriangle className="w-6 h-6 text-amber-600" />,
        info: <Info className="w-6 h-6 text-blue-600" />,
    };

    const colors = {
        danger: {
            bg: 'bg-red-50',
            border: 'border-red-200',
            button: 'bg-red-600 hover:bg-red-700 shadow-red-500/30',
        },
        warning: {
            bg: 'bg-amber-50',
            border: 'border-amber-200',
            button: 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/30',
        },
        info: {
            bg: 'bg-blue-50',
            border: 'border-blue-200',
            button: 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30',
        },
    };

    const handleConfirm = () => {
        onConfirm();
        onOpenChange(false);
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="sm:max-w-[480px]">
                <AlertDialogHeader>
                    <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-full ${colors[variant].bg} ${colors[variant].border} border-2 flex items-center justify-center flex-shrink-0`}>
                            {icons[variant]}
                        </div>
                        <div className="flex-1 pt-1">
                            <AlertDialogTitle className="text-xl font-bold text-gray-900 mb-2">
                                {title}
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-sm text-gray-600 leading-relaxed">
                                {description}
                            </AlertDialogDescription>
                        </div>
                    </div>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-6 gap-2">
                    <AlertDialogCancel 
                        disabled={isLoading}
                        className="flex-1 h-11 border-2 font-semibold"
                    >
                        {cancelText}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className={`flex-1 h-11 ${colors[variant].button} shadow-lg font-semibold`}
                    >
                        {confirmText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
