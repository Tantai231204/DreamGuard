import React, { memo, useCallback, useMemo, lazy, Suspense } from "react"
import { Store, Package, Palette, ChevronRight, RotateCcw, Layers, ShieldCheck } from "lucide-react"
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
        return { label: 'Combined Order', icon: Layers }
    }, [hasMultipleChildren, order.childOrders])

    return (
        <Card className="group relative rounded-xl border-slate-200 bg-white shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md">
            {/* Header */}
            <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                        <Store className="w-4 h-4 text-slate-500" />
                    </div>
                    <div>
                        <span className="text-sm font-bold text-slate-900">DreamGuard Store</span>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{formatDate(order.createdAt)}</p>
                    </div>
                </div>
                <Badge
                    variant="outline"
                    className="w-fit px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border-slate-200 bg-white"
                    style={{ color: theme.color, borderColor: `${theme.color}30` }}
                >
                    <span className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: theme.color }} />
                    {theme.label}
                </Badge>
            </div>

            {/* Body */}
            <div className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Left: Order identity */}
                    <div className="flex items-start gap-4 flex-1">
                        <div className="relative shrink-0">
                            <div className={cn(
                                "w-12 h-12 rounded border flex items-center justify-center",
                                hasMultipleChildren
                                    ? "bg-slate-900 border-slate-900 shadow-md"
                                    : "bg-slate-50 border-slate-100"
                            )}>
                                <orderTypeInfo.icon className={cn(
                                    "w-5 h-5",
                                    hasMultipleChildren ? "text-white" : "text-slate-400"
                                )} />
                            </div>
                            {totalItems > 0 && (
                                <Badge className="absolute -top-2 -right-2 h-5 min-w-[20px] rounded bg-slate-900 text-white border-2 border-white font-black text-[9px] flex items-center justify-center shadow-sm">
                                    {totalItems}
                                </Badge>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-[14px] font-bold text-slate-900 tracking-tight">
                                #{order.checkoutOrderCode}
                            </h4>
                            <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider">
                                {orderTypeInfo.label} · {order.childOrders.length} Shipment{order.childOrders.length === 1 ? '' : 's'}
                            </p>

                            {/* Split Shipment Tracking Grid */}
                            <div className="mt-5 space-y-3">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Shipment Progress</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {order.childOrders.map((child) => {
                                        const childTheme = getStatusTheme(child.status)
                                        const childType = getChildOrderType(child.orderCode)
                                        const isCustom = childType === 'customize'

                                        return (
                                            <div
                                                key={child.id}
                                                className={cn(
                                                    "relative flex flex-col p-3 rounded-lg border transition-all duration-200",
                                                    isCustom
                                                        ? "bg-violet-50/20 border-violet-100/50"
                                                        : "bg-sky-50/20 border-sky-100/50"
                                                )}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        {isCustom ? <Palette className="w-3.5 h-3.5 text-violet-500" /> : <Package className="w-3.5 h-3.5 text-sky-500" />}
                                                        <span className="text-[10px] font-bold text-slate-900 tracking-tight">
                                                            {isCustom ? 'Custom' : 'Standard'}
                                                        </span>
                                                    </div>
                                                    <span
                                                        className="text-[9px] font-black uppercase tracking-widest"
                                                        style={{ color: childTheme.color }}
                                                    >
                                                        {childTheme.label}
                                                    </span>
                                                </div>

                                                {/* Flatter Progress Bar */}
                                                <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden mb-2">
                                                    <div
                                                        className="h-full transition-all duration-1000"
                                                        style={{
                                                            width: `${Math.max(10, (childTheme.step / 5) * 100)}%`,
                                                            backgroundColor: childTheme.color
                                                        }}
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-bold text-slate-900">{formatPrice(child.totalAmount)}</span>
                                                    <span className="text-[8px] font-black text-slate-300 uppercase">ACTIVE Tracking</span>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Totals */}
                    <div className="flex flex-col items-end justify-center gap-1 sm:text-right flex-shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-50">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Order Value</p>
                        <p className="text-xl font-black text-slate-900 tracking-tight">{formatPrice(order.totalAmount)}</p>
                        {hasRefund && (
                            <div className="flex items-center gap-1.5 mt-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                                <RotateCcw className="w-3 h-3 text-amber-500" />
                                <span className="text-[9px] font-bold text-amber-600 uppercase tracking-tight">
                                    {order.refundedAmount > 0 && `Refunded ${formatPrice(order.refundedAmount)}`}
                                    {order.refundingAmount > 0 && order.refundedAmount > 0 && ' · '}
                                    {order.refundingAmount > 0 && `Refunding ${formatPrice(order.refundingAmount)}`}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#4988c4]" />
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Protected Checkout</span>
                </div>
                <Button
                    variant="outline"
                    className="h-9 px-6 rounded-md text-[10px] font-black uppercase tracking-widest border-slate-200 hover:bg-white hover:border-slate-900 hover:text-slate-900 transition-all"
                    onClick={handleOpenDetail}
                >
                    View Order Details
                    <ChevronRight className="w-3.5 h-3.5 ml-1.5 text-slate-400" />
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
