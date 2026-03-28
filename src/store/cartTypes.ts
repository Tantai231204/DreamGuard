export interface TradeInItem {
    id: string
    name: string
    image: string
    originalPrice: number
    tradeInValue: number
}

export interface CartItem {
    id: string
    productId?: string
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
    isCustom?: boolean
    customAttributes?: {
        length?: number;
        width?: number;
        thickness?: number;
        colorHex?: string;
    }
    customizeTypeIds?: string[]
    ProductCustomizeDetailRequest?: Array<{
        ProductCustomizeTypeId: string;
        CustomizeContent: string;
    }>
}
