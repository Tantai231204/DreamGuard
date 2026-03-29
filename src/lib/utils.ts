import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

export function formatTime(date: string | Date) {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
}

export function formatDateTime(date: string | Date) {
    if (!date) return 'N/A';
    return `${formatDate(date)} ${formatTime(date)}`;
}

export function formatPrice(price: number | string | undefined | null) {
    if (price === undefined || price === null || price === "") return "0 ₫";
    const num = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(num)) return "0 ₫";
    return Math.round(num).toLocaleString('vi-VN') + " ₫";
}

/**
 * Format helper for price input (1000 -> 1.000)
 */
export function formatNumber(value: string | number | undefined) {
    if (value === 0 || value === "0") return "0";
    if (!value) return "";
    const num = value.toString().replace(/\D/g, "");
    if (!num) return "";
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/**
 * Unformat helper for price input (1.000 -> 1000)
 */
export function unformatNumber(value: string | number | undefined): number {
    if (value === undefined || value === null || value === "") return 0;
    if (typeof value === "number") return value;
    const cleanNum = value.toString().replace(/\D/g, "");
    return parseInt(cleanNum, 10) || 0;
}
