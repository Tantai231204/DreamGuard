import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { systemConfigService } from '@/api/services';
import type { CreateSystemConfigRequest, UpdateSystemConfigRequest } from '@/api/types/systemConfig';

export const systemConfigKeys = {
    all: ['systemConfigs'] as const,
    list: (params: Record<string, unknown>) => [...systemConfigKeys.all, 'list', params] as const,
    detail: (key: string) => [...systemConfigKeys.all, 'detail', key] as const,
};

export const useSystemConfigs = (params?: { pageNumber?: number; pageSize?: number; Key?: string }) => {
    return useQuery({
        queryKey: systemConfigKeys.list(params || {}),
        queryFn: () => systemConfigService.getConfigs(params),
        staleTime: 60000,
    });
};

export const useCreateSystemConfig = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateSystemConfigRequest) => systemConfigService.createConfig(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: systemConfigKeys.all });
        },
    });
};

export const useUpdateSystemConfig = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ key, data }: { key: string; data: UpdateSystemConfigRequest }) =>
            systemConfigService.updateConfig(key, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: systemConfigKeys.all });
        },
    });
};

export const useDeleteSystemConfig = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (key: string) => systemConfigService.deleteConfig(key),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: systemConfigKeys.all });
        },
    });
};
