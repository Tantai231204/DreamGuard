export interface UserProfile {
  fullName: string
  email: string
  phoneNumber?: string
  dateOfBirth?: string
  gender?: string
  avatarUrl?: string
  memberCoin: number
}

export interface UpdateUserProfileRequest {
  fullName?: string
  email?: string
  dateOfBirth?: string
  gender?: string
  avatarUrl?: string
}

export interface ChangePhoneNumberRequest {
  phoneNumber: string
}

export interface ConfirmChangePhoneNumberRequest {
  phoneNumber: string
  otpCode: string
}