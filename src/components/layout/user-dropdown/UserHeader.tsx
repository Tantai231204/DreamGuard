import { Crown, Gem } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar"
import type { UserInfo } from "./types"

interface UserHeaderProps {
    user: UserInfo
}

export function UserHeader({ user }: UserHeaderProps) {
    const initials = user.name.split(' ').map(n => n[0]).join('').slice(0, 2)
    
    return (
        <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-sky-50 to-primary/10 p-5">
            {/* Decorative elements */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-sky-200/40 rounded-full blur-xl" />
            
            <div className="relative flex items-center gap-4">
                <Avatar className="h-14 w-14 ring-4 ring-white shadow-lg">
                    <AvatarImage src="" alt={user.name} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-white text-lg font-semibold">
                        {initials}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{user.name}</p>
                    <p className="text-sm text-gray-500 truncate">{user.email}</p>
                </div>
            </div>
            
            {/* Points badge */}
            <div className="relative mt-4 flex items-center gap-2">
                <div className="
                    inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
                    bg-gradient-to-r from-amber-50 to-orange-50
                    border border-amber-200/60
                    shadow-sm
                ">
                    <Gem className="h-3.5 w-3.5 text-amber-500" />
                    <span className="text-xs font-semibold text-amber-700">{user.points} pts</span>
                </div>
                <span className="
                    inline-flex items-center gap-1 px-2 py-1 rounded-full
                    bg-white/80 text-xs text-gray-500
                ">
                    <Crown className="h-3 w-3 text-amber-400" />
                    {user.rank}
                </span>
            </div>
        </div>
    )
}
