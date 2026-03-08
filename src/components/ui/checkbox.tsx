import * as React from "react"
import { twMerge } from "tailwind-merge"

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
    onCheckedChange?: (checked: boolean) => void
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
    ({ className, onChange, onCheckedChange, ...props }, ref) => {
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            onChange?.(e)
            onCheckedChange?.(e.target.checked)
        }

        return (
            <input
                type="checkbox"
                className={twMerge(
                    "h-4 w-4 shrink-0 rounded border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#7dd3e8]/30 focus:border-[#7dd3e8] disabled:cursor-not-allowed disabled:opacity-50 checked:bg-[#7dd3e8] checked:border-[#7dd3e8] transition-all accent-[#7dd3e8]",
                    className
                )}
                ref={ref}
                onChange={handleChange}
                {...props}
            />
        )
    }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
