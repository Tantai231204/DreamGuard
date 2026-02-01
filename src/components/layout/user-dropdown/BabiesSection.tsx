import { Link } from "react-router-dom"
import { Baby, Plus } from "lucide-react"
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
        <div className="px-4 py-3 bg-gradient-to-b from-transparent to-gray-50/50">
            <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
                    <Baby className="h-3.5 w-3.5" />
                    My little ones
                </p>
                <Link 
                    to={`${AppRoute.PROFILE}?tab=babies`} 
                    className="
                        flex items-center gap-1 text-xs font-medium text-primary 
                        hover:text-primary/80 transition-colors
                    "
                >
                    <Plus className="h-3 w-3" />
                    Manage
                </Link>
            </div>
            <div className="space-y-1.5">
                {babies.slice(0, maxDisplay).map((baby) => (
                    <BabyQuickCard key={baby.id} baby={baby} />
                ))}
            </div>
        </div>
    )
}
