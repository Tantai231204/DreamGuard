import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authService } from "../api/services";
import { useAuthStore } from "../store/authStore";
import { useCartStore } from "@/store/useCart";
import { toast } from "sonner";

export const useLogin = () => {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation<
    any,
    Error,
    {
      phoneNumber: string;
      password: string;
    }
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

