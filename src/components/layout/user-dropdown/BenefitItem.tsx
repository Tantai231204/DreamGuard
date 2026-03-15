import type { BenefitItemProps } from "./types"

export function BenefitItem({ icon, text }: BenefitItemProps) {
    return (
        <div className="flex items-center gap-3 py-0.5 group/item select-none cursor-pointer">
            <div className="flex items-center justify-center h-7 w-7 rounded-lg border border-dashed border-[#4988c4]/30 bg-[#4988c4]/3 text-[#4988c4] transition-all group-hover/item:scale-105 group-hover/item:border-[#4988c4]/60">
                {icon}
            </div>
            <span className="text-[12px] font-medium text-slate-600 group-hover/item:text-[#4988c4] transition-colors">
                {text}
            </span>
        </div>
    )
}
