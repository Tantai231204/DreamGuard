import { cva } from 'class-variance-authority'

export const buttonVariants = cva(
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
                premium: 'relative overflow-hidden bg-primary text-white border-2 border-primary hover:bg-primary-hover hover:border-primary-hover shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 active:scale-95 duration-300 font-extrabold text-[11px] uppercase tracking-[0.15em] group after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white/10 after:to-transparent after:-translate-x-full hover:after:translate-x-full after:transition-transform after:duration-[1200ms] after:content-[""]',
            },
            size: {
                default: 'h-10 px-5 py-2',
                sm: 'h-8 rounded-md px-3 text-xs',
                lg: 'h-11 rounded-lg px-8',
                icon: 'h-9 w-9',
                premium: 'h-11 rounded-xl px-6',
                premiumLg: 'h-12 rounded-2xl px-8',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    }
)
