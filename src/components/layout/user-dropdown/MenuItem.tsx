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
            px-3 py-2.5 cursor-pointer outline-none rounded-xl
            hover:bg-primary/5 transition-all duration-200
            group mx-1
        ">
            <Link to={to} className="flex items-center gap-3">
                <div className="text-gray-400 group-hover:text-primary transition-colors">
                    {icon}
                </div>

                <p className="flex-1 font-semibold text-gray-700 text-[13px] group-hover:text-primary transition-colors tracking-tight">
                    {title}
                </p>

                {badge !== undefined && (
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-400 group-hover:bg-primary/20 group-hover:text-primary transition-all">
                        {badge}
                    </span>
                )}
            </Link>
        </DropdownMenuItem>
    )
}
