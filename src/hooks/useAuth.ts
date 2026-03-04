import { useMutation } from "@tanstack/react-query";
import { authService } from "../services/auth.service";
import { useAuthStore } from "../store/authStore";

export const useLogin = () => {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation<
    {
      accessToken: string;
      refreshToken: string;
      roleName: string;
    },
    Error,
    {
      phoneNumber: string;
      password: string;
    }
  >({
    mutationFn: authService.login,
    // onSuccess: (data) => {
    //   setAuth(data);
    // },
    onSuccess: (data) => {
  console.log("🔥 LOGIN SUCCESS:", data);
  setAuth(data);
  console.log("🔥 AFTER SET AUTH:", useAuthStore.getState());
},
  });
};

export const useLogout = () => {
  const clearAuth = useAuthStore((s) => s.clearAuth);

  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      clearAuth();
    },
    onError: () => {
      clearAuth();
    },
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: authService.forgotPassword,
  });
};

export const useVerifyOtp = () => {
  return useMutation({
    mutationFn: authService.verifyOtp,
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: authService.resetPassword,
  });
};