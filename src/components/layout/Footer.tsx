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

/* ================= Footer Link ================= */
const FooterLink = ({ to, children }: { to: string; children: React.ReactNode }) => (
    <li>
        <Link
            to={to}
            className="text-[13px] font-medium text-slate-500 transition-all hover:text-[#4988c4] hover:translate-x-1 inline-block"
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
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-400 transition-all hover:border-[#4988c4] hover:bg-[#4988c4] hover:text-white hover:-translate-y-1 shadow-sm"
    >
        {children}
    </a>
);

/* ================= Footer ================= */
export default function Footer() {
    return (
        <footer className="bg-white border-t border-slate-100 pt-20 pb-10">
            <div className="container mx-auto max-w-7xl px-8">
                {/* Top Section: Brand & Navigation Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 lg:gap-12 pb-16 border-b border-slate-50">

                    {/* Brand Column */}
                    <div className="lg:col-span-4 space-y-8">
                        <Link to={AppRoute.HOME} className="inline-block transition-transform hover:scale-105">
                            <img
                                src="/images/logo_with_name.svg"
                                alt="DreamGuard"
                                className="h-14 w-auto"
                            />
                        </Link>
                        <p className="text-[14px] leading-relaxed text-slate-500 font-medium max-w-sm">
                            We don't just sell mattresses; we protect dreams. <br />
                            DreamGuard is dedicated to providing premium, organic, and safety-certified sleep solutions for your little ones.
                        </p>
                        <div className="flex items-center gap-3">
                            <SocialIcon href="#"><Facebook className="h-4 w-4" /></SocialIcon>
                            <SocialIcon href="#"><Instagram className="h-4 w-4" /></SocialIcon>
                            <SocialIcon href="#"><Twitter className="h-4 w-4" /></SocialIcon>
                        </div>
                    </div>

                    {/* Nav Columns Group */}
                    <div className="lg:col-span-5 grid grid-cols-2 sm:grid-cols-3 gap-8">
                        <div className="space-y-6">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900">
                                Collections
                            </h4>
                            <ul className="space-y-4">
                                <FooterLink to={AppRoute.PRODUCTS}>All Products</FooterLink>
                                <FooterLink to={AppRoute.COMBOS}>Curated Combos</FooterLink>
                            </ul>
                        </div>

                        <div className="space-y-6">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900">
                                Explore
                            </h4>
                            <ul className="space-y-4">
                                <FooterLink to={AppRoute.ABOUT}>Our Journey</FooterLink>
                                <FooterLink to={AppRoute.SERVICES}>Our Services</FooterLink>
                            </ul>
                        </div>

                        <div className="space-y-6">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900">
                                Support
                            </h4>
                            <ul className="space-y-4">
                                <FooterLink to={AppRoute.HELP_CENTER}>Help Center</FooterLink>
                                <FooterLink to={AppRoute.FAQ}>FAQs</FooterLink>
                                <FooterLink to={AppRoute.RETURN_POLICY}>Returns</FooterLink>
                            </ul>
                        </div>
                    </div>

                    {/* Contact Column */}
                    <div className="lg:col-span-3 space-y-6">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900">
                            Get in Touch
                        </h4>
                        <div className="space-y-5">
                            <div className="flex items-start gap-4 group">
                                <div className="p-2.5 rounded-lg bg-slate-50 text-[#4988c4] transition-colors group-hover:bg-[#4988c4] group-hover:text-white">
                                    <MapPin className="h-4 w-4" />
                                </div>
                                <span className="text-[13px] font-medium text-slate-500 leading-snug">
                                    123 Sleep Street, <br /> New York, NY 10001
                                </span>
                            </div>
                            <div className="flex items-center gap-4 group">
                                <div className="p-2.5 rounded-lg bg-slate-50 text-[#4988c4] transition-colors group-hover:bg-[#4988c4] group-hover:text-white">
                                    <Phone className="h-4 w-4" />
                                </div>
                                <a href="tel:1800123456" className="text-[13px] font-bold text-slate-900 hover:text-[#4988c4] transition-colors">
                                    1-800-DREAM-GD
                                </a>
                            </div>
                            <div className="flex items-center gap-4 group">
                                <div className="p-2.5 rounded-lg bg-slate-50 text-[#4988c4] transition-colors group-hover:bg-[#4988c4] group-hover:text-white">
                                    <Mail className="h-4 w-4" />
                                </div>
                                <a href="mailto:hello@dreamguard.com" className="text-[13px] font-medium text-slate-500 hover:text-[#4988c4] transition-colors">
                                    hello@dreamguard.com
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-10 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <p className="text-[12px] font-medium text-slate-400">
                        © 2026 DreamGuard. Crafted for peaceful nights.
                    </p>
                    <div className="flex items-center gap-8">
                        <Link to={AppRoute.TERMS_OF_SERVICE} className="text-[11px] font-black uppercase tracking-[0.1em] text-slate-400 hover:text-slate-900 transition-colors">
                            Terms of Service
                        </Link>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                            <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">System Online</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
