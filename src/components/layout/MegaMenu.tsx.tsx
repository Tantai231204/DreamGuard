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
                            {/* Links */}
                            <div className="col-span-8 grid grid-cols-3 gap-6">
                                {items.map((item) => (
                                    <Link
                                        key={item.label}
                                        to={item.href}
                                        className="group rounded-lg p-3 transition hover:bg-muted"
                                    >
                                        <p className="font-medium group-hover:text-primary">
                                            {item.label}
                                        </p>
                                        {item.description && (
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                {item.description}
                                            </p>
                                        )}
                                    </Link>
                                ))}
                            </div>

                            {/* Highlight */}
                            {highlight && (
                                <div className="col-span-4 rounded-xl bg-muted p-5">
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
                                            <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-white">
                                                {highlight.badge}
                                            </span>
                                        )}
                                    </div>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        {highlight.description}
                                    </p>
                                    <Link
                                        to={highlight.href}
                                        className="mt-4 inline-block text-sm font-medium text-primary"
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
