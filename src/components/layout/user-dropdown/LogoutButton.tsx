import { LogOut } from "lucide-react"
import { DropdownMenuItem } from "../../ui/dropdown-menu"

interface LogoutButtonProps {
    onLogout: () => void
}

export function LogoutButton({ onLogout }: LogoutButtonProps) {
    return (
        <DropdownMenuItem
            onClick={onLogout}
            className="
                px-4 py-3 cursor-pointer outline-none
                hover:bg-red-50/50 transition-colors duration-150
                group
            "
        >
            <div className="flex items-center gap-3.5">
                <LogOut className="h-4 w-4 text-red-500/70 group-hover:text-red-600 transition-colors" />
                <span className="font-medium text-sm text-red-600">Sign Out</span>
            </div>
        </DropdownMenuItem>
    )
}
