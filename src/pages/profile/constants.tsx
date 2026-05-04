import { Package, CheckCircle2, Truck, Clock3, AlertCircle, ShieldCheck, RotateCcw, MapPin, PackageCheck, MinusCircle } from "lucide-react"
import { OrderStatusValue } from "@/api/types/order"
import { resolveTradeInStatusTheme } from "@/utils/tradeInStatusTheme"

export type BadgeVariant = "default" | "secondary" | "success" | "warning" | "danger" | "outline" | "amber" | "sky"

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
        variant: "sky",
        icon: <CheckCircle2 className="h-4 w-4" />,
        color: "#0ea5e9", // Sky 500 (Admin Sky)
        step: 1,
        description: "Your order has been confirmed"
    },
    Processing: {
        label: "Processing",
        variant: "amber",
        icon: <Package className="h-4 w-4" />,
        color: "#f97316", // Orange 500 (Admin Amber/Processing)
        step: 2,
        description: "We are carefully packing your items"
    },
    Shipping: {
        label: "Shipping",
        variant: "outline",
        icon: <Truck className="h-4 w-4" />,
        color: "#2563eb", // Blue 600 (Admin Info)
        step: 3,
        description: "On the way to your home"
    },
    Arrived: {
        label: "Arrived",
        variant: "sky",
        icon: <MapPin className="h-4 w-4" />,
        color: "#0ea5e9", // Sky 500
        step: 4,
        description: "Package reached your vicinity"
    },
    Delivered: {
        label: "Delivered",
        variant: "default",
        icon: <PackageCheck className="h-4 w-4" />,
        color: "#4988c4", // Primary 500
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
        variant: "secondary",
        icon: <RotateCcw className="h-4 w-4" />,
        color: "#4988c4", // Primary 500 (Admin Primary)
        step: 6,
        description: "Order is being returned"
    },
    Returned: {
        label: "Returned",
        variant: "danger",
        icon: <AlertCircle className="h-4 w-4" />,
        color: "#e11d48", // Rose 600 (Admin Danger)
        step: 7,
        description: "Items received back at our hub"
    },
    ReturnedAndRefunding: {
        label: "Returned & Refunding",
        variant: "amber",
        icon: <RotateCcw className="h-4 w-4" />,
        color: "#f59e0b", // Amber 500
        step: 8,
        description: "Items returned and refund is being processed"
    },
    ReturnedAndRefunded: {
        label: "Returned & Refunded",
        variant: "success",
        icon: <CheckCircle2 className="h-4 w-4" />,
        color: "#10b981", // Emerald 500
        step: 9,
        description: "Items returned and refund completed"
    },
    ExchangeRequested: {
        label: "Exchange Requested",
        variant: "sky",
        icon: <RotateCcw className="h-4 w-4" />,
        color: "#0ea5e9", // Sky 500
        step: 2,
        description: "You have requested an exchange"
    },
    ShippingReplacement: {
        label: "Shipping Replacement",
        variant: "outline",
        icon: <Truck className="h-4 w-4" />,
        color: "#2563eb", // Blue 600
        step: 3,
        description: "Replacement item is on the way"
    },
    Refunded: {
        label: "Refunded",
        variant: "success",
        icon: <CheckCircle2 className="h-4 w-4" />,
        color: "#10b981", // Emerald 500
        step: 5,
        description: "Your refund has been processed successfully"
    },
    Rescheduled: {
        label: "Rescheduled",
        variant: "amber",
        icon: <RotateCcw className="h-4 w-4" />,
        color: "#f59e0b", // Amber 500
        step: 2,
        description: "Your service has been rescheduled to a new date"
    },
    Rejected: {
        label: "Rejected",
        variant: "danger",
        icon: <AlertCircle className="h-4 w-4" />,
        color: "#e11d48", // Rose 600
        step: -1,
        description: "This order was rejected"
    },
    PartialRefunded: {
        label: "Partial Refunded",
        variant: "amber",
        icon: <RotateCcw className="h-4 w-4" />,
        color: "#f59e0b", // Amber 500
        step: 5,
        description: "Some items have been refunded"
    },
    Refunding: {
        label: "Refunding",
        variant: "amber",
        icon: <RotateCcw className="h-4 w-4" />,
        color: "#f97316", // Orange 500
        step: 5,
        description: "Refund in progress"
    },
    PartialCompleted: {
        label: "Partial Completed",
        variant: "secondary",
        icon: <MinusCircle className="h-4 w-4" />,
        color: "#64748b", // Slate 500
        step: 5,
        description: "Some items in this batch have been completed"
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
    [OrderStatusValue.ReturnedAndRefunding]: THEME_MAP.ReturnedAndRefunding,
    [OrderStatusValue.ReturnedAndRefunded]: THEME_MAP.ReturnedAndRefunded,
    [OrderStatusValue.ExchangeRequested]: THEME_MAP.ExchangeRequested,
    [OrderStatusValue.Shipping_Replacement]: THEME_MAP.ShippingReplacement,
    "Pending": THEME_MAP.Pending,
    "Confirmed": THEME_MAP.Confirmed,
    "Processing": THEME_MAP.Processing,
    "Shipping": THEME_MAP.Shipping,
    "Delivering": THEME_MAP.Shipping,
    "Arrived": THEME_MAP.Arrived,
    "Delivered": THEME_MAP.Delivered,
    "Completed": THEME_MAP.Completed,
    "Cancelled": THEME_MAP.Cancelled,
    "AdminCancelled": THEME_MAP.Cancelled,
    "Admin_Cancelled": THEME_MAP.Cancelled,
    "ForcedCancelled": THEME_MAP.Cancelled,
    "Forced_Cancelled": THEME_MAP.Cancelled,
    "Returned": THEME_MAP.Returned,
    "Returning": THEME_MAP.Returning,
    "ReturnedAndRefunding": THEME_MAP.ReturnedAndRefunding,
    "ReturnedAndRefunded": THEME_MAP.ReturnedAndRefunded,
    "RefundedAndRestocked": THEME_MAP.ReturnedAndRefunding,
    "RefundedAndDamaged": THEME_MAP.ReturnedAndRefunded,
    "ExchangeRequested": THEME_MAP.ExchangeRequested,
    "Shipping_Replacement": THEME_MAP.ShippingReplacement,
    "ShippingReplacement": THEME_MAP.ShippingReplacement,
    // API may return parenthesized or spaced variants
    "Returned & Refunding": THEME_MAP.ReturnedAndRefunding,
    "Returned & Refunded": THEME_MAP.ReturnedAndRefunded,
    "Refunded (Restocked)": THEME_MAP.ReturnedAndRefunding,
    "Refunded (Damaged)": THEME_MAP.ReturnedAndRefunded,
    "Refunded(Restocked)": THEME_MAP.ReturnedAndRefunding,
    "Refunded(Damaged)": THEME_MAP.ReturnedAndRefunded,
    "Refunded": THEME_MAP.Refunded,
    "RefundedRestocked": THEME_MAP.ReturnedAndRefunding,
    "RefundedDamaged": THEME_MAP.ReturnedAndRefunded,
    "Rescheduled": THEME_MAP.Rescheduled,
    "Rejected": THEME_MAP.Rejected,
    "PartialRefunded": THEME_MAP.PartialRefunded,
    "Partial Refunded": THEME_MAP.PartialRefunded,
    "Refunding": THEME_MAP.Refunding,
    "PartialCompleted": THEME_MAP.PartialCompleted,
    "Partial Completed": THEME_MAP.PartialCompleted,
    "Partial_Completed": THEME_MAP.PartialCompleted,
}

