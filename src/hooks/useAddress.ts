import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
} from "@/api/services/address.service"

export const addressKeys = {
  all: ["addresses"] as const,
  detail: (id: string) => [...addressKeys.all, id] as const,
};

/* 
   GET ALL
 */
export const useAddresses = () => {
  return useQuery({
    queryKey: addressKeys.all,
    queryFn: getAddresses,
  })
}

/* 
   GET BY ID
 */
export const useAddress = (id: string) => {
  return useQuery({
    queryKey: addressKeys.detail(id),
    queryFn: () => getAddressById(id),
    enabled: !!id,
  })
}

/* 
   CREATE
 */
export const useCreateAddress = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: addressKeys.all })
    },
  })
}

/* 
   UPDATE
 */
export const useUpdateAddress = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: addressKeys.all })
    },
  })
}

/* 
   DELETE
 */
export const useDeleteAddress = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: addressKeys.all })
    },
  })
}