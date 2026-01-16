import * as Tabs from '@radix-ui/react-tabs'

interface ProductTabsProps {
    className?: string
}

export default function ProductTabs({ className }: ProductTabsProps) {
    return (
        <Tabs.List className={`flex justify-center gap-3 ${className || ''}`}>
            <Tabs.Trigger
                value="featured"
                className="px-5 py-2 rounded-full text-xs font-medium transition-all duration-300 data-[state=active]:bg-[var(--color-product-tab-active)] data-[state=active]:text-white data-[state=inactive]:bg-white data-[state=inactive]:text-[var(--color-product-tab-inactive)] hover:bg-gray-100 data-[state=active]:shadow-md data-[state=inactive]:hover:text-gray-900"
            >
                Featured
            </Tabs.Trigger>
            <Tabs.Trigger
                value="bestseller"
                className="px-5 py-2 rounded-full text-xs font-medium transition-all duration-300 data-[state=active]:bg-[var(--color-product-tab-active)] data-[state=active]:text-white data-[state=inactive]:bg-white data-[state=inactive]:text-[var(--color-product-tab-inactive)] hover:bg-gray-100 data-[state=active]:shadow-md data-[state=inactive]:hover:text-gray-900"
            >
                Best seller
            </Tabs.Trigger>
            <Tabs.Trigger
                value="newarrivals"
                className="px-5 py-2 rounded-full text-xs font-medium transition-all duration-300 data-[state=active]:bg-[var(--color-product-tab-active)] data-[state=active]:text-white data-[state=inactive]:bg-white data-[state=inactive]:text-[var(--color-product-tab-inactive)] hover:bg-gray-100 data-[state=active]:shadow-md data-[state=inactive]:hover:text-gray-900"
            >
                New arrivals
            </Tabs.Trigger>
        </Tabs.List>
    )
}