// Robust status theme resolver — handles all API response formats
export function getStatusTheme(status: string | number): StatusThemeItem {
    // 1. Direct lookup
    if (STATUS_THEME[status]) return STATUS_THEME[status];

    // 2. String coercion lookup (handles number -> string mismatch)
    const str = String(status);
    if (STATUS_THEME[str]) return STATUS_THEME[str];

    // 3. Keyword detection (catch-all for variants)
    const lower = str.toLowerCase();
    if (lower.includes("refund")) return THEME_MAP.Refunded;
    if (lower.includes("return")) return THEME_MAP.Returning;
    if (lower.includes("reschedule")) return THEME_MAP.Rescheduled;
    if (lower.includes("reject")) return THEME_MAP.Rejected;
    if (lower.includes("cancel")) return THEME_MAP.Cancelled;

    // 4. Fallback
    return THEME_MAP.Pending;
}

export function getTradeInStatusTheme(status: string | number): StatusThemeItem {
    return resolveTradeInStatusTheme(status);
}

// Voucher Status Theme
export const VOUCHER_STATUS_COLORS: Record<
    string,
    { bg: string; text: string; border: string }
> = {
    claimable: {
        bg: "bg-blue-50",
        text: "text-blue-700",
        border: "border-blue-200",
    },
    active: {
        bg: "bg-green-50",
        text: "text-green-700",
        border: "border-green-200",
    },
    used: { bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-200" },
    expired: { bg: "bg-red-50", text: "text-red-600", border: "border-red-200" },
};
