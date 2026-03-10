import React from "react"
import { Package, CheckCircle2, Truck, Clock3, AlertCircle } from "lucide-react"
import { OrderStatusValue } from "@/api/types/order"

export type BadgeVariant = "default" | "secondary" | "success" | "warning" | "danger" | "outline"

export const STATUS_THEME: Record<string | number, {
    label: string,
    variant: BadgeVariant,
    icon: React.ReactNode,
    color: string,
    step: number,
    description: string
}> = {
    [OrderStatusValue.Pending]: { label: "Pending", variant: "warning", icon: <Clock3 className="h-4 w-4" />, color: "#f59e0b", step: 0, description: "Wait for us to verify your order" },
    [OrderStatusValue.Confirmed]: { label: "Confirmed", variant: "default", icon: <CheckCircle2 className="h-4 w-4" />, color: "#4988c4", step: 1, description: "Your order has been confirmed" },
    [OrderStatusValue.Processing]: { label: "Processing", variant: "secondary", icon: <Package className="h-4 w-4" />, color: "#6366f1", step: 2, description: "We are carefully packing your items" },
    [OrderStatusValue.Shipping]: { label: "Shipping", variant: "outline", icon: <Truck className="h-4 w-4" />, color: "#06b6d4", step: 3, description: "On the way to your home" },
    [OrderStatusValue.Delivered]: { label: "Delivered", variant: "success", icon: <CheckCircle2 className="h-4 w-4" />, color: "#10b981", step: 4, description: "Package arrived safely" },
    [OrderStatusValue.Completed]: { label: "Completed", variant: "success", icon: <CheckCircle2 className="h-4 w-4" />, color: "#10b981", step: 5, description: "Order finished. Thank you!" },
    [OrderStatusValue.Cancelled]: { label: "Cancelled", variant: "danger", icon: <AlertCircle className="h-4 w-4" />, color: "#ef4444", step: -1, description: "This order was cancelled" },

    // String mapping
    "Pending": { label: "Pending", variant: "warning", icon: <Clock3 className="h-4 w-4" />, color: "#f59e0b", step: 0, description: "Wait for us to verify your order" },
    "Confirmed": { label: "Confirmed", variant: "default", icon: <CheckCircle2 className="h-4 w-4" />, color: "#4988c4", step: 1, description: "Your order has been confirmed" },
    "Processing": { label: "Processing", variant: "secondary", icon: <Package className="h-4 w-4" />, color: "#6366f1", step: 2, description: "We are carefully packing your items" },
    "Shipping": { label: "Shipping", variant: "outline", icon: <Truck className="h-4 w-4" />, color: "#06b6d4", step: 3, description: "On the way to your home" },
    "Delivered": { label: "Delivered", variant: "success", icon: <CheckCircle2 className="h-4 w-4" />, color: "#10b981", step: 4, description: "Package arrived safely" },
    "Completed": { label: "Completed", variant: "success", icon: <CheckCircle2 className="h-4 w-4" />, color: "#10b981", step: 5, description: "Order finished. Thank you!" },
    "Cancelled": { label: "Cancelled", variant: "danger", icon: <AlertCircle className="h-4 w-4" />, color: "#ef4444", step: -1, description: "This order was cancelled" },
}
