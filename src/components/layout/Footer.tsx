import { Link } from "react-router-dom";
import {
    Facebook,
    Instagram,
    Twitter,
    MapPin,
    Mail,
    Phone,
} from "lucide-react";
import { AppRoute } from "../../lib/constants";

type FooterSectionProps = {
    title: string;
    children: React.ReactNode;
};

const FooterSection = ({ title, children }: FooterSectionProps) => (
    <div>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[var(--color-text-primary)]">
            {title}
        </h3>
        {children}
    </div>
);

type FooterLinkProps = {
    to: string;
    children: React.ReactNode;
};

const FooterLink = ({ to, children }: FooterLinkProps) => (
    <li>
        <Link
            to={to}
            className="text-sm text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-primary)]"
        >
            {children}
        </Link>
    </li>
);

export default function Footer() {
    return (
        <footer
            className="
    border-t border-border
    bg-[linear-gradient(to_bottom,var(--color-footer-gradient-start)_0%,var(--color-footer-gradient-mid)_20%,var(--color-footer-gradient-end)_65%)]
  "
        >

            <div className="container mx-auto max-w-7xl px-4 py-12">
                {/* ================= Top ================= */}
                <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                    {/* Brand */}
                    <div>
                        <Link to={AppRoute.HOME} className="inline-block mb-4">
                            <div className="flex flex-col">
                                <span className="text-2xl font-bold text-[var(--color-primary)]">
                                    DreamGuard
                                </span>
                                <span className="text-xs tracking-wider text-[var(--color-text-secondary)]">
                                    Sleep Better, Live Better
                                </span>
                            </div>
                        </Link>

                        <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
                            Premium quality mattresses and bedding products designed for your
                            ultimate comfort and better sleep.
                        </p>
                    </div>

                    {/* About */}
                    <FooterSection title="About">
                        <ul className="space-y-2">
                            <FooterLink to="#">Our Story</FooterLink>
                            <FooterLink to="#">Our Impact</FooterLink>
                            <FooterLink to="#">FAQ</FooterLink>
                        </ul>
                    </FooterSection>

                    {/* Resources */}
                    <FooterSection title="Resources">
                        <ul className="space-y-2">
                            <FooterLink to="#">E-Catalog</FooterLink>
                            <FooterLink to="#">Request Catalog</FooterLink>
                            <FooterLink to="#">Support</FooterLink>
                        </ul>
                    </FooterSection>

                    {/* Contact */}
                    <FooterSection title="Contact">
                        <ul className="space-y-3 text-sm text-[var(--color-text-secondary)]">
                            <li className="flex items-start gap-2">
                                <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--color-primary)]" />
                                <span>12 John Avenue #2, New York</span>
                            </li>

                            <li className="flex items-center gap-2">
                                <Mail className="h-5 w-5 flex-shrink-0 text-[var(--color-primary)]" />
                                <a
                                    href="mailto:sleepy@shop.com"
                                    className="transition-colors hover:text-[var(--color-primary)]"
                                >
                                    sleepy@shop.com
                                </a>
                            </li>

                            <li className="flex items-center gap-2">
                                <Phone className="h-5 w-5 flex-shrink-0 text-[var(--color-primary)]" />
                                <a
                                    href="tel:+12223475339"
                                    className="transition-colors hover:text-[var(--color-primary)]"
                                >
                                    +1-222-34-SLEEP
                                </a>
                            </li>
                        </ul>

                        {/* Social */}
                        <div className="mt-5">
                            <p className="mb-3 text-sm text-[var(--color-text-secondary)]">
                                Follow Us:
                            </p>

                            <div className="flex items-center gap-3">
                                <SocialIcon
                                    href="https://facebook.com"
                                    color="var(--color-facebook)"
                                >
                                    <Facebook className="h-5 w-5" />
                                </SocialIcon>

                                <SocialIcon
                                    href="https://instagram.com"
                                    color="var(--color-instagram)"
                                >
                                    <Instagram className="h-5 w-5" />
                                </SocialIcon>

                                <SocialIcon
                                    href="https://twitter.com"
                                    color="var(--color-twitter)"
                                >
                                    <Twitter className="h-5 w-5" />
                                </SocialIcon>
                            </div>
                        </div>
                    </FooterSection>
                </div>

                {/* ================= Bottom ================= */}
                <div className="mt-10 border-t border-[var(--color-border)] pt-6">
                    <p className="text-center text-xs text-[var(--color-text-secondary)]">
                        © 2023 Sleepy Shop. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}

/* ===== Social Icon ===== */
type SocialIconProps = {
    href: string;
    color: string;
    children: React.ReactNode;
};

const SocialIcon = ({ href, color, children }: SocialIconProps) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-border)] bg-white transition-all duration-200"
        style={{ color }}
        onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = color;
            e.currentTarget.style.color = "#fff";
            e.currentTarget.style.borderColor = color;
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#fff";
            e.currentTarget.style.color = color;
            e.currentTarget.style.borderColor = "var(--color-border)";
        }}
    >
        {children}
    </a>
);
