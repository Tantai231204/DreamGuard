import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, DollarSign, Clock, AlertCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { TradeInStatus } from "../types"

interface TradeInActionsCardProps {
    status: TradeInStatus
    totalEstimatedPrice: number
    hasAllItemsPriced?: boolean
    onSetPrice?: () => void
    onApprove?: () => void
    onReject?: () => void
    onComplete?: () => void
    onReopen?: () => void
    delay?: number
}

export function TradeInActionsCard({
    status,
    totalEstimatedPrice,
    hasAllItemsPriced = true,
    onSetPrice,
    onApprove,
    onReject,
    onComplete,
    onReopen,
    delay = 0,
}: TradeInActionsCardProps) {
    const canSetPrice = ["pending", "reviewing"].includes(status)
    const canShowApprove = ["pending", "reviewing"].includes(status)
    const canApprove = canShowApprove && totalEstimatedPrice > 0 && hasAllItemsPriced
    const canReject = ["pending", "reviewing"].includes(status)
    const canComplete = status === "approved"
    const canReopen = status === "rejected"
    
    const approveDisabledReason = !totalEstimatedPrice
        ? "Must set estimated price before approval"
        : !hasAllItemsPriced
        ? "All items must be priced"
        : null

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
        >
            <Card className="p-5 border-2 border-gray-200 rounded-xl bg-gradient-to-br from-white to-gray-50">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-6 bg-gradient-to-b from-[var(--color-primary)] to-[var(--color-primary-hover)] rounded-full"></div>
                    <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                        Quick Actions
                    </h2>
                </div>

                {status === "completed" ? (
                    <div className="text-center py-4">
                        <CheckCircle2 className="h-10 w-10 mx-auto text-green-500 mb-2" />
                        <p className="text-sm text-gray-600">This request has been completed</p>
                    </div>
                ) : status === "rejected" ? (
                    <div className="space-y-3">
                        <div className="text-center py-2">
                            <XCircle className="h-8 w-8 mx-auto text-red-500 mb-2" />
                            <p className="text-sm text-gray-600">This request was rejected</p>
                        </div>
                        {canReopen && (
                            <Button
                                onClick={onReopen}
                                variant="outline"
                                className="w-full justify-center gap-2 rounded-xl hover:bg-amber-50 border-2 border-amber-200 text-amber-700 hover:border-amber-300 h-11 text-sm font-medium hover:scale-[1.02] transition-all"
                            >
                                <Clock className="h-4 w-4" />
                                Reopen Request
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {/* Set Price Button */}
                        {canSetPrice && (
                            <div>
                                <Button
                                    onClick={onSetPrice}
                                    className="w-full justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl h-11 text-sm font-semibold shadow-md hover:shadow-lg transition-all hover:scale-[1.02]"
                                >
                                    <DollarSign className="h-4 w-4" />
                                    Set Estimated Price
                                </Button>
                                {totalEstimatedPrice === 0 && (
                                    <div className="flex items-center gap-1.5 mt-2 text-xs text-amber-600 bg-amber-50 p-2 rounded-lg">
                                        <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                                        <span>Required before approval</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Approve Button */}
                        {canShowApprove && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div>
                                            <Button
                                                onClick={onApprove}
                                                disabled={!canApprove}
                                                className="w-full justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl h-11 text-sm font-semibold shadow-md hover:shadow-lg transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                            >
                                                <CheckCircle2 className="h-4 w-4" />
                                                Approve Request
                                            </Button>
                                        </div>
                                    </TooltipTrigger>
                                    {!canApprove && approveDisabledReason && (
                                        <TooltipContent>
                                            <p>{approveDisabledReason}</p>
                                        </TooltipContent>
                                    )}
                                </Tooltip>
                            </TooltipProvider>
                        )}

                        {canComplete && (
                            <Button
                                onClick={onComplete}
                                className="w-full justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl h-11 text-sm font-semibold shadow-md hover:shadow-lg transition-all hover:scale-[1.02]"
                            >
                                <CheckCircle2 className="h-4 w-4" />
                                Mark as Completed
                            </Button>
                        )}

                        {canReject && (
                            <Button
                                onClick={onReject}
                                variant="outline"
                                className="w-full justify-center gap-2 rounded-xl hover:bg-red-50 border-2 border-red-200 text-red-600 hover:border-red-300 h-11 text-sm font-medium hover:scale-[1.02] transition-all"
                            >
                                <XCircle className="h-4 w-4" />
                                Reject Request
                            </Button>
                        )}
                    </div>
                )}
            </Card>
        </motion.div>
    )
}
