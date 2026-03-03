import type { ElementType, ReactNode } from 'react';

interface InfoFieldProps {
    icon: ElementType;
    label: string;
    value: ReactNode;
    mono?: boolean;
}

export function InfoField({ icon: Icon, label, value, mono }: InfoFieldProps) {
    return (
        <div className="flex items-start gap-3 py-3 group">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-50 border border-gray-100 group-hover:border-blue-100 group-hover:bg-blue-50/60 transition-colors">
                <Icon size={14} className="text-gray-400 group-hover:text-[var(--color-primary)] transition-colors" />
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
                <p className="text-[10.5px] font-semibold uppercase tracking-widest text-gray-400 leading-none mb-1">
                    {label}
                </p>
                <div
                    className={`text-sm font-medium text-gray-800 break-words leading-snug ${
                        mono ? 'font-mono text-xs' : ''
                    }`}
                >
                    {value ?? <span className="text-gray-300 italic font-normal">Not specified</span>}
                </div>
            </div>
        </div>
    );
}