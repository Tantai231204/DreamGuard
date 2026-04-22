import apiClient from "../../lib/api";

export interface ProductType {
    productTypeId: string;
    productTypeName: string;
    isActive: boolean;
}

export interface AdminProductTypeResponse {
    items: ProductType[];
    totalCount: number;
    totalPages: number;
    pageNumber: number;
    pageSize: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}

export interface CreateProductTypeRequest {
    ProductTypeName: string;
    IsActive: boolean;
}

export interface UpdateProductTypeRequest {
    ProductTypeName: string;
    IsActive?: boolean; // Added for status management via Update
}

const productTypeService = {
    adminSearch: (params: {
        pageNumber?: number;
        pageSize?: number;
        isActive?: boolean;
        Key?: string
    }): Promise<AdminProductTypeResponse> =>
        apiClient.get('/ProductTypes/AdminSearchProductType', { params }).then(res => res.data?.data ?? res.data),

    getAll: (data?: {
        pageNumber?: number;
        pageSize?: number;
        exceedProductTypeIds?: string[];
    }): Promise<AdminProductTypeResponse> =>
        apiClient.post('/ProductTypes/get-all', data || {}).then(res => res.data?.data ?? res.data),

    getById: (id: string): Promise<ProductType> =>
        apiClient.get(`/ProductTypes/${id}`).then(res => res.data?.data ?? res.data),

    create: (data: CreateProductTypeRequest): Promise<ProductType> => {
        return apiClient.post('/ProductTypes', data).then(res => res.data?.data ?? res.data);
    },

    update: (id: string, data: UpdateProductTypeRequest): Promise<ProductType> => {
        return apiClient.put(`/ProductTypes/${id}`, data).then(res => res.data?.data ?? res.data);
    },

    // Using DELETE method for Deactivation as per user confirmation
    delete: (id: string): Promise<void> =>
        apiClient.delete(`/ProductTypes/${id}`).then(res => res.data?.data ?? res.data),

    assignPackages: (productTypeId: string, data: { requests: { servicePackageId: string, price: number }[] }): Promise<void> =>
        apiClient.post(`/ProductTypes/${productTypeId}/packages`, data).then(res => res.data?.data ?? res.data),
};

export default productTypeService;
