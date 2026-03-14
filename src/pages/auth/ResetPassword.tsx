import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { useResetPassword } from "../../hooks/useAuth";
import { AppRoute } from "../../lib/constants";
import { useForgotPasswordStore } from "../../store/forgotPasswordStore";

export default function ResetPassword() {
  const navigate = useNavigate();
  const { mutate: resetPassword, isPending, error } = useResetPassword();

  const phoneNumber = useForgotPasswordStore((s) => s.phoneNumber);
  const otpCode = useForgotPasswordStore((s) => s.otp);

  const handleResetPassword = () => {
    if (!phoneNumber || !otpCode) {
      navigate(AppRoute.FORGOT_PASSWORD);
      return;
    }

    resetPassword(
      {
        phoneNumber,
        otpCode,
      },
      {
        onSuccess: () => {
          console.log("Password reset successful for:", phoneNumber);
          navigate(AppRoute.RESET_PASSWORD_SUCCESS);
        },
      },
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-[var(--color-border)] p-8 w-full max-w-md">
      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <img
          src="/images/logo_no_name.svg"
          alt="DreamGuard Logo"
          className="h-20 w-20 rounded-lg object-contain shadow-md"
        />
        <span className="text-xl font-bold text-[var(--color-auth-title)]">
          DreamGuard
        </span>
      </div>

      {/* Title */}
      <div className="mb-6 text-center">
        <h2 className="text-lg font-semibold text-[#1C4D8D]">Reset password</h2>
        <p className="text-sm text-gray-500 mt-1">
          We will send a new random password to your email.
        </p>
      </div>

      {error instanceof Error && (
        <p className="text-sm text-red-500 text-center mb-4">{error.message}</p>
      )}

      <Button
        onClick={handleResetPassword}
        disabled={isPending}
        className="w-full h-11 bg-[var(--color-auth-btn-bg)] hover:bg-[var(--color-auth-btn-hover)] text-[var(--color-auth-btn-text)] font-semibold rounded-lg border-2 border-[var(--color-auth-btn-border)]"
      >
        {isPending ? "Processing..." : "Send new password"}
      </Button>
    </div>
  );
}
