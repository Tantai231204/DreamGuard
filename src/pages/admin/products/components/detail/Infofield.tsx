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
        <div className={cn('flex items-start gap-5 py-5 group transition-all', className)}>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[1.25rem] bg-gray-50 border border-gray-100 group-hover:bg-primary/5 group-hover:border-primary/20 transition-all duration-300">
                <Icon size={16} className="text-gray-400 group-hover:text-primary transition-colors duration-300" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 leading-none">
                    {label}
                </p>
                <div
                    className={cn(
                        'text-[13px] font-black text-gray-900 break-words leading-relaxed tracking-tight',
                        mono && 'font-mono text-[11px] uppercase text-slate-500 tracking-wider',
                    )}
                >
                    {value ?? <span className="text-gray-300 font-medium italic">Undefined</span>}
                </div>
            </div>
        </div>
    );
}

