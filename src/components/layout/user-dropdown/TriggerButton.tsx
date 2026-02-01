import { User, ChevronDown } from "lucide-react"
import { DropdownMenuTrigger } from "../../ui/dropdown-menu"

interface TriggerButtonProps {
    isAuthenticated: boolean
    notificationCount?: number
}

export function TriggerButton({ isAuthenticated, notificationCount = 3 }: TriggerButtonProps) {
    return (
        <DropdownMenuTrigger asChild>
            <button
                className="
                    relative flex items-center gap-1.5 rounded-full px-2.5 py-2
                    bg-transparent
                    transition-all duration-300 ease-out
                    hover:bg-gray-100
                    focus:outline-none focus:ring-2 focus:ring-primary/20
                    active:scale-[0.98]
                    data-[state=open]:bg-gray-100
                    group
                "
                aria-label="Menu tài khoản"
            >
                <User className="h-5 w-5 text-gray-600 group-hover:text-gray-800 transition-colors" />
                <ChevronDown className="h-3.5 w-3.5 text-gray-400 transition-transform duration-300 group-data-[state=open]:rotate-180" />
                {isAuthenticated && notificationCount > 0 && (
                    <span className="
                        absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center 
                        rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white
                        ring-2 ring-white
                    ">
                        {notificationCount}
                    </span>
                )}
            </button>
        </DropdownMenuTrigger>
    )
}
