import { Clock, CheckCircle, Check, XCircle, Eye } from "lucide-react"
import type { TradeInStatus, EligibleProduct, TradeInRequest } from "./types"

/* ═══════════════════════════════════════════════════════════
   STATUS CONFIG
═══════════════════════════════════════════════════════════ */
export const STATUS_CONFIG: Record<TradeInStatus, { label: string; icon: React.ReactNode; color: string; borderColor: string }> = {
    pending: { label: "Chờ duyệt", icon: <Clock className="h-4 w-4" />, color: "bg-amber-100 text-amber-700", borderColor: "#f59e0b" },
    reviewing: { label: "Đang xem xét", icon: <Eye className="h-4 w-4" />, color: "bg-blue-100 text-blue-700", borderColor: "#3b82f6" },
    approved: { label: "Đã duyệt", icon: <CheckCircle className="h-4 w-4" />, color: "bg-emerald-100 text-emerald-700", borderColor: "#10b981" },
    completed: { label: "Hoàn thành", icon: <Check className="h-4 w-4" />, color: "bg-green-100 text-green-700", borderColor: "#22c55e" },
    rejected: { label: "Từ chối", icon: <XCircle className="h-4 w-4" />, color: "bg-red-100 text-red-700", borderColor: "#ef4444" },
}

/* ═══════════════════════════════════════════════════════════
   WIZARD STEPS
═══════════════════════════════════════════════════════════ */
export const WIZARD_STEPS = [
    { step: 1, label: "Chọn sản phẩm" },
    { step: 2, label: "Tải hình/video" },
    { step: 3, label: "Xác nhận" },
]

/* ═══════════════════════════════════════════════════════════
   MOCK DATA
═══════════════════════════════════════════════════════════ */
export const mockEligibleProducts: EligibleProduct[] = [
    {
        id: "P001",
        orderId: "ORD001",
        name: "Nệm Baby Foam Cao Cấp",
        image: "https://i.pinimg.com/736x/c5/67/61/c567613e5b7eca33961d69bb41d52355.jpg",
        originalPrice: 2500000,
        purchaseDate: "2025-11-15",
        canTradeIn: true,
    },
    {
        id: "P002",
        orderId: "ORD002",
        name: "Bộ Chăn Ga Cotton Cao Cấp",
        image: "https://i.pinimg.com/736x/c5/67/61/c567613e5b7eca33961d69bb41d52355.jpg",
        originalPrice: 1200000,
        purchaseDate: "2025-12-01",
        canTradeIn: true,
    },
    {
        id: "P003",
        orderId: "ORD003",
        name: "Gối Memory Foam",
        image: "https://i.pinimg.com/736x/c5/67/61/c567613e5b7eca33961d69bb41d52355.jpg",
        originalPrice: 800000,
        purchaseDate: "2026-01-20",
        canTradeIn: true,
    },
    {
        id: "P004",
        orderId: "ORD004",
        name: "Áo ngủ bé sơ sinh",
        image: "https://i.pinimg.com/736x/c5/67/61/c567613e5b7eca33961d69bb41d52355.jpg",
        originalPrice: 150000,
        purchaseDate: "2026-02-01",
        canTradeIn: false,
        reason: "Sản phẩm không trong danh mục thu mua",
    },
    {
        id: "P005",
        orderId: "ORD005",
        name: "Chăn lông cừu cao cấp",
        image: "https://i.pinimg.com/736x/c5/67/61/c567613e5b7eca33961d69bb41d52355.jpg",
        originalPrice: 1500000,
        purchaseDate: "2026-01-10",
        canTradeIn: true,
    },
]

export const mockTradeInRequests: TradeInRequest[] = [
    {
        id: "TI001",
        items: [
            {
                productId: "P005",
                productName: "Nệm Memory Foam Size S",
                productImage: "https://i.pinimg.com/736x/c5/67/61/c567613e5b7eca33961d69bb41d52355.jpg",
                originalPrice: 1800000,
                estimatedPrice: 0,
                mediaCount: 3,
            },
            {
                productId: "P006",
                productName: "Gối chống đầu bẹt",
                productImage: "https://i.pinimg.com/736x/c5/67/61/c567613e5b7eca33961d69bb41d52355.jpg",
                originalPrice: 450000,
                estimatedPrice: 0,
                mediaCount: 2,
            },
        ],
        totalEstimatedPrice: 0,
        status: "reviewing",
        createdAt: "2026-02-10",
        staffNote: "Đang kiểm tra tình trạng sản phẩm",
    },
    {
        id: "TI002",
        items: [
            {
                productId: "P007",
                productName: "Chăn lông cừu cao cấp",
                productImage: "https://i.pinimg.com/736x/c5/67/61/c567613e5b7eca33961d69bb41d52355.jpg",
                originalPrice: 1500000,
                estimatedPrice: 600000,
                mediaCount: 4,
            },
        ],
        totalEstimatedPrice: 600000,
        status: "completed",
        createdAt: "2026-01-25",
        completedAt: "2026-01-30",
    },
]
