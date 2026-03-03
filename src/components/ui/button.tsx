import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { twMerge } from 'tailwind-merge'

const buttonVariants = cva(
    'inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4988c4] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
    {
        variants: {
            variant: {
                default: 'bg-[#4988c4] text-white hover:bg-[#3a73a8] border-2 border-[#4988c4] hover:border-[#3a73a8] shadow-sm hover:shadow-md',
                secondary: 'bg-[#bde8f5] text-[#3a73a8] hover:bg-[#94d9ef] border-2 border-[#bde8f5] hover:border-[#94d9ef] shadow-sm hover:shadow-md',
                outline: 'border-2 border-gray-300 bg-white hover:bg-gray-50 hover:border-[#4988c4] hover:text-[#4988c4] shadow-sm hover:shadow-md',
                ghost: 'hover:bg-[#bde8f5]/30 hover:text-[#4988c4] border-2 border-transparent',
                link: 'underline-offset-4 hover:underline text-[#4988c4]',
            },
            size: {
                default: 'h-10 px-5 py-2',
                sm: 'h-8 rounded-md px-3 text-xs',
                lg: 'h-11 rounded-lg px-8',
                icon: 'h-9 w-9',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : 'button'
        return (
            <Comp
                className={twMerge(buttonVariants({ variant, size }), className)}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = 'Button'
