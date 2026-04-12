import api from "../../lib/api"
import type { UserProfile, UpdateUserProfileRequest, ConfirmChangePhoneNumberRequest } from "../types/userProfile"

export const getUserProfile = async (): Promise<UserProfile> => {
  const res = await api.get("/UserProfiles")
  return res.data
}

export const uploadUserAvatar = async (file: File): Promise<{ avatarUrl: string } | null> => {
  try {
    const formData = new FormData()
    formData.append("file", file)

    const res = await api.post("/asset/user/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })

    return res.data
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const axiosError = error as any
    if (axiosError?.response?.status === 404) {
      return null
    }
    throw error
  }
}

export const updateUserProfile = async (data: UpdateUserProfileRequest) => {
  const res = await api.put("/UserProfiles", data)
  return res.data
}

export const requestChangePhoneNumber = async () => {
  const res = await api.post("/UserProfiles/ChangePhoneNumberRequest")
  return res.data
}

export const confirmChangePhoneNumber = async (data: ConfirmChangePhoneNumberRequest) => {
  const res = await api.post("/UserProfiles/ChangePhoneNumber", data)
  return res.data
}