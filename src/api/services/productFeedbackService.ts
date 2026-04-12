import apiClient from '@/lib/api';
import type { ProductFeedbackPayload, ProductFeedbackResponse } from '@/api/types/feedback';
import type { PaginatedResponse } from '@/api/types';

const productFeedbackService = {
  createFeedback: async (orderItemId: string, payload: ProductFeedbackPayload): Promise<ProductFeedbackResponse> => {
    const res = await apiClient.post(`/ProductFeedbacks/${orderItemId}`, payload);
    return res.data?.data ?? res.data;
  },

  getFeedbackByOrderItemId: async (orderItemId: string): Promise<ProductFeedbackResponse | null> => {
    try {
      const res = await apiClient.get(`/ProductFeedbacks/OrderItem/${orderItemId}`);
      return res.data?.data ?? res.data;
    } catch {
       // If the API returns 404 when no feedback exists, we handle it
       return null;
    }
  },

  getProductFeedbacks: async (productId: string): Promise<PaginatedResponse<ProductFeedbackResponse>> => {
    const res = await apiClient.get(`/ProductFeedbacks/products/${productId}`);
    return res.data;
  },
  
  updateStatus: async (feedbackId: string, status: string): Promise<ProductFeedbackResponse> => {
    const res = await apiClient.put(`/ProductFeedbacks/${feedbackId}/status`, {}, { params: { status } });
    return res.data?.data ?? res.data;
  }
};

export default productFeedbackService;
