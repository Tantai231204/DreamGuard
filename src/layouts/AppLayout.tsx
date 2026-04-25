import { Outlet, Link, useLocation } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { Breadcrumb } from "../components/common";
import { useBreadcrumb } from "../components/common/BreadcrumbNav";
import { AppRoute } from "../lib/constants";
import UnifiedFloatingChat from "../components/chat/UnifiedFloatingChat";
import { useNotificationHub } from "@/hooks/useNotificationHub";

interface AppLayoutProps {
  variant?: "home" | "checkout";
}
export default function AppLayout({ variant = "home" }: AppLayoutProps) {
  useNotificationHub();
  const location = useLocation();
  const { items: breadcrumbItems } = useBreadcrumb();

  const isHomePage = location.pathname === "/" || location.pathname === AppRoute.HOME;

  if (variant === "checkout") {
    return (
      <div className="min-h-screen bg-white flex flex-col relative">
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

        <main className="flex-1 w-full focus:outline-none" tabIndex={-1}>
          <Outlet />
        </main>

        <Footer />
        <UnifiedFloatingChat />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      <Header />
      <main
        className="flex-1 w-full flex flex-col transition-all duration-500 ease-in-out focus:outline-none"
        tabIndex={-1}
        style={{ marginTop: 'var(--header-height, 188px)' }}
      >
        {!isHomePage && breadcrumbItems && breadcrumbItems.length > 0 && (
          <div className="container max-w-7xl mx-auto px-4 pt-8 lg:px-8">
            <Breadcrumb items={breadcrumbItems} />
          </div>
        )}
        <div className="flex-1 w-full">
          <Outlet />
        </div>
      </main>
      <Footer />
      <UnifiedFloatingChat />
    </div>
  );
}
