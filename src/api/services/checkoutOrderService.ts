import apiClient from '../../lib/api';
import type { CustomAxiosRequestConfig } from '../../lib/api';
import type { PaginatedCheckoutOrders } from '../types/checkoutOrder';

const checkoutOrderService = {
    /**
     * Get paginated checkout orders for the current user.
     */
    getCheckoutOrders: async (params?: import('../types/checkoutOrder').CheckoutOrderQueryParams): Promise<PaginatedCheckoutOrders> => {
        const res = await apiClient.get('/checkout-product-order', { params });
        return res.data?.data ?? res.data;
    },

    /**
     * Get paginated checkout orders for admin.
     */
    getAdminCheckoutOrders: async (params?: import('../types/checkoutOrder').CheckoutOrderQueryParams): Promise<PaginatedCheckoutOrders> => {
        const res = await apiClient.get('/checkout-product-order/admin', { params });
        return res.data?.data ?? res.data;
    },

    /**
     * Cancel an entire checkout order.
     * Use for: COD orders or VnPay unpaid (Pending) orders.
     */
    cancelCheckoutOrder: async (id: string): Promise<void> => {
        const config: CustomAxiosRequestConfig = { _suppressToast: true };
        await apiClient.patch(`/checkout-product-order/${id}/cancelled`, {}, config);
    },

    /**
     * Cancel an individual child order.
     * Use for: VnPay paid (Confirmed) orders → triggers auto-refund.
     * Falls back to the existing order cancel endpoint since child orders
     * use the standard Order entity.
     */
    cancelChildOrder: async (childOrderId: string): Promise<void> => {
        const config: CustomAxiosRequestConfig = { _suppressToast: true };
        await apiClient.put(`/order/${childOrderId}/cancel`, {}, config);
    },

    /**
     * Confirm an entire checkout order.
     * Use for: Admin confirming a COD order or manual payment order.
     */
    confirmCheckoutOrder: async (checkoutOrderId: string): Promise<void> => {
        const config: CustomAxiosRequestConfig = { _suppressToast: true };
        await apiClient.patch(`/checkout-product-order/admin/${checkoutOrderId}/confirmed`, {}, config);
    },
};

export default checkoutOrderService;
