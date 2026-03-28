// src/hooks/queries/useCustomizeType.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customizeTypeService } from "@/api";
import type { 
  CustomizeTypeParams, 
  CreateCustomizeTypeRequest 
} from "@/api/types/customizeType.types";

export const customizeTypeKeys = {
  all: ["customize-types"] as const,
  list: (params?: CustomizeTypeParams) => ["customize-types", "list", params] as const,
  detail: (id: string) => ["customize-types", "detail", id] as const,
};

export const useCustomizeTypes = (params?: CustomizeTypeParams) => {
  return useQuery({
    queryKey: customizeTypeKeys.list(params),
    queryFn: () => customizeTypeService.getAll(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useCustomizeTypeDetail = (id: string) => {
  return useQuery({
    queryKey: customizeTypeKeys.detail(id),
    queryFn: () => customizeTypeService.getById(id),
    enabled: !!id,
  });
};

export const useCreateCustomizeType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCustomizeTypeRequest) => customizeTypeService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customizeTypeKeys.all });
    },
  });
};

export const useUpdateCustomizeType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateCustomizeTypeRequest }) =>
      customizeTypeService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: customizeTypeKeys.all });
      queryClient.invalidateQueries({ queryKey: customizeTypeKeys.detail(variables.id) });
    },
  });
};

export const useDeleteCustomizeType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => customizeTypeService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customizeTypeKeys.all });
    },
  });
};
