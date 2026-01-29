import { useState } from "react"
import { useAuthStore } from "../../store/authStore"
import { Link, useSearchParams } from "react-router-dom"
import { AppRoute } from "../../lib/constants"
import {
    PersonIcon,
    GearIcon,
    HeartIcon,
    ClipboardIcon,
    HomeIcon,
    LockClosedIcon,
    ExitIcon,
    Pencil1Icon,
    CameraIcon,
    PlusIcon,
    ChevronRightIcon,
} from "@radix-ui/react-icons"
import {
    Package,
    MapPin,
    Bell,
    Gift,
    Baby,
    Sparkles,
    Moon,
    Ruler,
    Scale,
    Calendar,
    Heart,
    ShoppingBag,
    Bed,
    Star,
} from "lucide-react"

/* ================= Types ================= */
type TabId =
    | "profile"
    | "babies"
    | "orders"
    | "wishlist"
    | "addresses"
    | "notifications"
    | "security"

interface Tab {
    id: TabId
    label: string
    icon: React.ReactNode
    badge?: number
}

interface BabyProfile {
    id: string
    name: string
    nickname?: string
    birthDate: string
    gender: "boy" | "girl"
    avatarEmoji: string
    height?: number
    weight?: number
    sleepHabits?: string
    allergies?: string[]
}

interface ProductRecommendation {
    id: string
    name: string
    price: number
    image: string
    reason: string
    discount?: number
}

/* ================= Mock Data ================= */
const mockBabies: BabyProfile[] = [
    {
        id: "1",
        name: "Nguyễn Bảo Ngọc",
        nickname: "Bé Bông",
        birthDate: "2024-03-15",
        gender: "girl",
        avatarEmoji: "👧",
        height: 75,
        weight: 9.5,
        sleepHabits: "Ngủ xuyên đêm",
        allergies: ["Len"]
    },
    {
        id: "2",
        name: "Nguyễn Minh Khang",
        nickname: "Bé Bin",
        birthDate: "2025-08-20",
        gender: "boy",
        avatarEmoji: "👦",
        height: 55,
        weight: 4.2,
        sleepHabits: "Thức đêm 2-3 lần",
        allergies: []
    },
]

const mockRecommendations: ProductRecommendation[] = [
    {
        id: "1",
        name: "Nệm cao su non cho bé 6-12 tháng",
        price: 1290000,
        image: "https://i.pinimg.com/1200x/78/47/1d/78471d920e63312ee215e0f328a67b37.jpg",
        reason: "Phù hợp với giai đoạn phát triển của Bé Bông",
        discount: 15
    },
    {
        id: "2",
        name: "Chăn cotton organic mềm mại",
        price: 590000,
        image: "https://i.pinimg.com/1200x/78/47/1d/78471d920e63312ee215e0f328a67b37.jpg",
        reason: "Không chứa len - An toàn cho bé",
        discount: 10
    },
    {
        id: "3",
        name: "Gối chống trào ngược cho bé sơ sinh",
        price: 450000,
        image: "https://i.pinimg.com/1200x/78/47/1d/78471d920e63312ee215e0f328a67b37.jpg",
        reason: "Hỗ trợ giấc ngủ cho Bé Bin",
    },
]

/* ================= Helper Functions ================= */
function calculateAge(birthDate: string): { text: string; months: number } {
    const birth = new Date(birthDate)
    const now = new Date()
    const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())

    if (months < 1) return { text: "Sơ sinh", months: 0 }
    if (months < 12) return { text: `${months} tháng tuổi`, months }
    const years = Math.floor(months / 12)
    const remainingMonths = months % 12
    if (remainingMonths === 0) return { text: `${years} tuổi`, months }
    return { text: `${years} tuổi ${remainingMonths} tháng`, months }
}

