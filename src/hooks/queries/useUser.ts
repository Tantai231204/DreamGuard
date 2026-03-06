import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import userService from "@/api/services/userService";
import { useAuthStore } from "@/store/authStore";
import type { UpdateUserProfileRequest } from "@/api/types";

export const profileKeys = {
    all: ["user-profile"] as const,
};

export const useProfile = () => {
    const { isAuthenticated } = useAuthStore();

    return useQuery({
        queryKey: profileKeys.all,
        queryFn: userService.getProfile,
        enabled: isAuthenticated,
    });
};

export const useUpdateProfile = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: UpdateUserProfileRequest) => userService.updateProfile(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: profileKeys.all });
        },
    });
};
