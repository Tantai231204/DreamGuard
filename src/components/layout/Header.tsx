import { Link } from "react-router-dom"
import { InstagramLogoIcon, BellIcon } from "@radix-ui/react-icons"
import { Facebook } from "lucide-react"
import { useState, useEffect } from "react"

import { AppRoute } from "../../lib/constants"
import { SearchBar } from "../ui/search-bar"

import {
    NavDropdown,
    type DropdownLink,
    type HighlightCard,
} from "./NavDropdown"
import { MegaMenu } from "./MegaMenu.tsx"
import UserDropdown from "./UserDropdown.tsx"
import { CartDrawer } from "./CartDrawer"

/* ================= Constants ================= */
type NavItem = {
    label: string
    href?: string
    items?: DropdownLink[]
    highlight?: HighlightCard
}

const NAV_ITEMS: NavItem[] = [
    {
        label: "Mattresses",
        items: [
            {
                label: "Foam Mattress",
                description: "Breathable dual-sided core with washable cover.",
                href: "#",
            },
            {
                label: "Hybrid Mattress",
                description: "Pocket coil support with cooling foam comfort.",
                href: "#",
            },
            {
                label: "Kids Mattress",
                description: "Gentle firmness tailored for growing sleepers.",
                href: "#",
            },
        ],
        highlight: {
            title: "DreamGuard Baby Foam",
            description: "Dual-side design that supports each stage of growth.",
            ctaLabel: " Shop Now",
            href: "#",
            badge: "-30%",
            image: "https://i.pinimg.com/1200x/78/47/1d/78471d920e63312ee215e0f328a67b37.jpg",
        },
    },
    {
        label: "Pillows",
        items: [
            {
                label: "Memory Foam Pillow",
                description: "Pressure-relieving core for neck alignment.",
                href: "#",
            },
            {
                label: "Contour Pillow",
                description: "Ergonomic wave profile for side sleepers.",
                href: "#",
            },
            {
                label: "Kids Pillow",
                description: "Lower loft with airy cover for little ones.",
                href: "#",
            },
        ],
        highlight: {
            title: "Cooling Cloud Pillow",
            description: "Phase-change cover keeps temperatures balanced.",
            ctaLabel: "Explore Now",
            href: "#",
            badge: "New",
            image: "https://i.pinimg.com/1200x/78/47/1d/78471d920e63312ee215e0f328a67b37.jpg",
        },
    },
    {
        label: "Bedding Sets",
        items: [
            {
                label: "Premium Cotton Set",
                description: "400-thread sateen weave with silky handfeel.",
                href: "#",
            },
            {
                label: "Luxe Linen Set",
                description: "Airy texture ideal for warm sleepers.",
                href: "#",
            },
            {
                label: "Bamboo Blend Set",
                description: "Moisture-wicking fibers for year-round comfort.",
                href: "#",
            },
        ],
        highlight: {
            title: "Layer and Save",
            description:
                "Bundle duvet covers, sheets, and pillowcases with extra savings.",
            ctaLabel: "Shop the Collection",
            href: "#",
            badge: "Bundle",
            image: "https://i.pinimg.com/1200x/78/47/1d/78471d920e63312ee215e0f328a67b37.jpg",
        },
    },
    {
        label: "Accessories",
        items: [
            {
                label: "Protectors",
                description: "Waterproof and breathable mattress shields.",
                href: "#",
            },
            {
                label: "Throws",
                description: "Layer-friendly textures for quick styling.",
                href: "#",
            },
            {
                label: "Aromatherapy",
                description: "Lavender and chamomile mists for bedtime.",
                href: "#",
            },
        ],
        highlight: {
            title: "Sleep Better Kit",
            description:
                "A curated trio of protector, spray, and travel pillow.",
            ctaLabel: "Buy the Kit",
            href: "#",
            badge: "-15%",
            image: "https://i.pinimg.com/1200x/78/47/1d/78471d920e63312ee215e0f328a67b37.jpg",
        },
    },
    { label: "Services", href: "#" },
    { label: "About", href: "#" },
]

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
    } | null>(null)
    const [isScrolled, setIsScrolled] = useState(false)

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
            <header className={`fixed top-0 left-0 right-0 z-50 w-full border-b transition-all duration-300 ${
                isScrolled 
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
                        {NAV_ITEMS.map(({ label, items, highlight, href }) => (
                            <li key={label}>
                                {items ? (
                                    <NavDropdown
                                        label={label}
                                        items={items}
                                        highlight={highlight}
                                        isActive={activeMenu?.label === label}
                                        onOpen={() =>
                                            setActiveMenu({
                                                label,
                                                items,
                                                highlight,
                                            })
                                        }
                                        onClose={() => { }}
                                    />
                                ) : (
                                    <Link
                                        to={href ?? "#"}
                                        className="text-foreground/60 hover:text-primary"
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
                    open={!!activeMenu}
                    items={activeMenu?.items ?? null}
                    highlight={activeMenu?.highlight}
                    onMouseEnter={() => {
                        if (activeMenu) setActiveMenu(activeMenu)
                    }}
                    onMouseLeave={() => setActiveMenu(null)}
                />
            </nav>
        </>
    )
}
