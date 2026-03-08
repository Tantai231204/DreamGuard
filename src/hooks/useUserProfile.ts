import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getUserProfile,
  updateUserProfile
} from "../api/services/userProfile.service"

export const useUserProfile = () => {
  return useQuery({
    queryKey: ["userProfile"],
    queryFn: getUserProfile
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