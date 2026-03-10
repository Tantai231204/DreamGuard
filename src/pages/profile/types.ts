export type TabId =
    | "profile"
    | "babies"
    | "orders"
    | "resell"
    | "wishlist"
    | "vouchers"
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

export interface Voucher {
    id: string
    code: string
    title: string
    description: string
    discount: number
    discountType: "percentage" | "fixed"
    minPurchase: number
    maxDiscount?: number
    validFrom: string
    validTo: string
    status: "active" | "used" | "expired"
    usedAt?: string
    category?: string
    image?: string
    terms?: string[]
    usageInstructions?: string[]
    quantity?: number
    usedCount?: number
}
