import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { type VariantProps } from 'class-variance-authority'
import { twMerge } from 'tailwind-merge'
import { buttonVariants } from './button-variants'



export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, children, ...props }, ref) => {
        const Comp = asChild ? Slot : 'button'
        return (
            <Comp
                className={twMerge(buttonVariants({ variant, size }), className)}
                ref={ref}
                {...props}
            >
                {children}
            </Comp>
        )
    }
)
Button.displayName = 'Button'



