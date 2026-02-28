import type { AdminTradeInRequest, TradeInStatus } from "./types"

/* ═══════════════════════════════════════════════════════════
   STATUS CONFIG
═══════════════════════════════════════════════════════════ */
export const STATUS_CONFIG: Record<TradeInStatus, { 
    label: string
    color: string
    bgColor: string
    borderColor: string
}> = {
    pending: { 
        label: "Pending", 
        color: "text-amber-700",
        bgColor: "bg-amber-50",
        borderColor: "border-amber-300"
    },
    reviewing: { 
        label: "Reviewing", 
        color: "text-blue-700",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-300"
    },
    approved: { 
        label: "Approved", 
        color: "text-emerald-700",
        bgColor: "bg-emerald-50",
        borderColor: "border-emerald-300"
    },
    completed: { 
        label: "Completed", 
        color: "text-green-700",
        bgColor: "bg-green-50",
        borderColor: "border-green-300"
    },
    rejected: { 
        label: "Rejected", 
        color: "text-red-700",
        bgColor: "bg-red-50",
        borderColor: "border-red-300"
    },
}

export const PRIORITY_CONFIG = {
    low: { label: "Low", color: "text-gray-600", bgColor: "bg-gray-100" },
    medium: { label: "Medium", color: "text-blue-600", bgColor: "bg-blue-100" },
    high: { label: "High", color: "text-red-600", bgColor: "bg-red-100" },
}

/* ═══════════════════════════════════════════════════════════
   MOCK DATA
═══════════════════════════════════════════════════════════ */
export const mockAdminTradeInRequests: AdminTradeInRequest[] = [
    {
        id: "TI001",
        customer: {
            id: "C001",
            name: "Nguyễn Văn An",
            email: "nguyenvanan@email.com",
            phone: "0901234567",
        },
        items: [
            {
                productId: "P001",
                productName: "Nệm Memory Foam Size S",
                productImage: "https://i.pinimg.com/736x/c5/67/61/c567613e5b7eca33961d69bb41d52355.jpg",
                originalPrice: 1800000,
                estimatedPrice: 0,
                mediaCount: 3,
                condition: "good",
            },
            {
                productId: "P002",
                productName: "Gối chống đầu bẹt",
                productImage: "https://i.pinimg.com/736x/c5/67/61/c567613e5b7eca33961d69bb41d52355.jpg",
                originalPrice: 450000,
                estimatedPrice: 0,
                mediaCount: 2,
                condition: "excellent",
            },
        ],
        totalOriginalPrice: 2250000,
        totalEstimatedPrice: 0,
        status: "pending",
        createdAt: "2026-02-25T10:30:00",
        priority: "high",
    },
    {
        id: "TI002",
        customer: {
            id: "C002",
            name: "Trần Thị Bình",
            email: "tranthibinh@email.com",
            phone: "0912345678",
        },
        items: [
            {
                productId: "P003",
                productName: "Bộ Chăn Ga Cotton Cao Cấp",
                productImage: "https://i.pinimg.com/736x/c5/67/61/c567613e5b7eca33961d69bb41d52355.jpg",
                originalPrice: 1200000,
                estimatedPrice: 480000,
                mediaCount: 4,
                condition: "good",
            },
        ],
        totalOriginalPrice: 1200000,
        totalEstimatedPrice: 480000,
        status: "reviewing",
        createdAt: "2026-02-24T14:20:00",
        updatedAt: "2026-02-25T09:30:00",
        staffNote: "Checking product condition",
        assignedTo: "Staff001",
        priority: "medium",
    },
    {
        id: "TI003",
        customer: {
            id: "C003",
            name: "Lê Minh Cường",
            email: "leminhcuong@email.com",
            phone: "0923456789",
        },
        items: [
            {
                productId: "P004",
                productName: "Nệm Baby Foam Cao Cấp",
                productImage: "https://i.pinimg.com/736x/c5/67/61/c567613e5b7eca33961d69bb41d52355.jpg",
                originalPrice: 2500000,
                estimatedPrice: 1000000,
                mediaCount: 5,
                condition: "excellent",
            },
        ],
        totalOriginalPrice: 2500000,
        totalEstimatedPrice: 1000000,
        status: "approved",
        createdAt: "2026-02-22T09:15:00",
        updatedAt: "2026-02-24T16:00:00",
        staffNote: "Product in good condition, approved for trade-in",
        assignedTo: "Staff002",
        priority: "medium",
    },
    {
        id: "TI004",
        customer: {
            id: "C004",
            name: "Phạm Thị Dung",
            email: "phamthidung@email.com",
            phone: "0934567890",
        },
        items: [
            {
                productId: "P005",
                productName: "Chăn lông cừu cao cấp",
                productImage: "https://i.pinimg.com/736x/c5/67/61/c567613e5b7eca33961d69bb41d52355.jpg",
                originalPrice: 1500000,
                estimatedPrice: 600000,
                mediaCount: 4,
                condition: "good",
            },
        ],
        totalOriginalPrice: 1500000,
        totalEstimatedPrice: 600000,
        status: "completed",
        createdAt: "2026-02-15T11:00:00",
        updatedAt: "2026-02-18T14:30:00",
        completedAt: "2026-02-20T10:30:00",
        priority: "low",
    },
    {
        id: "TI005",
        customer: {
            id: "C005",
            name: "Hoàng Văn Em",
            email: "hoangvanem@email.com",
            phone: "0945678901",
        },
        items: [
            {
                productId: "P006",
                productName: "Gối Memory Foam",
                productImage: "https://i.pinimg.com/736x/c5/67/61/c567613e5b7eca33961d69bb41d52355.jpg",
                originalPrice: 800000,
                estimatedPrice: 0,
                mediaCount: 2,
                condition: "poor",
            },
        ],
        totalOriginalPrice: 800000,
        totalEstimatedPrice: 0,
        status: "rejected",
        createdAt: "2026-02-18T15:45:00",
        updatedAt: "2026-02-19T10:00:00",
        staffNote: "Product too old, does not meet trade-in requirements",
        rejectionReason: "Product Too Old: Item age exceeds our trade-in program limits. The pillow shows significant wear from extended use and cannot be refurbished to meet our quality standards.",
        rejectionCategory: "age",
        priority: "low",
    },
    {
        id: "TI006",
        customer: {
            id: "C006",
            name: "Võ Thị Phương",
            email: "vothiphuong@email.com",
            phone: "0956789012",
        },
        items: [
            {
                productId: "P007",
                productName: "Nệm cao su non",
                productImage: "https://i.pinimg.com/736x/c5/67/61/c567613e5b7eca33961d69bb41d52355.jpg",
                originalPrice: 3200000,
                estimatedPrice: 0,
                mediaCount: 6,
                condition: "excellent",
            },
            {
                productId: "P008",
                productName: "Bộ ga giường hữu cơ",
                productImage: "https://i.pinimg.com/736x/c5/67/61/c567613e5b7eca33961d69bb41d52355.jpg",
                originalPrice: 980000,
                estimatedPrice: 0,
                mediaCount: 3,
                condition: "good",
            },
        ],
        totalOriginalPrice: 4180000,
        totalEstimatedPrice: 0,
        status: "pending",
        createdAt: "2026-02-26T08:00:00",
        priority: "high",
    },
]
