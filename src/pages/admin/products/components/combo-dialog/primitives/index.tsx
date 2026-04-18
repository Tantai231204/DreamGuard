/**
 * Dumb UI primitives for combo form fields.
 * Zero business logic — pure presentation atoms.
 */
import { memo } from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

// ── ErrorMsg ─────────────────────────────────────────────
export const ErrorMsg = memo(function ErrorMsg({ error }: { error?: { message?: string } }) {
    if (!error) return null;
    return (
        <p className="flex items-center gap-1 mt-1 text-[11px] text-red-500 font-medium">
            <AlertCircle className="h-3 w-3 shrink-0" />
            {error.message}
        </p>
    );
});

// ── SectionDivider ───────────────────────────────────────
export const SectionDivider = ({ label }: { label: string }) => (
    <div className="flex items-center gap-3 mb-3">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 whitespace-nowrap">
            {label}
        </span>
        <div className="flex-1 h-px bg-slate-100" />
    </div>
);

// ── Field ────────────────────────────────────────────────
export const Field = ({
    label,
    required,
    hint,
    children,
    className,
}: {
    label: string;
    required?: boolean;
    hint?: string;
    children: React.ReactNode;
    className?: string;
}) => (
    <div className={cn('space-y-1', className)}>
        <div className="flex items-center justify-between">
            <Label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                {label}
                {required && <span className="text-red-400 ml-0.5">*</span>}
            </Label>
            {hint && <span className="text-[10px] text-slate-400">{hint}</span>}
        </div>
        {children}
    </div>
);

// ── StatusDot ────────────────────────────────────────────
const STATUS_DOT_COLOR: Record<string, string> = {
    Published: 'bg-emerald-500',
    Draft: 'bg-amber-500',
    OutOfStock: 'bg-rose-500',
};

export const StatusDot = ({ status }: { status: string }) => (
    <div className={cn("h-1.5 w-1.5 rounded-full", STATUS_DOT_COLOR[status] || 'bg-slate-400')} />
);
