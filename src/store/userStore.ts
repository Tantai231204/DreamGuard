import { create } from "zustand"
import type { UserProfile } from "../api/types/userProfile"
interface UserState {
  profile: UserProfile | null
  setProfile: (profile: UserProfile) => void
  clearProfile: () => void
}

export const useUserStore = create<UserState>((set) => ({
  profile: null,

  setProfile: (profile) => set({ profile }),

  clearProfile: () => set({ profile: null }),
}))