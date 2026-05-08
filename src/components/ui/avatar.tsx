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

const AvatarContext = React.createContext<{
    status: "idle" | "loading" | "loaded" | "error";
    setStatus: (status: "idle" | "loading" | "loaded" | "error") => void;
} | null>(null);

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
    ({ className, size = "md", children, ...props }, ref) => {
        const [status, setStatus] = React.useState<"idle" | "loading" | "loaded" | "error">("idle");

        return (
            <AvatarContext.Provider value={{ status, setStatus }}>
                <div
                    ref={ref}
                    className={cn(
                        "relative flex shrink-0 overflow-hidden rounded-full",
                        avatarSizes[size],
                        className
                    )}
                    {...props}
                >
                    {children}
                </div>
            </AvatarContext.Provider>
        )
    }
)
Avatar.displayName = "Avatar"

/* ================= Avatar Image ================= */
type AvatarImageProps = React.ImgHTMLAttributes<HTMLImageElement>

const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
    ({ className, src, ...props }, ref) => {
        const context = React.useContext(AvatarContext);
        
        // Handle stringified "null" or "undefined" from some APIs
        const validSrc = src && src !== "null" && src !== "undefined" ? src : null;

        React.useEffect(() => {
            if (!validSrc) {
                context?.setStatus("error");
            } else {
                context?.setStatus("loading");
            }
        }, [validSrc, context]);

        if (context?.status === "error" && !validSrc) return null;

        return (
            <img
                ref={ref}
                src={validSrc || undefined}
                className={cn(
                    "aspect-square h-full w-full object-cover", 
                    className, 
                    context?.status !== "loaded" && "hidden"
                )}
                onLoad={() => context?.setStatus("loaded")}
                onError={() => context?.setStatus("error")}
                {...props}
            />
        )
    }
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
    ({ className, variant = "primary", children, ...props }, ref) => {
        const context = React.useContext(AvatarContext);

        if (context?.status === "loaded") return null;

        return (
            <div
                ref={ref}
                className={cn(
                    "flex h-full w-full items-center justify-center rounded-full font-semibold overflow-hidden transition-opacity duration-300",
                    avatarVariants[variant],
                    className,
                    context?.status === "loading" ? "opacity-50" : "opacity-100"
                )}
                {...props}
            >
                {children || (
                    <img 
                        src="/images/logo_no_name.svg" 
                        alt="DG" 
                        className={cn(
                            "w-1/2 h-1/2 object-contain transition-all duration-300",
                            (variant === "primary" || className?.includes("bg-[#4988c4]")) 
                                ? "brightness-0 invert" 
                                : "opacity-70 grayscale hover:opacity-100"
                        )} 
                    />
                )}
            </div>
        )
    }
)
AvatarFallback.displayName = "AvatarFallback"

export { Avatar, AvatarImage, AvatarFallback }
