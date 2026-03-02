import { memo } from 'react';

/* ─── Section Heading Component ───────────────────────── */
interface SectionHeadingProps {
    title: string;
}

const SectionHeading = memo(function SectionHeading({ title }: SectionHeadingProps) {
    return (
        <h3 className="text-xs font-bold uppercase tracking-widest text-purple-600/70 flex items-center gap-2">
            <span className="h-px flex-1 bg-gradient-to-r from-purple-200 to-transparent" />
            {title}
            <span className="h-px flex-1 bg-gradient-to-l from-purple-200 to-transparent" />
        </h3>
    );
});

export default SectionHeading;
