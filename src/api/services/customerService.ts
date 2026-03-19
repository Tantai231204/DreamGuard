import apiClient from '../../lib/api';
import type { CustomerPageResponse, CustomerResponse, CustomerParams } from '../types/customer.types';

const customerService = {
  getAllCustomers: async (params: CustomerParams = {}): Promise<CustomerPageResponse> => {
    const response = await apiClient.get('/customers/GetAllAsync', { params });
    return response.data?.data ?? response.data;
  },

  getCustomerById: async (id: string): Promise<CustomerResponse> => {
    const response = await apiClient.get(`/customers/${id}`);
    return response.data?.data ?? response.data;
  },
};

export default customerService;
