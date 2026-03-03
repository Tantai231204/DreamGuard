import { cn } from '@/lib/utils';

interface SectionHeadingProps {
    label: string;
    accent?: string;
    trailing?: React.ReactNode;
}

export function SectionHeading({
    label,
    accent = 'from-[var(--color-primary)] to-blue-600',
    trailing,
}: SectionHeadingProps) {
    return (
        <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
                <div className={cn('w-1 h-4 rounded-full bg-gradient-to-b', accent)} />
                <h2 className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-gray-500">
                    {label}
                </h2>
            </div>
            {trailing && <div>{trailing}</div>}
        </div>
    );
}
