import { ChevronDown } from "lucide-react"
import * as Accordion from "@radix-ui/react-accordion"

/* ================= Types ================= */
export type DropdownLink = {
    label: string
    description?: string
    href: string
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
    onOpen: () => void
    onClose: () => void
}

/* ================= Component ================= */
export function NavDropdown({
    label,
    items,
    isActive,
    onOpen,
    onClose,
}: NavDropdownProps) {
    return (
        <>
            {/* Desktop trigger */}
            <div
                className="relative hidden md:block"
                onMouseEnter={onOpen}
                onMouseLeave={onClose}
            >
                <button className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm transition ${isActive ? 'text-primary' : 'text-foreground/60 hover:text-primary'}`}>
                    {label}
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isActive ? 'rotate-180' : ''}`} />
                </button>
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
