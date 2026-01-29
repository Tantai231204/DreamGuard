import { User } from "lucide-react"
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
                    relative rounded-full p-2.5 text-gray-500
                    border border-transparent
                    transition-all duration-200 ease-out
                    hover:bg-gray-50 hover:text-primary hover:border-gray-200
                    focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30
                    active:scale-[0.97]
                    data-[state=open]:bg-gray-50 data-[state=open]:text-primary data-[state=open]:border-primary/30
                "
                aria-label="Menu tài khoản"
            >
                <User className="h-5 w-5 transition-transform duration-200" />
                {isAuthenticated && notificationCount > 0 && (
                    <span className="
                        absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center 
                        rounded-full bg-primary px-1 text-[10px] font-semibold text-white
                        shadow-sm
                    ">
                        {notificationCount}
                    </span>
                )}
            </button>
        </DropdownMenuTrigger>
    )
}
