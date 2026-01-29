import { Link } from "react-router-dom"
import { Baby, ChevronRight } from "lucide-react"
import { AppRoute } from "../../../lib/constants"
import type { BabyProfile } from "./types"
import { calculateAge, getGenderStyles } from "./utils"

interface BabyQuickCardProps {
    baby: BabyProfile
}

export function BabyQuickCard({ baby }: BabyQuickCardProps) {
    const age = calculateAge(baby.birthDate)
    const genderStyles = getGenderStyles(baby.gender)

    return (
        <Link
            to={`${AppRoute.PROFILE}?tab=babies&babyId=${baby.id}`}
            className="
                flex items-center gap-3 rounded-lg p-2.5 
                border border-transparent
                transition-all duration-200 ease-out
                hover:bg-gray-50 hover:border-gray-100 hover:shadow-sm
                group
            "
        >
            <div className={`
                flex h-9 w-9 items-center justify-center rounded-lg border ${genderStyles}
                transition-all duration-200
                group-hover:scale-110 group-hover:shadow-sm
            `}>
                <Baby className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 text-sm truncate transition-colors group-hover:text-primary">
                    {baby.nickname}
                </p>
                <p className="text-xs text-gray-500">{age}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-300 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-gray-400" />
        </Link>
    )
}
