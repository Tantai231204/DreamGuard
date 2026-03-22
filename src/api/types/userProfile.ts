export interface UserProfile {
  firstName: string
  lastName: string
  fullName?: string
  email: string
  dateOfBirth: string
  gender: string
  avatarUrl?: string
}

export interface UpdateUserProfileRequest {
  firstName: string
  lastName: string
  fullName?: string
  email: string
  dateOfBirth: string
  gender: string
  avatarUrl?: string
}

export interface ChangePhoneNumberRequest {
  phoneNumber: string
}

export interface ConfirmChangePhoneNumberRequest {
  phoneNumber: string
  otpCode: string
}