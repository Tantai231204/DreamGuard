interface SectionHeadingProps {
    label: string;
    accent?: string; // tailwind gradient classes, e.g. 'from-blue-400 to-blue-600'
    trailing?: React.ReactNode;
}

export function SectionHeading({
    label,
    accent = 'from-[var(--color-primary)] to-[var(--color-primary-hover)]',
    trailing,
}: SectionHeadingProps) {
    return (
        <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
                <div className={`w-[3px] h-4 bg-gradient-to-b ${accent} rounded-full`} />
                <h2 className="text-[11px] font-bold uppercase tracking-[0.1em] text-gray-500">
                    {label}
                </h2>
            </div>
            {trailing && <div>{trailing}</div>}
        </div>
    );
}