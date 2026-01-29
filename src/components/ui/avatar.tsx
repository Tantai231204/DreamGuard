import * as React from "react"
import { cn } from "../../lib/utils"

/* ================= Avatar Root ================= */
interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
    size?: "sm" | "md" | "lg" | "xl"
}

const avatarSizes = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
    xl: "h-16 w-16 text-lg",
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
    ({ className, size = "md", ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                "relative flex shrink-0 overflow-hidden rounded-full",
                avatarSizes[size],
                className
            )}
            {...props}
        />
    )
)
Avatar.displayName = "Avatar"

/* ================= Avatar Image ================= */
type AvatarImageProps = React.ImgHTMLAttributes<HTMLImageElement>

const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
    ({ className, ...props }, ref) => (
        <img
            ref={ref}
            className={cn("aspect-square h-full w-full object-cover", className)}
            {...props}
        />
    )
)
AvatarImage.displayName = "AvatarImage"

/* ================= Avatar Fallback ================= */
interface AvatarFallbackProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "primary" | "soft"
}

const avatarVariants = {
    default: "bg-muted text-muted-foreground",
    primary: "bg-primary text-white",
    soft: "bg-primary/10 text-primary",
}

const AvatarFallback = React.forwardRef<HTMLDivElement, AvatarFallbackProps>(
    ({ className, variant = "primary", ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                "flex h-full w-full items-center justify-center rounded-full font-semibold",
                avatarVariants[variant],
                className
            )}
            {...props}
        />
    )
)
AvatarFallback.displayName = "AvatarFallback"

export { Avatar, AvatarImage, AvatarFallback }
