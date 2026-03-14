import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { 
  authService, 
  type AuthResponse, 
  type LoginRequest, 
  type RegisterRequest,
  type VerifyOtpRequest,
  type ResetPasswordRequest,
  type ForgotPasswordRequest,
  type ChangePasswordRequest
} from "../api";
import { useAuthStore } from "../store/authStore";
import { useCartStore } from "@/store/useCart";
import { toast } from "sonner";

export const useLogin = () => {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation<
    AuthResponse,
    Error,
    LoginRequest
  >({
    mutationFn: authService.login,
    meta: { hideToast: true },
    onSuccess: async (data) => {
      setAuth(data);
      // Sync is handled by the App root when isAuthenticated becomes true

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
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authService.logout,
    onSuccess: async () => {
      await useCartStore.getState().clearCart();
      clearAuth();
      navigate("/");
      toast.success("Logged Out", {
        description: "You have been successfully logged out. See you soon!",
      });
    },
    onError: () => {
      useCartStore.getState().clearCart();
      clearAuth();
      navigate("/");
      toast.success("Logged Out", {
        description: "Session closed. You have been logged out.",
      });
    },
  });
};

export const useForgotPassword = () => {
  return useMutation<
    { message: string },
    Error,
    ForgotPasswordRequest
  >({
    mutationFn: authService.forgotPassword,
  });
};

export const useVerifyOtp = () => {
  return useMutation<
    { message: string },
    Error,
    VerifyOtpRequest
  >({
    mutationFn: authService.verifyOtp,
  });
};

export const useResetPassword = () => {
  return useMutation<
    { message: string },
    Error,
    ResetPasswordRequest
  >({
    mutationFn: authService.resetPassword,
  });
};

export const useRegister = () => {
  return useMutation<unknown, Error, RegisterRequest>({
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

export const useChangePassword = () => {
  return useMutation<
    { message: string },
    Error,
    ChangePasswordRequest
  >({
    mutationFn: authService.changePassword,
  })
}
