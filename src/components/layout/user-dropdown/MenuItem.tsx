import { Link } from "react-router-dom"
import { ChevronRight } from "lucide-react"
import { DropdownMenuItem } from "../../ui/dropdown-menu"
import type { MenuItemProps } from "./types"

export function MenuItem({ 
    to, 
    icon, 
    iconBg, 
    title, 
    subtitle, 
    badge, 
    badgeColor = "bg-gray-100 text-gray-600" 
}: MenuItemProps) {
    return (
        <DropdownMenuItem asChild className="rounded-xl px-3 py-2.5 cursor-pointer focus:bg-gray-50/80 hover:bg-gray-50/80 group transition-colors duration-150">
            <Link to={to} className="flex items-center gap-3">
                <div className={`
                    flex h-9 w-9 items-center justify-center rounded-xl ${iconBg}
                    transition-all duration-200 ease-out
                    group-hover:scale-105
                `}>
                    {icon}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-700 text-sm transition-colors duration-150 group-hover:text-gray-900">
                        {title}
                    </p>
                    {subtitle && (
                        <p className="text-xs text-gray-400 transition-colors duration-150 group-hover:text-gray-500">{subtitle}</p>
                    )}
                </div>
                {badge !== undefined ? (
                    <span className={`
                        rounded-full px-2 py-0.5 text-xs font-semibold ${badgeColor}
                        transition-all duration-150 group-hover:scale-105
                    `}>
                        {badge}
                    </span>
                ) : (
                    <ChevronRight className="h-4 w-4 text-gray-300 transition-all duration-150 group-hover:translate-x-0.5 group-hover:text-gray-400" />
                )}
            </Link>
        </DropdownMenuItem>
    )
}
