import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import staffService from "@/api/services/staffService";
import type { CreateStaffRequest, UpdateStaffRequest, StaffParams, UpdateStaffAccountRequest, StaffPageResponse } from "@/api/types/staff.types";

export const staffKeys = {
    all: ["staffs"] as const,
    list: (params: StaffParams = {}) => [...staffKeys.all, "list", params] as const,
    detail: (id: string) => [...staffKeys.all, "detail", id] as const,
    profile: () => [...staffKeys.all, "profile"] as const,
};

export const useStaffs = (params: StaffParams = {}, options?: { enabled?: boolean }) => {
    return useQuery({
        queryKey: staffKeys.list(params),
        queryFn: () => staffService.getAllStaff(params),
        staleTime: 0,
        enabled: options?.enabled,
    });
};

export const useStaffById = (id: string, options?: { enabled?: boolean }) => {
    return useQuery({
        queryKey: staffKeys.detail(id),
        queryFn: () => staffService.getStaffById(id),
        enabled: (options?.enabled ?? true) && !!id,
        staleTime: 5 * 60 * 1000,
        gcTime: 15 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
};

export const useStaffProfile = (options?: { enabled?: boolean }) => {
    return useQuery({
        queryKey: staffKeys.profile(),
        queryFn: () => staffService.getStaffProfile(),
        enabled: options?.enabled ?? true,
        staleTime: 2 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
};

export const useCreateStaff = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateStaffRequest) => staffService.createStaff(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: staffKeys.all });
        },
    });
};

export const useUpdateStaff = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateStaffRequest }) =>
            staffService.updateStaff(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: staffKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: staffKeys.all });
        },
    });
};

export const useUpdateStaffRole = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, newRole }: { id: string; newRole: string }) =>
            staffService.updateStaffRole(id, newRole),
        onMutate: async ({ id, newRole }) => {
            await queryClient.cancelQueries({ queryKey: staffKeys.all });
            const previousQueries = queryClient.getQueriesData<StaffPageResponse>({ queryKey: [...staffKeys.all, "list"] });

            queryClient.setQueriesData<StaffPageResponse>({ queryKey: [...staffKeys.all, "list"] }, (old) => {
                if (!old) return old;
                return {
                    ...old,
                    items: old.items.map(s => s.staffId === id ? { ...s, role: newRole } : s)
                };
            });

            return { previousQueries };
        },
        onError: (_err, _variables, context) => {
            if (context?.previousQueries) {
                context.previousQueries.forEach(([queryKey, data]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }
        },
        onSettled: (_, __, { id }) => {
            queryClient.invalidateQueries({ queryKey: staffKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: staffKeys.all });
        },
    });
};

export const useUpdateStaffAccount = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateStaffAccountRequest }) =>
            staffService.updateStaffAccount(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: staffKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: staffKeys.all });
        },
    });
};

export const useCleaningStaffsForAssignment = (options?: { enabled?: boolean }) => {
    return useQuery({
        queryKey: [...staffKeys.all, "cleaning-assignment"],
        queryFn: () => staffService.getCleaningStaffsForAssignment(),
        enabled: options?.enabled,
    });
};

export const useDeliveryStaffsForAssignment = (options?: { enabled?: boolean }) => {
    return useQuery({
        queryKey: [...staffKeys.all, "delivery-assignment"],
        queryFn: () => staffService.getDeliveryStaffsForAssignment(),
        enabled: options?.enabled,
    });
};
