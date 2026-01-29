import { useAuthStore } from "../../store/authStore"
import { Link } from "react-router-dom"
import { AppRoute } from "../../lib/constants"
import {
    PersonIcon,
    GearIcon,
    HeartIcon,
    ExitIcon,
    ChevronRightIcon,
} from "@radix-ui/react-icons"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import {
    Package,
    Baby,
    Sparkles,
    LogIn,
    UserPlus,
} from "lucide-react"

/* ================= Types ================= */
interface BabyProfile {
    id: string
    name: string
    nickname: string
    birthDate: string
    gender: "boy" | "girl"
    avatarEmoji: string
}

/* ================= Mock Data ================= */
const mockBabies: BabyProfile[] = [
    { id: "1", name: "Nguyễn Bảo Ngọc", nickname: "Bé Bông", birthDate: "2024-03-15", gender: "girl", avatarEmoji: "👧" },
    { id: "2", name: "Nguyễn Minh Khang", nickname: "Bé Bin", birthDate: "2025-08-20", gender: "boy", avatarEmoji: "👦" },
]

/* ================= Helper Functions ================= */
function calculateAge(birthDate: string): string {
    const birth = new Date(birthDate)
    const now = new Date()
    const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())

    if (months < 1) return "Sơ sinh"
    if (months < 12) return `${months} tháng`
    const years = Math.floor(months / 12)
    const remainingMonths = months % 12
    if (remainingMonths === 0) return `${years} tuổi`
    return `${years}t ${remainingMonths}th`
}

function getStageColor(birthDate: string): string {
    const birth = new Date(birthDate)
    const now = new Date()
    const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())

    if (months < 3) return "from-pink-400 to-rose-400"
    if (months < 6) return "from-purple-400 to-violet-400"
    if (months < 12) return "from-blue-400 to-cyan-400"
    if (months < 24) return "from-green-400 to-emerald-400"
    return "from-amber-400 to-orange-400"
}

