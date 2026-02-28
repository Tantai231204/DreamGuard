/* ═══════════════════════════════════════════════════════════
   RESELL / TRADE-IN TYPES
═══════════════════════════════════════════════════════════ */

export type TradeInStatus = "pending" | "reviewing" | "approved" | "completed" | "rejected"

export interface MediaFile {
    id: string
    type: "image" | "video"
    url: string
    name: string
    size: number
}

export interface TradeInItem {
    productId: string
    productName: string
    productImage: string
    originalPrice: number
    estimatedPrice: number
    mediaCount: number
    note?: string
}

export interface TradeInRequest {
    id: string
    items: TradeInItem[]
    totalEstimatedPrice?: number
    status: TradeInStatus
    createdAt: string
    completedAt?: string
    staffNote?: string
}

export interface EligibleProduct {
    id: string
    orderId: string
    name: string
    image: string
    originalPrice: number
    purchaseDate: string
    canTradeIn: boolean
    reason?: string
}

export interface TradeInStats {
    total: number
    pending: number
    reviewing: number
    completed: number
    totalEarned: number
}

export interface SelectedProductWithMedia {
    product: EligibleProduct
    media: MediaFile[]
    note: string
}
