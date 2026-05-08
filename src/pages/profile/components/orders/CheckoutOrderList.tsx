import { memo } from "react"
import type { CheckoutOrderResponse } from "@/api/types/checkoutOrder"
import { EmptyState } from "./EmptyState"
import { CheckoutOrderCard } from "./CheckoutOrderCard"

interface CheckoutOrderListProps {
    orders: CheckoutOrderResponse[]
    isFilterActive: boolean
}

export const CheckoutOrderList = memo(({ orders, isFilterActive }: CheckoutOrderListProps) => {
    if (orders.length === 0) return <EmptyState isFilter={isFilterActive} orderType="product" />
    return (
        <div className="space-y-4">
            {orders.map((order) => (
                <CheckoutOrderCard key={order.id} order={order} />
            ))}
        </div>
    )
})

CheckoutOrderList.displayName = 'CheckoutOrderList'
