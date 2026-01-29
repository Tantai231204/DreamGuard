import { User, Package, Heart, Settings } from "lucide-react"
import { DropdownMenuContent, DropdownMenuSeparator } from "../../ui/dropdown-menu"
import { AppRoute } from "../../../lib/constants"
import { useAuthStore } from "../../../store/authStore"
import { UserHeader } from "./UserHeader"
import { BabiesSection } from "./BabiesSection"
import { MenuItem } from "./MenuItem"
import { RecommendationCard } from "./RecommendationCard"
import { LogoutButton } from "./LogoutButton"
import { mockBabies, mockUser } from "./data"

export function UserDropdownContent() {
    const { role, logout } = useAuthStore()

    return (
        <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="
                w-80 rounded-2xl border border-gray-100 bg-white p-0 overflow-hidden z-[9999]
                shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15),0_4px_12px_-4px_rgba(0,0,0,0.08)]
                data-[state=open]:animate-in data-[state=closed]:animate-out
                data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
                data-[state=closed]:scale-[0.98] data-[state=open]:scale-100
                data-[state=closed]:translate-y-1 data-[state=open]:translate-y-0
                duration-200 ease-out
                origin-top-right
            "
        >
            <UserHeader user={mockUser} />

            <BabiesSection babies={mockBabies} />

            {/* Quick Actions */}
            <div className="p-2">
                <MenuItem
                    to={AppRoute.PROFILE}
                    icon={<User className="h-4 w-4 text-primary" />}
                    iconBg="bg-primary/10"
                    title="Thông tin tài khoản"
                    subtitle="Quản lý thông tin cá nhân"
                />

                <MenuItem
                    to={`${AppRoute.PROFILE}?tab=orders`}
                    icon={<Package className="h-4 w-4 text-blue-600" />}
                    iconBg="bg-blue-50"
                    title="Đơn hàng của tôi"
                    subtitle="Theo dõi đơn hàng"
                    badge={2}
                    badgeColor="bg-blue-100 text-blue-700"
                />

                <MenuItem
                    to={`${AppRoute.PROFILE}?tab=wishlist`}
                    icon={<Heart className="h-4 w-4 text-rose-600" />}
                    iconBg="bg-rose-50"
                    title="Yêu thích"
                    subtitle="Sản phẩm đã lưu"
                    badge={5}
                    badgeColor="bg-rose-100 text-rose-700"
                />

                <RecommendationCard babyName="Bé Bông" count={3} />

                {role === "admin" && (
                    <>
                        <DropdownMenuSeparator className="my-2 bg-gray-100" />
                        <MenuItem
                            to={AppRoute.ADMIN}
                            icon={<Settings className="h-4 w-4 text-amber-600" />}
                            iconBg="bg-amber-50"
                            title="Quản trị viên"
                            subtitle="Truy cập bảng điều khiển"
                        />
                    </>
                )}
            </div>

            <DropdownMenuSeparator className="bg-gray-100" />

            <LogoutButton onLogout={logout} />
        </DropdownMenuContent>
    )
}
