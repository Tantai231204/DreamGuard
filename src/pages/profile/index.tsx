import { useEffect, useMemo, useCallback } from 'react';
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

    const handleTabChange = useCallback((tab: TabId) => {
        setSearchParams({ tab });
    }, [setSearchParams]);

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

            <div className="min-h-[calc(100vh-200px)] bg-[#fafbfc] relative overflow-hidden">
                {/* Abstract Background Accents */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-[100px] -mr-64 -mt-64" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-slate-50 rounded-full blur-[100px] -ml-64 -mb-64" />

                <div className="container mx-auto max-w-[1300px] px-4 py-16 lg:px-8 relative">
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="grid gap-8 lg:grid-cols-[330px_1fr] items-stretch"
                    >
                        {/* Interactive Sidebar - Height Master */}
                        <aside className="h-full">
                            <ProfileSidebar
                                activeTab={activeTab}
                                onTabChange={handleTabChange}
                            />
                        </aside>

                        {/* Main Stage - Follows Sidebar Height */}
                        <main className="relative min-h-[600px]">
                            <div className="lg:absolute lg:inset-0">
                                <AnimatePresence mode="wait" initial={false}>
                                    <motion.div
                                        key={activeTab}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -8 }}
                                        transition={{ duration: 0.15, ease: "easeOut" }}
                                        className="rounded-[3rem] border border-slate-100 bg-white shadow-xl ring-1 ring-slate-100/50 flex flex-col h-full overflow-hidden"
                                    >
                                        <div className="flex-1 overflow-y-auto custom-scrollbar p-10 scroll-smooth">
                                            <ActiveComponent />
                                        </div>
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </main>
                    </motion.div>
                </div>
            </div>
        </ErrorBoundary>
    );
}