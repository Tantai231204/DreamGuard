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
  const body = res.data
  
  // Extract ID with extreme prejudice across all common backend patterns
  let rawId = 
    body?.data?.addressId ?? 
    body?.data?.id ?? 
    body?.addressId ?? 
    body?.id ?? 
    body?.data?.AddressId ?? 
    body?.data?.Id ?? 
    body?.AddressId ?? 
    body?.Id ?? 
    body?.data?.address_id ??
    body?.address_id ??
    (typeof body?.data === 'string' ? body.data : null) ??
    (typeof body === 'string' ? body : null);

  // Ultimate Fallback: Regex search through the entire body string for a GUID
  if (!rawId && body) {
    const bodyString = JSON.stringify(body);
    const guidMatch = bodyString.match(/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i);
    if (guidMatch) {
      rawId = guidMatch[0];
    }
  }

  if (!rawId) {
    console.error("Address creation response missing ID:", body);
    throw new Error("Address created but no ID was returned by the server. Please try again.");
  }

  return String(rawId).trim().replace(/^["']+|["']+$/g, '');
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
