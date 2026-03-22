import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getUserProfile,
  updateUserProfile,
  type UserProfile
} from "../api/services/userProfile.service"
import staffService from "@/api/services/staffService"
import { useAuthStore } from "@/store/authStore"
import type { StaffResponse } from "@/api/types/staff.types"

export const useUserProfile = () => {
  const role = useAuthStore((state) => state.role);
  const isStaff = role && role !== "User";

  return useQuery<UserProfile | StaffResponse>({
    queryKey: ["userProfile", role],
    queryFn: isStaff ? () => staffService.getStaffProfile() : getUserProfile
  })
}

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateUserProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["userProfile"]
      })
    }
  })
}