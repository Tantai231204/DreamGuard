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
    badgeColor = "bg-gray-500 text-white" 
}: MenuItemProps) {
    return (
        <DropdownMenuItem asChild className="
            rounded-2xl px-3 py-2.5 cursor-pointer 
            focus:bg-gray-50/80 hover:bg-gray-50/80 
            transition-all duration-200 
            group
        ">
            <Link to={to} className="flex items-center gap-3">
                <div className={`
                    flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}
                    transition-all duration-300 ease-out
                    group-hover:scale-105 group-hover:shadow-md
                `}>
                    {icon}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-700 text-sm group-hover:text-gray-900">
                        {title}
                    </p>
                    {subtitle && (
                        <p className="text-xs text-gray-400 group-hover:text-gray-500">{subtitle}</p>
                    )}
                </div>
                {badge !== undefined ? (
                    <span className={`
                        rounded-full px-2 py-0.5 text-[10px] font-bold ${badgeColor}
                        shadow-sm
                    `}>
                        {badge}
                    </span>
                ) : (
                    <ChevronRight className="h-4 w-4 text-gray-300 transition-all duration-200 group-hover:translate-x-1 group-hover:text-gray-400" />
                )}
            </Link>
        </DropdownMenuItem>
    )
}
