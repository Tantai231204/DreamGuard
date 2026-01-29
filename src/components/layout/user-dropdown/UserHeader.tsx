import { User, Crown } from "lucide-react"
import type { UserInfo } from "./types"

interface UserHeaderProps {
    user: UserInfo
}

export function UserHeader({ user }: UserHeaderProps) {
    return (
        <div className="bg-[var(--color-primary-light)] p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
                <div className="
                    flex h-12 w-12 items-center justify-center rounded-xl bg-white border border-gray-200
                    transition-all duration-300
                    hover:shadow-md hover:scale-105
                ">
                    <User className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{user.name}</p>
                    <p className="text-sm text-gray-600 truncate">{user.email}</p>
                </div>
            </div>
            {/* Points Badge */}
            <div className="mt-3 flex items-center gap-2">
                <div className="
                    flex items-center gap-1.5 rounded-lg bg-white border border-amber-200 px-2.5 py-1
                    transition-all duration-200
                    hover:border-amber-300 hover:shadow-sm
                ">
                    <Crown className="h-3.5 w-3.5 text-amber-500" />
                    <span className="text-xs font-semibold text-amber-700">{user.points} điểm</span>
                </div>
                <span className="text-xs text-gray-500">{user.rank}</span>
            </div>
        </div>
    )
}