/* ================= Baby Quick Card ================= */
function BabyQuickCard({ baby }: { baby: BabyProfile }) {
    const age = calculateAge(baby.birthDate)
    const stageColor = getStageColor(baby.birthDate)

    return (
        <Link
            to={`${AppRoute.PROFILE}?tab=babies&babyId=${baby.id}`}
            className="flex items-center gap-3 rounded-xl p-3 hover:bg-gray-50 transition-colors"
        >
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${baby.gender === "girl" ? "from-pink-100 to-rose-100" : "from-blue-100 to-cyan-100"}`}>
                <span className="text-lg">{baby.avatarEmoji}</span>
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 text-sm truncate">{baby.nickname}</p>
                <div className="flex items-center gap-2">
                    <span className={`inline-flex rounded-full bg-gradient-to-r ${stageColor} px-2 py-0.5 text-[10px] font-semibold text-white`}>
                        {age}
                    </span>
                </div>
            </div>
            <ChevronRightIcon className="h-4 w-4 text-gray-300" />
        </Link>
    )
}

/* ================= Guest Dropdown Content ================= */
function GuestDropdownContent() {
    return (
        <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="w-80 rounded-2xl border border-gray-100 bg-white p-0 shadow-xl overflow-hidden z-[9999]"
        >
            {/* Header with gradient */}
            <div className="bg-gradient-to-br from-rose-50 via-purple-50 to-sky-50 p-6 text-center">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm mb-3">
                    <span className="text-3xl">🧸</span>
                </div>
                <h3 className="font-bold text-gray-800 text-lg">Chào mừng đến DreamGuard!</h3>
                <p className="text-sm text-gray-500 mt-1">Tổ ấm giấc ngủ cho bé yêu</p>
            </div>

            {/* Benefits */}
            <div className="p-4 space-y-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Đăng nhập để nhận</p>
                <div className="grid grid-cols-2 gap-2">
                    {[
                        { icon: "🎁", text: "Ưu đãi độc quyền" },
                        { icon: "💝", text: "Tích điểm đổi quà" },
                        { icon: "👶", text: "Gợi ý theo bé" },
                        { icon: "🚚", text: "Freeship đơn 500k" },
                    ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 rounded-lg bg-gray-50 p-2.5">
                            <span className="text-base">{item.icon}</span>
                            <span className="text-xs font-medium text-gray-600">{item.text}</span>
                        </div>
                    ))}
                </div>
            </div>

            <DropdownMenuSeparator className="bg-gray-100" />

            {/* Actions */}
            <div className="p-3 space-y-2">
                <Link to={AppRoute.LOGIN} className="flex items-center gap-3 w-full rounded-xl bg-primary px-4 py-3 text-white font-semibold hover:bg-primary/90 transition-colors justify-center">
                    <LogIn className="h-4 w-4" />
                    Đăng nhập
                </Link>
                <Link to={AppRoute.REGISTER} className="flex items-center gap-3 w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-700 font-semibold hover:bg-gray-50 transition-colors justify-center">
                    <UserPlus className="h-4 w-4" />
                    Tạo tài khoản mới
                </Link>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-4 py-3 text-center">
                <p className="text-xs text-gray-500">
                    Cần hỗ trợ? <span className="text-primary font-medium cursor-pointer hover:underline">Liên hệ ngay</span>
                </p>
            </div>
        </DropdownMenuContent>
    )
}

/* ================= User Dropdown Content ================= */
function UserDropdownContent() {
    const { role, logout } = useAuthStore()

    return (
        <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="w-80 rounded-2xl border border-gray-100 bg-white p-0 shadow-xl overflow-hidden z-[9999]"
        >
            {/* User Header */}
            <div className="bg-gradient-to-br from-rose-50 via-purple-50 to-sky-50 p-5">
                <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
                        <span className="text-2xl">👩</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-800 truncate">Chào Mẹ! 💕</p>
                        <p className="text-sm text-gray-600 truncate">Nguyễn Thị Minh Anh</p>
                        <div className="mt-1 flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                                <span>⭐</span> 150 điểm
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Baby Profiles Quick Access */}
            {mockBabies.length > 0 && (
                <div className="p-3 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                            <Baby className="h-3.5 w-3.5" />
                            Bé yêu của mẹ
                        </p>
                        <Link to={`${AppRoute.PROFILE}?tab=babies`} className="text-xs font-medium text-primary hover:underline">
                            Quản lý
                        </Link>
                    </div>
                    <div className="space-y-1 -mx-1">
                        {mockBabies.slice(0, 2).map((baby) => (
                            <BabyQuickCard key={baby.id} baby={baby} />
                        ))}
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            <div className="p-2">
                <DropdownMenuItem asChild className="rounded-xl px-3 py-2.5 cursor-pointer focus:bg-gray-50">
                    <Link to={AppRoute.PROFILE} className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <PersonIcon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                            <p className="font-medium text-gray-800 text-sm">Thông tin tài khoản</p>
                            <p className="text-xs text-gray-500">Quản lý thông tin cá nhân</p>
                        </div>
                        <ChevronRightIcon className="h-4 w-4 text-gray-300" />
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild className="rounded-xl px-3 py-2.5 cursor-pointer focus:bg-gray-50">
                    <Link to={`${AppRoute.PROFILE}?tab=orders`} className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                            <Package className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                            <p className="font-medium text-gray-800 text-sm">Đơn hàng của tôi</p>
                            <p className="text-xs text-gray-500">Theo dõi đơn hàng</p>
                        </div>
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-600">2</span>
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild className="rounded-xl px-3 py-2.5 cursor-pointer focus:bg-gray-50">
                    <Link to={`${AppRoute.PROFILE}?tab=wishlist`} className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
                            <HeartIcon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                            <p className="font-medium text-gray-800 text-sm">Yêu thích</p>
                            <p className="text-xs text-gray-500">Sản phẩm đã lưu</p>
                        </div>
                        <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-600">5</span>
                    </Link>
                </DropdownMenuItem>

                {/* Personalized Recommendations */}
                <div className="mt-2 mx-1 rounded-xl bg-gradient-to-r from-primary/10 to-purple-100 p-3">
                    <div className="flex items-center gap-2 text-primary">
                        <Sparkles className="h-4 w-4" />
                        <span className="text-xs font-semibold">Gợi ý cho bé</span>
                    </div>
                    <p className="mt-1 text-xs text-gray-600">3 sản phẩm mới phù hợp với Bé Bông</p>
                    <Link to="/products?recommended=true" className="mt-2 inline-block text-xs font-semibold text-primary hover:underline">
                        Xem ngay →
                    </Link>
                </div>

                {role === "admin" && (
                    <>
                        <DropdownMenuSeparator className="my-2 bg-gray-100" />
                        <DropdownMenuItem asChild className="rounded-xl px-3 py-2.5 cursor-pointer focus:bg-gray-50">
                            <Link to={AppRoute.ADMIN} className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                                    <GearIcon className="h-4 w-4" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-gray-800 text-sm">Quản trị viên</p>
                                    <p className="text-xs text-gray-500">Truy cập bảng điều khiển</p>
                                </div>
                            </Link>
                        </DropdownMenuItem>
                    </>
                )}
            </div>

            <DropdownMenuSeparator className="bg-gray-100" />

            {/* Logout */}
            <div className="p-2">
                <DropdownMenuItem
                    onClick={logout}
                    className="rounded-xl px-3 py-2.5 cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-600"
                >
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-100 text-red-600">
                            <ExitIcon className="h-4 w-4" />
                        </div>
                        <span className="font-medium text-sm">Đăng xuất</span>
                    </div>
                </DropdownMenuItem>
            </div>
        </DropdownMenuContent>
    )
}

/* ================= Trigger Button ================= */
function TriggerButton({ isAuthenticated }: { isAuthenticated: boolean }) {
    return (
        <DropdownMenuTrigger asChild>
            <button
                className="relative rounded-full p-2 text-foreground/60 transition-all hover:bg-muted hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                aria-label="Menu tài khoản"
            >
                <PersonIcon className="h-5 w-5" />
                {/* Notification badge */}
                {isAuthenticated && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-white shadow-sm">
                        3
                    </span>
                )}
            </button>
        </DropdownMenuTrigger>
    )
}

/* ================= Main Component ================= */
export default function UserDropdown() {
    const { isAuthenticated } = useAuthStore()
    const authenticated = isAuthenticated()

    return (
        <DropdownMenu>
            <TriggerButton isAuthenticated={authenticated} />
            {authenticated ? <UserDropdownContent /> : <GuestDropdownContent />}
        </DropdownMenu>
    )
}