function getStageInfo(months: number): { label: string; color: string; icon: string; tips: string[] } {
    if (months < 3) return {
        label: "Sơ sinh",
        color: "from-pink-400 to-rose-400",
        icon: "👶",
        tips: ["Chọn nệm êm ái, thoáng khí", "Chăn mỏng nhẹ", "Gối chống trào ngược"]
    }
    if (months < 6) return {
        label: "3-6 tháng",
        color: "from-purple-400 to-violet-400",
        icon: "🌸",
        tips: ["Nệm có độ cứng vừa phải", "Chăn có thể điều chỉnh nhiệt độ", "Gối định hình đầu"]
    }
    if (months < 12) return {
        label: "6-12 tháng",
        color: "from-blue-400 to-cyan-400",
        icon: "🌟",
        tips: ["Nệm hỗ trợ lật người", "Ga giường dễ giặt", "Phụ kiện an toàn"]
    }
    if (months < 24) return {
        label: "1-2 tuổi",
        color: "from-green-400 to-emerald-400",
        icon: "🌿",
        tips: ["Nệm size lớn hơn", "Chăn ga họa tiết bé thích", "Gối phù hợp chiều cao"]
    }
    if (months < 36) return {
        label: "2-3 tuổi",
        color: "from-yellow-400 to-amber-400",
        icon: "☀️",
        tips: ["Có thể chuyển sang giường nhỏ", "Chăn ga theo chủ đề", "Phụ kiện trang trí"]
    }
    return {
        label: "Trên 3 tuổi",
        color: "from-orange-400 to-red-400",
        icon: "🎨",
        tips: ["Giường đơn cho bé", "Để bé chọn màu sắc", "Nệm hỗ trợ cột sống"]
    }
}

/* ================= Sidebar Menu ================= */
const TABS: Tab[] = [
    { id: "profile", label: "Thông tin phụ huynh", icon: <PersonIcon className="h-4 w-4" /> },
    { id: "babies", label: "Hồ sơ bé yêu", icon: <Baby className="h-4 w-4" />, badge: 2 },
    { id: "orders", label: "Đơn hàng", icon: <Package className="h-4 w-4" /> },
    { id: "wishlist", label: "Yêu thích", icon: <HeartIcon className="h-4 w-4" /> },
    { id: "addresses", label: "Địa chỉ", icon: <MapPin className="h-4 w-4" /> },
    { id: "notifications", label: "Thông báo", icon: <Bell className="h-4 w-4" /> },
    { id: "security", label: "Bảo mật", icon: <LockClosedIcon className="h-4 w-4" /> },
]

