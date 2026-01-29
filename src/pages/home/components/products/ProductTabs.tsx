import * as Tabs from '@radix-ui/react-tabs'

interface ProductTabsProps {
    className?: string
}

const tabClassName = `
    px-5 py-2 rounded-full text-xs font-medium transition-all duration-300
    data-[state=active]:bg-[var(--color-primary-light)] data-[state=active]:text-gray-900
    data-[state=inactive]:bg-white data-[state=inactive]:text-gray-600
    hover:bg-gray-100 data-[state=active]:shadow-md data-[state=inactive]:hover:text-gray-900
`

export default function ProductTabs({ className }: ProductTabsProps) {
    return (
        <Tabs.List className={`flex justify-center gap-3 ${className || ''}`}>
            <Tabs.Trigger value="featured" className={tabClassName}>
                Featured
            </Tabs.Trigger>
            <Tabs.Trigger value="bestseller" className={tabClassName}>
                Best seller
            </Tabs.Trigger>
            <Tabs.Trigger value="newarrivals" className={tabClassName}>
                New arrivals
            </Tabs.Trigger>
        </Tabs.List>
    )
}
