import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import userService from "@/api/services/userService";
import staffService from "@/api/services/staffService";
import { useAuthStore } from "@/store/authStore";
import type { UpdateUserProfileRequest, UserProfile } from "@/api/types";
import type { StaffResponse } from "@/api/types/staff.types";
import { isAdminRole, isStaffRole } from "@/lib/role";

export const profileKeys = {
    all: ["user-profile"] as const,
};

export interface NormalizedProfile {
    staffId?: string;
    fullName: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    avatarUrl?: string;
    gender?: string;
    dateOfBirth?: string;
}

function normalizeProfile(profile: StaffResponse | UserProfile): NormalizedProfile {
    const raw = profile as unknown as Record<string, unknown>;
    const fullName = String(raw.fullName || "").trim();
    const [firstNameFromFull, ...rest] = fullName.split(" ").filter(Boolean);
    const lastNameFromFull = rest.join(" ");

    return {
        ...profile,
        firstName: String(raw.firstName || firstNameFromFull || "").trim(),
        lastName: String(raw.lastName || lastNameFromFull || "").trim(),
        fullName: fullName || `${firstNameFromFull || ""} ${lastNameFromFull || ""}`.trim(),
    } as NormalizedProfile;
}

export const useProfile = () => {
    const { isAuthenticated, role } = useAuthStore();
    const isStaff = isStaffRole(role);
    const hasProfile = !!role && !isAdminRole(role);

    return useQuery<StaffResponse | UserProfile, Error, NormalizedProfile>({
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
