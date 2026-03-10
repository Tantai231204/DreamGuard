import React from "react"
import { useOrderDetail, useCancelOrder } from "@/hooks/queries/useOrder"
import { useVariant } from "@/hooks/queries/useVariant"
import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/useToast"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { formatPrice } from "../utils"
import {
    MapPin,
    Package,
    Truck,
    CheckCircle2,
    Clock,
    AlertCircle,
    Info,
    Store,
    ChevronRight,
    CreditCard
} from "lucide-react"
import { STATUS_THEME } from "./order-constants"
import { cn } from "@/lib/utils"
import type { OrderItem, OrderDetailResponse } from "@/api/types/order"
import { isAxiosError } from "axios"

interface OrderDetailDialogProps {
    orderId: string
    orderCode: string
    trigger: React.ReactNode
}

// Sub-component to fetch and display variant details correctly
function OrderItemRow({ item }: { item: OrderItem }) {
    const { data: variant, isLoading } = useVariant(item.productVariantId)

    return (
        <div className="p-4 flex gap-4 bg-white border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
            <div className="w-16 h-16 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center shrink-0">
                {item.image ? (
                    <img src={item.image} alt={item.itemName} className="w-full h-full object-cover" />
                ) : (
                    <Package className="w-6 h-6 text-gray-300" />
                )}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                    <h4 className="text-[14px] font-semibold text-gray-900 truncate">{item.itemName}</h4>
                    <span className="text-[14px] font-bold text-[#4988c4]">{formatPrice(item.unitPrice)}</span>
                </div>

                {isLoading ? (
                    <div className="h-4 w-24 bg-gray-100 animate-pulse rounded mt-2" />
                ) : (
                    <div className="flex flex-wrap gap-2 mt-1.5">
                        {variant?.size && (
                            <span className="px-2 py-0.5 bg-gray-100 text-[11px] text-gray-600 rounded font-bold uppercase">
                                Size: {variant.size}
                            </span>
                        )}
                        {variant?.attributes?.color && (
                            <span className="px-2 py-0.5 bg-gray-100 text-[11px] text-gray-600 rounded font-bold uppercase">
                                Color: {variant.attributes.color}
                            </span>
                        )}
                    </div>
                )}

                <div className="flex items-center justify-between mt-2.5 text-[12px] text-gray-500 font-medium">
                    <span>Quantity: {item.quantity}</span>
                    <span className="text-gray-900 font-bold">Total: {formatPrice(item.unitPrice * item.quantity)}</span>
                </div>
            </div>
        </div>
    )
}

