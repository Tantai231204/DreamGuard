import api from "@/lib/api"
import { AxiosError } from "axios"
import type {
  Address,
  CreateAddressPayload,
  UpdateAddressPayload,
} from "@/types/address"

/* 
   GET ALL
 */
export const getAddresses = async (): Promise<Address[]> => {
  try {
    const res = await api.get("/Addresses?pageNumber=1")
    return res.data?.items ?? res.data
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      // Nếu backend trả 404 vì không có dữ liệu
      if (error.response?.status === 404) {
        return [] 
      }

      console.log("GET ADDRESSES ERROR:", error.response?.data)
    }

    throw error
  }
}

/* 
   GET BY ID
 */
export const getAddressById = async (id: string): Promise<Address> => {
  try {
    const res = await api.get(`/Addresses/${id}`)
    return res.data
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.log("GET ADDRESS ERROR:", error.response?.data)
    }
    throw error
  }
}

/* 
   CREATE
 */
export const createAddress = async (
  payload: CreateAddressPayload,
): Promise<string> => {
  try {
    console.log("CREATE ADDRESS PAYLOAD:", payload)

    const res = await api.post("/Addresses", payload)
    return res.data
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.log("CREATE ADDRESS ERROR:", error.response?.data)
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
    if (error instanceof AxiosError) {
      console.log("UPDATE ADDRESS ERROR:", error.response?.data)
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
    if (error instanceof AxiosError) {
      console.log("DELETE ADDRESS ERROR:", error.response?.data)
    }
    throw error
  }
}