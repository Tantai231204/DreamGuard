import apiClient from '../../lib/api';

export interface AddCartItemRequest {
    productVariantId: string | null;
    comboId: string | null;
    quantity: number;
}

export interface CartItemResponse {
    id: string;
    productVariantId: string | null;
    comboId: string | null;
    productName: string;
    productImage: string;
    price: number;
    quantity: number;
    totalPrice: number;
}

export interface CartResponse {
    items: CartItemResponse[];
    totalAmount: number;
    itemCount: number;
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
};

export default cartService;
