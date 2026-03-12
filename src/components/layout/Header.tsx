import { Link } from "react-router-dom"
import { InstagramLogoIcon, BellIcon } from "@radix-ui/react-icons"
import { Facebook } from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import { useCategories } from "@/hooks/queries/useCategory"

import { AppRoute } from "../../lib/constants"
import { SearchBar } from "../ui/search-bar"

import {
    NavDropdown,
    type DropdownLink,
    type HighlightCard,
} from "./NavDropdown"
import { MegaMenu } from "./MegaMenu"
import UserDropdown from "./UserDropdown"
import { CartDrawer } from "./CartDrawer"
import type { CategoryResponse } from "@/api/types/category.types"
import { usePublicCombos } from "@/hooks/queries/useCombo"

// --- Material Data Store ---
const MATERIAL_ASSETS: Record<string, { image: string, description: string }> = {
    'Polyester': {
        image: 'https://i.pinimg.com/1200x/16/67/bd/1667bd49ceb38179d8b9071842fd7bd0.jpg',
        description: 'Durable, lightweight and wrinkle-resistant.',
    },
    'Cotton': {
        image: 'https://i.pinimg.com/1200x/91/4e/cc/914eccc7214c72e9bea452fd1d536c72.jpg',
        description: 'Soft, breathable and perfect for everyday comfort.',
    },
    'Organic Cotton': {
        image: 'https://i.pinimg.com/1200x/56/ce/81/56ce813f1037f4f7d978c2d7f362adf3.jpg',
        description: '100% organic, hypoallergenic and eco-friendly.',
    },
    'Bamboo Fiber': {
        image: 'https://i.pinimg.com/736x/01/95/44/0195446c9411868e9efe734ef4b5151b.jpg',
        description: 'Naturally antibacterial and highly absorbent.',
    },
    'Fleece': {
        image: 'https://i.pinimg.com/736x/91/7e/86/917e8695f0744371d42e59ef0081c6d3.jpg',
        description: 'Warm, cozy, and ideal for chilly nights.',
    },
    'Memory Foam': {
        image: 'https://i.pinimg.com/736x/40/9f/88/409f887e5436ee1c5d6f0739b08bbf04.jpg',
        description: 'Contouring support that adapts to your shape.',
    },
    'default': {
        image: 'https://i.pinimg.com/736x/1a/10/7b/1a107b22d1406d44bcab4affb42fa023.jpg',
        description: 'High-quality material selected for best experience.',
    }
}

/* ================= Constants ================= */
type NavItem = {
    label: string
    href?: string
    items?: DropdownLink[]
    highlight?: HighlightCard
    isSimpleMenu?: boolean
    categoryId?: number
    categoryName?: string
}

/* ================= Icon Button ================= */
const IconButton = ({
    children,
    badge,
}: {
    children: React.ReactNode
    badge?: number
}) => (
    <button className="relative rounded-full p-2 text-foreground/60 transition-all hover:bg-muted hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/20">
        {children}
        {badge !== undefined && badge > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-white shadow-sm">
                {badge > 9 ? "9+" : badge}
            </span>
        )}
    </button>
)

