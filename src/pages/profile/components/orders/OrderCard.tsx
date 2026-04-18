import { memo, useCallback, useMemo, lazy, Suspense } from "react"
import { Store, Package, Truck, ShieldCheck } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatPrice, formatDate } from "../../utils"
import type { OrderResponse } from "@/api/types/order"
import { getStatusTheme } from "../../constants"
import { useNavigate } from "react-router-dom"
import { orderKeys } from "@/hooks/queries/useOrder"
import { queryClient } from "@/lib/queryClient"
import orderService from "@/api/services/orderService"

// Lazy load heavy dialog component
const OrderDetailDialog = lazy(() => import("./OrderDetailDialog").then(m => ({ default: m.OrderDetailDialog })));

interface OrderCardProps {
    order: OrderResponse
}

export const OrderCard = memo(({ order }: OrderCardProps) => {
    const theme = getStatusTheme(order.status)
    const navigate = useNavigate()
    const status = String(order.status)

    const isShipping = useMemo(() => ["Shipping", "3"].includes(status), [status])
    const isDelivered = useMemo(() => ["Delivered", "Completed", "4", "5"].includes(status), [status])
    const isCancelled = useMemo(() => ["Cancelled", "6"].includes(status), [status])
    const isInTransit = isShipping || ["Delivered", "4"].includes(status)

    const prefetch = useCallback(() => {
        queryClient.prefetchQuery({
            queryKey: orderKeys.detail(order.id),
            queryFn: () => orderService.getOrderDetail(order.id),
            staleTime: 60_000,
        })
        import("../../../cart").catch(() => {})
    }, [order.id])

    const handleReOrder = useCallback(() => {
        navigate(`/cart?reorder=${order.id}`)
    }, [navigate, order.id])

    return (
        <Card className="group relative rounded-2xl border-slate-200/60 bg-white shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md will-change-transform">
            {/* Header */}
            <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 bg-slate-50/30">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                        <Store className="w-4 h-4 text-slate-500" />
                    </div>
                    <div>
                        <span className="text-sm font-bold text-slate-900">DreamGuard Store</span>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{formatDate(order.createdAt)}</p>
                    </div>
                </div>
                <Badge
                    variant="secondary"
                    className="w-fit px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border-none shadow-sm"
                    style={{ backgroundColor: `${theme.color}10`, color: theme.color }}
                >
                    <span className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: theme.color }} />
                    {theme.label}
                </Badge>
            </div>

            {/* Body */}
            <div className="p-6 flex flex-col md:flex-row gap-6">
                <div className="relative shrink-0">
                    <div className="w-20 h-20 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                        <Package className="w-8 h-8 text-slate-300" />
                    </div>
                    <Badge className="absolute -top-2 -right-2 h-6 min-w-[24px] rounded-lg bg-slate-900 text-white border-2 border-white font-bold text-[10px] flex items-center justify-center shadow-sm">
                        {order.itemCount}
                    </Badge>
                </div>
                <div className="flex-1 flex flex-col justify-center space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h4 className="text-base font-bold text-slate-900 tracking-tight">Order ID: #{order.orderCode}</h4>
                            {isInTransit && (
                                <div className="flex items-center gap-1 mt-1.5 text-[10px] font-bold text-emerald-600 uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-emerald-50/50 w-fit">
                                    <Truck className="w-3 h-3" />
                                    In Transit
                                </div>
                            )}
                        </div>
                        <div className="sm:text-right">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Amount</p>
                            <p className="text-lg font-bold text-slate-900">{formatPrice(order.totalAmount)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50/30 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <p className="text-[11px] text-slate-500 font-medium">
                        View detailed manifest and billing information for this order.
                    </p>
                    <button
                        className="text-[10px] font-black text-[#4988c4] uppercase tracking-widest flex items-center gap-1.5 hover:underline w-fit"
                        onClick={() => window.alert(`Contacting support for Order #${order.orderCode}...`)}
                    >
                        <ShieldCheck className="w-3 h-3" />
                        Express Support
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    <Suspense fallback={
                        <Button variant="outline" className="h-9 px-4 rounded-lg text-xs font-bold uppercase tracking-wider border-slate-200 opacity-70 animate-pulse" disabled>
                            Details
                        </Button>
                    }>
                        <OrderDetailDialog
                            orderId={order.id}
                            orderCode={order.orderCode}
                            trigger={
                                <Button variant="outline" className="h-9 px-4 rounded-lg text-xs font-bold uppercase tracking-wider border-slate-200 hover:bg-white transition-all">
                                    Details
                                </Button>
                            }
                        />
                    </Suspense>

                    {isShipping && (
                        <Button
                            className="h-9 px-4 rounded-lg text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-all"
                            onClick={() => window.alert("Redirecting to tracking page...")}
                        >
                            <Truck className="w-3.5 h-3.5 mr-1.5" />
                            Track Order
                        </Button>
                    )}

                    {isDelivered && (
                        <div className="flex items-center gap-2">
                            <Suspense fallback={null}>
                                <OrderDetailDialog
                                    orderId={order.id}
                                    orderCode={order.orderCode}
                                    trigger={
                                        <Button variant="ghost" className="h-9 px-4 rounded-lg text-[10px] font-black uppercase tracking-wider text-amber-600 hover:bg-amber-50">
                                            Write Review
                                        </Button>
                                    }
                                />
                            </Suspense>
                            <BuyAgainButton onClick={handleReOrder} onMouseEnter={prefetch} />
                        </div>
                    )}

                    {isCancelled && (
                        <div className="flex items-center gap-2">
                            <div className="flex items-center pr-2 border-r border-slate-200 mr-1">
                                <span className="text-[10px] font-bold text-rose-400 italic">User requested cancellation</span>
                            </div>
                            <BuyAgainButton onClick={handleReOrder} onMouseEnter={prefetch} />
                        </div>
                    )}
                </div>
            </div>
        </Card>
    )
})

// Extracted to reduce duplication
function BuyAgainButton({ onClick, onMouseEnter }: { onClick: () => void; onMouseEnter: () => void }) {
    return (
        <Button
            className="relative h-9 px-4 rounded-lg text-[10px] font-black uppercase tracking-[0.15em] bg-primary text-white shadow-[0_4px_12px_-4px_rgba(73,136,196,0.5)] hover:shadow-[0_8px_20px_-6px_rgba(73,136,196,0.6)] hover:-translate-y-0.5 transition-all duration-300 group/btn overflow-hidden border-none"
            onClick={onClick}
            onMouseEnter={onMouseEnter}
        >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
            <span className="relative z-10">Buy Again</span>
        </Button>
    )
}
