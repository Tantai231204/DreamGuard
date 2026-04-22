import type { ProfileVoucher } from "./types"

/**
 * Format currency to VND display
 */
export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("vi-VN").format(amount) + "đ"
}

/**
 * Format coin values in compact style
 */
export const formatCoin = (amount: number): string => {
    return new Intl.NumberFormat("vi-VN").format(amount)
}

/**
 * Format date as DD/MM/YYYY
 */
export const formatDate = (dateString?: string | null): string => {
    if (!dateString) return "N/A"

    const date = new Date(dateString)
    if (Number.isNaN(date.getTime())) return "N/A"

    // Use UTC methods to avoid shifting dates based on local time
    // since expiration dates from the backend are absolute.
    const day = String(date.getUTCDate()).padStart(2, '0')
    const month = String(date.getUTCMonth() + 1).padStart(2, '0')
    const year = date.getUTCFullYear()

    return `${day}/${month}/${year}`
}

/**
 * Get discount display (percentage or fixed amount)
 */
export const getDiscountDisplay = (voucher: ProfileVoucher): string => {
    const percent = Math.round(voucher.discountValue * 100)
    return `${percent}%`
}

/**
 * Get days remaining until expiry
 */
export const getDaysRemaining = (validTo?: string | null): number => {
    if (!validTo) return Number.POSITIVE_INFINITY

    const target = new Date(validTo).getTime()
    if (Number.isNaN(target)) return Number.POSITIVE_INFINITY

    return Math.ceil(
        (target - new Date().getTime()) / (1000 * 60 * 60 * 24)
    )
}

/**
 * Check if voucher is expiring soon (within 7 days)
 */
export const isExpiringSoon = (voucher: ProfileVoucher): boolean => {
    if (voucher.status !== "active") return false
    const days = getDaysRemaining(voucher.endDate)
    return Number.isFinite(days) && days <= 7 && days > 0
}

/**
 * Get status label in English
 */
export const getStatusLabel = (status: ProfileVoucher["status"]): string => {
    const labels: Record<ProfileVoucher["status"], string> = {
        claimable: "Claimable",
        active: "Available",
        used: "Used",
        expired: "Expired"
    }
    return labels[status]
}

/**
 * Get voucher type label in English
 */
export const getVoucherTypeLabel = (voucherType: ProfileVoucher["voucherType"]): string => {
    if (voucherType === "Product") return "Product"
    if (voucherType === "Service") return "Service"
    return "All"
}
