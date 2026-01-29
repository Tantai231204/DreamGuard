import { useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { HomeIcon } from "@radix-ui/react-icons"

import { AppRoute } from "../../lib/constants"
import type { TabId } from "./types"
import { AddressesTab, BabiesTab, NotificationsTab, OrdersTab, ProfileInfoTab, ProfileSidebar, SecurityTab, WishlistTab } from "./components"



export default function Profile() {
    const [searchParams] = useSearchParams()
    const tabFromUrl = searchParams.get("tab") as TabId | null
    const [activeTab, setActiveTab] = useState<TabId>(tabFromUrl || "profile")

    const renderTabContent = () => {
        switch (activeTab) {
            case "profile": return <ProfileInfoTab />
            case "babies": return <BabiesTab />
            case "orders": return <OrdersTab />
            case "wishlist": return <WishlistTab />
            case "addresses": return <AddressesTab />
            case "notifications": return <NotificationsTab />
            case "security": return <SecurityTab />
            default: return <ProfileInfoTab />
        }
    }

    return (
        <div className="min-h-[calc(100vh-200px)] bg-gray-50/50">
            <div className="container mx-auto max-w-6xl px-4 py-8">
                {/* Breadcrumb */}
                <nav className="mb-6 flex items-center gap-2 text-sm">
                    <Link
                        to={AppRoute.HOME}
                        className="text-gray-400 hover:text-primary transition-colors"
                    >
                        <HomeIcon className="h-4 w-4" />
                    </Link>
                    <span className="text-gray-300">/</span>
                    <span className="font-medium text-gray-700">Tài khoản của tôi</span>
                </nav>

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