/* ================= Profile Info Tab ================= */
function ProfileInfoTab() {
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState({
        fullName: "Nguyễn Thị Minh Anh",
        email: "minhanh.nguyen@email.com",
        phone: "0912 345 678",
        birthday: "1992-05-20",
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-gray-800">Thông tin phụ huynh</h2>
                    <p className="text-sm text-gray-500 mt-1">Quản lý thông tin cá nhân của bạn</p>
                </div>
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                    <Pencil1Icon className="h-4 w-4" />
                    {isEditing ? "Hủy" : "Chỉnh sửa"}
                </button>
            </div>

            {/* Avatar Section */}
            <div className="flex items-center gap-6 p-6 rounded-2xl bg-gradient-to-br from-rose-50 via-purple-50 to-sky-50">
                <div className="relative">
                    <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center overflow-hidden shadow-sm border-4 border-white">
                        <span className="text-4xl">👩</span>
                    </div>
                    {isEditing && (
                        <button className="absolute bottom-0 right-0 rounded-full bg-primary p-2.5 text-white shadow-lg hover:bg-primary/90 transition-colors">
                            <CameraIcon className="h-4 w-4" />
                        </button>
                    )}
                </div>
                <div>
                    <h3 className="text-xl font-semibold text-gray-800">{formData.fullName}</h3>
                    <p className="text-sm text-gray-500 mt-1">{formData.email}</p>
                    <div className="mt-3 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-medium text-primary shadow-sm">
                            <Heart className="h-3 w-3" />
                            Mẹ của 2 bé
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                            <Star className="h-3 w-3" />
                            150 điểm
                        </span>
                    </div>
                </div>
            </div>

            {/* Form */}
            <div className="grid gap-5 md:grid-cols-2">
                {[
                    { label: "Họ và tên", key: "fullName", type: "text" },
                    { label: "Email", key: "email", type: "email" },
                    { label: "Số điện thoại", key: "phone", type: "tel" },
                    { label: "Ngày sinh", key: "birthday", type: "date" },
                ].map((field) => (
                    <div key={field.key} className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            {field.label}
                        </label>
                        <input
                            type={field.type}
                            value={formData[field.key as keyof typeof formData]}
                            onChange={(e) =>
                                setFormData({ ...formData, [field.key]: e.target.value })
                            }
                            disabled={!isEditing}
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
                        />
                    </div>
                ))}
            </div>

            {isEditing && (
                <div className="flex gap-3 pt-2">
                    <button className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-primary/90 hover:shadow-lg">
                        Lưu thay đổi
                    </button>
                    <button
                        onClick={() => setIsEditing(false)}
                        className="rounded-xl border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50"
                    >
                        Hủy bỏ
                    </button>
                </div>
            )}
        </div>
    )
}

/* ================= Baby Card Component ================= */
function BabyCard({ baby, onSelect }: { baby: BabyProfile; onSelect: () => void }) {
    const age = calculateAge(baby.birthDate)
    const stage = getStageInfo(age.months)

    return (
        <div
            onClick={onSelect}
            className="group relative rounded-2xl border border-gray-100 bg-white p-5 transition-all hover:border-primary/30 hover:shadow-lg cursor-pointer"
        >
            {/* Header */}
            <div className="flex items-start gap-4">
                <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${baby.gender === "girl" ? "from-pink-100 to-rose-100" : "from-blue-100 to-cyan-100"} shadow-sm`}>
                    <span className="text-3xl">{baby.avatarEmoji}</span>
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{baby.name}</h3>
                    {baby.nickname && (
                        <p className="text-sm text-gray-500">{baby.nickname}</p>
                    )}
                    <div className="mt-2 flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-r ${stage.color} px-2.5 py-0.5 text-[10px] font-semibold text-white`}>
                            {stage.icon} {stage.label}
                        </span>
                        <span className="text-xs text-gray-400">{age.text}</span>
                    </div>
                </div>
                <ChevronRightIcon className="h-5 w-5 text-gray-300 group-hover:text-primary transition-colors" />
            </div>

            {/* Stats */}
            <div className="mt-4 grid grid-cols-3 gap-3">
                {baby.height && (
                    <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
                        <Ruler className="h-4 w-4 text-gray-400" />
                        <span className="text-xs font-medium text-gray-600">{baby.height} cm</span>
                    </div>
                )}
                {baby.weight && (
                    <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
                        <Scale className="h-4 w-4 text-gray-400" />
                        <span className="text-xs font-medium text-gray-600">{baby.weight} kg</span>
                    </div>
                )}
                <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
                    <Moon className="h-4 w-4 text-gray-400" />
                    <span className="text-xs font-medium text-gray-600 truncate">{baby.sleepHabits || "Chưa cập nhật"}</span>
                </div>
            </div>

            {/* Allergies Warning */}
            {baby.allergies && baby.allergies.length > 0 && (
                <div className="mt-3 flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                    <span className="font-medium">⚠️ Dị ứng:</span>
                    {baby.allergies.join(", ")}
                </div>
            )}
        </div>
    )
}

