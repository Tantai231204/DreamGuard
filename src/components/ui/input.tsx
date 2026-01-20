import * as React from "react"
import { twMerge } from "tailwind-merge"

type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={twMerge(
                    "flex h-10 w-full rounded-lg border border-gray-300 bg-gray-50/50 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:border-[#7dd3e8] focus:ring-2 focus:ring-[#7dd3e8]/30 disabled:cursor-not-allowed disabled:opacity-50 transition-all",
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Input.displayName = "Input"

export { Input }
