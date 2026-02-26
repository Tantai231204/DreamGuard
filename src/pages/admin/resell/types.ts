/* ═══════════════════════════════════════════════════════════
   ADMIN RESELL / TRADE-IN TYPES
═══════════════════════════════════════════════════════════ */

export type TradeInStatus = "pending" | "reviewing" | "approved" | "completed" | "rejected"

export interface TradeInItem {
    productId: string
    productName: string
    productImage: string
    originalPrice: number
    estimatedPrice: number
    mediaCount: number
    mediaUrls?: string[]
    note?: string
    condition?: "excellent" | "good" | "fair" | "poor"
}

export interface CustomerInfo {
    id: string
    name: string
    email: string
    phone: string
    avatar?: string
}

export interface AdminTradeInRequest {
    id: string
    customer: CustomerInfo
    items: TradeInItem[]
    totalOriginalPrice: number
    totalEstimatedPrice: number
    status: TradeInStatus
    createdAt: string
    updatedAt?: string
    completedAt?: string
    staffNote?: string
    assignedTo?: string
    priority: "low" | "medium" | "high"
    rejectionReason?: string
    rejectionCategory?: string
}

export interface TradeInStats {
    total: number
    pending: number
    reviewing: number
    approved: number
    completed: number
    rejected: number
    totalValue: number
    avgProcessingTime: number
}
