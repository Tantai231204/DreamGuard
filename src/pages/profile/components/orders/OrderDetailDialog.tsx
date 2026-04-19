import React, { useCallback, useMemo } from "react"
import { useOrderDetail, useCancelOrder } from "@/hooks/queries/useOrder"
import { usePaymentByOrderId } from "@/hooks/queries/usePayment"
import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/useToast"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Store, ChevronRight, AlertCircle, Info, ShieldCheck, ChevronDown } from "lucide-react"
import { getStatusTheme } from "../../constants"
import { isAxiosError } from "axios"
import { useNavigate } from "react-router-dom"

import {
    OrderItemRow,
    OrderStepFlow,
    AddressSection,
    PricingSummary,
    PaymentDetailsCard,
    ShipperInfoSection
} from "./components"

const MAX_VISIBLE = 3;

interface OrderDetailDialogProps {
    orderId: string
    orderCode: string
    trigger: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
    initialTab?: "details" | "review"
}

export function OrderDetailDialog({ 
    orderId, 
    orderCode, 
    trigger, 
    open, 
    onOpenChange,
    initialTab = "details" 
}: OrderDetailDialogProps) {
    const [confirmOpen, setConfirmOpen] = React.useState(false)
    const [itemsExpanded, setItemsExpanded] = React.useState(false)
    const toast = useToast()
    const { data: order, isPending } = useOrderDetail(orderId)
    const { data: payment } = usePaymentByOrderId(orderId)
    const { mutate: cancelOrder, isPending: isCancelling } = useCancelOrder({ meta: { hideToast: true } })
    const navigate = useNavigate()

    // Scroll to items if initialTab is "review"
    React.useEffect(() => {
        if (open && initialTab === "review" && !isPending) {
            setTimeout(() => {
                const element = document.getElementById("order-items-section");
                if (element) {
                    element.scrollIntoView({ behavior: "smooth", block: "start" });
                }
            }, 300);
        }
    }, [open, initialTab, isPending]);

    const theme = useMemo(() => order ? getStatusTheme(order.status) : getStatusTheme("Pending"), [order])
    const isCancelled = theme.label.toLowerCase().includes("cancel")
    const canCancel = theme.step === 0

    const allItems = useMemo(() => order?.items || [], [order?.items])
    const needsCollapse = allItems.length > MAX_VISIBLE
    const visibleItems = useMemo(
        () => needsCollapse && !itemsExpanded ? allItems.slice(0, MAX_VISIBLE) : allItems,
        [allItems, needsCollapse, itemsExpanded]
    )
    const hiddenCount = allItems.length - MAX_VISIBLE

    const preloadCartJS = useCallback(() => {
        import("../../../cart").catch(() => { })
    }, [])

    const handleReOrder = useCallback(() => {
        if (!order?.items?.length) return
        navigate(`/cart?reorder=${orderId}`)
    }, [order?.items?.length, navigate, orderId])

    const handleDialogChange = useCallback((newOpen: boolean) => {
        if (!newOpen) setItemsExpanded(false)
        onOpenChange?.(newOpen)
    }, [onOpenChange])

    const handleCancelConfirm = useCallback(() => {
        cancelOrder(orderId, {
            onSuccess: () => {
                toast.success("Order Cancelled", `The order #${orderCode} has been cancelled.`)
                setConfirmOpen(false)
            },
            onError: (error: unknown) => {
                const message = isAxiosError(error)
                    ? (error.response?.data?.message || error.message)
                    : error instanceof Error ? error.message : "Error occurred"
                toast.error("Cancellation Failed", message)
            }
        })
    }, [cancelOrder, orderId, orderCode, toast])

    return (
        <>
            <Dialog open={open} onOpenChange={handleDialogChange}>
                <DialogTrigger asChild>{trigger}</DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[92vh] overflow-hidden flex flex-col p-0 rounded-xl border-none shadow-2xl bg-gray-50">
                    {/* Header */}
                    <div className="bg-white border-b border-gray-100 pl-6 pr-12 py-4 flex items-center justify-between shrink-0 relative">
                        <DialogHeader className="flex flex-row items-center gap-4 space-y-0">
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-gray-100">
                                <ChevronRight className="w-5 h-5 rotate-180 text-gray-500" />
                            </Button>
                            <div className="text-left">
                                <DialogTitle className="text-[16px] font-black text-gray-900 uppercase tracking-tight">Order Journey</DialogTitle>
                                <DialogDescription className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">
                                    Order ID: {orderCode}
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
                        {isPending ? (
                            <div className="flex flex-col items-center justify-center py-40 gap-4 bg-white">
                                <div className="w-7 h-7 border-[3px] border-[#4988c4] border-t-transparent rounded-full animate-spin" />
                                <p className="text-[12px] font-bold text-gray-400 tracking-wider uppercase">Loading secure details...</p>
                            </div>
                        ) : order ? (
                            <div className="space-y-3">
                                <OrderStepFlow step={theme.step} color={theme.color} isCancelled={isCancelled} />
                                <ShipperInfoSection
                                    staffName={order.shippingStaffName}
                                    shippingStatus={order.shippingStatus}
                                    avatarUrl={order.shippingStaffAvatarUrl}
                                />
                                <AddressSection order={order} />

                                {/* Items */}
                                <div className="bg-white" id="order-items-section">
                                    <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2.5">
                                        <Store className="w-4 h-4 text-gray-500" />
                                        <span className="text-[14px] font-bold text-gray-800 tracking-tight">DreamGuard Official</span>
                                        <ChevronRight className="w-4 h-4 text-gray-300" />
                                    </div>
                                    <div className="divide-y divide-gray-50">
                                        {visibleItems.map((item) => <OrderItemRow key={item.id} item={item} orderStatus={order.status} />)}
                                    </div>
                                    {needsCollapse && (
                                        <button
                                            type="button"
                                            onClick={() => setItemsExpanded(v => !v)}
                                            className="w-full flex items-center justify-center gap-1.5 py-3 text-sm font-semibold text-[#4988c4] hover:text-[#3b6fa3] hover:bg-blue-50/50 border-t border-gray-50 transition-colors"
                                        >
                                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${itemsExpanded ? 'rotate-180' : ''}`} />
                                            {itemsExpanded ? 'Show less' : `Show ${hiddenCount} more item${hiddenCount > 1 ? 's' : ''}`}
                                        </button>
                                    )}
                                </div>

                                {/* Pricing & Notes */}
                                <div className="bg-white pb-7 pt-4">
                                    <PricingSummary order={order} />
                                    <div className="mx-6 mt-5 pt-4 border-t border-slate-100/80">
                                        <PaymentDetailsCard
                                            payments={payment ? [payment] : undefined}
                                            fallbackPayment={{
                                                id: order.orderCode,
                                                orderCode: order.orderCode,
                                                paymentMethod: order.paymentMethod || "COD",
                                                paymentType: "Purchase",
                                                status: order.paymentStatus || "Pending",
                                                amount: order.totalAmount,
                                                createdAt: order.createdAt,
                                            }}
                                            className="mx-0"
                                        />
                                    </div>

                                    {order.note && (
                                        <div className="mx-6 mt-6 p-4 bg-amber-50/30 rounded-lg border border-amber-100/50 text-left">
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <Info className="w-3 h-3 text-amber-500" />
                                                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Order Notes</span>
                                            </div>
                                            <p className="text-[12px] text-amber-700/80 italic font-medium">"{order.note}"</p>
                                        </div>
                                    )}

                                    {isCancelled && (
                                        <div className="mx-6 mt-6 p-5 bg-rose-50/40 rounded-xl border border-rose-100 text-left">
                                            <div className="flex items-center gap-2 mb-2 text-rose-600">
                                                <AlertCircle className="w-4 h-4" />
                                                <span className="text-[11px] font-black uppercase tracking-widest">Refund Process Initiated</span>
                                            </div>
                                            <p className="text-[12px] text-rose-700/70 font-medium leading-relaxed">
                                                Your order has been cancelled. If you already made a payment, the refund will be credited back to your original source within 3-5 business days.
                                            </p>
                                            <div className="mt-4 flex flex-wrap gap-2">
                                                <span className="px-2 py-0.5 rounded bg-rose-100 text-[10px] font-bold text-rose-600 uppercase">Refund Issued</span>
                                                <span className="px-2 py-0.5 rounded bg-rose-50 border border-rose-100 text-[10px] font-bold text-rose-300 uppercase tracking-tighter cursor-not-allowed">Bank Processing...</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="py-32 text-center bg-white">
                                <AlertCircle className="w-12 h-12 text-gray-100 mx-auto mb-4" />
                                <p className="text-[13px] font-bold text-gray-400 uppercase tracking-widest">Record Not Synchronized</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-5 border-t border-gray-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
                        <div className="flex flex-col items-start gap-0.5">
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-tight">Need more help?</span>
                            <button
                                className="text-[10px] font-black text-[#4988c4] uppercase tracking-widest hover:underline flex items-center gap-1.5"
                                onClick={() => window.alert("Connecting to a dedicated agent...")}
                            >
                                <ShieldCheck className="w-3.5 h-3.5" />
                                Chat with Senior Assistant
                            </button>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 ml-auto">
                            {order && canCancel && (
                                <Button
                                    variant="ghost"
                                    className="h-11 px-6 text-[11px] font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-50 uppercase tracking-widest transition-all"
                                    onClick={() => setConfirmOpen(true)}
                                    disabled={isCancelling}
                                >
                                    {isCancelling ? "Cancelling..." : "Cancel Order"}
                                </Button>
                            )}
                            <Button
                                className="h-11 px-10 rounded text-[11px] font-black bg-[#4988c4] hover:bg-[#3b6fa3] text-white uppercase tracking-widest shadow-sm transition-all active:scale-95 disabled:opacity-70"
                                onClick={handleReOrder}
                                onMouseEnter={preloadCartJS}
                                disabled={isPending}
                            >
                                Re-Order
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                title="Cancel Order"
                description={`Are you sure you want to cancel order #${orderCode}? This action cannot be undone.`}
                confirmText="Yes, Cancel Order"
                cancelText="No, Keep It"
                onConfirm={handleCancelConfirm}
                variant="danger"
                isLoading={isCancelling}
            />
        </>
    )
}
