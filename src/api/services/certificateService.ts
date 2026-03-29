// src/api/services/certificateService.ts
import apiClient, { type CustomAxiosRequestConfig } from '../../lib/api';
import type { Certificate, CreateCertificateRequest } from '@/pages/admin/products/types';

export interface CertificatePageResponse {
  items: Certificate[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
}

export interface CertificateParams {
  pageNumber?: number;
  pageSize?: number;
  name?: string;
}

const certificateService = {
  /** Get paginated certificates for admin */
  getAll: (params: CertificateParams = {}): Promise<CertificatePageResponse> =>
    apiClient
      .get<CertificatePageResponse>('/certificate', { params, _suppressToast: true } as CustomAxiosRequestConfig)
      .then((res) => res.data),

  /** Get all certificates non-paginated */
  getAllList: (): Promise<Certificate[]> =>
    apiClient
      .get<CertificatePageResponse>('/certificate', { params: { pageSize: 1000 } })
      .then((res) => res.data.items || []),

  /** Create new certificate */
  create: (data: CreateCertificateRequest): Promise<Certificate> =>
    apiClient.post('/certificate', data).then((res) => res.data),

  /** Update certificate */
  update: (id: string, data: Partial<CreateCertificateRequest>): Promise<Certificate> =>
    apiClient.put(`/certificate/${id}`, data).then((res) => res.data),

  /** Delete certificate */
  delete: (id: string): Promise<void> =>
    apiClient.delete(`/certificate/${id}`).then((res) => res.data),

  /** Update certificate status */
  updateStatus: (id: string, isActive: boolean): Promise<Certificate> =>
    apiClient.put(`/certificate/${id}/status`, null, { params: { isActive } }).then((res) => res.data),

  /** Get certificates by product ID */
  getByProductId: (productId: string): Promise<Certificate[]> =>
    apiClient.get<Certificate[]>(`/certificate/product/${productId}`).then((res) => res.data),
};

export default certificateService;
