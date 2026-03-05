export interface BabyProfile {
  babyId: string
  name: string
  gender: string
  dateOfBirth: string
  weight: number
  height: number
  note: string
}

export interface CreateBabyProfilePayload {
  name: string
  gender: string
  height: number
  weight: number
  dateOfBirth: string
  note?: string
}

export interface UpdateBabyProfilePayload
  extends CreateBabyProfilePayload {
  babyId: string
}