import { User, Heart, ShieldCheck, ShoppingBag, Baby } from "lucide-react"
import { DropdownMenuContent, DropdownMenuSeparator } from "../../ui/dropdown-menu"
import { AppRoute } from "../../../lib/constants"
import { useAuthStore } from "../../../store/authStore"
import { UserHeader } from "./UserHeader"
import { MenuItem } from "./MenuItem"
import { LogoutButton } from "./LogoutButton"
import { mockUser } from "./data"
import { useProfile } from "@/hooks/queries"
import { useLogout } from "@/hooks/useAuth"

export function UserDropdownContent() {
    const { role } = useAuthStore()
    const { mutate: logout } = useLogout()
    const { data: profile, isLoading } = useProfile()

    const resolvedName = profile
        ? profile.firstName || profile.lastName
            ? `${profile.firstName || ""} ${profile.lastName || ""}`.trim()
            : profile.fullName || mockUser.name
        : mockUser.name

    const userData = {
        ...mockUser,
        name: resolvedName,
        email: profile?.email || mockUser.email,
        points: 150,
        avatarUrl: profile?.avatarUrl || mockUser.avatarUrl || ""
    }

    return (
        <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="
                w-72 rounded-2xl border border-gray-100 bg-white p-0 overflow-hidden
                shadow-[0_12px_40px_-12px_rgba(0,0,0,0.1)]
            "
        >
            <UserHeader user={userData} isLoading={isLoading} />

            <div className="py-2 px-1">
                <MenuItem
                    to={`${AppRoute.PROFILE}?tab=profile`}
                    icon={<User className="h-4 w-4" />}
                    title="Account Settings"
                />

                <MenuItem
                    to={`${AppRoute.PROFILE}?tab=babies`}
                    icon={<Baby className="h-4 w-4" />}
                    title="My Babies"
                />

                <MenuItem
                    to={`${AppRoute.PROFILE}?tab=orders`}
                    icon={<ShoppingBag className="h-4 w-4" />}
                    title="Recent Orders"
                    badge={2}
                />

                <MenuItem
                    to={`${AppRoute.PROFILE}?tab=wishlist`}
                    icon={<Heart className="h-4 w-4" />}
                    title="Wishlist"
                />
                
                <MenuItem
                    to={`${AppRoute.PROFILE}?tab=security`}
                    icon={<ShieldCheck className="h-4 w-4" />}
                    title="Account Security"
                />

                {role?.toLowerCase() === "admin" && (
                    <>
                        <DropdownMenuSeparator className="mx-4 my-2 opacity-50" />
                        <MenuItem
                            to={AppRoute.ADMIN}
                            icon={<ShieldCheck className="h-4 w-4 text-primary" />}
                            title="Admin Controls"
                        />
                    </>
                )}
            </div>

            <DropdownMenuSeparator className="mx-4 my-2 opacity-50" />

            <div className="py-1">
                <LogoutButton onLogout={logout} />
            </div>
        </DropdownMenuContent>
    )
}
