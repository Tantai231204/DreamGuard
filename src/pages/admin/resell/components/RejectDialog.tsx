import { useState, useEffect, useCallback } from "react"
import { XCircle, AlertTriangle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"

interface RejectDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: (reason: string, category: string) => void
    requestId: string
    customerName: string
}

// Common rejection reasons in trade-in/resell business
const REJECTION_REASONS = [
    {
        id: "condition",
        label: "Poor Item Condition",
        description: "Item condition does not meet minimum requirements",
    },
    {
        id: "wear",
        label: "Excessive Wear & Tear",
        description: "Signs of heavy use, damage, or significant deterioration",
    },
    {
        id: "age",
        label: "Product Too Old",
        description: "Product age exceeds acceptable limit for trade-in",
    },
    {
        id: "incomplete",
        label: "Missing Parts/Accessories",
        description: "Essential components or accessories are missing",
    },
    {
        id: "hygiene",
        label: "Hygiene Concerns",
        description: "Cannot be properly sanitized or has permanent stains/odors",
    },
    {
        id: "modified",
        label: "Unauthorized Modifications",
        description: "Product has been altered or repaired improperly",
    },
    {
        id: "counterfeit",
        label: "Authenticity Concerns",
        description: "Suspected counterfeit or not genuine product",
    },
    {
        id: "photos",
        label: "Insufficient Information",
        description: "Photos or details provided are inadequate for evaluation",
    },
    {
        id: "market",
        label: "Low Market Demand",
        description: "Product type currently not in demand or discontinued",
    },
    {
        id: "policy",
        label: "Policy Violation",
        description: "Request does not comply with trade-in program policies",
    },
    {
        id: "other",
        label: "Other Reason",
        description: "Specify custom reason below",
    },
] as const

export function RejectDialog({
    open,
    onOpenChange,
    onConfirm,
    requestId,
    customerName,
}: RejectDialogProps) {
    const [selectedReason, setSelectedReason] = useState<string>("")
    const [customReason, setCustomReason] = useState<string>("")
    const [error, setError] = useState<string>("")

    const handleClose = useCallback(() => {
        setSelectedReason("")
        setCustomReason("")
        setError("")
        onOpenChange(false)
    }, [onOpenChange])

    // Close on ESC key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape" && open) {
                handleClose()
            }
        }
        window.addEventListener("keydown", handleEsc)
        return () => window.removeEventListener("keydown", handleEsc)
    }, [open, handleClose])

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = "unset"
        }
        return () => {
            document.body.style.overflow = "unset"
        }
    }, [open])

    const handleConfirm = () => {
        // Validation
        if (!selectedReason) {
            setError("Please select a rejection reason")
            return
        }

        if (selectedReason === "other" && customReason.trim().length < 10) {
            setError("Please provide detailed reason (minimum 10 characters)")
            return
        }

        // Get selected reason details
        const reasonData = REJECTION_REASONS.find((r) => r.id === selectedReason)
        const fullReason =
            selectedReason === "other"
                ? customReason.trim()
                : `${reasonData?.label}: ${customReason.trim() || reasonData?.description}`

        onConfirm(fullReason, selectedReason)
        handleClose()
    }

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                                            <XCircle className="h-5 w-5 text-red-600" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-semibold text-gray-900">
                                                Reject Trade-in Request
                                            </h2>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Request #{requestId} from {customerName}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleClose}
                                        className="text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-5">
                                {/* Warning Message */}
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
                                    <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                    <div className="text-sm">
                                        <p className="font-medium text-amber-900">
                                            This action will notify the customer
                                        </p>
                                        <p className="text-amber-700 mt-1">
                                            Please provide a clear and professional reason for rejection to
                                            help the customer understand the decision.
                                        </p>
                                    </div>
                                </div>

                                {/* Rejection Reason Selection */}
                                <div>
                                    <Label className="text-sm font-semibold mb-3 block">
                                        Select Rejection Reason *
                                    </Label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {REJECTION_REASONS.map((reason) => (
                                            <button
                                                key={reason.id}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedReason(reason.id)
                                                    setError("")
                                                }}
                                                className={`text-left p-3 rounded-lg border-2 transition-all ${
                                                    selectedReason === reason.id
                                                        ? "border-red-500 bg-red-50"
                                                        : "border-gray-200 hover:border-gray-300 bg-white"
                                                }`}
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-medium text-sm text-gray-900">
                                                            {reason.label}
                                                        </div>
                                                        <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                                                            {reason.description}
                                                        </div>
                                                    </div>
                                                    {selectedReason === reason.id && (
                                                        <Badge className="bg-red-500 text-white flex-shrink-0">
                                                            Selected
                                                        </Badge>
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Additional Details */}
                                <div>
                                    <Label htmlFor="rejection-details" className="text-sm font-semibold mb-2 block">
                                        Additional Details {selectedReason === "other" && "*"}
                                    </Label>
                                    <textarea
                                        id="rejection-details"
                                        placeholder={
                                            selectedReason === "other"
                                                ? "Please provide detailed reason for rejection..."
                                                : "Add any additional context or instructions for the customer (optional)..."
                                        }
                                        value={customReason}
                                        onChange={(e) => {
                                            setCustomReason(e.target.value)
                                            setError("")
                                        }}
                                        rows={4}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                                    />
                                    <div className="flex items-center justify-between mt-2">
                                        <p className="text-xs text-gray-500">
                                            {selectedReason === "other"
                                                ? "Minimum 10 characters required"
                                                : "Provide specific details to help customer"}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {customReason.length} characters
                                        </p>
                                    </div>
                                </div>

                                {/* Error Message */}
                                {error && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2">
                                        <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-red-700">{error}</p>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 rounded-b-xl flex items-center justify-end gap-3">
                                <Button variant="outline" onClick={handleClose}>
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleConfirm}
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Confirm Rejection
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    )
}
