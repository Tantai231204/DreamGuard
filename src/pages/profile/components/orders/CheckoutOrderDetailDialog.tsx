import React, { useCallback, useMemo } from "react"
import { useCheckoutOrders, useCancelCheckoutOrder } from "@/hooks/queries/useCheckoutOrder"
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
import { ChevronRight, AlertCircle, ShieldCheck, Palette, Package } from "lucide-react"
import { getStatusTheme } from "../../constants"
import { isAxiosError } from "axios"
import { cn } from "@/lib/utils"
import type { CheckoutOrderResponse } from "@/api/types/checkoutOrder"
import { getChildOrderType } from "@/api/types/checkoutOrder"

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
    const [activeShipmentTab, setActiveShipmentTab] = React.useState(initialOrder.childOrders[0]?.id)
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

    // Ensure tab is set if order changes or initial set fails
    React.useEffect(() => {
        if (!activeShipmentTab && order.childOrders.length > 0) {
            setActiveShipmentTab(order.childOrders[0].id)
        }
    }, [order.childOrders, activeShipmentTab])

    // Fetch payment info by checkout order code
    const { data: paymentData } = usePayments({
        orderCode: open ? order.checkoutOrderCode : undefined,
    })

    const paymentMethod = useMemo(() => {
        if (!paymentData?.items?.length) return undefined
        return paymentData.items[0]?.paymentMethod
    }, [paymentData])

    // ── Cancel Logic ──
    const isVnPay = paymentMethod?.toLowerCase() === 'vnpay'
    const isTerminalStatus = ['Completed', 'Cancelled', 'Refunded'].includes(order.status)

    // Can cancel entire order?
    const canCancelAll = useMemo(() => {
        if (isTerminalStatus) return false
        // Allow bulk cancel ONLY for COD orders in user history
        // We wait for payment info to ensure we don't show it for VnPay orders briefly
        if (!paymentMethod) return false 
        if (isVnPay) return false
        return ['Pending', 'Confirmed', 'Processing'].includes(order.status)
    }, [isTerminalStatus, order.status, isVnPay, paymentMethod])

    // Can cancel individual child orders? 
    // Disabled for users as per request "only cancel COD orders"
    const canCancelIndividual = false;

    const { mutateAsync: cancelAll } = useCancelCheckoutOrder({ meta: { hideToast: true } })
    const [isBulkCancelling, setIsBulkCancelling] = React.useState(false)
    const isCancellingAll = isBulkCancelling

    const handleCancelAll = useCallback(async () => {
        setIsBulkCancelling(true)
        try {
            // Switch target ID based on status: Pending orders require parent ID, Confirmed/Processing require child ID
            const targetId = order.status === 'Pending' ? order.id : (order.childOrders[0]?.id || order.id)
            await cancelAll(targetId)

            toast.success("Order journey cancelled", `Order #${order.checkoutOrderCode} has been cancelled.`)
            setConfirmCancelAll(false)
            onOpenChange?.(false)
        } catch (error: unknown) {
            const message = isAxiosError(error)
                ? (error.response?.data?.message || error.message)
                : error instanceof Error ? error.message : "Error occurred during cancellation"
            toast.error("Cancellation Failed", message)
        } finally {
            setIsBulkCancelling(false)
        }
    }, [order.id, order.checkoutOrderCode, toast, cancelAll, onOpenChange])

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-3xl max-h-[92vh] overflow-hidden flex flex-col p-0 rounded-xl border-none shadow-2xl bg-slate-50/50">
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
                    <div className="flex-1 overflow-y-auto no-scrollbar bg-white">
                        {isLoadingDetail && !liveOrder ? (
                            <OrderDetailSkeleton />
                        ) : (
                            <div className="space-y-0">
                                {/* Refund Banner */}
                                {hasRefund && (
                                    <div className="border-b border-gray-100 bg-amber-50/30">
                                        <RefundSummaryBanner
                                            refundingAmount={order.refundingAmount}
                                            refundedAmount={order.refundedAmount}
                                        />
                                    </div>
                                )}

                                {/* Split Shipments Tabbed Interface */}
                                <div className="border-b border-gray-100">
                                    {/* Sub-order Selector Tabs */}
                                    {order.childOrders.length > 1 && (
                                        <div className="px-6 py-4 bg-gray-50 flex gap-2 border-b border-gray-100 overflow-x-auto no-scrollbar">
                                            {order.childOrders.map((child) => {
                                                const isActive = activeShipmentTab === child.id
                                                const childType = getChildOrderType(child.orderCode)
                                                return (
                                                    <button
                                                        key={child.id}
                                                        onClick={() => setActiveShipmentTab(child.id)}
                                                        className={cn(
                                                            "flex items-center gap-3 px-5 py-2.5 rounded-md transition-all duration-200 border-2 shrink-0",
                                                            isActive
                                                                ? "bg-white border-primary shadow-sm"
                                                                : "bg-transparent border-transparent text-slate-400 hover:text-slate-600"
                                                        )}
                                                    >
                                                        <div className={cn(
                                                            "w-6 h-6 rounded flex items-center justify-center",
                                                            isActive
                                                                ? (childType === 'customize' ? "bg-violet-100/50" : "bg-primary-100/50")
                                                                : "bg-slate-100/50"
                                                        )}>
                                                            {childType === 'customize'
                                                                ? <Palette className={cn("w-3 h-3", isActive ? "text-violet-600" : "text-slate-400")} />
                                                                : <Package className={cn("w-3 h-3", isActive ? "text-sky-600" : "text-slate-400")} />
                                                            }
                                                        </div>
                                                        <div className="text-left">
                                                            <span className={cn(
                                                                "text-[11px] font-black uppercase tracking-tight block",
                                                                isActive ? "text-primary" : "text-slate-400"
                                                            )}>
                                                                {childType === 'customize' ? 'Custom' : 'Standard'}
                                                            </span>
                                                        </div>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    )}

                                    <div className="animate-in fade-in duration-300">
                                        {order.childOrders
                                            .filter(child => !activeShipmentTab || child.id === activeShipmentTab)
                                            .map((child) => (
                                                <ChildOrderSection
                                                    key={child.id}
                                                    child={child}
                                                    canCancelIndividual={canCancelIndividual}
                                                />
                                            ))}
                                    </div>
                                </div>

                                {/* Pricing Summary */}
                                <div className="border-b border-gray-100 bg-gray-50/30">
                                    <CheckoutPricingSummary order={order} />
                                </div>

                                {/* Payment Details */}
                                <div className="p-8 bg-white">
                                    <div className="mb-6">
                                        <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] mb-1">Transaction Identity</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gateway and Reference Info</p>
                                    </div>
                                    <PaymentDetailsCard
                                        orderCode={order.checkoutOrderCode}
                                        className="mx-0 shadow-none border border-slate-100 rounded-lg bg-slate-50/30"
                                    />
                                </div>

                                {/* Cancelled info */}
                                {order.status === 'Cancelled' && (
                                    <div className="px-8 py-6 border-t border-rose-100 bg-rose-50/20 text-left">
                                        <div className="flex items-center gap-2 mb-2 text-rose-600">
                                            <AlertCircle className="w-4 h-4" />
                                            <span className="text-[11px] font-black uppercase tracking-widest">Order Cancelled</span>
                                        </div>
                                        <p className="text-[12px] text-rose-700/70 font-bold leading-relaxed">
                                            This order has been fully cancelled. Refund processing is active.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-gray-100 bg-white flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-primary" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Secured Order Information</span>
                        </div>
                        <div className="flex items-center gap-3">
                            {canCancelAll && (
                                <Button
                                    variant="ghost"
                                    className="h-10 px-6 text-[11px] font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-50 uppercase tracking-widest transition-all rounded-md"
                                    onClick={() => setConfirmCancelAll(true)}
                                    disabled={isCancellingAll}
                                >
                                    {isCancellingAll ? "Processing..." : "Cancel All"}
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                className="h-10 px-8 rounded-md text-[11px] font-black uppercase tracking-widest transition-all border-slate-200"
                                onClick={() => onOpenChange?.(false)}
                            >
                                Close Detail
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
