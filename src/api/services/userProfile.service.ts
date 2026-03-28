import api from "../../lib/api"

export interface UserProfile {
  firstName: string
  lastName: string
  email: string
  dateOfBirth: string
  gender: string
}

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
  } catch (error: any) {
    // Nếu đường dẫn upload không tồn tại (404) hoặc backend chưa hỗ trợ chỗ này,
    // trả về null để frontend không block việc update profile.
    if (error?.response?.status === 404) {
      return null
    }
    throw error
  }
}

export const updateUserProfile = async (data: UserProfile) => {
  const res = await api.put("/UserProfiles", data)
  return res.data
}

export const requestChangePhoneNumber = async () => {
  const res = await api.post("/UserProfiles/ChangePhoneNumberRequest")
  return res.data
}

export const confirmChangePhoneNumber = async (data: {
  phoneNumber: string
  otpCode: string
}) => {
  const res = await api.post("/UserProfiles/ChangePhoneNumber", data)
  return res.data
}