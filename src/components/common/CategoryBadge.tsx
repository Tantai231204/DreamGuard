import { cn } from '@/lib/utils';
import { Tag } from 'lucide-react';
import { ProductAssetIcons } from './icons';

export interface CategoryBadgeProps {
  categoryName?: string | null;
  className?: string;
  variant?: 'badge' | 'card';
}

export function CategoryBadge({ categoryName, className, variant = 'badge' }: CategoryBadgeProps) {
    const rawName = categoryName || 'Unknown';
    const lower = rawName.toLowerCase();

    let iconSrc: string | null = null;
    let colorTheme = 'border-slate-200 bg-white text-slate-700';
    let iconBg = 'bg-slate-100 text-slate-500';

    if (lower.includes('mattress') || lower.includes('nệm')) {
        iconSrc = ProductAssetIcons.BABY_SLEEP;
        colorTheme = 'border-[#4988c4]/20 bg-[#4988c4]/5 text-[#4988c4]';
        iconBg = 'bg-white shadow-sm';
    } else if (lower.includes('blanket') || lower.includes('mền')) {
        iconSrc = ProductAssetIcons.BLANKET;
        colorTheme = 'border-indigo-200 bg-indigo-50/50 text-indigo-700';
        iconBg = 'bg-white shadow-sm';
    } else if (lower.includes('sheet') || lower.includes('ga')) {
        iconSrc = ProductAssetIcons.FOLDING;
        colorTheme = 'border-emerald-200 bg-emerald-50/50 text-emerald-700';
        iconBg = 'bg-white shadow-sm';
    } else if (lower.includes('pillow') || lower.includes('gối') || lower.includes('cũi')) {
        iconSrc = ProductAssetIcons.CRIB;
        colorTheme = 'border-purple-200 bg-purple-50/50 text-purple-700';
        iconBg = 'bg-white shadow-sm';
    }

    if (variant === 'card') {
        return (
            <div className={cn("flex flex-col items-center justify-center p-4 rounded-[1.5rem] border-2 transition-all duration-300 hover:shadow-lg", colorTheme, className)}>
                <div className={cn("p-3 rounded-2xl mb-3 shadow-sm transition-transform hover:scale-105", iconBg)}>
                    {iconSrc ? (
                        <img src={iconSrc} alt={rawName} className="w-10 h-10 object-contain drop-shadow-sm" />
                    ) : (
                        <Tag className="w-10 h-10 opacity-70" />
                    )}
                </div>
                <span className="text-[13px] font-black uppercase tracking-widest text-center px-2">{rawName}</span>
            </div>
        );
    }

    return (
        <div className={cn("inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full border shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all duration-200 hover:shadow-md", colorTheme, className)}>
            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm transition-transform hover:scale-110", iconBg)}>
                {iconSrc ? (
                    <img src={iconSrc} alt={rawName} className="w-6 h-6 object-contain opacity-90" />
                ) : (
                    <Tag className="w-5 h-5 opacity-60" />
                )}
            </div>
            <span className="text-[14px] font-bold whitespace-nowrap leading-none pr-2 tracking-tight">{rawName}</span>
        </div>
    );
}
