export interface Address {
  addressId: string
  receiverName: string
  phoneNumber: string
  street: string
  ward: string
  district: string
  province: string
  isDefault?: boolean
}

export interface CreateAddressPayload {
  receiverName: string
  phoneNumber: string
  street: string
  province: string
  city: string
  district: string
  ward: string
}

export interface UpdateAddressPayload extends CreateAddressPayload {
  id: string
}