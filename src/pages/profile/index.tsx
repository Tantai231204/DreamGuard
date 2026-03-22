import { useEffect, useMemo, useCallback, useState } from 'react';
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
    SecurityTab,
    VouchersTab,
    WishlistTab
} from "./components"
import { useBreadcrumb, Breadcrumb } from '@/components/common/BreadcrumbNav';
import { SEO, ErrorBoundary } from "@/components/common";

const TAB_COMPONENTS: Record<TabId, React.ComponentType> = {
    profile: ProfileInfoTab,
    babies: BabiesTab,
    orders: OrdersTab,
    wishlist: WishlistTab,
    vouchers: VouchersTab,
    addresses: AddressesTab,
    notifications: NotificationsTab,
    security: SecurityTab,
};

export default function Profile() {
    const [searchParams, setSearchParams] = useSearchParams();
    const tabFromUrl = (searchParams.get("tab") as TabId) || "profile";
    const [activeTab, setActiveTab] = useState<TabId>(tabFromUrl);

    // Sync state with URL without triggering effect cascades (React Pattern)
    const [prevTabFromUrl, setPrevTabFromUrl] = useState(tabFromUrl);
    if (tabFromUrl !== prevTabFromUrl) {
        setPrevTabFromUrl(tabFromUrl);
        setActiveTab(tabFromUrl);
    }

    const handleTabChange = useCallback((tab: TabId) => {
        setActiveTab(tab); // Instant visual feedback
        setSearchParams({ tab }); // Sync with URL
    }, [setSearchParams]);

    const { setItems: setBreadcrumb } = useBreadcrumb();

    useEffect(() => {
        setBreadcrumb([]); // Render inside page to achieve layout synergy
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

                <div className="container mx-auto max-w-[1300px] px-4 pt-8 pb-16 lg:px-8 relative">
                    <Breadcrumb
                        items={[
                            { label: 'Home', href: AppRoute.HOME },
                            { label: 'My Account', active: true },
                        ]}
                        className="mb-8"
                    />

                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="grid gap-8 lg:grid-cols-[330px_1fr] items-stretch min-h-[750px]"
                    >
                        {/* Interactive Sidebar - Height Master */}
                        <aside className="h-full">
                            <ProfileSidebar
                                activeTab={activeTab}
                                onTabChange={handleTabChange}
                            />
                        </aside>

                        {/* Main Stage - Absolute fit inside bounds */}
                        <main className="relative h-full w-full">
                            <div className="lg:absolute lg:inset-0">
                                <AnimatePresence initial={false}>
                                    <motion.div
                                        key={activeTab}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.25, ease: "easeOut" }}
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