import { Package, CheckCircle2, Truck, Clock3, AlertCircle, ShieldCheck, RotateCcw, MapPin, PackageCheck } from "lucide-react"
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
        color: "#3b82f6", // Blue 500
        step: 3,
        description: "On the way to your home"
    },
    Arrived: {
        label: "Arrived",
        variant: "default",
        icon: <MapPin className="h-4 w-4" />,
        color: "#0ea5e9", // Sky 500
        step: 4,
        description: "Package reached your vicinity"
    },
    Delivered: {
        label: "Delivered",
        variant: "default",
        icon: <PackageCheck className="h-4 w-4" />,
        color: "#4f46e5", // Indigo 600
        step: 4.5,
        description: "Package arrived safely"
    },
    Completed: {
        label: "Completed",
        variant: "success",
        icon: <ShieldCheck className="h-4 w-4" />,
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
    Returning: {
        label: "Returning",
        variant: "warning",
        icon: <RotateCcw className="h-4 w-4" />,
        color: "#f59e0b",
        step: 6,
        description: "Order is being returned"
    },
    Returned: {
        label: "Returned",
        variant: "danger",
        icon: <AlertCircle className="h-4 w-4" />,
        color: "#e11d48", // Rose 600
        step: 7,
        description: "Items received back at our hub"
    },
    Refunded: {
        label: "Refunded",
        variant: "success",
        icon: <CheckCircle2 className="h-4 w-4" />,
        color: "#10b981", // Emerald 500
        step: 5,
        description: "Your refund has been processed successfully"
    }
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
    [OrderStatusValue.Returned]: THEME_MAP.Returned,
    [OrderStatusValue.Returning]: THEME_MAP.Returning,
    [OrderStatusValue.RefundedAndRestocked]: THEME_MAP.Refunded,
    [OrderStatusValue.RefundedAndDamaged]: THEME_MAP.Refunded,
    "Pending": THEME_MAP.Pending,
    "Confirmed": THEME_MAP.Confirmed,
    "Processing": THEME_MAP.Processing,
    "Shipping": THEME_MAP.Shipping,
    "Delivering": THEME_MAP.Shipping,
    "Arrived": THEME_MAP.Arrived,
    "Delivered": THEME_MAP.Delivered,
    "Completed": THEME_MAP.Completed,
    "Cancelled": THEME_MAP.Cancelled,
    "Returned": THEME_MAP.Returned,
    "Returning": THEME_MAP.Returning,
    "RefundedAndRestocked": THEME_MAP.Refunded,
    "RefundedAndDamaged": THEME_MAP.Refunded,
    // API may return parenthesized or spaced variants
    "Refunded (Restocked)": THEME_MAP.Refunded,
    "Refunded (Damaged)": THEME_MAP.Refunded,
    "Refunded(Restocked)": THEME_MAP.Refunded,
    "Refunded(Damaged)": THEME_MAP.Refunded,
    "Refunded": THEME_MAP.Refunded,
    "RefundedRestocked": THEME_MAP.Refunded,
    "RefundedDamaged": THEME_MAP.Refunded,
}

// Robust status theme resolver — handles all API response formats
export function getStatusTheme(status: string | number): StatusThemeItem {
    // 1. Direct lookup
    if (STATUS_THEME[status]) return STATUS_THEME[status];

    // 2. String coercion lookup (handles number -> string mismatch)
    const str = String(status);
    if (STATUS_THEME[str]) return STATUS_THEME[str];

    // 3. Refund keyword detection (catch-all for any refund variant)
    const lower = str.toLowerCase();
    if (lower.includes("refund")) return THEME_MAP.Refunded;
    if (lower.includes("return")) return THEME_MAP.Returning;

    // 4. Fallback
    return THEME_MAP.Pending;
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
