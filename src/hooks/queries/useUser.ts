import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import userService from "@/api/services/userService";
import { useAuthStore } from "@/store/authStore";
import type { UpdateUserProfileRequest } from "@/api/types";

export const profileKeys = {
    all: ["user-profile"] as const,
};

function normalizeProfile(profile: any) {
    const fullName = profile?.fullName?.trim() || "";
    const [firstNameFromFull, ...rest] = fullName.split(" ").filter(Boolean);
    const lastNameFromFull = rest.join(" ");

    return {
        ...profile,
        firstName: profile?.firstName?.trim() || firstNameFromFull || "",
        lastName: profile?.lastName?.trim() || lastNameFromFull || "",
        fullName: profile?.fullName || `${profile?.firstName || firstNameFromFull || ""} ${profile?.lastName || lastNameFromFull || ""}`.trim(),
    };
}

export const useProfile = () => {
    const { isAuthenticated } = useAuthStore();

    return useQuery({
        queryKey: profileKeys.all,
        queryFn: async () => {
            const data = await userService.getProfile();
            return normalizeProfile(data);
        },
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
