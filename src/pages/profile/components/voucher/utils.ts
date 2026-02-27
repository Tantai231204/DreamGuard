import type { Voucher } from "../../types"

/**
 * Format currency to Vietnamese format
 */
export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("vi-VN").format(amount) + "đ"
}

/**
 * Format date to Vietnamese format
 */
export const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    })
}

/**
 * Get discount display (percentage or fixed amount)
 */
export const getDiscountDisplay = (voucher: Voucher): string => {
    if (voucher.discountType === "percentage") {
        return `${voucher.discount}%`
    }
    // For amounts >= 1000, show in K format
    if (voucher.discount >= 1000) {
        return `${(voucher.discount / 1000).toFixed(0)}K`
    }
    return formatCurrency(voucher.discount)
}

/**
 * Get days remaining until expiry
 */
export const getDaysRemaining = (validTo: string): number => {
    return Math.ceil(
        (new Date(validTo).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    )
}

/**
 * Check if voucher is expiring soon (within 7 days)
 */
export const isExpiringSoon = (voucher: Voucher): boolean => {
    if (voucher.status !== "active") return false
    const days = getDaysRemaining(voucher.validTo)
    return days <= 7 && days > 0
}

/**
 * Get status label in Vietnamese
 */
export const getStatusLabel = (status: Voucher["status"]): string => {
    const labels: Record<Voucher["status"], string> = {
        active: "Có thể dùng",
        used: "Đã dùng",
        expired: "Hết hạn"
    }
    return labels[status]
}

/**
 * Get discount type label in Vietnamese
 */
export const getDiscountTypeLabel = (discountType: Voucher["discountType"]): string => {
    return discountType === "percentage" ? "GIẢM GIÁ" : "GIẢM"
}
