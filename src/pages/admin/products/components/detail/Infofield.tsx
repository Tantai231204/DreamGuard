import type { ElementType, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface InfoFieldProps {
    icon: ElementType;
    label: string;
    value: ReactNode;
    mono?: boolean;
    className?: string;
}

export function InfoField({ icon: Icon, label, value, mono, className }: InfoFieldProps) {
    return (
        <div className={cn('flex items-start gap-3 py-3.5 group', className)}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/80 border border-gray-100 group-hover:border-primary-200 group-hover:from-primary-50 group-hover:to-secondary-100 transition-all duration-200">
                <Icon size={15} className="text-gray-400 group-hover:text-[var(--color-primary)] transition-colors duration-200" />
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 leading-none mb-1.5">
                    {label}
                </p>
                <div
                    className={cn(
                        'text-sm font-medium text-gray-800 break-words leading-snug',
                        mono && 'font-mono text-xs',
                    )}
                >
                    {value ?? <span className="text-gray-300 italic font-normal text-xs">Not specified</span>}
                </div>
            </div>
        </div>
    );
}
