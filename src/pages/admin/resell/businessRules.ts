/* ═══════════════════════════════════════════════════════════
   TRADE-IN BUSINESS RULES & VALIDATIONS
═══════════════════════════════════════════════════════════ */

import type { TradeInStatus, AdminTradeInRequest } from "./types"

/**
 * Business Rules for Trade-In Request Management
 */

// Status transition rules
export const STATUS_TRANSITIONS: Record<TradeInStatus, TradeInStatus[]> = {
    pending: ["reviewing", "rejected"],
    reviewing: ["approved", "rejected", "pending"],
    approved: ["completed", "reviewing"],
    completed: [], // Cannot transition from completed
    rejected: ["reviewing"], // Can be reopened to reviewing
}

// Approval requirements
export const APPROVAL_REQUIREMENTS = {
    minimumItems: 1,
    requiresEstimatedPrice: true,
    allItemsMustBePriced: true,
    requiresReview: false, // Set to true if staff review is mandatory
}

// Completion requirements
export const COMPLETION_REQUIREMENTS = {
    mustBeApproved: true,
    requiresCustomerAcceptance: false, // Set to true if customer confirmation needed
}

// Rejection requirements
export const REJECTION_REQUIREMENTS = {
    reasonRequired: true,
    minimumReasonLength: 10,
}

/**
 * Validation Functions
 */

export function canApproveRequest(request: AdminTradeInRequest): {
    canApprove: boolean
    reason?: string
} {
    // Check if status allows approval
    if (!["pending", "reviewing"].includes(request.status)) {
        return {
            canApprove: false,
            reason: "Request must be in pending or reviewing status",
        }
    }

    // Check if has estimated price
    if (APPROVAL_REQUIREMENTS.requiresEstimatedPrice && request.totalEstimatedPrice === 0) {
        return {
            canApprove: false,
            reason: "Must set estimated price before approval",
        }
    }

    // Check if all items are priced
    if (APPROVAL_REQUIREMENTS.allItemsMustBePriced) {
        const unpricedItems = request.items.filter((item) => item.estimatedPrice === 0)
        if (unpricedItems.length > 0) {
            return {
                canApprove: false,
                reason: `${unpricedItems.length} item(s) still need pricing`,
            }
        }
    }

    // Check minimum items
    if (request.items.length < APPROVAL_REQUIREMENTS.minimumItems) {
        return {
            canApprove: false,
            reason: `At least ${APPROVAL_REQUIREMENTS.minimumItems} item(s) required`,
        }
    }

    return { canApprove: true }
}

export function canCompleteRequest(request: AdminTradeInRequest): {
    canComplete: boolean
    reason?: string
} {
    // Check if must be approved first
    if (COMPLETION_REQUIREMENTS.mustBeApproved && request.status !== "approved") {
        return {
            canComplete: false,
            reason: "Request must be approved before completion",
        }
    }

    return { canComplete: true }
}

export function canRejectRequest(request: AdminTradeInRequest): {
    canReject: boolean
    reason?: string
} {
    // Check if status allows rejection
    if (!["pending", "reviewing"].includes(request.status)) {
        return {
            canReject: false,
            reason: "Only pending or reviewing requests can be rejected",
        }
    }

    if (request.status === "completed") {
        return {
            canReject: false,
            reason: "Cannot reject completed requests",
        }
    }

    return { canReject: true }
}

export function canReopenRequest(request: AdminTradeInRequest): {
    canReopen: boolean
    reason?: string
} {
    // Only rejected requests can be reopened
    if (request.status !== "rejected") {
        return {
            canReopen: false,
            reason: "Only rejected requests can be reopened",
        }
    }

    return { canReopen: true }
}

export function canTransitionStatus(
    currentStatus: TradeInStatus,
    newStatus: TradeInStatus
): boolean {
    return STATUS_TRANSITIONS[currentStatus]?.includes(newStatus) ?? false
}

/**
 * Validation Messages
 */
export const VALIDATION_MESSAGES = {
    APPROVAL: {
        NO_PRICE: "Cannot approve without estimated price. Please set price first.",
        UNPRICED_ITEMS: "All items must have estimated prices before approval.",
        INVALID_STATUS: "Request must be in pending or reviewing status to approve.",
        SUCCESS: "Request approved successfully.",
    },
    REJECTION: {
        REASON_REQUIRED: "Please provide a reason for rejection.",
        REASON_TOO_SHORT: `Rejection reason must be at least ${REJECTION_REQUIREMENTS.minimumReasonLength} characters.`,
        INVALID_STATUS: "Only pending or reviewing requests can be rejected.",
        SUCCESS: "Request rejected.",
    },
    COMPLETION: {
        NOT_APPROVED: "Only approved requests can be marked as completed.",
        SUCCESS: "Request marked as completed.",
    },
    REOPEN: {
        NOT_REJECTED: "Only rejected requests can be reopened.",
        SUCCESS: "Request reopened for review.",
    },
    PRICE: {
        REQUIRED: "Estimated price is required.",
        INVALID: "Please enter a valid price.",
        SUCCESS: "Price updated successfully.",
    },
}
