import apiClient from "../../lib/api";

export interface ServicePackageMapping {
    servicePackageMappingId?: string;
    productTypeId: string;
    servicePackageId: string;
    price: number;
}

const servicePackageMappingService = {
    getAll: (params?: { 
        pageNumber?: number; 
        pageSize?: number; 
        servicePackageId?: string; 
        productTypeId?: string 
    }): Promise<{ items: ServicePackageMapping[] } | ServicePackageMapping[]> =>
        apiClient.get('/ServicePackageMappings', { params }).then(res => res.data?.data ?? res.data),

    assign: (data: { productTypeId: string; servicePackageId: string; price: number }): Promise<void> =>
        apiClient.post(`/ProductTypes/${data.productTypeId}/packages`, {
            requests: [
                {
                    servicePackageId: data.servicePackageId,
                    price: data.price
                }
            ]
        }).then(res => res.data?.data ?? res.data),

    update: (mappingId: string, data: { 
        price: number; 
        duration: number; 
        servicePackageId?: string;
        productTypeId?: string;
        servicePackage: { 
            packageName: string; 
            duration: number; 
            suitableFor: string; 
            benefits: string; 
            serviceContent: string 
        } 
    }): Promise<void> =>
        apiClient.put(`/ServicePackageMappings/${mappingId}`, data).then(res => res.data),

    delete: (mappingId: string): Promise<void> =>
        apiClient.delete(`/ServicePackageMappings/${mappingId}`).then(res => res.data?.data ?? res.data),
};

export default servicePackageMappingService;
