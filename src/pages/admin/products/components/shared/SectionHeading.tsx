import { memo } from 'react';
import { cn } from '@/lib/utils';

/* ─── Section Heading Component ───────────────────────── */
interface SectionHeadingProps {
    title: string;
    className?: string;
}

const SectionHeading = memo(function SectionHeading({ title, className }: SectionHeadingProps) {
    return (
        <h3 className={cn("text-[11px] font-bold uppercase tracking-widest text-slate-500 pb-1.5 border-b border-slate-200/60 flex items-center gap-1.5", className)}>
            {title}
        </h3>
    );
});

export default SectionHeading;
