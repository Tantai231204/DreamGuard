export interface TradeInItem {
    id: string
    name: string
    image: string
    originalPrice: number
    tradeInValue: number
}

export interface CartItem {
    id: string
    name: string
    image: string
    price: number
    quantity: number
    subtotal: number
    productVariantId: string | null
    tradeIn?: {
        products: TradeInItem[]
        totalValue: number
    }
    color?: string
    size?: string
    comboId?: string | null
    sku?: string
    availableStock?: number
    isAvailable?: boolean
}
