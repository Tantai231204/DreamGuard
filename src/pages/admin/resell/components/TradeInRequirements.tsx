import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react"
import type { TradeInStatus } from "../types"

interface TradeInRequirementsProps {
    status: TradeInStatus
    totalEstimatedPrice: number
    itemCount: number
    hasAllItemsPriced: boolean
    delay?: number
}

export function TradeInRequirements({
    status,
    totalEstimatedPrice,
    itemCount,
    hasAllItemsPriced,
    delay = 0,
}: TradeInRequirementsProps) {
    // Only show requirements for pending/reviewing statuses
    if (!["pending", "reviewing"].includes(status)) {
        return null
    }

    const requirements = [
        {
            id: "items",
            label: `All ${itemCount} items submitted`,
            met: itemCount > 0,
        },
        {
            id: "price",
            label: "Estimated price set for all items",
            met: hasAllItemsPriced && totalEstimatedPrice > 0,
        },
        {
            id: "review",
            label: "Items reviewed by staff",
            met: status === "reviewing",
        },
    ]

    const approvalReady = hasAllItemsPriced && totalEstimatedPrice > 0

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
        >
            <Card className="p-5 border border-gray-200 rounded-xl">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-5 bg-gradient-to-b from-[var(--color-primary)] to-[var(--color-primary-hover)] rounded-full" />
                    <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                        Approval Requirements
                    </h2>
                </div>

                <div className="space-y-3">
                    {requirements.map((req) => (
                        <div key={req.id} className="flex items-start gap-2.5">
                            {req.met ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                            ) : (
                                <XCircle className="h-4 w-4 text-gray-300 mt-0.5 flex-shrink-0" />
                            )}
                            <span className={`text-sm ${req.met ? "text-gray-900" : "text-gray-500"}`}>
                                {req.label}
                            </span>
                        </div>
                    ))}
                </div>

                {approvalReady ? (
                    <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-medium text-emerald-900">Ready for Approval</p>
                            <p className="text-xs text-emerald-700 mt-0.5">
                                All requirements met. You can approve this request.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-medium text-amber-900">Action Required</p>
                            <p className="text-xs text-amber-700 mt-0.5">
                                {!hasAllItemsPriced || totalEstimatedPrice === 0
                                    ? "Set estimated prices for all items to proceed."
                                    : "Complete the review to approve this request."}
                            </p>
                        </div>
                    </div>
                )}
            </Card>
        </motion.div>
    )
}
