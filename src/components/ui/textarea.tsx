import * as React from "react"
import { twMerge } from "tailwind-merge"

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={twMerge(
          "flex min-h-[80px] w-full rounded-lg border border-gray-300 bg-gray-50/50 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:border-[#4988c4] focus:ring-2 focus:ring-[#4988c4]/20 disabled:cursor-not-allowed disabled:opacity-50 transition-all resize-none",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
