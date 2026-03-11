import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, ArrowRight, Star } from "lucide-react"
import type { DropdownLink, HighlightCard } from "./NavDropdown"
import type { ComboResponse } from "@/api"

interface MegaMenuProps {
    open: boolean
    items: DropdownLink[] | null
    highlight?: HighlightCard
    combos?: ComboResponse[] | null
    onMouseEnter?: () => void
    onMouseLeave?: () => void
}

export function MegaMenu({ open, items, highlight, combos = [], onMouseEnter, onMouseLeave }: MegaMenuProps) {
    const hasRightContent = highlight || (combos && combos.length > 0);

    return (
        <AnimatePresence>
            {open && items && (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}
                    className="absolute left-0 top-full w-full border-b border-[var(--color-border)] bg-white/95 backdrop-blur-md shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] z-50 overflow-hidden"
                >
                    {/* Top Accent Line */}
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent opacity-50" />

                    <div className="mx-auto max-w-7xl px-8 py-10">
                        <div className="grid grid-cols-12 gap-12">
                            {/* Left Side: Category Links */}
                            <div className={hasRightContent ? "col-span-8" : "col-span-12"}>
                                <div className="mb-6 flex items-center justify-between border-b pb-4">
                                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-gray-400)]">
                                        Explore Collections
                                    </h3>
                                    {!hasRightContent && (
                                        <Link to="/products" className="text-xs font-semibold text-[var(--color-primary)] hover:underline flex items-center gap-1">
                                            View All Products <ArrowRight className="h-3 w-3" />
                                        </Link>
                                    )}
                                </div>
                                <div className={`grid gap-x-8 gap-y-6 ${hasRightContent ? "grid-cols-2" : "grid-cols-4"}`}>
                                    {items.map((item, idx) => (
                                        <motion.div
                                            key={item.label}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.03 }}
                                        >
                                            <Link
                                                to={item.href}
                                                className="group flex items-start gap-4 rounded-2xl p-3 transition-all hover:bg-[var(--color-gray-50)]"
                                            >
                                                {item.image && (
                                                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-[var(--color-gray-100)] shadow-sm">
                                                        <img
                                                            src={item.image}
                                                            alt={item.label}
                                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                        />
                                                        <div className="absolute inset-0 bg-[var(--color-primary)]/0 transition-colors group-hover:bg-[var(--color-primary)]/5" />
                                                    </div>
                                                )}
                                                <div className="pt-1">
                                                    <p className="text-sm font-bold text-[var(--color-gray-900)] group-hover:text-[var(--color-primary)] transition-colors">
                                                        {item.label}
                                                    </p>
                                                    {item.description && (
                                                        <p className="mt-1 text-xs leading-relaxed text-[var(--color-gray-500)] line-clamp-2">
                                                            {item.description}
                                                        </p>
                                                    )}
                                                    <div className="mt-2 h-[1px] w-0 bg-[var(--color-primary)] transition-all duration-300 group-hover:w-full" />
                                                </div>
                                            </Link>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Right Side: Featured/Combos */}
                            {hasRightContent && (
                                <div className="col-span-4 border-l border-[var(--color-gray-100)] pl-12">
                                    {(combos && combos.length > 0) ? (
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Sparkles className="h-3.5 w-3.5 text-[var(--color-primary)]" />
                                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-gray-400)]">
                                                        Special Sets
                                                    </h4>
                                                </div>
                                                <Link to="/products" className="text-[10px] font-bold text-[var(--color-primary)] hover:underline flex items-center gap-1">
                                                    View All <ArrowRight className="h-2.5 w-2.5" />
                                                </Link>
                                            </div>

                                            <div className="space-y-4">
                                                {combos.slice(0, 1).map((combo) => (
                                                    <motion.div
                                                        key={combo.id}
                                                        initial={{ opacity: 0, x: 10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: 0.15, duration: 0.5 }}
                                                    >
                                                        <Link
                                                            to={`/products/${combo.slug}`}
                                                            className="group block"
                                                        >
                                                            <div className="relative aspect-video overflow-hidden rounded-2xl border border-[var(--color-gray-100)] bg-white shadow-sm transition-all group-hover:shadow-md group-hover:border-[var(--color-primary-light)]">
                                                                {combo.imageUrl ? (
                                                                    <img
                                                                        src={combo.imageUrl}
                                                                        alt={combo.name}
                                                                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                                    />
                                                                ) : (
                                                                    <div className="flex h-full w-full items-center justify-center bg-[var(--color-gray-50)]">
                                                                        <Sparkles className="h-8 w-8 text-[var(--color-primary-light)]" />
                                                                    </div>
                                                                )}
                                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                                                                <div className="absolute bottom-3 right-3 translate-x-2 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100">
                                                                    <div className="rounded-full bg-white p-2 text-[var(--color-primary)] shadow-lg">
                                                                        <ArrowRight className="h-3.5 w-3.5" />
                                                                    </div>
                                                                </div>
                                                                <div className="absolute top-3 left-3">
                                                                    <span className="rounded-full bg-white/90 backdrop-blur-sm px-2.5 py-0.5 text-[9px] font-black text-[var(--color-primary)] uppercase tracking-wider shadow-sm">
                                                                        Featured
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <div className="mt-3 px-1 space-y-1">
                                                                <div className="flex items-center justify-between gap-2">
                                                                    <h5 className="text-[13px] font-black text-[var(--color-gray-900)] group-hover:text-[var(--color-primary)] transition-colors line-clamp-1">
                                                                        {combo.name}
                                                                    </h5>
                                                                    <span className="shrink-0 text-[13px] font-black text-[var(--color-primary)]">
                                                                        {combo.salePrice.toLocaleString()}đ
                                                                    </span>
                                                                </div>
                                                                <p className="text-[11px] leading-snug text-[var(--color-gray-500)] line-clamp-2">
                                                                    {combo.description || "Premium collection for your baby's comfort."}
                                                                </p>
                                                            </div>
                                                        </Link>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : highlight ? (
                                        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--color-gray-50)] to-white p-6 border border-[var(--color-gray-100)]">
                                            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[var(--color-primary-light)] opacity-20 blur-3xl" />

                                            <img
                                                src={highlight.image}
                                                alt={highlight.title}
                                                className="relative mb-6 h-40 w-full rounded-2xl object-cover shadow-lg"
                                            />

                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-primary)]">
                                                        Editor's Choice
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <h4 className="text-lg font-black text-[var(--color-gray-900)] leading-tight">
                                                        {highlight.title}
                                                    </h4>
                                                    {highlight.badge && (
                                                        <span className="rounded-full bg-[var(--color-primary)] px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-tighter">
                                                            {highlight.badge}
                                                        </span>
                                                    )}
                                                </div>

                                                <p className="text-xs leading-relaxed text-[var(--color-gray-500)]">
                                                    {highlight.description}
                                                </p>

                                                <Link
                                                    to={highlight.href}
                                                    className="group mt-4 inline-flex items-center gap-2 text-sm font-bold text-[var(--color-primary)] transition-all hover:gap-3"
                                                >
                                                    {highlight.ctaLabel}
                                                    <span className="transition-transform group-hover:translate-x-1">→</span>
                                                </Link>
                                            </div>
                                        </div>
                                    ) : null}
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

