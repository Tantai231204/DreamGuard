import { Link } from "react-router-dom";
import {
    Facebook,
    Instagram,
    Twitter,
    MapPin,
    Mail,
    Phone,
    ArrowRight,
} from "lucide-react";
import { AppRoute } from "../../lib/constants";

/* ================= Footer Link ================= */
const FooterLink = ({ to, children }: { to: string; children: React.ReactNode }) => (
    <li>
        <Link
            to={to}
            className="text-sm text-muted-foreground transition-colors hover:text-primary"
        >
            {children}
        </Link>
    </li>
);

/* ================= Social Icon ================= */
const SocialIcon = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-all hover:border-primary hover:bg-primary hover:text-white"
    >
        {children}
    </a>
);

/* ================= Footer ================= */
export default function Footer() {
    return (
        <footer className="border-t bg-muted/30">
            {/* Newsletter Section */}
            <div className="border-b bg-primary/5">
                <div className="container mx-auto max-w-7xl px-4 py-8 sm:py-10">
                    <div className="flex flex-col items-center justify-between gap-6 lg:flex-row">
                        <div className="text-center lg:text-left">
                            <h3 className="text-lg font-semibold text-foreground">
                                Subscribe to our Newsletter
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Get the latest updates on new products and upcoming sales
                            </p>
                        </div>

                        <div className="flex w-full max-w-md flex-col gap-3 sm:flex-row sm:gap-2">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="flex-1 rounded-lg border border-border bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                            <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90">
                                Subscribe
                                <ArrowRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Footer */}
            <div className="container mx-auto max-w-7xl px-4 py-10 sm:py-12">
                <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-12 lg:gap-10">
                    {/* Brand */}
                    <div className="col-span-2 sm:col-span-3 lg:col-span-4">
                        <Link to={AppRoute.HOME} className="inline-block">
                            <img
                                src="/images/logo_with_name.svg"
                                alt="DreamGuard"
                                className="h-12 w-auto sm:h-14"
                            />
                        </Link>

                        <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
                            Premium quality mattresses and bedding products designed for your
                            ultimate comfort and better sleep experience.
                        </p>

                        {/* Social */}
                        <div className="mt-6 flex items-center gap-3">
                            <SocialIcon href="https://facebook.com">
                                <Facebook className="h-4 w-4" />
                            </SocialIcon>
                            <SocialIcon href="https://instagram.com">
                                <Instagram className="h-4 w-4" />
                            </SocialIcon>
                            <SocialIcon href="https://twitter.com">
                                <Twitter className="h-4 w-4" />
                            </SocialIcon>
                        </div>
                    </div>

                    {/* Products */}
                    <div className="col-span-1 lg:col-span-2">
                        <h4 className="mb-4 text-sm font-semibold text-foreground">
                            Products
                        </h4>
                        <ul className="space-y-3">
                            <FooterLink to="#">Mattresses</FooterLink>
                            <FooterLink to="#">Pillows</FooterLink>
                            <FooterLink to="#">Bedding Sets</FooterLink>
                            <FooterLink to="#">Accessories</FooterLink>
                        </ul>
                    </div>

                    {/* Company */}
                    <div className="col-span-1 lg:col-span-2">
                        <h4 className="mb-4 text-sm font-semibold text-foreground">
                            Company
                        </h4>
                        <ul className="space-y-3">
                            <FooterLink to="#">Our Story</FooterLink>
                            <FooterLink to="#">Blog</FooterLink>
                            <FooterLink to="#">Careers</FooterLink>
                            <FooterLink to="#">Press</FooterLink>
                        </ul>
                    </div>

                    {/* Support */}
                    <div className="col-span-1 lg:col-span-2">
                        <h4 className="mb-4 text-sm font-semibold text-foreground">
                            Support
                        </h4>
                        <ul className="space-y-3">
                            <FooterLink to="#">Help Center</FooterLink>
                            <FooterLink to="#">Returns</FooterLink>
                            <FooterLink to="#">Warranty</FooterLink>
                            <FooterLink to="#">FAQ</FooterLink>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="col-span-1 lg:col-span-2">
                        <h4 className="mb-4 text-sm font-semibold text-foreground">
                            Contact
                        </h4>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                <span>123 Sleep Street, NY 10001</span>
                            </li>
                            <li className="flex items-center gap-2.5 text-sm text-muted-foreground">
                                <Phone className="h-4 w-4 shrink-0 text-primary" />
                                <a href="tel:1800123456" className="hover:text-primary">
                                    1-800-DREAM-GD
                                </a>
                            </li>
                            <li className="flex items-center gap-2.5 text-sm text-muted-foreground">
                                <Mail className="h-4 w-4 shrink-0 text-primary" />
                                <a href="mailto:hello@dreamguard.com" className="hover:text-primary">
                                    hello@dreamguard.com
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t">
                <div className="container mx-auto max-w-7xl px-4 py-5">
                    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                        <p className="text-xs text-muted-foreground">
                            © 2026 DreamGuard. All rights reserved.
                        </p>

                        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-muted-foreground">
                            <Link to="#" className="hover:text-primary">
                                Terms of Service
                            </Link>
                            <Link to="#" className="hover:text-primary">
                                Privacy Policy
                            </Link>
                            <Link to="#" className="hover:text-primary">
                                Cookies
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
