import { memo, useMemo, useState, useCallback, lazy, Suspense } from "react"
import { Package, Palette, ChevronDown, AlertCircle, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { useOrderDetail } from "@/hooks/queries/useOrder"
import { useCancelChildOrder } from "@/hooks/queries/useCheckoutOrder"
import { useToast } from "@/hooks/useToast"
import { getStatusTheme } from "../../../constants"
import { formatPrice } from "../../../utils"
import { getChildOrderType } from "@/api/types/checkoutOrder"
import type { ChildOrderSummary } from "@/api/types/checkoutOrder"
import { cn } from "@/lib/utils"
import { isAxiosError } from "axios"

const OrderItemRow = lazy(() => import("./OrderItemRow").then(m => ({ default: m.OrderItemRow })))
const OrderStepFlow = lazy(() => import("./OrderStepFlow").then(m => ({ default: m.OrderStepFlow })))
const AddressSection = lazy(() => import("./AddressSection").then(m => ({ default: m.AddressSection })))
const ShipperInfoSection = lazy(() => import("./ShipperInfoSection").then(m => ({ default: m.ShipperInfoSection })))

interface ChildOrderSectionProps {
    child: ChildOrderSummary
    /** Whether the parent checkout order was paid via VnPay and is in Confirmed state */
    canCancelIndividual: boolean
    onChildCancelled?: () => void
}

/**
 * Renders a single child order section inside the CheckoutOrderDetailDialog.
 * Fetches the child's full detail (items, pricing) via the existing order API.
 */
export const ChildOrderSection = memo(({
    child,
    canCancelIndividual,
    onChildCancelled,
}: ChildOrderSectionProps) => {
    const childType = getChildOrderType(child.orderCode)
    const theme = getStatusTheme(child.status)
    const isCustomize = childType === 'customize'
    const isCancelled = theme.label.toLowerCase().includes("cancel")
    const isTerminal = isCancelled || theme.label.toLowerCase().includes("completed") || theme.label.toLowerCase().includes("refund")

    const [expanded, setExpanded] = useState(true)
    const [confirmOpen, setConfirmOpen] = useState(false)

    const { data: detail, isPending } = useOrderDetail(child.id)
    const { mutate: cancelChild, isPending: isCancelling } = useCancelChildOrder({ meta: { hideToast: true } })
    const toast = useToast()

    const items = useMemo(() => detail?.items || [], [detail?.items])

    const handleCancelConfirm = useCallback(() => {
        cancelChild(child.id, {
            onSuccess: () => {
                toast.success("Order Cancelled", `Child order #${child.orderCode} has been cancelled. Refund will be processed automatically.`)
                setConfirmOpen(false)
                onChildCancelled?.()
            },
            onError: (error: unknown) => {
                const message = isAxiosError(error)
                    ? (error.response?.data?.message || error.message)
                    : error instanceof Error ? error.message : "Error occurred"
                toast.error("Cancellation Failed", message)
            }
        })
    }, [cancelChild, child.id, child.orderCode, toast, onChildCancelled])

    return (
        <>
            <div className="bg-white border-b border-gray-100 last:border-b-0">
                {/* Child Order Header */}
                <button
                    type="button"
                    onClick={() => setExpanded(v => !v)}
                    className={cn(
                        "w-full px-6 py-4 flex items-center justify-between transition-all duration-200",
                        expanded ? "bg-white" : "hover:bg-gray-50/50"
                    )}
                >
                    <div className="flex items-center gap-4">
                        <div className={cn(
                            "h-9 w-9 rounded flex items-center justify-center flex-shrink-0 border transition-all duration-200",
                            isCustomize
                                ? "bg-violet-50 border-violet-100"
                                : "bg-sky-50 border-sky-100"
                        )}>
                            {isCustomize
                                ? <Palette className="w-4 h-4 text-violet-500" />
                                : <Package className="w-4 h-4 text-sky-500" />
                            }
                        </div>
                        <div className="text-left">
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-[14px] font-bold text-slate-900 tracking-tight">
                                    {isCustomize ? 'Custom Production' : 'Standard Delivery'}
                                </span>
                                <Badge
                                    variant="outline"
                                    className="px-2 py-0 h-4 rounded text-[8px] font-black uppercase tracking-widest border-slate-200 bg-white"
                                    style={{ color: theme.color, borderColor: `${theme.color}30` }}
                                >
                                    {theme.label}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                <span>#{child.orderCode}</span>
                                <span className="w-1 h-1 rounded-full bg-slate-200" />
                                <span className="text-slate-600">{formatPrice(child.totalAmount)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Cancel button for individual child */}
                        {canCancelIndividual && !isTerminal && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-3 text-[10px] font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-50 uppercase tracking-widest rounded-md border border-transparent hover:border-rose-100 transition-all"
                                onClick={(e) => { e.stopPropagation(); setConfirmOpen(true) }}
                                disabled={isCancelling}
                            >
                                <XCircle className="w-3.5 h-3.5 mr-1.5" />
                                Cancel
                            </Button>
                        )}
                        <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center border border-gray-100 bg-white shadow-sm transition-all duration-300",
                            expanded ? "rotate-180 border-primary/30" : "hover:border-gray-300"
                        )}>
                            <ChevronDown className={cn(
                                "w-4 h-4 text-gray-400",
                                expanded && "text-primary"
                            )} />
                        </div>
                    </div>
                </button>

                {/* Expanded Content */}
                {expanded && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                        {/* Step flow for child */}
                        <Suspense fallback={null}>
                            <div className="px-6 pb-3">
                                <OrderStepFlow step={theme.step} color={theme.color} isCancelled={isCancelled} />
                            </div>
                        </Suspense>

                        {/* Items */}
                        {isPending ? (
                            <div className="px-6 pb-4">
                                <div className="space-y-3">
                                    {[1, 2].map(i => (
                                        <div key={i} className="h-16 rounded-lg bg-gray-50 animate-pulse" />
                                    ))}
                                </div>
                            </div>
                        ) : detail && items.length > 0 ? (
                            <div className="divide-y divide-gray-50">
                                <Suspense fallback={null}>
                                    <ShipperInfoSection
                                        staffName={detail.shippingStaffName}
                                        shippingStatus={detail.shippingStatus}
                                        avatarUrl={detail.shippingStaffAvatarUrl}
                                    />
                                    <AddressSection order={detail} />
                                    {items.map((item) => (
                                        <OrderItemRow
                                            key={item.id}
                                            item={item}
                                            orderStatus={child.status}
                                            orderId={child.id}
                                        />
                                    ))}
                                </Suspense>
                            </div>
                        ) : (
                            <div className="px-6 pb-4 text-center py-6">
                                <AlertCircle className="w-6 h-6 text-gray-200 mx-auto mb-2" />
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">No items loaded</p>
                            </div>
                        )}

                        {/* Cancelled banner */}
                        {isCancelled && (
                            <div className="mx-6 mb-4 p-3 bg-rose-50/50 rounded-lg border border-rose-100/60 flex items-center gap-2">
                                <AlertCircle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                                <p className="text-[10px] font-bold text-rose-500">
                                    This order was cancelled. {isCustomize ? "Refund has been automatically initiated." : ""}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <ConfirmDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                title="Cancel This Order"
                description={`Are you sure you want to cancel order #${child.orderCode}? A refund will be automatically processed to your original payment method.`}
                confirmText="Yes, Cancel & Refund"
                cancelText="No, Keep It"
                onConfirm={handleCancelConfirm}
                variant="danger"
                isLoading={isCancelling}
            />
        </>
    )
})

ChildOrderSection.displayName = 'ChildOrderSection'
