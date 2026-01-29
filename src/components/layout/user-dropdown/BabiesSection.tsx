import { Link } from "react-router-dom"
import { Baby } from "lucide-react"
import { AppRoute } from "../../../lib/constants"
import { BabyQuickCard } from "./BabyQuickCard"
import type { BabyProfile } from "./types"

interface BabiesSectionProps {
    babies: BabyProfile[]
    maxDisplay?: number
}

export function BabiesSection({ babies, maxDisplay = 2 }: BabiesSectionProps) {
    if (babies.length === 0) return null

    return (
        <div className="p-3 border-b border-gray-100">
            <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Baby className="h-3.5 w-3.5" />
                    Bé yêu của mẹ
                </p>
                <Link 
                    to={`${AppRoute.PROFILE}?tab=babies`} 
                    className="
                        text-xs font-medium text-primary 
                        transition-all duration-200
                        hover:underline hover:text-[var(--color-primary-hover)]
                    "
                >
                    Quản lý
                </Link>
            </div>
            <div className="space-y-1">
                {babies.slice(0, maxDisplay).map((baby) => (
                    <BabyQuickCard key={baby.id} baby={baby} />
                ))}
            </div>
        </div>
    )
}
