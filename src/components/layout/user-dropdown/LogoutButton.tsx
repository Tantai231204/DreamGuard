import { LogOut } from "lucide-react"
import { DropdownMenuItem } from "../../ui/dropdown-menu"

interface LogoutButtonProps {
    onLogout: () => void
}

export function LogoutButton({ onLogout }: LogoutButtonProps) {
    return (
        <div className="p-3 pt-0">
            <DropdownMenuItem
                onClick={onLogout}
                className="
                    rounded-xl px-3 py-2.5 cursor-pointer 
                    bg-gradient-to-r from-red-50/80 to-rose-50/80
                    text-red-600 
                    transition-all duration-300
                    focus:from-red-100 focus:to-rose-100
                    hover:from-red-100 hover:to-rose-100 hover:shadow-sm
                    group
                "
            >
                <div className="flex items-center gap-3">
                    <div className="
                        flex h-9 w-9 items-center justify-center rounded-xl 
                        bg-white/80 shadow-sm
                        transition-all duration-300
                        group-hover:scale-105 group-hover:shadow-md
                    ">
                        <LogOut className="h-4 w-4" />
                    </div>
                    <span className="font-medium text-sm">Sign out</span>
                </div>
            </DropdownMenuItem>
        </div>
    )
}
