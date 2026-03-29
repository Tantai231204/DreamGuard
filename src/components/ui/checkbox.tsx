import * as React from "react"
import { twMerge } from "tailwind-merge"

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'checked'> {
    checked?: boolean | "indeterminate"
    onCheckedChange?: (checked: boolean) => void
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
    ({ className, onChange, onCheckedChange, checked, ...props }, ref) => {
        const localRef = React.useRef<HTMLInputElement>(null)
        const combinedRef = (node: HTMLInputElement) => {
            if (typeof ref === 'function') ref(node)
            else if (ref) ref.current = node
            // @ts-ignore
            localRef.current = node
        }

        React.useEffect(() => {
            if (localRef.current) {
                localRef.current.indeterminate = checked === "indeterminate"
            }
        }, [checked])

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
                ref={combinedRef}
                checked={checked === true}
                onChange={handleChange}
                {...props}
            />
        )
    }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
