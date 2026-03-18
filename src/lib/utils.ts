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
    if (price === undefined || price === null || price === "") return "0 VNĐ";
    const num = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(num)) return "0 VNĐ";
    return Math.round(num).toLocaleString('vi-VN') + " VNĐ";
}
