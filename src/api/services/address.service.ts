import api, { ApiError, type CustomAxiosRequestConfig } from "@/lib/api"
import type {
  Address,
  CreateAddressPayload,
  UpdateAddressPayload,
} from "@/api/types/address"

/* 
   GET ALL
 */
export const getAddresses = async (): Promise<Address[]> => {
  try {
    const res = await api.get("/Addresses", {
      params: { pageNumber: 1 },
      _suppressToast: true,
    } as CustomAxiosRequestConfig)
    const data = res.data?.data ?? res.data
    return data?.items ?? data
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      if (error.status === 404) {
        return []
      }
    }
    throw error
  }
}

export const getAddressById = async (id: string): Promise<Address> => {
  const res = await api.get(`/Addresses/${id}`)
  return res.data?.data ?? res.data
}

export const createAddress = async (
  payload: CreateAddressPayload,
): Promise<string> => {
  const res = await api.post("/Addresses", payload)
  const data = res.data?.data ?? res.data
  return data?.addressId ?? data?.id ?? (typeof data === 'string' ? data : null)
}

/* 
   UPDATE
 */
export const updateAddress = async (
  payload: UpdateAddressPayload,
): Promise<void> => {
  const { id, ...data } = payload

  await api.put(`/Addresses/${id}`, data)
}

/* 
   DELETE
 */
export const deleteAddress = async (id: string): Promise<void> => {
  await api.delete(`/Addresses/${id}`)
}
