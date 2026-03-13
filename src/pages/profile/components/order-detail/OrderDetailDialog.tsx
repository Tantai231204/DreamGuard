import React from "react"
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
import {
    Store,
    ChevronRight,
    AlertCircle,
    Info,
} from "lucide-react"
import { STATUS_THEME } from "../../constants"
import { isAxiosError } from "axios"

// Internal Components
import { 
    OrderItemRow, 
    OrderStepFlow, 
    AddressSection, 
    PricingSummary, 
    PaymentDetailsCard 
} from "./components"

interface OrderDetailDialogProps {
    orderId: string
    orderCode: string
    trigger: React.ReactNode
}

export function OrderDetailDialog({ orderId, orderCode, trigger }: OrderDetailDialogProps) {
    const [confirmOpen, setConfirmOpen] = React.useState(false)
    const toast = useToast()
    const { data: order, isPending } = useOrderDetail(orderId)
    const { data: payment } = usePaymentByOrderId(orderId)
    const { mutate: cancelOrder, isPending: isCancelling } = useCancelOrder({ meta: { hideToast: true } })

    const currentTheme = order ? (STATUS_THEME[order.status] || STATUS_THEME["Pending"]) : STATUS_THEME["Pending"]

    return (
        <Dialog>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[92vh] overflow-hidden flex flex-col p-0 rounded-xl border-none shadow-2xl bg-gray-50">
                {/* Visual Header */}
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
                    <div className="px-4 py-1.5 rounded-full text-[11px] font-bold text-white uppercase tracking-widest bg-[#4988c4] shadow-sm">
                        {currentTheme.label}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar">
                    {isPending ? (
                        <div className="flex flex-col items-center justify-center py-40 gap-4 bg-white">
                            <div className="w-7 h-7 border-[3px] border-[#4988c4] border-t-transparent rounded-full animate-spin" />
                            <p className="text-[12px] font-bold text-gray-400 tracking-wider uppercase">Loading secure details...</p>
                        </div>
                    ) : order ? (
                        <div className="space-y-3">
                            <OrderStepFlow step={currentTheme.step} />
                            <AddressSection order={order} />

                            {/* Store & Item Manifest */}
                            <div className="bg-white">
                                <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2.5">
                                    <Store className="w-4 h-4 text-gray-500" />
                                    <span className="text-[14px] font-bold text-gray-800 tracking-tight">DreamGuard Official</span>
                                    <ChevronRight className="w-4 h-4 text-gray-300" />
                                </div>
                                <div className="divide-y divide-gray-50">
                                    {order.items.map((item) => <OrderItemRow key={item.id} item={item} />)}
                                </div>
                            </div>

                            <div className="bg-white pb-8 pt-4">
                                <PricingSummary order={order} />
                                <PaymentDetailsCard order={order} payment={payment} />

                                {order.note && (
                                    <div className="mx-6 mt-6 p-4 bg-amber-50/30 rounded-lg border border-amber-100/50 text-left">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <Info className="w-3 h-3 text-amber-500" />
                                            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Order Notes</span>
                                        </div>
                                        <p className="text-[12px] text-amber-700/80 italic font-medium">"{order.note}"</p>
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

                {/* Footer Actions */}
                <div className="p-5 border-t border-gray-100 bg-white flex items-center justify-end gap-3 shrink-0">
                    {order && currentTheme.step === 0 && (
                        <Button
                            variant="ghost"
                            className="h-11 px-6 text-[12px] font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-50 uppercase tracking-wider transition-all"
                            onClick={() => setConfirmOpen(true)}
                            disabled={isCancelling}
                        >
                            {isCancelling ? "Cancelling..." : "Cancel Order"}
                        </Button>
                    )}
                    <Button variant="ghost" className="h-11 px-6 text-[12px] font-bold text-gray-500 hover:text-gray-900 uppercase tracking-wider">Help Center</Button>
                    <Button className="h-11 px-10 rounded text-[12px] font-bold bg-[#4988c4] hover:bg-[#3b6fa3] text-white uppercase tracking-wider shadow-sm transition-all active:scale-95">Buy Again</Button>
                </div>
            </DialogContent>

            <ConfirmDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                title="Cancel Order"
                description={`Are you sure you want to cancel order #${orderCode}? This action cannot be undone.`}
                confirmText="Yes, Cancel Order"
                cancelText="No, Keep It"
                onConfirm={() => {
                    cancelOrder(orderId, {
                        onSuccess: () => {
                            toast.success("Order Cancelled", `The order #${orderCode} has been cancelled.`)
                            setConfirmOpen(false)
                        },
                        onError: (error: unknown) => {
                            let message = "Error occurred";
                            if (isAxiosError(error)) {
                                message = error.response?.data?.message || error.message;
                            } else if (error instanceof Error) {
                                message = error.message;
                            }
                            toast.error("Cancellation Failed", message)
                        }
                    })
                }}
                variant="danger"
                isLoading={isCancelling}
            />
        </Dialog>
    )
}
