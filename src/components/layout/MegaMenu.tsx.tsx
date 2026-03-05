import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import type { DropdownLink, HighlightCard } from "./NavDropdown"

interface MegaMenuProps {
    open: boolean
    items: DropdownLink[] | null
    highlight?: HighlightCard
    onMouseEnter?: () => void
    onMouseLeave?: () => void
}

export function MegaMenu({ open, items, highlight, onMouseEnter, onMouseLeave }: MegaMenuProps) {
    return (
        <AnimatePresence>
            {open && items && (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}
                    className="absolute left-0 top-full w-screen border-t bg-white shadow-lg z-50"
                >
                    <div className="mx-auto max-w-7xl px-6 py-8">
                        <div className="grid grid-cols-12 gap-8">
                            {/* Material Cards with Images */}
                            <div className={highlight ? "col-span-8" : "col-span-12"}>
                                <div className={`grid gap-4 ${highlight ? "grid-cols-2" : "grid-cols-3 lg:grid-cols-4"}`}>
                                    {items.map((item) => (
                                        <Link
                                            key={item.label}
                                            to={item.href}
                                            className="group flex items-center gap-4 rounded-xl p-3 transition-all hover:bg-gray-50"
                                        >
                                            {item.image && (
                                                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                                    <img
                                                        src={item.image}
                                                        alt={item.label}
                                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                                                    />
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <p className="font-medium text-gray-900 group-hover:text-[var(--color-primary)]">
                                                    {item.label}
                                                </p>
                                                {item.description && (
                                                    <p className="mt-1 text-sm leading-snug text-gray-500 line-clamp-2">
                                                        {item.description}
                                                    </p>
                                                )}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {/* Highlight */}
                            {highlight && (
                                <div className="col-span-4 rounded-xl bg-gray-50 p-5">
                                    <img
                                        src={highlight.image}
                                        alt={highlight.title}
                                        className="mb-4 h-36 w-full rounded-lg object-contain"
                                    />
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-semibold">
                                            {highlight.title}
                                        </h4>
                                        {highlight.badge && (
                                            <span className="rounded-full bg-[var(--color-primary)] px-2 py-0.5 text-xs text-white">
                                                {highlight.badge}
                                            </span>
                                        )}
                                    </div>
                                    <p className="mt-2 text-sm text-gray-500">
                                        {highlight.description}
                                    </p>
                                    <Link
                                        to={highlight.href}
                                        className="mt-4 inline-block text-sm font-medium text-[var(--color-primary)] hover:underline"
                                    >
                                        {highlight.ctaLabel} →
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
