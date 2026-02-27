import { useState } from "react"
import { useSearchParams } from "react-router-dom"

import { HomeIcon } from "@radix-ui/react-icons"

import { AppRoute } from "../../lib/constants"
import type { TabId } from "./types"
import { AddressesTab, BabiesTab, NotificationsTab, OrdersTab, ProfileInfoTab, ProfileSidebar, ResellTab, SecurityTab, VouchersTab, WishlistTab } from "./components"
import { useEffect } from 'react';
import { useBreadcrumb } from '@/components/common/breadcrumb/useBreadcrumb';



export default function Profile() {
    const [searchParams] = useSearchParams()
    const tabFromUrl = searchParams.get("tab") as TabId | null
    const [activeTab, setActiveTab] = useState<TabId>(tabFromUrl || "profile")

    const renderTabContent = () => {
        switch (activeTab) {
            case "profile": return <ProfileInfoTab />
            case "babies": return <BabiesTab />
            case "orders": return <OrdersTab />
            case "resell": return <ResellTab />
            case "wishlist": return <WishlistTab />
            case "vouchers": return <VouchersTab />
            case "addresses": return <AddressesTab />
            case "notifications": return <NotificationsTab />
            case "security": return <SecurityTab />
            default: return <ProfileInfoTab />
        }
    }

    const { setItems: setBreadcrumb } = useBreadcrumb();
    useEffect(() => {
        setBreadcrumb([
            { label: <span className="flex items-center gap-1"><HomeIcon className="h-4 w-4" /> Home</span>, href: AppRoute.HOME },
            { label: 'My Account', active: true },
        ]);
        return () => setBreadcrumb([]);
    }, [setBreadcrumb]);
    return (
        <div className="min-h-[calc(100vh-200px)] bg-gray-50/50">
            <div className="container mx-auto max-w-6xl px-4 py-8">
                {/* Main Grid */}
                <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
                    <ProfileSidebar
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                    />

                    <main className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm min-h-[500px]">
                        {renderTabContent()}
                    </main>
                </div>
            </div>
        </div>
    )
}
