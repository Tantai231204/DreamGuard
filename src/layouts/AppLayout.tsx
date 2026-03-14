import { Outlet, Link } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { Breadcrumb } from "../components/common";
import { useBreadcrumb } from "../components/common/BreadcrumbNav";
import { AppRoute } from "../lib/constants";

interface AppLayoutProps {
  variant?: "home" | "checkout";
}

/**
 * AppLayout provides the standard structure for the public-facing pages.
 * - "home": Full header, footer, and automatic top padding for sticky header.
 * - "checkout": Minimalist header (logo only) for reduced friction in checkout.
 */
export default function AppLayout({ variant = "home" }: AppLayoutProps) {
  const { items: breadcrumbItems } = useBreadcrumb();

  // Checkout variant with minimalist header
  if (variant === "checkout") {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <header className="border-b bg-white py-4 shadow-sm relative z-40">
          <div className="container mx-auto max-w-7xl px-4 flex items-center justify-between">
            <Link to={AppRoute.HOME} className="hover:opacity-80 transition-opacity">
              <img src="/images/logo_with_name.svg" alt="DreamGuard" className="h-10 w-auto" />
            </Link>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest hidden sm:block">
              Secure Checkout
            </div>
          </div>
        </header>

        <main className="flex-1 w-full">
          <Outlet />
        </main>

        <Footer />
      </div>
    );
  }

  // Home/Standard variant with Unified Header and Footer
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main
        className="flex-1 w-full flex flex-col transition-all duration-500 ease-in-out"
        style={{ marginTop: 'var(--header-height, 188px)' }}
      >
        {breadcrumbItems && breadcrumbItems.length > 0 && (
          <div className="container max-w-7xl mx-auto px-4 pt-8 lg:px-8">
            <Breadcrumb items={breadcrumbItems} />
          </div>
        )}
        <div className="flex-1 w-full">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
}
