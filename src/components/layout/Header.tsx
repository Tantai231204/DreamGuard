import { Link } from "react-router-dom"
import { InstagramLogoIcon, BellIcon } from "@radix-ui/react-icons"
import { Facebook } from "lucide-react"
import { useState, useEffect, useCallback, memo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

import { AppRoute } from "../../lib/constants"
import { SearchBar } from "../ui/search-bar"
import { NavDropdown, type DropdownLink, type HighlightCard } from "./NavDropdown"
import { MegaMenu } from "./MegaMenu"
import UserDropdown from "./UserDropdown"
import { CartDrawer } from "./CartDrawer"
import { useHeaderData, type NavItem } from "./useHeaderData"
import { useCoinRewardConfig } from "@/hooks/queries/useCoinRewardConfig"

/* ================= Sub-Components ================= */

const BrandLogo = memo(({ isScrolled }: { isScrolled: boolean }) => (
    <Link to={AppRoute.HOME} className="flex items-center justify-center select-none group">
        <motion.img
            animate={{
                scale: isScrolled ? 0.85 : 1,
                y: isScrolled ? 0 : -2
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            src="/images/logo_with_name.svg"
            alt="DreamGuard"
            className="w-auto h-12 origin-center filter drop-shadow-sm transition-all duration-500 group-hover:drop-shadow-md"
        />
    </Link>
))

const NavItemLink = memo(({ label, href, items, highlight, isActive, onOpen, isSimpleMenu }: NavItem & { isActive: boolean, onOpen: () => void }) => {
    if (items) {
        return (
            <NavDropdown
                label={label}
                items={items}
                highlight={highlight}
                isSimpleMenu={isSimpleMenu}
                isActive={isActive}
                onOpen={onOpen}
                onClose={() => { }}
            />
        )
    }
    return (
        <Link
            to={href ?? "#"}
            className="group relative px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] transition-all hover:text-slate-900"
        >
            <span className="relative z-10">{label}</span>
            <span className="absolute bottom-1 left-4 right-4 h-[2px] bg-[#4988c4] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
        </Link>
    )
})

const ActionIcon = memo(({ children, badge, onClick, label }: { children: React.ReactNode, badge?: number, onClick?: () => void, label: string }) => (
    <button
        onClick={onClick}
        aria-label={label}
        className="group relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-slate-50 hover:text-[#4988c4] focus:outline-none focus:ring-2 focus:ring-[#4988c4]/20"
    >
        {children}
        {badge !== undefined && badge > 0 && (
            <span className="absolute top-2 right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#4988c4] px-1 text-[8px] font-black text-white shadow-lg shadow-blue-500/20 ring-2 ring-white transition-transform group-hover:scale-110">
                {badge > 9 ? "9+" : badge}
            </span>
        )}
    </button>
))

/* ================= Main Header Component ================= */

export default function Header() {
    const { navItems, combos } = useHeaderData()
    const { orderCompletionCoin, feedbackCoin } = useCoinRewardConfig()
    const [isScrolled, setIsScrolled] = useState(false)
    const [activeMenu, setActiveMenu] = useState<{
        label: string
        items: DropdownLink[]
        highlight?: HighlightCard
        categoryName?: string
        menuIndex: number
    } | null>(null)

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll, { passive: true })
        // Set initial height
        document.documentElement.style.setProperty('--header-height', isScrolled ? '128px' : '188px')
        return () => window.removeEventListener('scroll', handleScroll)
    }, [isScrolled])

    const handleMenuOpen = useCallback((label: string, items: DropdownLink[] | undefined, highlight: HighlightCard | undefined, categoryName: string | undefined, index: number) => {
        if (!items) return;
        setActiveMenu({ label, items, highlight, categoryName, menuIndex: index })
    }, [])

    return (
        <header
            className={cn(
                "fixed top-0 left-0 right-0 z-40 w-full transition-all duration-500 will-change-transform",
                isScrolled
                    ? "bg-white border-b border-slate-200 shadow-[0_4px_20px_rgba(0,0,0,0.05)]"
                    : "bg-white shadow-sm"
            )}
        >
            {/* 1. Global Announcement Bar - Vibrant Accent */}
            <AnimatePresence>
                {!isScrolled && (
                    <motion.div
                        initial={{ height: 36, opacity: 1 }}
                        animate={{ height: isScrolled ? 0 : 36, opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-[#4988c4] border-b border-primary/10"
                    >
                        <div className="container mx-auto max-w-7xl px-8 h-full">
                            <div className="flex h-full items-center justify-between text-white">
                                <div className="flex items-center gap-4">
                                    <a href="#" className="hover:scale-110 transition-transform"><Facebook className="w-3.5 h-3.5" /></a>
                                    <a href="#" className="hover:scale-110 transition-transform"><InstagramLogoIcon className="w-3.5 h-3.5" /></a>
                                </div>
                                <p className="text-[9px] font-black uppercase tracking-[0.25em] drop-shadow-sm">
                                    Reward update: order completed <span className="underline underline-offset-4 decoration-2">+{orderCompletionCoin} coin</span> | feedback submitted <span className="underline underline-offset-4 decoration-2">+{feedbackCoin} coin</span>
                                </p>
                                <div className="flex items-center gap-4">
                                    <button className="text-[9px] font-black uppercase tracking-widest hover:opacity-80 transition-opacity">Eng</button>
                                    <div className="w-px h-3 bg-white/20" />
                                    <button className="text-[9px] font-black uppercase tracking-widest hover:opacity-80 transition-opacity">Track Order</button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 2. Primary Navigation Core */}
            <div className={cn(
                "container mx-auto max-w-7xl px-8 flex items-center justify-between transition-all duration-500",
                isScrolled ? "h-20" : "h-24"
            )}>
                {/* Left: Interactive Search */}
                <div className="w-1/3 flex items-center gap-4">
                    <div className="hidden lg:block w-full max-w-[280px]">
                        <SearchBar />
                    </div>
                </div>

                {/* Center: Heroic Branding */}
                <div className="w-1/3 flex justify-center">
                    <BrandLogo isScrolled={isScrolled} />
                </div>

                {/* Right: Personal & Transactional */}
                <div className="w-1/3 flex justify-end items-center gap-3">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-100 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                        <UserDropdown />
                        <div className="w-[1px] h-4 bg-slate-200/60 mx-1" />
                        <CartDrawer />
                    </div>
                    <ActionIcon badge={2} label="Notifications">
                        <BellIcon className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    </ActionIcon>
                </div>
            </div>

            {/* 3. Discover Navigation Layer */}
            <nav
                className="relative border-t border-slate-50/50"
                onMouseLeave={() => setActiveMenu(null)}
            >
                <div className="container mx-auto max-w-7xl px-8">
                    <ul className={cn(
                        "flex items-center justify-center gap-4 transition-all duration-500",
                        isScrolled ? "h-12" : "h-14"
                    )}>
                        {navItems.map((item, idx) => (
                            <li key={item.label} className="h-full flex items-center">
                                <NavItemLink
                                    {...item}
                                    isActive={activeMenu?.label === item.label}
                                    onOpen={() => handleMenuOpen(item.label, item.items, item.highlight, item.categoryName, idx)}
                                />
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Mega Menu Integration */}
                <MegaMenu
                    open={!!activeMenu && !!activeMenu.items}
                    items={activeMenu?.items ?? null}
                    highlight={activeMenu?.highlight}
                    combos={(() => {
                        if (!combos.length) return [];
                        if (activeMenu?.categoryName) {
                            const filtered = combos.filter(c => c.category?.toLowerCase().includes(activeMenu.categoryName?.toLowerCase() || ""));
                            if (filtered.length > 0) return filtered;
                        }
                        const rotIdx = activeMenu?.menuIndex ?? 0;
                        const start = rotIdx % combos.length;
                        return [...combos.slice(start), ...combos.slice(0, start)];
                    })()}
                    onMouseEnter={() => { if (activeMenu) setActiveMenu(activeMenu) }}
                    onMouseLeave={() => setActiveMenu(null)}
                />
            </nav>

            {/* Minimalist Visual Accent */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-[#4988c4]/10 to-transparent" />
        </header>
    )
}
