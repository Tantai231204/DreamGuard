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

export function formatPrice(price: number) {
    return price.toLocaleString('vi-VN', {
        style: 'currency',
        currency: 'VND',
    });
}
