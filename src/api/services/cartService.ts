import apiClient from '../../lib/api';

export interface AddCartItemRequest {
    productVariantId: string | null;
    comboId: string | null;
    quantity: number;
    ProductCustomizeDetailRequest?: Array<{
        ProductCustomizeTypeId: string;
        CustomizeContent: string;
    }>;
    configHash?: string;
}

export interface CartItemResponse {
    id: string;
    productVariantId: string | null;
    comboId: string | null;
    itemName: string;
    sku: string;
    imageUrl: string;
    unitPrice: number;
    quantity: number;
    subTotal: number;
    availableStock: number;
    isAvailable: boolean;
    productCustomizeDetails: Array<{
        customizeTypeName: string;
        customizeContent: string;
        addOnPrice: number;
    }>;
    totalAddOnPrice: number;
}

export interface CartResponse {
    cartId: string;
    items: CartItemResponse[];
    totalAmount: number;
    totalItems: number;
}

const cartService = {
    getCart: (): Promise<CartResponse> =>
        apiClient.get('/cart').then((res) => res.data),

    addItem: (data: AddCartItemRequest): Promise<CartResponse> =>
        apiClient.post('/cart/items', data).then((res) => res.data),

    updateItem: (itemId: string, quantity: number): Promise<CartResponse> =>
        apiClient.put(`/cart/items/${itemId}`, { quantity }).then((res) => res.data),

    removeItem: (itemId: string): Promise<void> =>
        apiClient.delete(`/cart/items/${itemId}`).then((res) => res.data),

    syncCart: (items: AddCartItemRequest[]): Promise<CartResponse> =>
        apiClient.post('/cart/sync', { items }).then((res) => res.data),

    clearCart: (): Promise<void> =>
        apiClient.delete('/cart').then((res) => res.data),
};

export default cartService;
