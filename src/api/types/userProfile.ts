export interface UserProfile {
  firstName: string
  lastName: string
  email: string
  dateOfBirth: string
  gender: string
}

export interface UpdateUserProfileRequest {
  firstName: string
  lastName: string
  email: string
  dateOfBirth: string
  gender: string
}

export interface ChangePhoneNumberRequest {
  phoneNumber: string
}

export interface ConfirmChangePhoneNumberRequest {
  phoneNumber: string
  otpCode: string
}