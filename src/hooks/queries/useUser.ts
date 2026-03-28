import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import userService from "@/api/services/userService";
import staffService from "@/api/services/staffService";
import { useAuthStore } from "@/store/authStore";
import type { UpdateUserProfileRequest, UserProfile } from "@/api/types";
import type { StaffResponse } from "@/api/types/staff.types";

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
    const { isAuthenticated, role } = useAuthStore();
    const isStaff = role && role !== "User" && role !== "Admin";
    const hasProfile = role && role !== "Admin";

    return useQuery<StaffResponse | UserProfile, Error, any>({
        queryKey: [...profileKeys.all, role],
        queryFn: isStaff ? () => staffService.getStaffProfile() : userService.getProfile,
        enabled: isAuthenticated && !!hasProfile,
        select: normalizeProfile,
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
