import type { BenefitItemProps } from "./types"

export function BenefitItem({ icon, text }: BenefitItemProps) {
    return (
        <div className="flex items-center gap-2.5 py-1 select-none">
            <div className="text-gray-300">
                {icon}
            </div>
            <span className="text-xs font-medium text-gray-500">
                {text}
            </span>
        </div>
    )
}
