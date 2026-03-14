import { create } from "zustand";

interface ForgotPasswordState {
  phoneNumber: string;
  email: string;
  otp: string;

  setPhoneNumber: (phone: string) => void;
  setEmail: (email: string) => void;
  setOtp: (otp: string) => void;
}

export const useForgotPasswordStore = create<ForgotPasswordState>((set) => ({
  phoneNumber: "",
  email: "",
  otp: "",

  setPhoneNumber: (phone) => set({ phoneNumber: phone }),
  setEmail: (email) => set({ email }),
  setOtp: (otp) => set({ otp }),
}));