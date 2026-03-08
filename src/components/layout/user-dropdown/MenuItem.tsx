import { Link } from "react-router-dom"
import { DropdownMenuItem } from "../../ui/dropdown-menu"
import type { MenuItemProps } from "./types"

export function MenuItem({
    to,
    icon,
    title,
    badge,
}: MenuItemProps) {
    return (
        <DropdownMenuItem asChild className="
            px-4 py-3 cursor-pointer outline-none
            hover:bg-gray-50 transition-colors duration-150
            group
        ">
            <Link to={to} className="flex items-center gap-3.5">
                <div className="text-gray-400 group-hover:text-gray-900 transition-colors">
                    {icon}
                </div>

                <p className="flex-1 font-medium text-gray-700 text-sm group-hover:text-gray-900 transition-colors">
                    {title}
                </p>

                {badge !== undefined && (
                    <span className="text-[11px] font-bold text-gray-400">
                        {badge}
                    </span>
                )}
            </Link>
        </DropdownMenuItem>
    )
}
