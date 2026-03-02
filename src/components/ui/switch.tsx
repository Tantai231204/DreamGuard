import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"
import { cn } from "../../lib/utils"

const Switch = React.forwardRef<
    React.ElementRef<typeof SwitchPrimitives.Root>,
    React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
    <SwitchPrimitives.Root
        ref={ref}
        className={cn(
            "peer relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center",
            "rounded-full border-2 border-transparent",
            "transition-all duration-300 ease-in-out",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-green-400 data-[state=checked]:via-green-500 data-[state=checked]:to-emerald-500",
            "data-[state=unchecked]:bg-gray-200",
            "shadow-sm",
            className
        )}
        {...props}
    >
        <SwitchPrimitives.Thumb
            className={cn(
                "pointer-events-none absolute left-0.5 top-1/2",
                "h-5 w-5 -translate-y-1/2 rounded-full",
                "bg-white shadow-lg ring-0",
                "transition-all duration-300 ease-out will-change-transform",
                "data-[state=checked]:translate-x-5"
            )}
        />
    </SwitchPrimitives.Root>
))

Switch.displayName = SwitchPrimitives.Root.displayName
export { Switch }