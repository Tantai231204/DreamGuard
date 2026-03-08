import { create } from "zustand";

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password?: string;
  gender?: "Male" | "Female";
  dateOfBirth?: string;
}

interface RegisterStore {
  registerData: RegisterData | null;
  setRegisterData: (data: Partial<RegisterData>) => void;
  clearRegisterData: () => void;
}

export const useRegisterStore = create<RegisterStore>((set) => ({
  registerData: null,

  setRegisterData: (data) =>
    set((state) => ({
      registerData: {
        ...state.registerData,
        ...data,
      } as RegisterData,
    })),

  clearRegisterData: () =>
    set({
      registerData: null,
    }),
}));