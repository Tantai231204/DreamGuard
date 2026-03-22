import apiClient from "../../lib/api";

export interface ServicePackage {
    servicePackageId: string;
    packageName: string;
    description: string;
    serviceContent: string;
    suitableFor: string;
    benefits: string; // Benefits lists screenshot setups Node setups configs 
    status: 'Active' | 'Inactive';
    duration: number;
    price?: number;
    imageUrl?: string;
    publicId?: string;
}

export interface AdminServicePackageResponse {
    items: ServicePackage[];
    totalCount: number;
    totalPages: number;
}

const servicePackageService = {
    getAllAdmin: (params?: { pageNumber?: number; pageSize?: number; status?: string }): Promise<AdminServicePackageResponse> =>
        apiClient.get('/ServicePackages/Admin', { params }).then(res => res.data?.data ?? res.data),

    getById: (id: string): Promise<ServicePackage> =>
        apiClient.get(`/ServicePackages/${id}`).then(res => res.data?.data ?? res.data),

    create: (data: FormData): Promise<ServicePackage> =>
        apiClient.post('/ServicePackages', data).then(res => res.data?.data ?? res.data),

    update: (id: string, data: FormData): Promise<ServicePackage> =>
        apiClient.put(`/ServicePackages/${id}`, data).then(res => res.data?.data ?? res.data),

    updateStatus: (id: string, status: 'Active' | 'Inactive'): Promise<void> =>
        apiClient.patch(`/ServicePackages/${id}`, null, {
            params: { status }
        }).then(res => res.data?.data ?? res.data),

    deleteImage: (id: string): Promise<void> =>
        apiClient.delete(`/ServicePackages/${id}/DeleteImage`).then(res => res.data?.data ?? res.data),

    replaceImage: (id: string, file: File): Promise<void> => {
        const formData = new FormData();
        formData.append('File', file);
        return apiClient.post(`/ServicePackages/${id}/ReplaceImage`, formData).then(res => res.data?.data ?? res.data);
    }
};

export default servicePackageService;
