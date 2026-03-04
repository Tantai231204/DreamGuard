import { memo } from 'react';

/* ─── Section Heading Component ───────────────────────── */
interface SectionHeadingProps {
    title: string;
}

const SectionHeading = memo(function SectionHeading({ title }: SectionHeadingProps) {
    return (
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-500 pb-1.5 border-b border-slate-200/60 flex items-center gap-1.5">
            {title}
        </h3>
    );
});

export default SectionHeading;
