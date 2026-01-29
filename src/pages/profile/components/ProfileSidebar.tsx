import { Link } from "react-router-dom"
import { Package, MapPin, Bell, Gift, Baby, Star, User, Heart, Lock, LogOut } from "lucide-react"
import { useAuthStore } from "../../../store/authStore"
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar"
import { Badge } from "../../../components/ui/badge"
import { Card, CardContent } from "../../../components/ui/card"
import type { TabId, Tab } from "../types"

const TABS: Tab[] = [
    { id: "profile", label: "Thông tin", icon: <User className="h-[18px] w-[18px]" strokeWidth={2} /> },
    { id: "babies", label: "Hồ sơ bé", icon: <Baby className="h-[18px] w-[18px]" strokeWidth={2} />, badge: 2 },
    { id: "orders", label: "Đơn hàng", icon: <Package className="h-[18px] w-[18px]" strokeWidth={2} /> },
    { id: "wishlist", label: "Yêu thích", icon: <Heart className="h-[18px] w-[18px]" strokeWidth={2} /> },
    { id: "addresses", label: "Địa chỉ", icon: <MapPin className="h-[18px] w-[18px]" strokeWidth={2} /> },
    { id: "notifications", label: "Thông báo", icon: <Bell className="h-[18px] w-[18px]" strokeWidth={2} /> },
    { id: "security", label: "Bảo mật", icon: <Lock className="h-[18px] w-[18px]" strokeWidth={2} /> },
]

interface ProfileSidebarProps {
    activeTab: TabId
    onTabChange: (tab: TabId) => void
}

export default function ProfileSidebar({ activeTab, onTabChange }: ProfileSidebarProps) {
    const { role, logout } = useAuthStore()

    return (
        <aside className="space-y-4">
            {/* User Card */}
            <Card className="overflow-hidden">
                <div className="h-16 bg-gradient-to-r from-[#5c9fd4] via-[#4988c4] to-[#3a73a8]" />
                <CardContent className="p-5 -mt-8">
                    <div className="flex items-end gap-4">
                        <Avatar size="lg" className="h-16 w-16 ring-4 ring-white shadow-lg">
                            <AvatarImage src="/images/avatar-placeholder.jpg" alt="User" />
                            <AvatarFallback className="bg-gradient-to-br from-[#4988c4] to-[#3a73a8] text-white text-lg font-semibold">
                                MA
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0 pb-1">
                            <p className="font-semibold text-gray-900 truncate">Nguyễn Thị Minh Anh</p>
                            <p className="text-sm text-gray-500">
                                {role === "admin" ? "Quản trị viên" : "Thành viên"}
                            </p>
                        </div>
                    </div>

                    {/* Points Card */}
                    <div className="mt-5 rounded-xl bg-gradient-to-r from-[#e6f7fb] to-[#bde8f5] p-4 border border-[#94d9ef]/50">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-[#3a73a8] font-medium">Điểm tích lũy</p>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <Star className="h-5 w-5 text-[#4988c4] fill-[#4988c4]" />
                                    <span className="text-2xl font-bold text-[#3a73a8]">150</span>
                                </div>
                            </div>
                            <div className="p-2 rounded-full bg-white/60">
                                <Gift className="h-7 w-7 text-[#4988c4]" />
                            </div>
                        </div>
                        <Link
                            to="/rewards"
                            className="mt-3 inline-flex items-center text-sm font-medium text-[#3a73a8] hover:text-[#2d5f8a] transition-colors"
                        >
                            Đổi quà ngay
                            <span className="ml-1">→</span>
                        </Link>
                    </div>
                </CardContent>
            </Card>

            {/* Navigation */}
            <Card>
                <CardContent className="p-3">
                    <nav>
                        <ul className="space-y-1">
                            {TABS.map((tab) => {
                                const isActive = activeTab === tab.id
                                return (
                                    <li key={tab.id}>
                                        <button
                                            onClick={() => onTabChange(tab.id)}
                                            className={`group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                                                isActive
                                                    ? "bg-[#4988c4] text-white shadow-lg shadow-[#4988c4]/30"
                                                    : "text-gray-600 hover:bg-[#bde8f5]/50 hover:text-[#4988c4]"
                                            }`}
                                        >
                                            <span className={`${isActive ? "text-white" : "text-gray-400 group-hover:text-[#4988c4]"} transition-colors`}>
                                                {tab.icon}
                                            </span>
                                            <span className="flex-1 text-left">{tab.label}</span>
                                            {tab.badge && (
                                                <Badge
                                                    variant={isActive ? "secondary" : "default"}
                                                    className={isActive
                                                        ? "bg-white/25 text-white border-transparent font-semibold"
                                                        : "bg-[#bde8f5] text-[#4988c4] border-transparent"
                                                    }
                                                >
                                                    {tab.badge}
                                                </Badge>
                                            )}
                                        </button>
                                    </li>
                                )
                            })}
                        </ul>

                        <div className="mt-3 pt-3 border-t border-gray-100">
                            <button
                                onClick={logout}
                                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-500 transition-all duration-200 hover:bg-red-50 hover:text-red-600"
                            >
                                <LogOut className="h-[18px] w-[18px]" strokeWidth={2} />
                                Đăng xuất
                            </button>
                        </div>
                    </nav>
                </CardContent>
            </Card>
        </aside>
    )
}