export function OrderDetailDialog({ orderId, orderCode, trigger }: OrderDetailDialogProps) {
    const [confirmOpen, setConfirmOpen] = React.useState(false)
    const toast = useToast()
    const { data, isPending } = useOrderDetail(orderId)
    const { mutate: cancelOrder, isPending: isCancelling } = useCancelOrder()
    const order = data as OrderDetailResponse | undefined
    const currentTheme = order ? (STATUS_THEME[order.status] || STATUS_THEME["Pending"]) : STATUS_THEME["Pending"]

    const handleCancelOrder = () => {
        setConfirmOpen(true)
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[92vh] overflow-hidden flex flex-col p-0 rounded-xl border-none shadow-2xl bg-gray-50">
                {/* Visual Header */}
                <div className="bg-white border-b border-gray-100 pl-6 pr-12 py-4 flex items-center justify-between shrink-0 relative">
                    <DialogHeader className="flex flex-row items-center gap-4 space-y-0">
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-gray-100">
                            <ChevronRight className="w-5 h-5 rotate-180 text-gray-500" />
                        </Button>
                        <div className="text-left">
                            <DialogTitle className="text-[16px] font-bold text-gray-900 uppercase tracking-tight">
                                Order Journey
                            </DialogTitle>
                            <DialogDescription className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">
                                Order ID: {orderCode}
                            </DialogDescription>
                        </div>
                    </DialogHeader>
                    <div>
                        <div className="px-4 py-1.5 rounded-full text-[11px] font-bold text-white uppercase tracking-widest bg-[#4988c4] shadow-sm">
                            {currentTheme.label}
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar">
                    {isPending ? (
                        <div className="flex flex-col items-center justify-center py-40 gap-4 bg-white">
                            <div className="w-7 h-7 border-[3px] border-[#4988c4] border-t-transparent rounded-full animate-spin" />
                            <p className="text-[12px] font-bold text-gray-400 tracking-wider">Loading secure details...</p>
                        </div>
                    ) : order ? (
                        <div className="space-y-3">
                            {/* Stepper */}
                            <div className="bg-white p-8 border-b border-gray-100">
                                <div className="flex items-center justify-between relative max-w-xl mx-auto px-6">
                                    {[
                                        { s: 0, label: "Ordered", icon: <Clock className="w-5 h-5" /> },
                                        { s: 2, label: "Packed", icon: <Package className="w-5 h-5" /> },
                                        { s: 3, label: "Transit", icon: <Truck className="w-5 h-5" /> },
                                        { s: 5, label: "Arrived", icon: <CheckCircle2 className="w-5 h-5" /> }
                                    ].map((step, idx, arr) => (
                                        <React.Fragment key={step.label}>
                                            <div className="flex flex-col items-center gap-2 relative z-10 transition-all">
                                                <div className={cn(
                                                    "w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all duration-500",
                                                    currentTheme.step >= step.s
                                                        ? "bg-white border-[#26aa99] text-[#26aa99] shadow-sm"
                                                        : "bg-white border-gray-100 text-gray-300"
                                                )}>
                                                    {step.icon}
                                                </div>
                                                <span className={cn(
                                                    "text-[10px] font-bold uppercase tracking-wider",
                                                    currentTheme.step >= step.s ? "text-gray-900" : "text-gray-400"
                                                )}>{step.label}</span>
                                            </div>
                                            {idx < arr.length - 1 && (
                                                <div className="flex-1 h-[2px] bg-gray-100 mt-[-28px] mx-[-15px] relative">
                                                    <div
                                                        className="absolute inset-0 bg-[#26aa99] transition-all duration-1000 ease-out"
                                                        style={{ width: currentTheme.step > step.s ? "100%" : "0%" }}
                                                    />
                                                </div>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>

                            {/* Address */}
                            <div className="bg-white p-6 border-b border-gray-100">
                                <div className="flex items-start gap-4">
                                    <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                        <MapPin className="w-4 h-4 text-[#4988c4]" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">Delivery Address</h3>
                                        <div className="space-y-1">
                                            <p className="text-[16px] font-bold text-gray-900 tracking-tight">{order.receiverName}</p>
                                            <p className="text-[14px] font-medium text-gray-500">{order.phoneNumber}</p>
                                            <p className="text-[14px] font-medium text-gray-600 leading-relaxed max-w-lg mt-1">
                                                {order.street}, {order.ward}, {order.district}, {order.city}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Store & Items */}
                            <div className="bg-white">
                                <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2.5">
                                    <Store className="w-4 h-4 text-gray-500" />
                                    <span className="text-[14px] font-bold text-gray-800 tracking-tight">DreamGuard Official</span>
                                    <ChevronRight className="w-4 h-4 text-gray-300" />
                                    <Button variant="outline" size="sm" className="h-7 text-[10px] font-bold px-3 ml-auto rounded border-gray-200 uppercase tracking-widest hover:bg-gray-50 hover:text-[#4988c4]">
                                        View Shop
                                    </Button>
                                </div>
                                <div className="divide-y divide-gray-50">
                                    {order.items.map((item) => (
                                        <OrderItemRow key={item.id} item={item} />
                                    ))}
                                </div>
                            </div>

                            {/* Final Summary */}
                            <div className="bg-white pb-8 pt-4">
                                <div className="space-y-4">
                                    <div className="px-6 space-y-3">
                                        <div className="flex justify-between items-center text-[13px] font-medium text-gray-500">
                                            <span>Subtotal</span>
                                            <span className="text-gray-900">{formatPrice(order.subTotal || 0)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[13px] font-medium text-gray-500">
                                            <span>Shipping Fee</span>
                                            <span className="text-gray-900">{formatPrice(0)}</span>
                                        </div>
                                        {order.discountAmount !== undefined && order.discountAmount > 0 && (
                                            <div className="flex justify-between items-center text-[13px] font-medium text-gray-500">
                                                <span>Promotion Discount</span>
                                                <span className="text-red-500">-{formatPrice(order.discountAmount)}</span>
                                            </div>
                                        )}
                                        <Separator className="bg-gray-50 my-2" />
                                        <div className="flex justify-between items-center pt-1">
                                            <span className="text-[15px] font-bold text-gray-900">Total Payment</span>
                                            <span className="text-[22px] font-black text-[#4988c4] tracking-tighter">
                                                {formatPrice(order.totalAmount)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mx-6 p-4 rounded-lg bg-gray-50/80 border border-gray-100 flex items-start gap-3.5">
                                        <CreditCard className="w-4 h-4 text-[#4988c4] mt-0.5" />
                                        <div className="space-y-0.5">
                                            <p className="text-[13px] font-bold text-gray-900">Payment Method</p>
                                            <p className="text-[12px] text-gray-500 font-medium">
                                                {order.paymentMethod ? (order.paymentMethod === "COD" ? "Cash on Delivery" : order.paymentMethod) : 'Standard Checkout'}
                                            </p>
                                        </div>
                                    </div>

                                    {order.note && (
                                        <div className="mx-6 p-4 bg-amber-50/30 rounded-lg border border-amber-100/50">
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <Info className="w-3 h-3 text-amber-500" />
                                                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Order Notes</span>
                                            </div>
                                            <p className="text-[12px] text-amber-700/80 italic font-medium">"{order.note}"</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="py-32 text-center bg-white">
                            <AlertCircle className="w-12 h-12 text-gray-100 mx-auto mb-4" />
                            <p className="text-[13px] font-bold text-gray-400 uppercase tracking-widest">Record Not Syncronized</p>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-5 border-t border-gray-100 bg-white flex items-center justify-end gap-3 shrink-0">
                    {order && currentTheme.step === 0 && (
                        <Button
                            variant="ghost"
                            className="h-11 px-6 text-[12px] font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-50 uppercase tracking-wider transition-all"
                            onClick={handleCancelOrder}
                            disabled={isCancelling}
                        >
                            {isCancelling ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                                    <span>Cancelling...</span>
                                </div>
                            ) : "Cancel Order"}
                        </Button>
                    )}
                    <Button variant="ghost" className="h-11 px-6 text-[12px] font-bold text-gray-500 hover:text-gray-900 uppercase tracking-wider">
                        Help Center
                    </Button>
                    <Button className="h-11 px-10 rounded text-[12px] font-bold bg-[#4988c4] hover:bg-[#3b6fa3] text-white uppercase tracking-wider shadow-sm transition-all active:scale-95">
                        Buy Again
                    </Button>
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
                            toast.success("Order Cancelled", `The order #${orderCode} has been cancelled successfully.`)
                            setConfirmOpen(false)
                        },
                        onError: (error: unknown) => {
                            let errorMessage = "Something went wrong while cancelling the order."

                            if (isAxiosError(error)) {
                                const data = error.response?.data;
                                if (data && typeof data === 'object') {
                                    // Robust extraction following project standard (lib/api.ts)
                                    const rawMessage = (data as Record<string, unknown>).message ||
                                        (data as Record<string, unknown>).error ||
                                        error.message;

                                    errorMessage = Array.isArray(rawMessage)
                                        ? rawMessage.join(". ")
                                        : (typeof rawMessage === 'string' ? rawMessage : errorMessage);
                                } else {
                                    errorMessage = error.message || errorMessage
                                }
                            } else if (error instanceof Error) {
                                errorMessage = error.message
                            }

                            toast.error("Cancellation Failed", errorMessage)
                            console.error("Order cancel failed:", error)
                        }
                    })
                }}
                variant="danger"
                isLoading={isCancelling}
            />
        </Dialog>
    )
}
