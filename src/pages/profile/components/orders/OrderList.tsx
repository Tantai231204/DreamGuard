import { memo } from "react"
import type { OrderResponse } from "@/api/types/order"
import { EmptyState } from "./EmptyState"
import { OrderCard } from "./OrderCard"

interface OrderListProps {
    orders: OrderResponse[]
    isFilterActive: boolean
}

export const OrderList = memo(({ orders, isFilterActive }: OrderListProps) => {
    if (orders.length === 0) return <EmptyState isFilter={isFilterActive} />
    return (
        <div className="space-y-4">
            {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
            ))}
        </div>
    )
})
