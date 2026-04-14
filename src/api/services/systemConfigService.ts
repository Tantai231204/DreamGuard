import api from '@/lib/api';
import type { PaginatedSystemConfigResponse, SystemConfig, UpdateSystemConfigRequest, CreateSystemConfigRequest } from '../types/systemConfig';

const systemConfigService = {
    getConfigs: async (params?: { pageNumber?: number; pageSize?: number; Key?: string }) => {
        const response = await api.get<PaginatedSystemConfigResponse>('/SystemConfigs', { params });
        return response.data;
    },

    getConfigByKey: async (key: string) => {
        const response = await api.get<SystemConfig>(`/SystemConfigs/${key}`);
        return response.data;
    },

    createConfig: async (data: CreateSystemConfigRequest) => {
        const response = await api.post<SystemConfig>('/SystemConfigs', data);
        return response.data;
    },

    updateConfig: async (key: string, data: UpdateSystemConfigRequest) => {
        const response = await api.put<SystemConfig>(`/SystemConfigs/${key}`, data);
        return response.data;
    },

    deleteConfig: async (key: string) => {
        await api.delete(`/SystemConfigs/${key}`);
    }
};

export default systemConfigService;
