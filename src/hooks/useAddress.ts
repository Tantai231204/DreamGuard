import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
} from "@/services/address.service"

/* 
   GET ALL
 */
export const useAddresses = () => {
  return useQuery({
    queryKey: ["addresses"],
    queryFn: getAddresses,
    staleTime: 1000 * 60 * 5,
  })
}

/* 
   GET BY ID
 */
export const useAddress = (id: string) => {
  return useQuery({
    queryKey: ["address", id],
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
      queryClient.invalidateQueries({ queryKey: ["addresses"] })
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
      queryClient.invalidateQueries({ queryKey: ["addresses"] })
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
      queryClient.invalidateQueries({ queryKey: ["addresses"] })
    },
  })
}