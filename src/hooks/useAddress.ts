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

import type { Address, CreateAddressPayload, UpdateAddressPayload } from "@/api/types/address";

/* 
   CREATE
 */
export const useCreateAddress = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createAddress,
    onMutate: async (newPayload: CreateAddressPayload) => {
      // 1. Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: addressKeys.all })

      // 2. Snapshot previous value
      const previousAddresses = queryClient.getQueryData<Address[]>(addressKeys.all)

      // 3. Optimistically update to the new value
      queryClient.setQueryData<Address[]>(addressKeys.all, (old) => {
        const tempAddress: Address = {
          addressId: `temp-${Date.now()}`,
          receiverName: newPayload.receiverName,
          phoneNumber: newPayload.phoneNumber,
          street: newPayload.street,
          province: newPayload.province,
          district: newPayload.district,
          ward: newPayload.ward,
        }
        return old ? [...old, tempAddress] : [tempAddress]
      })

      // 4. Return context object for rollback
      return { previousAddresses }
    },
    onError: (_err, _newPayload, context) => {
      queryClient.setQueryData(addressKeys.all, context?.previousAddresses)
    },
    onSettled: () => {
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
    onMutate: async (updatedPayload: UpdateAddressPayload) => {
      await queryClient.cancelQueries({ queryKey: addressKeys.all })

      const previousAddresses = queryClient.getQueryData<Address[]>(addressKeys.all)

      queryClient.setQueryData<Address[]>(addressKeys.all, (old) => {
        return old
          ? old.map((addr) =>
            addr.addressId === updatedPayload.id
              ? { ...addr, ...updatedPayload, addressId: updatedPayload.id } // map payload keys back
              : addr
          )
          : []
      })

      return { previousAddresses }
    },
    onError: (_err, _updatedPayload, context) => {
      queryClient.setQueryData(addressKeys.all, context?.previousAddresses)
    },
    onSettled: () => {
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
    onMutate: async (idToDelete: string) => {
      await queryClient.cancelQueries({ queryKey: addressKeys.all })

      const previousAddresses = queryClient.getQueryData<Address[]>(addressKeys.all)

      queryClient.setQueryData<Address[]>(addressKeys.all, (old) => {
        return old ? old.filter((item) => item.addressId !== idToDelete) : []
      })

      return { previousAddresses }
    },
    onError: (_err, _idToDelete, context) => {
      queryClient.setQueryData(addressKeys.all, context?.previousAddresses)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: addressKeys.all })
    },
  })
}
