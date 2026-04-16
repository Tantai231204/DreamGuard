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
    productName?: string // Compatibility with code using productName
    image: string
    price: number
    quantity: number
    subtotal: number
    productVariantId: string | null
    comboId: string | null
    isAvailable?: boolean
    availableStock?: number
    sku?: string
    color?: string
    size?: string
    isCustom?: boolean
    ProductCustomizeDetailRequest?: Array<{ ProductCustomizeTypeId: string; CustomizeContent: string }>
    customAttributes?: {
        length?: number;
        width?: number;
        thickness?: number;
        colorHex?: string;
        [key: string]: string | number | undefined;
    }
    attributeSignature?: string
    configHash?: string
    tradeIn?: {
        totalValue: number;
        products: TradeInItem[];
    };
    productCustomizeDetails?: Array<{
        customizeTypeName: string;
        customizeContent: string;
        addOnPrice: number;
    }>;
}
