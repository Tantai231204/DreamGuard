import * as React from "react"
import { cn } from "../../lib/utils"

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "secondary" | "success" | "warning" | "danger" | "outline"
}

const badgeVariants = {
    default: "bg-[#bde8f5]/50 text-[#3a73a8] border-[#bde8f5]",
    secondary: "bg-[#bde8f5] text-[#3a73a8] border-[#94d9ef]",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    danger: "bg-red-50 text-red-700 border-red-200",
    outline: "bg-transparent text-gray-700 border-gray-300",
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
    ({ className, variant = "default", ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
                badgeVariants[variant],
                className
            )}
            {...props}
        />
    )
)
Badge.displayName = "Badge"

export { Badge }
