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
                    relative flex items-center justify-center h-10 w-10 rounded-full
                    hover:bg-gray-50 transition-colors duration-200
                    outline-none focus-visible:ring-2 focus-visible:ring-primary/20
                    group
                "
                aria-label="Account Menu"
            >
                <User className="h-5 w-5 text-gray-500 group-hover:text-gray-900 transition-colors" />

                {isAuthenticated && notificationCount > 0 && (
                    <span className="
                        absolute top-2 right-2 flex h-2 w-2 items-center justify-center 
                        rounded-full bg-primary ring-2 ring-white
                    " />
                )}
            </button>
        </DropdownMenuTrigger>
    )
}
