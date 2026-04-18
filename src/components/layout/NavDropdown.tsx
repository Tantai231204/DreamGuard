import { ChevronDown, ArrowRight } from "lucide-react"
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
    href?: string
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
    href,
    isActive,
    isSimpleMenu,
    onOpen,
    onClose,
}: NavDropdownProps) {
    const renderTrigger = () => {
        const triggerContent = (
            <button className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${(!isSimpleMenu && isActive) ? 'text-[#4988c4] bg-[#4988c4]/5' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'}`}>
                {label}
                <ChevronDown className={`h-3 w-3 opacity-60 transition-transform duration-300 ${(!isSimpleMenu && isActive) ? 'rotate-180' : 'group-hover:rotate-180'}`} />
            </button>
        );

        if (href) {
            return (
                <a href={href} className="flex items-center">
                    {triggerContent}
                </a>
            );
        }
        return triggerContent;
    };

    return (
        <>
            {/* Desktop trigger */}
            <div
                className={`relative hidden md:block ${isSimpleMenu ? 'group' : ''}`}
                onMouseEnter={isSimpleMenu ? undefined : onOpen}
                onMouseLeave={isSimpleMenu ? undefined : onClose}
            >
                {renderTrigger()}
                {isSimpleMenu && (
                    <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 hidden w-56 rounded-2xl bg-white p-3 shadow-[0_15px_30px_-10px_rgba(0,0,0,0.05)] ring-1 ring-slate-100 group-hover:block z-50 border border-slate-50 animate-in fade-in zoom-in-95 duration-200">
                        {/* Top accent for dropdown */}
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-[#4988c4] rounded-t-2xl" />

                        <div className="grid gap-1">
                            {items.map(item => (
                                <div key={item.label} className="relative group/link overflow-hidden">
                                    <a
                                        href={item.href}
                                        className="flex items-center justify-between rounded-xl px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-500 transition-all hover:bg-[#4988c4]/5 hover:text-[#4988c4]"
                                    >
                                        {item.label}
                                        <ArrowRight className="h-3 w-3 opacity-0 -translate-x-2 transition-all group-hover/link:opacity-100 group-hover/link:translate-x-0" />
                                    </a>
                                    <div className="absolute bottom-1.5 left-4 right-4 h-px border-b border-dashed border-[#4988c4]/20 scale-x-0 group-hover/link:scale-x-100 transition-transform duration-500 origin-left" />
                                </div>
                            ))}
                        </div>
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
                        <Accordion.Trigger className="flex w-full items-center justify-between py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 border-b border-dashed border-slate-100 hover:text-[#4988c4] transition-colors">
                            {label}
                            <ChevronDown className="h-3 w-3 opacity-50 transition-transform duration-300 data-[state=open]:rotate-180" />
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
