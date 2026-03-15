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
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}
                    className="absolute left-0 top-full w-full border-b border-slate-100 bg-white shadow-[0_15px_30px_-10px_rgba(0,0,0,0.05)] z-50 overflow-hidden"
                >
                    {/* Top Accent Line - Sharp & Premium */}
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-[#4988c4]" />

                    <div className="mx-auto max-w-7xl px-8 py-10">
                        <div className="grid grid-cols-12 gap-12">
                            {/* Left Side: Category Links */}
                            <div className={hasRightContent ? "col-span-8" : "col-span-12"}>
                                <div className="mb-6 flex items-center justify-between border-b border-slate-50 pb-4">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                        Explore Collections
                                    </h3>
                                    {!hasRightContent && (
                                        <Link to="/products" className="text-[10px] font-black text-[#4988c4] hover:underline flex items-center gap-1 uppercase tracking-widest">
                                            View All <ArrowRight className="h-3 w-3" />
                                        </Link>
                                    )}
                                </div>
                                <div className={`grid gap-x-6 gap-y-4 ${hasRightContent
                                    ? (items.length > 6 ? "grid-cols-2" : "grid-cols-1 md:grid-cols-2")
                                    : "grid-cols-3 md:grid-cols-4"
                                    }`}>
                                    {items.map((item, idx) => (
                                        <motion.div
                                            key={item.label}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.02 }}
                                        >
                                            <Link
                                                to={item.href}
                                                className="group flex items-start gap-4 rounded-2xl p-3 transition-all hover:bg-slate-50 border border-transparent hover:border-slate-100 hover:shadow-sm"
                                            >
                                                {item.image && (
                                                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-50 border border-slate-100">
                                                        <img
                                                            src={item.image}
                                                            alt={item.label}
                                                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                        />
                                                        <div className="absolute inset-0 bg-[#4988c4]/0 transition-colors group-hover:bg-[#4988c4]/5" />
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0 pt-0.5">
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-[11px] font-black text-slate-900 group-hover:text-[#4988c4] transition-colors uppercase tracking-widest leading-none">
                                                            {item.label}
                                                        </p>
                                                        <div className="h-[1px] flex-1 overflow-hidden relative opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                                            <div className="absolute inset-0 border-t border-dashed border-[#4988c4]/30 w-full scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left" />
                                                        </div>
                                                    </div>
                                                    {item.description && (
                                                        <p className="mt-1 text-[9px] font-bold leading-relaxed text-slate-400 line-clamp-1 uppercase tracking-wide">
                                                            {item.description}
                                                        </p>
                                                    )}
                                                    <div className="mt-2 flex items-center gap-1.5 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                                                        <span className="text-[8px] font-black text-[#4988c4] uppercase tracking-tighter">Explore Now</span>
                                                        <ArrowRight className="w-2.5 h-2.5 text-[#4988c4]" />
                                                    </div>
                                                </div>
                                            </Link>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Right Side: Featured/Combos */}
                            {hasRightContent && (
                                <div className="col-span-4 relative pl-12">
                                    {/* Elegant Vertical Dashed Divider */}
                                    <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-slate-100 to-transparent" />
                                    <div className="absolute left-0 top-1/4 bottom-1/4 w-[1px] border-l border-dashed border-[#4988c4]/20" />

                                    {(combos && combos.length > 0) ? (
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Sparkles className="h-4 w-4 text-[#4988c4]" />
                                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">
                                                        Featured Combos
                                                    </h4>
                                                </div>
                                                <Link to="/products" className="text-[10px] font-black text-[#4988c4] hover:underline flex items-center gap-1 uppercase tracking-widest">
                                                    Explore <ArrowRight className="h-2.5 w-2.5" />
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
                                                            to={`/combos/${combo.id}`}
                                                            className="group block"
                                                        >
                                                            <div className="relative aspect-video overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all group-hover:shadow-md group-hover:border-[#4988c4]/30">
                                                                {combo.imageUrl ? (
                                                                    <img
                                                                        src={combo.imageUrl}
                                                                        alt={combo.name}
                                                                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                                    />
                                                                ) : (
                                                                    <div className="flex h-full w-full items-center justify-center bg-slate-50">
                                                                        <Sparkles className="h-8 w-8 text-[#4988c4]/20" />
                                                                    </div>
                                                                )}
                                                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                                                                <div className="absolute bottom-3 right-3 translate-x-2 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100">
                                                                    <div className="rounded-full bg-white p-2 text-[#4988c4] shadow-lg">
                                                                        <ArrowRight className="h-3.5 w-3.5" />
                                                                    </div>
                                                                </div>
                                                                <div className="absolute top-3 left-3">
                                                                    <span className="rounded-full bg-white px-2.5 py-0.5 text-[9px] font-black text-[#4988c4] uppercase tracking-widest shadow-sm ring-1 ring-slate-100">
                                                                        TOP COMBO
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <div className="mt-3 px-1 space-y-1">
                                                                <div className="flex items-center justify-between gap-2">
                                                                    <h5 className="text-[12px] font-black text-slate-900 group-hover:text-[#4988c4] transition-colors line-clamp-1 uppercase tracking-tight">
                                                                        {combo.name}
                                                                    </h5>
                                                                    <span className="shrink-0 text-[12px] font-black text-[#4988c4] tabular-nums">
                                                                        {combo.salePrice.toLocaleString()}đ
                                                                    </span>
                                                                </div>
                                                                <p className="text-[10px] font-bold leading-snug text-slate-400 line-clamp-1 uppercase tracking-wide">
                                                                    {combo.description || "Premium collection for your baby's comfort."}
                                                                </p>
                                                            </div>
                                                        </Link>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : highlight ? (
                                        <div className="relative overflow-hidden rounded-3xl bg-slate-50 p-6 border border-slate-200">
                                            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#4988c4]/5" />

                                            <img
                                                src={highlight.image}
                                                alt={highlight.title}
                                                className="relative mb-6 h-40 w-full rounded-2xl object-cover shadow-sm border border-white"
                                            />

                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#4988c4]">
                                                        Editor's Choice
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <h4 className="text-sm font-black text-slate-900 leading-tight uppercase tracking-tight">
                                                        {highlight.title}
                                                    </h4>
                                                    {highlight.badge && (
                                                        <span className="rounded-full bg-[#4988c4] px-2 py-0.5 text-[8px] font-black text-white uppercase tracking-tighter">
                                                            {highlight.badge}
                                                        </span>
                                                    )}
                                                </div>

                                                <p className="text-[10px] font-bold leading-relaxed text-slate-400 uppercase tracking-wide">
                                                    {highlight.description}
                                                </p>

                                                <Link
                                                    to={highlight.href}
                                                    className="group mt-4 inline-flex items-center gap-2 text-[10px] font-black text-[#4988c4] transition-all hover:gap-3 uppercase tracking-widest"
                                                >
                                                    {highlight.ctaLabel}
                                                    <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
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

