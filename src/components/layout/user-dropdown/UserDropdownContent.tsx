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
                w-80 rounded-3xl border-0 bg-white/95 backdrop-blur-xl p-0 overflow-hidden z-[9999]
                shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2),0_10px_20px_-10px_rgba(0,0,0,0.1)]
                ring-1 ring-black/5
                data-[state=open]:animate-in data-[state=closed]:animate-out
                data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
                data-[state=closed]:scale-95 data-[state=open]:scale-100
                data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2
                duration-200
            "
        >
            <UserHeader user={mockUser} />

            <BabiesSection babies={mockBabies} />

            {/* Menu */}
            <div className="p-2">
                <MenuItem
                    to={AppRoute.PROFILE}
                    icon={<User className="h-4 w-4" />}
                    iconBg="bg-gradient-to-br from-primary/20 to-primary/10 text-primary"
                    title="Account"
                    subtitle="Settings & preferences"
                />

                <MenuItem
                    to={`${AppRoute.PROFILE}?tab=orders`}
                    icon={<Package className="h-4 w-4" />}
                    iconBg="bg-gradient-to-br from-blue-100 to-blue-50 text-blue-600"
                    title="Orders"
                    subtitle="Track your purchases"
                    badge={2}
                    badgeColor="bg-blue-500 text-white"
                />

                <MenuItem
                    to={`${AppRoute.PROFILE}?tab=wishlist`}
                    icon={<Heart className="h-4 w-4" />}
                    iconBg="bg-gradient-to-br from-rose-100 to-rose-50 text-rose-500"
                    title="Wishlist"
                    subtitle="Saved items"
                    badge={5}
                    badgeColor="bg-rose-500 text-white"
                />

                <RecommendationCard babyName="Bé Bông" count={3} />

                {role === "admin" && (
                    <>
                        <DropdownMenuSeparator className="my-2 bg-gray-100/80" />
                        <MenuItem
                            to={AppRoute.ADMIN}
                            icon={<Settings className="h-4 w-4" />}
                            iconBg="bg-gradient-to-br from-violet-100 to-violet-50 text-violet-600"
                            title="Admin"
                            subtitle="Dashboard"
                        />
                    </>
                )}
            </div>

            <LogoutButton onLogout={logout} />
        </DropdownMenuContent>
    )
}
