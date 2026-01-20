import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { twMerge } from 'tailwind-merge'

const buttonVariants = cva(
    'inline-flex items-center justify-center rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
    {
        variants: {
            variant: {
                default: 'bg-blue-600 text-white hover:bg-blue-700 border-2 border-blue-600 hover:border-blue-700 shadow-sm hover:shadow-md',
                secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 border-2 border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md',
                outline: 'border-2 border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400 shadow-sm hover:shadow-md',
                ghost: 'hover:bg-gray-100 border-2 border-transparent',
                link: 'underline-offset-4 hover:underline text-blue-600',
            },
            size: {
                default: 'h-9 px-4 py-2',
                sm: 'h-8 rounded-md px-3',
                lg: 'h-10 rounded-md px-8',
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
