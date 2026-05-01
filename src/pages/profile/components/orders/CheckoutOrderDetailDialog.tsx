import React, { useCallback, useMemo } from "react"
import { useCancelCheckoutOrder, useCheckoutOrders } from "@/hooks/queries/useCheckoutOrder"
import { usePayments } from "@/hooks/queries/usePayment"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/useToast"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { ChevronRight, AlertCircle, ShieldCheck, Layers } from "lucide-react"
import { getStatusTheme } from "../../constants"
import { isAxiosError } from "axios"
import type { CheckoutOrderResponse } from "@/api/types/checkoutOrder"

import { ChildOrderSection } from "./components/ChildOrderSection"
import { RefundSummaryBanner } from "./components/RefundSummaryBanner"
import { PaymentDetailsCard } from "./components/PaymentDetailsCard"
import { CheckoutPricingSummary } from "./components/CheckoutPricingSummary"
import { OrderDetailSkeleton } from "@/components/common/Skeletons"

interface CheckoutOrderDetailDialogProps {
    checkoutOrder: CheckoutOrderResponse
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export function CheckoutOrderDetailDialog({
    checkoutOrder: initialOrder,
    open,
    onOpenChange,
}: CheckoutOrderDetailDialogProps) {
    const [confirmCancelAll, setConfirmCancelAll] = React.useState(false)
    const toast = useToast()

    // Live data — fetch from list and find because the direct detail API doesn't exist
    const { data: listData, isPending: isLoadingDetail } = useCheckoutOrders({ 
        search: initialOrder.id 
    });
    
    const liveOrder = useMemo(() => {
        return listData?.items.find(item => item.id === initialOrder.id);
    }, [listData, initialOrder.id]);

    const order = liveOrder || initialOrder

    const theme = useMemo(() => getStatusTheme(order.status), [order.status])
    const hasRefund = order.refundingAmount > 0 || order.refundedAmount > 0

    // Fetch payment info by checkout order code
    const { data: paymentData } = usePayments({
        orderCode: open ? order.checkoutOrderCode : undefined,
    })

    const paymentMethod = useMemo(() => {
        if (!paymentData?.items?.length) return undefined
        return paymentData.items[0]?.paymentMethod
    }, [paymentData])

    // ── Cancel Logic ──
    const isPending = order.status === 'Pending'
    const isPaid = ['Confirmed', 'Processing'].includes(order.status)
    const hasMultipleChildren = order.childOrders.length > 1
    const isVnPay = paymentMethod?.toLowerCase() === 'vnpay'
    const isCOD = paymentMethod?.toLowerCase() === 'cod'
    const isTerminalStatus = ['Completed', 'Cancelled', 'Refunded'].includes(order.status)

    // Can cancel entire order?
    const canCancelAll = useMemo(() => {
        if (isTerminalStatus) return false
        // COD → always can cancel if not terminal
        if (isCOD && isPending) return true
        // VnPay unpaid (Pending) → cancel all
        if (isVnPay && isPending) return true
        return false
    }, [isTerminalStatus, isCOD, isVnPay, isPending])

    // Can cancel individual child orders? Only VnPay paid with multiple children
    const canCancelIndividual = useMemo(() => {
        if (isTerminalStatus) return false
        return isVnPay && isPaid && hasMultipleChildren
    }, [isTerminalStatus, isVnPay, isPaid, hasMultipleChildren])

    const { mutate: cancelAll, isPending: isCancellingAll } = useCancelCheckoutOrder({ meta: { hideToast: true } })

    const handleCancelAll = useCallback(() => {
        cancelAll(order.id, {
            onSuccess: () => {
                toast.success("Order Cancelled", `Order #${order.checkoutOrderCode} has been cancelled.`)
                setConfirmCancelAll(false)
            },
            onError: (error: unknown) => {
                const message = isAxiosError(error)
                    ? (error.response?.data?.message || error.message)
                    : error instanceof Error ? error.message : "Error occurred"
                toast.error("Cancellation Failed", message)
            }
        })
    }, [cancelAll, order.id, order.checkoutOrderCode, toast])

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-3xl max-h-[92vh] overflow-hidden flex flex-col p-0 rounded-xl border-none shadow-2xl bg-gray-50">
                    {/* Header */}
                    <div className="bg-white border-b border-gray-100 pl-6 pr-12 py-4 flex items-center justify-between shrink-0 relative">
                        <DialogHeader className="flex flex-row items-center gap-4 space-y-0">
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-gray-100">
                                <ChevronRight className="w-5 h-5 rotate-180 text-gray-500" />
                            </Button>
                            <div className="text-left">
                                <DialogTitle className="text-[16px] font-black text-gray-900 uppercase tracking-tight">
                                    Order Journey
                                </DialogTitle>
                                <DialogDescription className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">
                                    #{order.checkoutOrderCode} · {order.childOrders.length} {order.childOrders.length === 1 ? 'order' : 'sub-orders'}
                                </DialogDescription>
                            </div>
                        </DialogHeader>
                        <div
                            className="px-4 py-1.5 rounded-full text-[11px] font-bold text-white uppercase tracking-widest shadow-sm"
                            style={{ backgroundColor: theme.color }}
                        >
                            {theme.label}
                        </div>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto no-scrollbar">
                        {isLoadingDetail && !liveOrder ? (
                            <OrderDetailSkeleton />
                        ) : (
                            <div className="space-y-2">
                                {/* Refund Banner */}
                                {hasRefund && (
                                    <div className="bg-white py-3">
                                        <RefundSummaryBanner
                                            refundingAmount={order.refundingAmount}
                                            refundedAmount={order.refundedAmount}
                                        />
                                    </div>
                                )}

                                {/* Child Orders */}
                                <div className="bg-white">
                                    <div className="px-6 py-3 border-b border-gray-50 flex items-center gap-2.5">
                                        <Layers className="w-4 h-4 text-gray-400" />
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                            Orders ({order.childOrders.length})
                                        </span>
                                    </div>
                                    {order.childOrders.map((child) => (
                                        <ChildOrderSection
                                            key={child.id}
                                            child={child}
                                            canCancelIndividual={canCancelIndividual}
                                        />
                                    ))}
                                </div>

                                {/* Pricing Summary */}
                                <CheckoutPricingSummary order={order} />

                                {/* Payment Details */}
                                <div className="bg-white pb-5 pt-2">
                                    <div className="mx-6">
                                        <PaymentDetailsCard
                                            orderCode={order.checkoutOrderCode}
                                            className="mx-0"
                                        />
                                    </div>
                                </div>

                                {/* Cancelled info */}
                                {order.status === 'Cancelled' && (
                                    <div className="mx-6 mb-4 p-5 bg-rose-50/40 rounded-xl border border-rose-100 text-left">
                                        <div className="flex items-center gap-2 mb-2 text-rose-600">
                                            <AlertCircle className="w-4 h-4" />
                                            <span className="text-[11px] font-black uppercase tracking-widest">Order Cancelled</span>
                                        </div>
                                        <p className="text-[12px] text-rose-700/70 font-medium leading-relaxed">
                                            This order has been fully cancelled. If payment was made, a refund will be processed within 3-5 business days.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-5 border-t border-gray-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
                        <div className="flex flex-col items-start gap-0.5">
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-tight">Need more help?</span>
                            <button
                                className="text-[10px] font-black text-[#4988c4] uppercase tracking-widest hover:underline flex items-center gap-1.5"
                                onClick={() => window.alert("Connecting to support...")}
                            >
                                <ShieldCheck className="w-3.5 h-3.5" />
                                Chat with Support
                            </button>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 ml-auto">
                            {canCancelAll && (
                                <Button
                                    variant="ghost"
                                    className="h-11 px-6 text-[11px] font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-50 uppercase tracking-widest transition-all"
                                    onClick={() => setConfirmCancelAll(true)}
                                    disabled={isCancellingAll}
                                >
                                    {isCancellingAll ? "Cancelling..." : "Cancel Order"}
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                className="h-11 px-8 rounded text-[11px] font-black uppercase tracking-widest transition-all"
                                onClick={() => onOpenChange?.(false)}
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={confirmCancelAll}
                onOpenChange={setConfirmCancelAll}
                title="Cancel Entire Order"
                description={`Are you sure you want to cancel order #${order.checkoutOrderCode}? This will cancel all ${order.childOrders.length} sub-orders. This action cannot be undone.`}
                confirmText="Yes, Cancel All"
                cancelText="No, Keep It"
                onConfirm={handleCancelAll}
                variant="danger"
                isLoading={isCancellingAll}
            />
        </>
    )
}
