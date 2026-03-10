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
      console.log("GET ADDRESSES ERROR:", error.message)
    }
    throw error
  }
}

export const getAddressById = async (id: string): Promise<Address> => {
  try {
    const res = await api.get(`/Addresses/${id}`)
    return res.data?.data ?? res.data
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      console.log("GET ADDRESS ERROR:", error.message)
    }
    throw error
  }
}

export const createAddress = async (
  payload: CreateAddressPayload,
): Promise<string> => {
  try {
    console.log("CREATE ADDRESS PAYLOAD:", payload)

    const res = await api.post("/Addresses", payload)
    const data = res.data?.data ?? res.data
    return data?.addressId ?? data?.id ?? data
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      console.log("CREATE ADDRESS ERROR:", error.message)
    }
    throw error
  }
}

/* 
   UPDATE
 */
export const updateAddress = async (
  payload: UpdateAddressPayload,
): Promise<void> => {
  const { id, ...data } = payload

  try {
    await api.put(`/Addresses/${id}`, data)
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      console.log("UPDATE ADDRESS ERROR:", error.message)
    }
    throw error
  }
}

/* 
   DELETE
 */
export const deleteAddress = async (id: string): Promise<void> => {
  try {
    await api.delete(`/Addresses/${id}`)
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      console.log("DELETE ADDRESS ERROR:", error.message)
    }
    throw error
  }
}
