import type { BenefitItemProps } from "./types"

export function BenefitItem({ icon, text }: BenefitItemProps) {
    return (
        <div className="
            flex items-center gap-2.5 rounded-lg bg-gray-50 border border-gray-100 p-2.5
            transition-all duration-200 ease-out
            hover:bg-white hover:border-primary/30 hover:shadow-sm
            group cursor-default
        ">
            <div className="
                flex h-8 w-8 items-center justify-center rounded-md bg-white border border-gray-100 text-primary
                transition-all duration-200
                group-hover:scale-110 group-hover:border-primary/30
            ">
                {icon}
            </div>
            <span className="text-xs font-medium text-gray-700 transition-colors group-hover:text-gray-900">
                {text}
            </span>
        </div>
    )
}