/* ================= Baby Detail View ================= */
function BabyDetailView({ baby, onBack }: { baby: BabyProfile; onBack: () => void }) {
    const age = calculateAge(baby.birthDate)
    const stage = getStageInfo(age.months)

    return (
        <div className="space-y-6">
            {/* Back Button */}
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary transition-colors"
            >
                ← Quay lại danh sách
            </button>

            {/* Baby Header */}
            <div className={`relative rounded-3xl bg-gradient-to-br ${baby.gender === "girl" ? "from-pink-50 via-rose-50 to-purple-50" : "from-blue-50 via-cyan-50 to-purple-50"} p-6 overflow-hidden`}>
                {/* Decorative */}
                <div className="absolute top-4 right-4 text-4xl opacity-20">{stage.icon}</div>

                <div className="flex items-center gap-5">
                    <div className={`flex h-24 w-24 items-center justify-center rounded-3xl bg-white shadow-lg`}>
                        <span className="text-5xl">{baby.avatarEmoji}</span>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">{baby.name}</h2>
                        {baby.nickname && (
                            <p className="text-gray-500">{baby.nickname}</p>
                        )}
                        <div className="mt-3 flex items-center gap-3">
                            <span className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r ${stage.color} px-4 py-1.5 text-sm font-semibold text-white shadow-sm`}>
                                {stage.icon} {stage.label}
                            </span>
                            <span className="text-sm text-gray-500">{age.text}</span>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="rounded-2xl bg-white/80 backdrop-blur-sm p-4 text-center shadow-sm">
                        <Calendar className="h-5 w-5 text-primary mx-auto mb-2" />
                        <p className="text-xs text-gray-500">Ngày sinh</p>
                        <p className="font-semibold text-gray-800">{new Date(baby.birthDate).toLocaleDateString("vi-VN")}</p>
                    </div>
                    <div className="rounded-2xl bg-white/80 backdrop-blur-sm p-4 text-center shadow-sm">
                        <Ruler className="h-5 w-5 text-green-500 mx-auto mb-2" />
                        <p className="text-xs text-gray-500">Chiều cao</p>
                        <p className="font-semibold text-gray-800">{baby.height || "--"} cm</p>
                    </div>
                    <div className="rounded-2xl bg-white/80 backdrop-blur-sm p-4 text-center shadow-sm">
                        <Scale className="h-5 w-5 text-blue-500 mx-auto mb-2" />
                        <p className="text-xs text-gray-500">Cân nặng</p>
                        <p className="font-semibold text-gray-800">{baby.weight || "--"} kg</p>
                    </div>
                    <div className="rounded-2xl bg-white/80 backdrop-blur-sm p-4 text-center shadow-sm">
                        <Moon className="h-5 w-5 text-purple-500 mx-auto mb-2" />
                        <p className="text-xs text-gray-500">Giấc ngủ</p>
                        <p className="font-semibold text-gray-800 text-xs">{baby.sleepHabits || "Chưa cập nhật"}</p>
                    </div>
                </div>
            </div>

            {/* Allergies */}
            {baby.allergies && baby.allergies.length > 0 && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                    <h3 className="flex items-center gap-2 font-semibold text-amber-800">
                        ⚠️ Lưu ý dị ứng
                    </h3>
                    <p className="mt-2 text-sm text-amber-700">
                        Bé có dị ứng với: <strong>{baby.allergies.join(", ")}</strong>.
                        Chúng tôi sẽ lọc các sản phẩm phù hợp cho bé.
                    </p>
                </div>
            )}

            {/* Stage Tips */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5">
                <h3 className="flex items-center gap-2 font-semibold text-gray-800">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Gợi ý cho giai đoạn {stage.label}
                </h3>
                <ul className="mt-3 space-y-2">
                    {stage.tips.map((tip, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                            {tip}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Product Recommendations */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="flex items-center gap-2 font-semibold text-gray-800">
                        <ShoppingBag className="h-5 w-5 text-primary" />
                        Sản phẩm gợi ý cho {baby.nickname || baby.name}
                    </h3>
                    <Link to="/products" className="text-sm font-medium text-primary hover:underline">
                        Xem tất cả →
                    </Link>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {mockRecommendations.map((product) => (
                        <div key={product.id} className="group rounded-xl border border-gray-100 overflow-hidden hover:border-primary/30 hover:shadow-md transition-all">
                            <div className="aspect-square bg-gray-100 relative overflow-hidden">
                                <img src={product.image} alt={product.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                                {product.discount && (
                                    <span className="absolute top-2 left-2 rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white">
                                        -{product.discount}%
                                    </span>
                                )}
                            </div>
                            <div className="p-3">
                                <h4 className="font-medium text-gray-800 text-sm line-clamp-2">{product.name}</h4>
                                <p className="mt-1 text-xs text-primary font-medium">{product.reason}</p>
                                <p className="mt-2 font-bold text-primary">{product.price.toLocaleString("vi-VN")}₫</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Services */}
            <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-primary/5 to-purple-50 p-5">
                <h3 className="flex items-center gap-2 font-semibold text-gray-800 mb-4">
                    <Bed className="h-5 w-5 text-primary" />
                    Dịch vụ chăm sóc
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                    {[
                        { icon: "🧹", title: "Giặt chăn ga tại nhà", desc: "Vệ sinh chuyên nghiệp, an toàn cho bé", price: "150.000₫" },
                        { icon: "🌙", title: "Tư vấn giấc ngủ", desc: "Chuyên gia hỗ trợ cải thiện giấc ngủ", price: "Miễn phí" },
                        { icon: "📦", title: "Đổi size theo tuổi", desc: "Đổi nệm/gối khi bé lớn lên", price: "Ưu đãi 30%" },
                        { icon: "🎁", title: "Gói quà tặng", desc: "Quà tặng đẹp mắt cho bé", price: "Từ 50.000₫" },
                    ].map((service, idx) => (
                        <div key={idx} className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                            <span className="text-2xl">{service.icon}</span>
                            <div className="flex-1">
                                <p className="font-medium text-gray-800">{service.title}</p>
                                <p className="text-xs text-gray-500">{service.desc}</p>
                            </div>
                            <span className="text-xs font-semibold text-primary">{service.price}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

/* ================= Babies Tab ================= */
function BabiesTab() {
    const [selectedBaby, setSelectedBaby] = useState<BabyProfile | null>(null)

    if (selectedBaby) {
        return <BabyDetailView baby={selectedBaby} onBack={() => setSelectedBaby(null)} />
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-gray-800">Hồ sơ bé yêu</h2>
                    <p className="text-sm text-gray-500 mt-1">Theo dõi sự phát triển và nhận gợi ý sản phẩm phù hợp</p>
                </div>
                <button className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors shadow-sm hover:shadow-md">
                    <PlusIcon className="h-4 w-4" />
                    Thêm bé
                </button>
            </div>

            {/* Baby List */}
            <div className="grid gap-4 md:grid-cols-2">
                {mockBabies.map((baby) => (
                    <BabyCard
                        key={baby.id}
                        baby={baby}
                        onSelect={() => setSelectedBaby(baby)}
                    />
                ))}
            </div>

            {/* Why Track Section */}
            <div className="rounded-2xl bg-gradient-to-br from-rose-50 via-purple-50 to-sky-50 p-6">
                <h3 className="font-semibold text-gray-800 mb-4">💡 Tại sao nên theo dõi hồ sơ bé?</h3>
                <div className="grid gap-4 sm:grid-cols-3">
                    {[
                        { icon: <Sparkles className="h-5 w-5" />, title: "Gợi ý thông minh", desc: "Sản phẩm phù hợp theo từng giai đoạn" },
                        { icon: <Heart className="h-5 w-5" />, title: "An toàn cho bé", desc: "Lọc sản phẩm theo dị ứng" },
                        { icon: <Gift className="h-5 w-5" />, title: "Ưu đãi đặc biệt", desc: "Quà tặng sinh nhật bé yêu" },
                    ].map((item, idx) => (
                        <div key={idx} className="text-center">
                            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white text-primary shadow-sm mb-3">
                                {item.icon}
                            </div>
                            <p className="font-medium text-gray-800">{item.title}</p>
                            <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

/* ================= Orders Tab ================= */
function OrdersTab() {
    const orders = [
        {
            id: "DG-2026-001234",
            date: "20/01/2026",
            status: "delivered",
            statusLabel: "Đã giao hàng",
            total: 2450000,
            items: [
                { name: "Bộ chăn ga gối cotton cho bé", quantity: 1, price: 1500000 },
                { name: "Gối chống trào ngược", quantity: 2, price: 475000 },
            ],
        },
        {
            id: "DG-2026-001189",
            date: "15/01/2026",
            status: "shipping",
            statusLabel: "Đang giao hàng",
            total: 890000,
            items: [
                { name: "Nệm cao su non cho bé", quantity: 1, price: 890000 },
            ],
        },
    ]

    const statusColors: Record<string, string> = {
        pending: "bg-amber-100 text-amber-700",
        confirmed: "bg-blue-100 text-blue-700",
        shipping: "bg-purple-100 text-purple-700",
        delivered: "bg-green-100 text-green-700",
        cancelled: "bg-red-100 text-red-700",
    }

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">Đơn hàng của tôi</h2>

            {/* Order Stats */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {[
                    { label: "Tổng đơn", value: "12", color: "text-primary" },
                    { label: "Hoàn thành", value: "10", color: "text-green-600" },
                    { label: "Đang giao", value: "1", color: "text-purple-600" },
                    { label: "Chờ xác nhận", value: "1", color: "text-amber-600" },
                ].map((stat, idx) => (
                    <div key={idx} className="rounded-2xl border border-gray-100 bg-white p-4 text-center">
                        <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                        <p className="text-sm text-gray-500">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Order List */}
            <div className="space-y-4">
                {orders.map((order) => (
                    <div
                        key={order.id}
                        className="rounded-2xl border border-gray-100 bg-white p-5 transition-all hover:shadow-md"
                    >
                        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                            <div>
                                <p className="font-semibold text-gray-800">{order.id}</p>
                                <p className="text-sm text-gray-500">Đặt ngày {order.date}</p>
                            </div>
                            <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[order.status]}`}>
                                {order.statusLabel}
                            </span>
                        </div>

                        <div className="py-4 space-y-2">
                            {order.items.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">{item.name} x{item.quantity}</span>
                                    <span className="font-medium text-gray-800">{item.price.toLocaleString("vi-VN")}₫</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                            <p className="text-sm text-gray-500">
                                Tổng tiền: <span className="text-lg font-bold text-primary">{order.total.toLocaleString("vi-VN")}₫</span>
                            </p>
                            <button className="text-sm font-medium text-primary hover:underline">
                                Xem chi tiết →
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/* ================= Wishlist Tab ================= */
function WishlistTab() {
    const wishlistItems = [
        {
            id: 1,
            name: "Bộ chăn ga gối cotton organic",
            price: 1890000,
            originalPrice: 2200000,
            image: "https://i.pinimg.com/1200x/78/47/1d/78471d920e63312ee215e0f328a67b37.jpg",
            inStock: true,
        },
        {
            id: 2,
            name: "Nệm cao su non cho bé sơ sinh",
            price: 890000,
            originalPrice: 1100000,
            image: "https://i.pinimg.com/1200x/78/47/1d/78471d920e63312ee215e0f328a67b37.jpg",
            inStock: true,
        },
    ]

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">Sản phẩm yêu thích</h2>
                <p className="text-sm text-gray-500">{wishlistItems.length} sản phẩm</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {wishlistItems.map((item) => (
                    <div key={item.id} className="group relative rounded-2xl border border-gray-100 bg-white overflow-hidden transition-all hover:shadow-md">
                        <button className="absolute right-3 top-3 z-10 rounded-full bg-white p-2 text-rose-500 shadow-md transition-transform hover:scale-110">
                            <HeartIcon className="h-4 w-4 fill-current" />
                        </button>

                        <div className="aspect-square overflow-hidden bg-gray-100">
                            <img src={item.image} alt={item.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                        </div>

                        <div className="p-4">
                            <h3 className="font-medium text-gray-800 line-clamp-2">{item.name}</h3>
                            <div className="mt-2 flex items-center gap-2">
                                <span className="text-lg font-bold text-primary">{item.price.toLocaleString("vi-VN")}₫</span>
                                <span className="text-sm text-gray-400 line-through">{item.originalPrice.toLocaleString("vi-VN")}₫</span>
                            </div>
                            <button
                                disabled={!item.inStock}
                                className={`mt-3 w-full rounded-xl py-2.5 text-sm font-semibold transition-colors ${item.inStock
                                        ? "bg-primary text-white hover:bg-primary/90"
                                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    }`}
                            >
                                {item.inStock ? "Thêm vào giỏ" : "Hết hàng"}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/* ================= Addresses Tab ================= */
function AddressesTab() {
    const addresses = [
        {
            id: 1,
            name: "Nguyễn Thị Minh Anh",
            phone: "0912 345 678",
            address: "123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh",
            isDefault: true,
        },
        {
            id: 2,
            name: "Nguyễn Thị Minh Anh",
            phone: "0912 345 678",
            address: "456 Đường Lê Lợi, Phường 1, Quận 3, TP. Hồ Chí Minh",
            isDefault: false,
        },
    ]

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">Sổ địa chỉ</h2>
                <button className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90">
                    <PlusIcon className="h-4 w-4" />
                    Thêm địa chỉ
                </button>
            </div>

            <div className="space-y-4">
                {addresses.map((addr) => (
                    <div key={addr.id} className="rounded-2xl border border-gray-100 bg-white p-5">
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <p className="font-semibold text-gray-800">{addr.name}</p>
                                    <span className="text-gray-300">|</span>
                                    <p className="text-gray-500">{addr.phone}</p>
                                    {addr.isDefault && (
                                        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                                            Mặc định
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-500">{addr.address}</p>
                            </div>
                            <div className="flex gap-3">
                                <button className="text-sm text-primary hover:underline">Sửa</button>
                                {!addr.isDefault && (
                                    <button className="text-sm text-red-500 hover:underline">Xóa</button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/* ================= Notifications Tab ================= */
function NotificationsTab() {
    const [settings, setSettings] = useState({
        orderUpdates: true,
        promotions: true,
        babyTips: true,
        newsletter: false,
    })

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">Cài đặt thông báo</h2>

            <div className="space-y-4">
                {[
                    { key: "orderUpdates", label: "Cập nhật đơn hàng", desc: "Thông báo trạng thái đơn hàng" },
                    { key: "promotions", label: "Khuyến mãi", desc: "Ưu đãi và chương trình giảm giá" },
                    { key: "babyTips", label: "Mẹo chăm sóc bé", desc: "Tips giấc ngủ và phát triển của bé" },
                    { key: "newsletter", label: "Bản tin email", desc: "Tin tức và sản phẩm mới" },
                ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-5">
                        <div>
                            <p className="font-medium text-gray-800">{item.label}</p>
                            <p className="text-sm text-gray-500">{item.desc}</p>
                        </div>
                        <button
                            onClick={() => setSettings({ ...settings, [item.key]: !settings[item.key as keyof typeof settings] })}
                            className={`relative h-6 w-11 rounded-full transition-colors ${settings[item.key as keyof typeof settings] ? "bg-primary" : "bg-gray-200"}`}
                        >
                            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${settings[item.key as keyof typeof settings] ? "translate-x-5" : "translate-x-0.5"}`} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}

/* ================= Security Tab ================= */
function SecurityTab() {
    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">Bảo mật tài khoản</h2>

            <div className="space-y-4">
                {[
                    { icon: <LockClosedIcon className="h-5 w-5" />, title: "Đổi mật khẩu", desc: "Cập nhật mật khẩu định kỳ", color: "bg-primary/10 text-primary", action: "Đổi mật khẩu" },
                    { icon: <GearIcon className="h-5 w-5" />, title: "Xác thực 2 bước", desc: "Bảo mật qua SMS", color: "bg-green-100 text-green-600", action: "Bật ngay" },
                    { icon: <ClipboardIcon className="h-5 w-5" />, title: "Lịch sử đăng nhập", desc: "Xem thiết bị đã đăng nhập", color: "bg-blue-100 text-blue-600", action: "Xem" },
                ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-5">
                        <div className="flex items-center gap-4">
                            <div className={`rounded-xl ${item.color} p-3`}>{item.icon}</div>
                            <div>
                                <p className="font-medium text-gray-800">{item.title}</p>
                                <p className="text-sm text-gray-500">{item.desc}</p>
                            </div>
                        </div>
                        <button className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
                            {item.action}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}

/* ================= Main Profile Page ================= */
export default function Profile() {
    const { role, logout } = useAuthStore()
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
        <div className="min-h-screen bg-gradient-to-b from-gray-50/50 to-white">
            <div className="container mx-auto max-w-6xl px-4 py-8">
                {/* Breadcrumb */}
                <div className="mb-6 flex items-center gap-2 text-sm">
                    <Link to={AppRoute.HOME} className="text-gray-400 hover:text-primary transition-colors">
                        <HomeIcon className="h-4 w-4" />
                    </Link>
                    <span className="text-gray-300">/</span>
                    <span className="font-medium text-gray-800">Tài khoản của tôi</span>
                </div>

                <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
                    {/* Sidebar */}
                    <aside className="space-y-4">
                        {/* User Card */}
                        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-100 flex items-center justify-center">
                                    <span className="text-2xl">👩</span>
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800">Nguyễn Thị Minh Anh</p>
                                    <p className="text-sm text-gray-500">
                                        {role === "admin" ? "Quản trị viên" : "Mẹ của 2 bé"}
                                    </p>
                                </div>
                            </div>

                            {/* Points */}
                            <div className="mt-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 p-4 border border-amber-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-amber-600 font-medium">Điểm tích lũy</p>
                                        <p className="text-2xl font-bold text-amber-600">150 ⭐</p>
                                    </div>
                                    <Gift className="h-8 w-8 text-amber-400" />
                                </div>
                                <button className="mt-2 text-sm font-medium text-amber-600 hover:underline">
                                    Đổi quà ngay →
                                </button>
                            </div>
                        </div>

                        {/* Navigation */}
                        <nav className="rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
                            <ul className="space-y-1">
                                {TABS.map((tab) => (
                                    <li key={tab.id}>
                                        <button
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${activeTab === tab.id
                                                    ? "bg-primary text-white shadow-sm"
                                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                                                }`}
                                        >
                                            {tab.icon}
                                            {tab.label}
                                            {tab.badge && (
                                                <span className={`ml-auto rounded-full px-2 py-0.5 text-xs font-bold ${activeTab === tab.id ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
                                                    }`}>
                                                    {tab.badge}
                                                </span>
                                            )}
                                        </button>
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-4 border-t border-gray-100 pt-3">
                                <button
                                    onClick={logout}
                                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
                                >
                                    <ExitIcon className="h-4 w-4" />
                                    Đăng xuất
                                </button>
                            </div>
                        </nav>
                    </aside>

                    {/* Main Content */}
                    <main className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                        {renderTabContent()}
                    </main>
                </div>
            </div>
        </div>
    )
}
