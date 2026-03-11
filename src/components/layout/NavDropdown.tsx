import { ChevronDown } from "lucide-react"
import * as Accordion from "@radix-ui/react-accordion"

/* ================= Types ================= */
export type DropdownLink = {
    label: string
    description?: string
    href: string
    image?: string
}

export type HighlightCard = {
    title: string
    description: string
    ctaLabel: string
    href: string
    badge?: string
    image: string
}

interface NavDropdownProps {
    label: string
    items: DropdownLink[]
    highlight?: HighlightCard
    isActive?: boolean
    isSimpleMenu?: boolean
    onOpen?: () => void
    onClose?: () => void
}

/* ================= Component ================= */
export function NavDropdown({
    label,
    items,
    isActive,
    isSimpleMenu,
    onOpen,
    onClose,
}: NavDropdownProps) {
    return (
        <>
            {/* Desktop trigger */}
            <div
                className={`relative hidden md:block ${isSimpleMenu ? 'group' : ''}`}
                onMouseEnter={isSimpleMenu ? undefined : onOpen}
                onMouseLeave={isSimpleMenu ? undefined : onClose}
            >
                <button className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm transition ${(!isSimpleMenu && isActive) ? 'text-primary' : 'text-foreground/60 hover:text-primary group-hover:text-primary'}`}>
                    {label}
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${(!isSimpleMenu && isActive) ? 'rotate-180' : 'group-hover:rotate-180'}`} />
                </button>
                {isSimpleMenu && (
                    <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 hidden w-48 rounded-xl bg-white/95 backdrop-blur-md p-2 shadow-2xl ring-1 ring-black/5 group-hover:block z-50 border border-[var(--color-gray-100)] animate-in fade-in zoom-in-95 duration-200">
                        {items.map(item => (
                            <a key={item.label} href={item.href} className="block rounded-lg px-4 py-2.5 text-sm font-semibold text-[var(--color-gray-700)] transition-all hover:bg-[var(--color-gray-50)] hover:text-[var(--color-primary)]">
                                {item.label}
                            </a>
                        ))}
                    </div>
                )}
            </div>

            {/* Mobile accordion */}
            <Accordion.Root
                type="single"
                collapsible
                className="block w-full md:hidden"
            >
                <Accordion.Item value={label}>
                    <Accordion.Header>
                        <Accordion.Trigger className="flex w-full items-center justify-between py-3 text-sm font-medium">
                            {label}
                            <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
                        </Accordion.Trigger>
                    </Accordion.Header>

                    <Accordion.Content className="space-y-2 pb-3">
                        {items.map((item) => (
                            <a
                                key={item.label}
                                href={item.href}
                                className="block rounded-md px-2 py-2 text-sm text-muted-foreground hover:bg-muted"
                            >
                                {item.label}
                            </a>
                        ))}
                    </Accordion.Content>
                </Accordion.Item>
            </Accordion.Root>
        </>
    )
}
