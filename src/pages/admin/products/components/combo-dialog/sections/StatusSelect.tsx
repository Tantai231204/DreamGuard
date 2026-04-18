import { memo } from 'react';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { SELECT_TRIGGER_CLS } from '../index';
import { PRODUCT_STATUSES } from '../../../types';
import { ErrorMsg, Field } from '../primitives';
import { cn } from '@/lib/utils';

interface StatusSelectProps {
    value: string;
    onChange: (v: string) => void;
    error?: { message?: string };
    disabled: boolean;
    readOnly?: boolean;
}

// ── StatusDot ────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
    published: 'bg-emerald-500',
    draft: 'bg-amber-500',
    outofstock: 'bg-rose-500',
    hidden: 'bg-blue-500',
};

const StatusDot = ({ status, label }: { status: string; label: string }) => {
    const s = status.toLowerCase();
    const color = STATUS_COLORS[s] || 'bg-slate-400';
    return (
        <div className="flex items-center gap-2 px-0.5">
            <div className={cn("h-1.5 w-1.5 rounded-full shrink-0", color)} />
            <span className="text-[13px] font-bold leading-none tracking-tight text-slate-700 capitalize">
                {label}
            </span>
        </div>
    );
};

const StatusSelect = memo(function StatusSelect({ value, onChange, error, disabled, readOnly }: StatusSelectProps) {
    if (readOnly) {
        return (
            <Field label="Status" hint="Locked for new items">
                <div className={cn(
                    SELECT_TRIGGER_CLS,
                    "bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed opacity-90 flex items-center pr-3.5"
                )}>
                    <StatusDot status="draft" label="Draft" />
                </div>
                <ErrorMsg error={error} />
            </Field>
        );
    }

    return (
        <Field label="Status" required>
            <Select value={value} onValueChange={onChange} disabled={disabled}>
                <SelectTrigger className={cn(SELECT_TRIGGER_CLS, "hover:border-blue-300 transition-all px-3")}>
                    <SelectValue>
                        <div className="flex -ml-0.5 translate-y-[1px]">
                            <StatusDot
                                status={value}
                                label={PRODUCT_STATUSES.find(s => s.value === value)?.label || value}
                            />
                        </div>
                    </SelectValue>
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-slate-200 shadow-2xl p-1 w-52">
                    <div className="flex items-center justify-between px-2 py-1.5 mb-1 border-b border-slate-50/50">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Select Status</span>
                        <div className="px-2 py-0.5 rounded-md bg-primary-50 border border-primary-100 shadow-sm">
                            <span className="text-[9px] font-black text-primary-500 uppercase tracking-tight">Collection</span>
                        </div>
                    </div>
                    {PRODUCT_STATUSES.map((s) => (
                        <SelectItem
                            key={s.value}
                            value={s.value}
                            className={cn(
                                "rounded-xl py-2 pl-9 pr-3 text-sm transition-all focus:bg-blue-50 focus:text-blue-700",
                                value === s.value ? "bg-blue-50 font-bold" : ""
                            )}
                        >
                            <StatusDot status={s.value} label={s.label} />
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <ErrorMsg error={error} />
        </Field>
    );
});

export default StatusSelect;
