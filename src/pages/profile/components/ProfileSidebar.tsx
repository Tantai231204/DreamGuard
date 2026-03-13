import { memo } from "react"
import { Link } from "react-router-dom"
import { MapPin, Bell, Gift, Baby, Star, User, Heart, Lock, LogOut, RefreshCw, Ticket, ShoppingBag, Crown } from "lucide-react"
import { useAuthStore } from "../../../store/authStore"
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar"
import { Skeleton } from "../../../components/ui/skeleton"
import type { TabId, Tab } from "../types"
import { useProfile } from "@/hooks/queries"
import { useLogout } from "../../../hooks/useAuth"

const TABS: Tab[] = [
  { id: "profile", label: "My Profile", icon: <User className="h-4.5 w-4.5" /> },
  { id: "babies", label: "My Babies", icon: <Baby className="h-4.5 w-4.5" />, badge: 2 },
  { id: "orders", label: "Recent Orders", icon: <ShoppingBag className="h-4.5 w-4.5" /> },
  { id: "resell", label: "Sell Items", icon: <RefreshCw className="h-4.5 w-4.5" /> },
  { id: "wishlist", label: "Wishlist", icon: <Heart className="h-4.5 w-4.5" /> },
  { id: "vouchers", label: "Vouchers", icon: <Ticket className="h-4.5 w-4.5" />, badge: 3 },
  { id: "addresses", label: "Shipping Addresses", icon: <MapPin className="h-4.5 w-4.5" /> },
  { id: "notifications", label: "Notifications", icon: <Bell className="h-4.5 w-4.5" /> },
  { id: "security", label: "Account Security", icon: <Lock className="h-4.5 w-4.5" /> },
]

interface ProfileSidebarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const ProfileSidebar = ({ activeTab, onTabChange }: ProfileSidebarProps) => {
  const { role } = useAuthStore()
  const { data: profile, isLoading } = useProfile()
  const logoutMutation = useLogout()

  const fullName = profile ? `${profile.firstName} ${profile.lastName}` : "User"
  const initials = profile ? `${profile.firstName[0] || ""}${profile.lastName[0] || ""}`.toUpperCase() : "U"

  const handleLogout = () => {
    logoutMutation.mutate()
  }

  return (
    <aside className="space-y-6">
      {/* Minimal User Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-6 hover:shadow-md transition-shadow duration-300">
        {isLoading ? (
          <div className="flex flex-col items-center text-center">
            <Skeleton className="h-20 w-20 rounded-full mb-4" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-32 mx-auto" />
              <Skeleton className="h-3 w-20 mx-auto" />
            </div>
            <div className="mt-6 w-full pt-6 border-t border-gray-50 flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-2 w-20" />
                <Skeleton className="h-5 w-12" />
              </div>
              <Skeleton className="h-10 w-10 rounded-xl" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center">
            <Avatar className="h-20 w-20 border border-gray-50 shadow-sm mb-4">
              <AvatarImage src={profile?.avatarUrl} alt={fullName} />
              <AvatarFallback className="bg-gray-50 text-gray-500 text-xl font-medium">
                {initials || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h2 className="font-bold text-gray-900 text-lg leading-tight">{fullName}</h2>
              <div className="flex items-center justify-center gap-2 mt-1">
                {/* High-Fidelity Metallic Rank Badge */}
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-br from-slate-100 via-gray-300 to-slate-200 border border-slate-300/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_1px_2px_rgba(0,0,0,0.05)]">
                  <Crown className="h-3 w-3 text-slate-500 fill-slate-400 drop-shadow-[0_1px_0_rgba(255,255,255,0.5)]" />
                  <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider drop-shadow-[0_1px_0_rgba(255,255,255,0.5)]">Silver Member</span>
                </div>
                <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">•</span>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">
                  {role === "admin" ? "Administrator" : "Active"}
                </p>
              </div>
            </div>

            {/* Integrated Points Section */}
            <div className="mt-6 w-full pt-6 border-t border-gray-50 flex items-center justify-between">
              <div className="text-left">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                  Available Points
                </p>
                <div className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                  <span className="text-xl font-black text-gray-900 leading-none">150</span>
                </div>
              </div>
              <Link
                to="/rewards"
                className="h-10 w-10 flex items-center justify-center rounded-xl bg-primary/5 text-primary hover:bg-primary hover:text-white transition-all duration-300"
                title="Redeem points"
              >
                <Gift className="h-5 w-5" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Clean Side Navigation */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-2 overflow-hidden hover:shadow-md transition-shadow duration-300">
        <nav className="space-y-1">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                                    w-full group flex items-center gap-3.5 rounded-xl px-4 py-3.5
                                    transition-all duration-200 relative
                                    ${isActive
                    ? "bg-[#4988c4] text-white shadow-md shadow-[#4988c4]/20"
                    : "hover:bg-gray-50 text-gray-600 hover:text-gray-900"
                  }
                                `}
              >
                <span className={`${isActive ? "text-white" : "text-gray-400 group-hover:text-gray-900"} transition-colors`}>
                  {tab.icon}
                </span>
                <span className="flex-1 text-left text-[14px] font-semibold tracking-tight">{tab.label}</span>

                {tab.badge && (
                  <span className={`
                                        text-[11px] font-bold px-2 py-0.5 rounded-full
                                        ${isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}
                                    `}>
                    {tab.badge}
                  </span>
                )}
              </button>
            )
          })}

          <div className="pt-2 mt-2 border-t border-gray-50">
            <button
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className="w-full flex items-center gap-3.5 rounded-xl px-4 py-3.5 text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200 disabled:opacity-50"
            >
              <LogOut className="h-[18px] w-[18px]" strokeWidth={2} />
              <span className="text-[14px] font-semibold">Sign Out</span>
            </button>
          </div>
        </nav>
      </div>
    </aside>
  )
}

export default memo(ProfileSidebar);
