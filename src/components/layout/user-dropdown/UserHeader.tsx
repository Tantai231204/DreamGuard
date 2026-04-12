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

    const initials = user.name.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2)

    return (
        <div className="p-5 pb-4 border-b border-gray-50 bg-gradient-to-b from-gray-50/30 to-transparent">
            <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border-2 border-white shadow-sm ring-1 ring-gray-100">
                    {user.avatarUrl ? (
                        <AvatarImage src={user.avatarUrl} alt={user.name} className="object-cover" />
                    ) : (
                        <AvatarFallback className="bg-primary text-white font-black text-xs">
                            {initials}
                        </AvatarFallback>
                    )}
                </Avatar>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <p className="font-black text-slate-900 leading-none truncate tracking-tight">{user.name}</p>
                    </div>
                    <p className="text-[11px] font-medium text-slate-400 mt-1 truncate tracking-tight">{user.email}</p>
                </div>
            </div>

            <div className="mt-5 flex items-center justify-between">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100/50">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Logged In</span>
                </div>

                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-100/50 shadow-sm">
                    <div className="w-3.5 h-3.5 rounded-full bg-amber-500 flex items-center justify-center shadow-sm">
                        <span className="text-[8px] text-white font-black">⌬</span>
                    </div>
                    <span className="text-[10px] font-black text-amber-600 uppercase tracking-tight">
                        {user.memberCoin} Coins
                    </span>
                </div>
            </div>
        </div>
    )
}
