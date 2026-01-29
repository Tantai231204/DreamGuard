export type TabId =
    | "profile"
    | "babies"
    | "orders"
    | "wishlist"
    | "addresses"
    | "notifications"
    | "security"

export interface Tab {
    id: TabId
    label: string
    icon: React.ReactNode
    badge?: number
}

export interface BabyProfile {
    id: string
    name: string
    nickname?: string
    birthDate: string
    gender: "male" | "female"
    avatar?: string
    height?: number
    weight?: number
    notes?: string
    allergies?: string[]
}

export interface ProductRecommendation {
    id: string
    name: string
    price: number
    image: string
    forAge: string
    discount?: number
}

export interface Order {
    id: string
    createdAt: string
    status: "pending" | "processing" | "shipping" | "delivered" | "cancelled"
    total: number
    items: OrderItem[]
}

export interface OrderItem {
    name: string
    quantity: number
    price: number
    image: string
}

export interface WishlistItem {
    id: number
    name: string
    price: number
    originalPrice?: number
    image: string
    inStock: boolean
    discount?: number
    addedAt: string
}

export interface Address {
    id: string
    label: string
    recipient: string
    phone: string
    address: string
    type: "home" | "office"
    isDefault: boolean
}
