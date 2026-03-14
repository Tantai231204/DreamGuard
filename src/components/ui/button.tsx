import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { twMerge } from 'tailwind-merge'

const buttonVariants = cva(
    'inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
    {
        variants: {
            variant: {
                default: 'bg-primary text-white hover:bg-primary-hover border-2 border-primary hover:border-primary-hover shadow-sm hover:shadow-md',
                secondary: 'bg-primary-light text-primary-dark hover:bg-primary-light/80 border-2 border-primary-light hover:border-primary-light/80 shadow-sm',
                outline: 'border-2 border-primary-light bg-white hover:bg-primary-light/10 hover:border-primary hover:text-primary shadow-sm',
                ghost: 'hover:bg-primary-light/30 hover:text-primary border-2 border-transparent',
                link: 'underline-offset-4 hover:underline text-primary',
                amber: 'bg-amber-400 text-white hover:bg-amber-500 border-2 border-amber-400 hover:border-amber-500 shadow-lg shadow-amber-400/20 hover:shadow-amber-400/40',
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

export { buttonVariants }
