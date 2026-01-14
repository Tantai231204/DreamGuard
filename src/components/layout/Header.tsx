import { Link } from "react-router-dom";
import {
    InstagramLogoIcon,
    BellIcon,
    PersonIcon,
    ChevronDownIcon,
} from "@radix-ui/react-icons";
import { Facebook, ShoppingCart } from "lucide-react";
import { AppRoute } from "../../lib/constants";
import { useAuthStore } from "../../store/authStore";
import { SearchBar } from "../ui/search-bar";

/* ================= Constants ================= */
const NAV_ITEMS = [
    { label: "Mattresses", hasDropdown: true },
    { label: "Pillows", hasDropdown: true },
    { label: "Bedding Sets", hasDropdown: true },
    { label: "Accessories", hasDropdown: true },
    { label: "Services", hasDropdown: false },
    { label: "About", hasDropdown: false },
] as const;

/* ================= Icon Button ================= */
const IconButton = ({
    children,
    badge,
}: {
    children: React.ReactNode;
    badge?: number;
}) => (
    <button className="relative rounded-full p-2 text-foreground/60 transition-all hover:bg-muted hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/20">
        {children}

        {badge !== undefined && badge > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-white shadow-sm">
                {badge > 9 ? "9+" : badge}
            </span>
        )}
    </button>
);

/* ================= Header ================= */
export default function Header() {
    const { token } = useAuthStore();

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            {/* ================= Top Bar ================= */}
            <div className="border-b bg-banner">
                <div className="container mx-auto max-w-7xl px-4">
                    <div className="flex h-8 items-center justify-between text-xs">
                        {/* Social */}
                        <div className="flex items-center gap-2.5">
                            <a
                                href="https://facebook.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-foreground/60 transition-colors hover:text-primary"
                                aria-label="Facebook"
                            >
                                <Facebook className="h-3.5 w-3.5" />
                            </a>
                            <a
                                href="https://instagram.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-foreground/60 transition-colors hover:text-primary"
                                aria-label="Instagram"
                            >
                                <InstagramLogoIcon className="h-3.5 w-3.5" />
                            </a>
                        </div>

                        {/* Banner */}
                        <span className="font-medium text-foreground/80">
                            Sale up to <span className="font-semibold text-primary">50%</span> for all products — 2 days left
                        </span>

                        <div className="w-14" />
                    </div>
                </div>
            </div>

            {/* ================= Main Header ================= */}
            <div className="container mx-auto max-w-7xl px-4 py-3.5">
                <div className="grid grid-cols-3 items-center gap-4">
                    {/* Search */}
                    <div className="justify-self-start w-full max-w-xs">
                        <SearchBar />
                    </div>

                    {/* Logo */}
                    <Link
                        to={AppRoute.HOME}
                        className="justify-self-center select-none"
                    >
                        <img
                            src="/src/assets/images/logo_with_name.svg"
                            alt="DreamGuard"
                            className="h-12 w-auto"
                        />
                    </Link>

                    {/* Actions */}
                    <div className="justify-self-end flex items-center gap-0.5">
                        <Link to={token ? AppRoute.PROFILE : AppRoute.LOGIN}>
                            <IconButton>
                                <PersonIcon className="h-5 w-5" />
                            </IconButton>
                        </Link>

                        <IconButton badge={2}>
                            <ShoppingCart className="h-5 w-5" />
                        </IconButton>

                        <IconButton badge={1}>
                            <BellIcon className="h-5 w-5" />
                        </IconButton>
                    </div>
                </div>
            </div>

            {/* ================= Navigation ================= */}
            <nav className="border-t">
                <div className="container mx-auto max-w-7xl px-4">
                    <ul className="flex h-12 items-center justify-center gap-8 text-sm font-medium">
                        {NAV_ITEMS.map(({ label, hasDropdown }) => (
                            <li key={label}>
                                <Link
                                    to="#"
                                    className="group inline-flex items-center gap-1 text-foreground/60 transition-colors hover:text-primary"
                                >
                                    {label}
                                    {hasDropdown && (
                                        <ChevronDownIcon className="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-180" />
                                    )}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </nav>
        </header>
    );
}
