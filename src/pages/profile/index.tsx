import { useEffect, useMemo } from 'react';
import { useSearchParams } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"

import { AppRoute } from "../../lib/constants"
import type { TabId } from "./types"
import {
    AddressesTab,
    BabiesTab,
    NotificationsTab,
    OrdersTab,
    ProfileInfoTab,
    ProfileSidebar,
    ResellTab,
    SecurityTab,
    VouchersTab,
    WishlistTab
} from "./components"
import { useBreadcrumb } from '@/components/common/BreadcrumbNav';
import { SEO, ErrorBoundary } from "@/components/common";

const TAB_COMPONENTS: Record<TabId, React.ComponentType> = {
    profile: ProfileInfoTab,
    babies: BabiesTab,
    orders: OrdersTab,
    resell: ResellTab,
    wishlist: WishlistTab,
    vouchers: VouchersTab,
    addresses: AddressesTab,
    notifications: NotificationsTab,
    security: SecurityTab,
};
export default function Profile() {
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = (searchParams.get("tab") as TabId) || "profile";

    const handleTabChange = (tab: TabId) => {
        setSearchParams({ tab });
    };

    const { setItems: setBreadcrumb } = useBreadcrumb();

    useEffect(() => {
        setBreadcrumb([
            { label: 'Home', href: AppRoute.HOME },
            { label: 'My Account', active: true },
        ]);
        return () => setBreadcrumb([]);
    }, [setBreadcrumb]);

    const ActiveComponent = useMemo(() => TAB_COMPONENTS[activeTab] || ProfileInfoTab, [activeTab]);

    return (
        <ErrorBoundary>
            <SEO
                title={`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} | My Account`}
                description="Manage your DreamGuard account, orders, and baby profiles."
            />

            <div className="min-h-[calc(100vh-200px)] bg-white">
                <div className="container mx-auto max-w-[1300px] px-4 py-12 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        className="grid gap-8 lg:grid-cols-[300px_1fr]"
                    >
                        {/* Interactive Sidebar */}
                        <aside className="relative z-10">
                            <div className="sticky top-28">
                                <ProfileSidebar
                                    activeTab={activeTab}
                                    onTabChange={handleTabChange}
                                />
                            </div>
                        </aside>

                        {/* Main Stage with AnimatePresence */}
                        <main className="min-w-0">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                                    className="rounded-3xl border border-white bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] min-h-[600px] ring-1 ring-slate-200/50 will-change-transform"
                                >
                                    <ActiveComponent />
                                </motion.div>
                            </AnimatePresence>
                        </main>
                    </motion.div>
                </div>
            </div>
        </ErrorBoundary>
    );
}
