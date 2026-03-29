import { Package, CheckCircle2, Truck, Clock3, AlertCircle } from "lucide-react"
import { OrderStatusValue } from "@/api/types/order"

export type BadgeVariant = "default" | "secondary" | "success" | "warning" | "danger" | "outline"

interface StatusThemeItem {
    label: string
    variant: BadgeVariant
    icon: React.ReactNode
    color: string
    step: number
    description: string
}

const THEME_MAP: Record<string, StatusThemeItem> = {
    Pending: {
        label: "Pending",
        variant: "warning",
        icon: <Clock3 className="h-4 w-4" />,
        color: "#f59e0b", // Amber 500
        step: 0,
        description: "Wait for us to verify your order"
    },
    Confirmed: {
        label: "Confirmed",
        variant: "default",
        icon: <CheckCircle2 className="h-4 w-4" />,
        color: "#2563eb", // Blue 600
        step: 1,
        description: "Your order has been confirmed"
    },
    Processing: {
        label: "Processing",
        variant: "secondary",
        icon: <Package className="h-4 w-4" />,
        color: "#2563eb", // Blue 600
        step: 2,
        description: "We are carefully packing your items"
    },
    Shipping: {
        label: "Shipping",
        variant: "outline",
        icon: <Truck className="h-4 w-4" />,
        color: "#2563eb", // Blue 600
        step: 3,
        description: "On the way to your home"
    },
    Delivered: {
        label: "Delivered",
        variant: "success",
        icon: <CheckCircle2 className="h-4 w-4" />,
        color: "#10b981", // Emerald 500
        step: 4,
        description: "Package arrived safely"
    },
    Completed: {
        label: "Completed",
        variant: "success",
        icon: <CheckCircle2 className="h-4 w-4" />,
        color: "#10b981", // Emerald 500
        step: 5,
        description: "Order finished. Thank you!"
    },
    Cancelled: {
        label: "Cancelled",
        variant: "danger",
        icon: <AlertCircle className="h-4 w-4" />,
        color: "#e11d48", // Rose 600
        step: -1,
        description: "This order was cancelled"
    },
}

// Map both numeric values and string names to the same theme objects
export const STATUS_THEME: Record<string | number, StatusThemeItem> = {
    ...THEME_MAP,
    [OrderStatusValue.Pending]: THEME_MAP.Pending,
    [OrderStatusValue.Confirmed]: THEME_MAP.Confirmed,
    [OrderStatusValue.Processing]: THEME_MAP.Processing,
    [OrderStatusValue.Shipping]: THEME_MAP.Shipping,
    [OrderStatusValue.Delivered]: THEME_MAP.Delivered,
    [OrderStatusValue.Completed]: THEME_MAP.Completed,
    [OrderStatusValue.Cancelled]: THEME_MAP.Cancelled,
}

// Voucher Status Theme
export const VOUCHER_STATUS_COLORS: Record<
    string,
    { bg: string; text: string; border: string }
> = {
    active: {
        bg: "bg-green-50",
        text: "text-green-700",
        border: "border-green-200",
    },
    used: { bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-200" },
    expired: { bg: "bg-red-50", text: "text-red-600", border: "border-red-200" },
};