/* ================= Header ================= */
export default function Header() {
    const [activeMenu, setActiveMenu] = useState<{
        label: string
        items: DropdownLink[]
        highlight?: HighlightCard
        categoryName?: string
        menuIndex?: number
    } | null>(null)
    const [isScrolled, setIsScrolled] = useState(false)

    const { data: categories = [] } = useCategories()
    const { data: comboPage } = usePublicCombos({ pageSize: 12 })
    const combos = comboPage?.items || []

    const navItems: NavItem[] = useMemo(() => {
        const topCategories = categories.slice(0, 3);
        const restCategories = categories.slice(3);

        const items: NavItem[] = topCategories.map((cat: CategoryResponse) => {
            const childItems: DropdownLink[] = (cat.childCategoryList || []).map(child => {
                const asset = MATERIAL_ASSETS[child.name] || MATERIAL_ASSETS['default'];
                return {
                    label: child.name,
                    href: `/products?cateId=${child.cateId}&categoryName=${encodeURIComponent(cat.name)}&materialName=${encodeURIComponent(child.name)}`,
                    image: asset.image,
                    description: asset.description
                };
            });

            return {
                label: cat.name,
                items: childItems,
                highlight: {
                    title: `Shop ${cat.name}`,
                    description: "Discover our premium quality collection.",
                    ctaLabel: "Shop Now",
                    href: `/products?cateId=${cat.cateId}`,
                    image: "https://i.pinimg.com/1200x/78/47/1d/78471d920e63312ee215e0f328a67b37.jpg",
                },
                categoryId: cat.cateId,
                categoryName: cat.name
            }
        });

        if (restCategories.length > 0) {
            const restDropdownItems: DropdownLink[] = restCategories.map((cat: CategoryResponse) => {
                const asset = MATERIAL_ASSETS[cat.name] || MATERIAL_ASSETS['default'];
                return {
                    label: cat.name,
                    href: `/products?cateId=${cat.cateId}`,
                    description: `Explore our collection of ${cat.name}`,
                    image: asset.image
                };
            });

            items.push({
                label: "Categories",
                items: restDropdownItems,
                isSimpleMenu: false,
                highlight: {
                    title: "Special Collections",
                    description: "Discover our full range of curated products.",
                    ctaLabel: "Shop All",
                    href: "/products",
                    image: "https://i.pinimg.com/1200x/78/47/1d/78471d920e63312ee215e0f328a67b37.jpg",
                }
            });
        }

        items.push({ label: "Combos", href: "/com-bo" });
        items.push({ label: "Services", href: "/services" });
        items.push({ label: "About", href: "/about" });

        return items;
    }, [categories]);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10)
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <>
            {/* ================= Fixed Header ================= */}
            <header className={`fixed top-0 left-0 right-0 z-50 w-full border-b transition-all duration-300 ${isScrolled
                ? 'bg-white shadow-lg backdrop-blur-md'
                : 'bg-white backdrop-blur supports-[backdrop-filter]:bg-background/60'
                }`}>
                {/* ================= Top Bar ================= */}
                <div className="border-b bg-banner">
                    <div className="container mx-auto max-w-7xl px-4">
                        <div className="flex h-8 items-center justify-between text-xs">
                            <div className="flex items-center gap-2.5">
                                <a
                                    href="https://facebook.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-foreground/60 hover:text-primary"
                                >
                                    <Facebook className="h-3.5 w-3.5" />
                                </a>
                                <a
                                    href="https://instagram.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-foreground/60 hover:text-primary"
                                >
                                    <InstagramLogoIcon className="h-3.5 w-3.5" />
                                </a>
                            </div>

                            <span className="font-medium text-foreground/80">
                                Sale up to{" "}
                                <span className="font-semibold text-primary">
                                    50%
                                </span>{" "}
                                for all products — 2 days left
                            </span>

                            <div className="w-14" />
                        </div>
                    </div>
                </div>

                {/* ================= Main Header ================= */}
                <div className="container mx-auto max-w-7xl px-4 py-3.5">
                    <div className="grid grid-cols-3 items-center gap-4">
                        <div className="justify-self-start w-full max-w-xs">
                            <SearchBar />
                        </div>

                        <Link
                            to={AppRoute.HOME}
                            className="justify-self-center select-none"
                        >
                            <img
                                src="/images/logo_with_name.svg"
                                alt="DreamGuard"
                                className="h-12 w-auto"
                            />
                        </Link>

                        <div className="justify-self-end flex items-center gap-0.5">
                            <UserDropdown />

                            <CartDrawer />

                            <IconButton badge={1}>
                                <BellIcon className="h-5 w-5" />
                            </IconButton>
                        </div>
                    </div>
                </div>
            </header>

            {/* Spacer để nội dung không bị header fixed che */}
            <div className="h-[108px]" />

            {/* ================= Navigation (Non-sticky) ================= */}
            <nav
                className="relative border-b bg-white"
                onMouseLeave={() => setActiveMenu(null)}
            >
                <div className="container mx-auto max-w-7xl px-4">
                    <ul className="flex h-12 items-center justify-center gap-8 text-sm font-medium">
                        {navItems.map(({ label, items, highlight, isSimpleMenu, href }, idx) => (
                            <li key={label} className="h-full flex items-center">
                                {items ? (
                                    <NavDropdown
                                        label={label}
                                        items={items}
                                        highlight={highlight}
                                        isSimpleMenu={isSimpleMenu}
                                        isActive={activeMenu?.label === label}
                                        onOpen={() =>
                                            setActiveMenu({
                                                label,
                                                items,
                                                highlight,
                                                categoryName: navItems.find(n => n.label === label)?.categoryName,
                                                menuIndex: idx
                                            })
                                        }
                                        onClose={() => { }}
                                    />
                                ) : (
                                    <Link
                                        to={href ?? "#"}
                                        className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] transition-all hover:text-slate-900 hover:bg-slate-50 rounded-xl"
                                    >
                                        {label}
                                    </Link>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* ===== Mega Menu – ALWAYS CENTERED ===== */}
                <MegaMenu
                    open={!!activeMenu && !!activeMenu.items}
                    items={activeMenu?.items ?? null}
                    highlight={activeMenu?.highlight}
                    combos={(() => {
                        if (!combos.length) return [];
                        
                        // 1. Try to find combos specifically for this category
                        if (activeMenu?.categoryName) {
                            const filtered = combos.filter(c =>
                                c.category?.toLowerCase().includes(activeMenu.categoryName?.toLowerCase() || "")
                            );
                            if (filtered.length > 0) return filtered;
                        }

                        // 2. If no specific match, rotate based on menu index to show different combos
                        const rotIdx = activeMenu?.menuIndex ?? 0;
                        const start = rotIdx % combos.length;
                        return [...combos.slice(start), ...combos.slice(0, start)];
                    })()}
                    onMouseEnter={() => {
                        if (activeMenu) setActiveMenu(activeMenu)
                    }}
                    onMouseLeave={() => setActiveMenu(null)}
                />
            </nav>
        </>
    )
}
