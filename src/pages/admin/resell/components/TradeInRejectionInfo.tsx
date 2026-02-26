import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { AlertCircle, Info } from "lucide-react"

interface TradeInRejectionInfoProps {
    reason: string
    category: string
    delay?: number
}

const CATEGORY_LABELS: Record<string, string> = {
    condition: "Poor Item Condition",
    wear: "Excessive Wear & Tear",
    age: "Product Too Old",
    incomplete: "Missing Parts/Accessories",
    hygiene: "Hygiene Concerns",
    modified: "Unauthorized Modifications",
    counterfeit: "Authenticity Concerns",
    photos: "Insufficient Information",
    market: "Low Market Demand",
    policy: "Policy Violation",
    other: "Other Reason",
}

export function TradeInRejectionInfo({ reason, category, delay = 0 }: TradeInRejectionInfoProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
        >
            <Card className="p-5 border-2 border-red-200 rounded-xl bg-red-50">
                <div className="flex items-center gap-2 mb-4">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <h2 className="text-sm font-semibold text-red-900 uppercase tracking-wide">
                        Rejection Reason
                    </h2>
                </div>

                <div className="space-y-3">
                    {/* Category Badge */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 border border-red-300 rounded-full">
                        <Info className="h-3.5 w-3.5 text-red-700" />
                        <span className="text-xs font-medium text-red-800">
                            {CATEGORY_LABELS[category] || "Other"}
                        </span>
                    </div>

                    {/* Reason Details */}
                    <div className="bg-white border border-red-200 rounded-lg p-4">
                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {reason}
                        </p>
                    </div>

                    {/* Info Message */}
                    <div className="text-xs text-red-700 bg-red-100 rounded-lg p-3">
                        <p className="font-medium mb-1">Note for Staff:</p>
                        <p>
                            This rejection reason has been communicated to the customer. They may
                            resubmit a new request if the issues can be addressed.
                        </p>
                    </div>
                </div>
            </Card>
        </motion.div>
    )
}
