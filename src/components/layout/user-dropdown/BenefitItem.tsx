import type { BenefitItemProps } from "./types"

export function BenefitItem({ icon, text }: BenefitItemProps) {
    return (
        <div className="
            flex items-center gap-2 rounded-xl bg-gray-50/80 p-2.5
            transition-all duration-300 ease-out
            hover:bg-primary/5 hover:scale-[1.02]
            cursor-default group
        ">
            <div className="
                flex h-7 w-7 items-center justify-center rounded-lg 
                bg-white text-primary shadow-sm
                transition-all duration-300
                group-hover:shadow-md group-hover:scale-110
            ">
                {icon}
            </div>
            <span className="text-xs font-medium text-gray-600 group-hover:text-gray-800">
                {text}
            </span>
        </div>
    )
}
