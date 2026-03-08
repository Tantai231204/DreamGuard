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