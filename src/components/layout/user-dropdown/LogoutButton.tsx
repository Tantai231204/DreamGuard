import { LogOut } from "lucide-react"
import { DropdownMenuItem } from "../../ui/dropdown-menu"

interface LogoutButtonProps {
    onLogout: () => void
}

export function LogoutButton({ onLogout }: LogoutButtonProps) {
    return (
        <div className="p-2">
            <DropdownMenuItem
                onClick={onLogout}
                className="
                    rounded-lg px-3 py-2.5 cursor-pointer text-red-600 
                    transition-all duration-200
                    focus:bg-red-50 focus:text-red-600
                    hover:bg-red-50
                    group
                "
            >
                <div className="flex items-center gap-3">
                    <div className="
                        flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 border border-red-100
                        transition-all duration-200
                        group-hover:scale-110 group-hover:bg-red-100
                    ">
                        <LogOut className="h-4 w-4" />
                    </div>
                    <span className="font-medium text-sm">Đăng xuất</span>
                </div>
            </DropdownMenuItem>
        </div>
    )
}
