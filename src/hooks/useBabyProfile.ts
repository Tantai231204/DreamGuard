import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getBabyProfiles,
  getBabyProfileById,
  createBabyProfile,
  updateBabyProfile,
  deleteBabyProfile,
} from "@/api/services/babyProfile.service"

// GET ALL
export const useBabyProfiles = () => {
  return useQuery({
    queryKey: ["babyProfiles"],
    queryFn: getBabyProfiles,
  })
}

// GET BY ID
export const useBabyProfile = (id: string) => {
  return useQuery({
    queryKey: ["babyProfile", id],
    queryFn: () => getBabyProfileById(id),
    enabled: !!id,
  })
}

// CREATE
export const useCreateBabyProfile = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createBabyProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["babyProfiles"] })
    },
  })
}

// UPDATE
export const useUpdateBabyProfile = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateBabyProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["babyProfiles"] })
    },
  })
}

// DELETE
export const useDeleteBabyProfile = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteBabyProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["babyProfiles"] })
    },
  })
}