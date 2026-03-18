import { Crown } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar"
import { Skeleton } from "../../ui/skeleton"
import type { UserInfo } from "./types"

interface UserHeaderProps {
    user: UserInfo
    isLoading?: boolean
}

export function UserHeader({ user, isLoading }: UserHeaderProps) {
    if (isLoading) {
        return (
            <div className="p-5 pb-4 border-b border-gray-50">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-32" />
                    </div>
                </div>
                <div className="mt-6 flex items-center justify-between">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-4 w-12 rounded-full" />
                </div>
            </div>
        )
    }

    const initials = user.name.split(' ').map(n => n[0]).join('').slice(0, 2)

    return (
        <div className="p-5 pb-4 border-b border-gray-50 bg-gradient-to-b from-gray-50/30 to-transparent">
            <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border-2 border-white shadow-sm ring-1 ring-gray-100">
                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                    <AvatarFallback className="bg-gray-100 text-gray-500 font-semibold text-xs">
                        {initials}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-900 leading-none truncate">{user.name}</p>
                    </div>
                    <p className="text-[11px] font-medium text-gray-400 mt-1 truncate tracking-tight">{user.email}</p>
                </div>
            </div>

            <div className="mt-5 flex items-center justify-between">
                {/* High-Fidelity Metallic Rank Badge */}
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-br from-slate-100 via-gray-300 to-slate-200 border border-slate-300/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_1px_2px_rgba(0,0,0,0.05)]">
                    <Crown className="h-2.5 w-2.5 text-slate-500 fill-slate-400 drop-shadow-[0_1px_0_rgba(255,255,255,0.5)]" />
                    <span className="text-[9px] font-black text-slate-700 uppercase tracking-wider drop-shadow-[0_1px_0_rgba(255,255,255,0.5)]">Silver Member</span>
                </div>

                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/5 text-primary text-[10px] font-black uppercase tracking-tight">
                    {user.points} Points
                </div>
            </div>
        </div>
    )
}
