import { useMutation } from "@tanstack/react-query";
import { authService } from "../api/services";
import { useAuthStore } from "../store/authStore";
import { toast } from "sonner";

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
      setAuth(data);
      toast.success("Login Successful", {
        description: "Welcome back to DreamGuard!",
      });
    },
    onError: (error) => {
      toast.error("Login Failed", {
        description: error.message || "Please check your credentials and try again.",
      });
    },
  });
};

export const useLogout = () => {
  const clearAuth = useAuthStore((s) => s.clearAuth);

  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      clearAuth();
      toast.success("Logged Out", {
        description: "You have been successfully logged out. See you soon!",
      });
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
  return useMutation<
    { message: string },
    Error,
    {
      email: string;
      phoneNumber: string;
      otpCode: string;
    }
  >({
    mutationFn: authService.verifyOtp,
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: authService.resetPassword,
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: authService.register,
  });
};

export const useResendOtp = () => {
  return useMutation({
    mutationFn: authService.resendOtp,
  });
};

export const useSendRegisterOtp = () => {
  return useMutation({
    mutationFn: authService.sendRegisterOtp
  })
}

