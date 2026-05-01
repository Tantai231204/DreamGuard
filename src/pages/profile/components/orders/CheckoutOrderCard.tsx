import React, { memo, useCallback, useMemo, lazy, Suspense } from "react"
import { Store, Package, Palette, ChevronRight, RotateCcw } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatPrice, formatDate } from "../../utils"
import type { CheckoutOrderResponse } from "@/api/types/checkoutOrder"
import { getChildOrderType } from "@/api/types/checkoutOrder"
import { getStatusTheme } from "../../constants"
import { useSearchParams } from "react-router-dom"
import { cn } from "@/lib/utils"

const CheckoutOrderDetailDialog = lazy(() => import("./CheckoutOrderDetailDialog").then(m => ({ default: m.CheckoutOrderDetailDialog })))

interface CheckoutOrderCardProps {
    order: CheckoutOrderResponse
}

export const CheckoutOrderCard = memo(({ order }: CheckoutOrderCardProps) => {
    const theme = getStatusTheme(order.status)
    const [searchParams, setSearchParams] = useSearchParams()
    const urlOrderId = searchParams.get("id")
    const isProductTab = searchParams.get("tab") === "orders"

    const isInitiallyDeepLinked = isProductTab && urlOrderId === order.id
    const [isOpen, setIsOpen] = React.useState(isInitiallyDeepLinked)

    React.useEffect(() => {
        if (isInitiallyDeepLinked) setIsOpen(true)
    }, [isInitiallyDeepLinked])

    const handleOpenDetail = useCallback(() => setIsOpen(true), [])

    const handleOpenChange = useCallback((open: boolean) => {
        setIsOpen(open)
        if (!open && isInitiallyDeepLinked) {
            const newParams = new URLSearchParams(searchParams)
            newParams.delete("id")
            setSearchParams(newParams, { replace: true })
        }
    }, [isInitiallyDeepLinked, searchParams, setSearchParams])

    const hasMultipleChildren = order.childOrders.length > 1
    const hasRefund = order.refundingAmount > 0 || order.refundedAmount > 0
    const totalItems = order.childOrders.reduce((sum, c) => sum + (c.itemCount || 0), 0)

    // Determine overall type for display
    const orderTypeInfo = useMemo(() => {
        if (!hasMultipleChildren) {
            const type = getChildOrderType(order.childOrders[0]?.orderCode || '')
            return {
                label: type === 'customize' ? 'Custom Order' : 'Product Order',
                icon: type === 'customize' ? Palette : Package,
            }
        }
        return { label: 'Mixed Order', icon: Package }
    }, [hasMultipleChildren, order.childOrders])

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
            <div className="p-6">
                <div className="flex flex-col md:flex-row gap-5">
                    {/* Left: Order identity */}
                    <div className="flex items-start gap-4 flex-1">
                        <div className="relative shrink-0">
                            <div className={cn(
                                "w-14 h-14 rounded-xl border flex items-center justify-center",
                                hasMultipleChildren
                                    ? "bg-gradient-to-br from-violet-50 to-sky-50 border-violet-100/50"
                                    : "bg-slate-50 border-slate-100"
                            )}>
                                <orderTypeInfo.icon className={cn(
                                    "w-6 h-6",
                                    hasMultipleChildren ? "text-violet-400" : "text-slate-300"
                                )} />
                            </div>
                            {totalItems > 0 && (
                                <Badge className="absolute -top-2 -right-2 h-5 min-w-[20px] rounded-md bg-slate-900 text-white border-2 border-white font-bold text-[9px] flex items-center justify-center shadow-sm">
                                    {totalItems}
                                </Badge>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-[15px] font-bold text-slate-900 tracking-tight">
                                #{order.checkoutOrderCode}
                            </h4>
                            <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                                {orderTypeInfo.label} · {order.childOrders.length} {order.childOrders.length === 1 ? 'order' : 'sub-orders'}
                            </p>

                            {/* Child Orders Summary Pills */}
                            <div className="flex flex-wrap gap-1.5 mt-3">
                                {order.childOrders.map((child) => {
                                    const childTheme = getStatusTheme(child.status)
                                    const childType = getChildOrderType(child.orderCode)
                                    return (
                                        <div
                                            key={child.id}
                                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-100 bg-slate-50/50 text-[9px] font-bold"
                                        >
                                            {childType === 'customize'
                                                ? <Palette className="w-3 h-3 text-violet-400" />
                                                : <Package className="w-3 h-3 text-sky-400" />
                                            }
                                            <span className="text-slate-500">
                                                {childType === 'customize' ? 'Custom' : 'Standard'}
                                            </span>
                                            <span className="w-1 h-1 rounded-full" style={{ backgroundColor: childTheme.color }} />
                                            <span style={{ color: childTheme.color }} className="uppercase tracking-wider">
                                                {childTheme.label}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Right: Totals */}
                    <div className="flex flex-col items-end justify-center gap-1 sm:text-right flex-shrink-0">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Amount</p>
                        <p className="text-xl font-black text-slate-900 tracking-tight">{formatPrice(order.totalAmount)}</p>
                        {hasRefund && (
                            <div className="flex items-center gap-1.5 mt-1">
                                <RotateCcw className="w-3 h-3 text-amber-500" />
                                <span className="text-[10px] font-bold text-amber-600">
                                    {order.refundedAmount > 0 && `Refunded ${formatPrice(order.refundedAmount)}`}
                                    {order.refundingAmount > 0 && order.refundedAmount > 0 && ' · '}
                                    {order.refundingAmount > 0 && `Processing ${formatPrice(order.refundingAmount)}`}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 bg-slate-50/30 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button
                    variant="outline"
                    className="h-9 px-5 rounded-lg text-xs font-bold uppercase tracking-wider border-slate-200 hover:bg-white transition-all"
                    onClick={handleOpenDetail}
                >
                    View Details
                    <ChevronRight className="w-3.5 h-3.5 ml-1 text-slate-400" />
                </Button>
            </div>

            {/* Clickable area for the whole card */}
            <div
                className="absolute inset-x-0 top-0 h-[calc(100%-52px)] cursor-pointer z-0"
                onClick={handleOpenDetail}
            />

            <Suspense fallback={null}>
                <CheckoutOrderDetailDialog
                    checkoutOrder={order}
                    open={isOpen}
                    onOpenChange={handleOpenChange}
                />
            </Suspense>
        </Card>
    )
})

CheckoutOrderCard.displayName = 'CheckoutOrderCard'
