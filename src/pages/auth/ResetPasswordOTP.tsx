import { useState, useCallback, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { useResetPassword } from "../../hooks/useAuth";
import { ApiError } from "@/lib/api";
import { useForgotPasswordStore } from "../../store/forgotPasswordStore";
import { AppRoute } from "@/lib/constants";
import axios from "axios";

interface ApiErrorResponse {
  errorCode: number;
  message: string[];
}

const OTP_LENGTH = 6;

export default function ResetPasswordOTP() {
  const navigate = useNavigate();

  const { mutate: resetPassword, isPending } = useResetPassword();

  const phoneNumber = useForgotPasswordStore((s) => s.phoneNumber);

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState("");

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!phoneNumber) {
      navigate(AppRoute.FORGOT_PASSWORD);
    }
  }, [phoneNumber, navigate]);

  const handleChange = useCallback(
    (index: number, value: string) => {
      const digits = value.replace(/\D/g, "");
      setError("");

      if (!digits) {
        setOtp((prev) => {
          const next = [...prev];
          next[index] = "";
          return next;
        });
        return;
      }

      setOtp((prev) => {
        const next = [...prev];
        digits
          .slice(0, OTP_LENGTH - index)
          .split("")
          .forEach((char, offset) => {
            next[index + offset] = char;
          });
        return next;
      });

      const focusIndex = Math.min(index + digits.length, OTP_LENGTH - 1);
      inputRefs.current[focusIndex]?.focus();
    },
    []
  );

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace") {
        e.preventDefault();

        setOtp((prev) => {
          const next = [...prev];

          if (next[index]) {
            next[index] = "";
            return next;
          }

          if (index > 0) {
            next[index - 1] = "";
            requestAnimationFrame(() => inputRefs.current[index - 1]?.focus());
          }

          return next;
        });
        return;
      }

      if (e.key === "ArrowLeft" && index > 0) {
        e.preventDefault();
        inputRefs.current[index - 1]?.focus();
      }

      if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
        e.preventDefault();
        inputRefs.current[index + 1]?.focus();
      }
    },
    []
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault();

      const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
      if (!pastedData) return;

      setError("");
      setOtp((prev) => {
        const next = [...prev];
        pastedData.split("").forEach((char, index) => {
          next[index] = char;
        });
        return next;
      });

      const focusIndex = Math.min(pastedData.length, OTP_LENGTH - 1);

      inputRefs.current[focusIndex]?.focus();
    },
    []
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const otpValue = otp.join("");

    if (otpValue.length !== OTP_LENGTH) {
      setError("Please enter all 6 digits");
      return;
    }

    if (!phoneNumber) {
      navigate(AppRoute.FORGOT_PASSWORD);
      return;
    }

    resetPassword(
      {
        phoneNumber,
        otpCode: otpValue,
      },
      {
        onSuccess: () => {
          navigate(AppRoute.RESET_PASSWORD_SUCCESS);
        },

        onError: (err) => {
          let message = "Failed to reset password";

          if (err instanceof ApiError) {
            message = err.message;
          } else if (axios.isAxiosError<ApiErrorResponse>(err)) {
            message =
              err.response?.data?.message?.[0] ?? "Failed to reset password";
          }

          setError(message);
        },
      }
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-[var(--color-border)] p-8 w-full max-w-md">
      <div className="flex flex-col items-center mb-8">
        <img
          src="/images/logo_with_name.svg"
          alt="DreamGuard Logo"
          className="h-20 w-20 rounded-lg object-contain shadow-md"
        />
        <span className="text-xl font-bold text-[var(--color-auth-title)]">
          DreamGuard
        </span>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold text-[#1C4D8D]">Enter OTP Code</h2>

        <p className="text-sm text-gray-500 mt-1 text-center">
          We sent a 6-digit OTP to the email associated with your phone number.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex justify-center gap-3" onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              autoComplete={index === 0 ? "one-time-code" : "off"}
              onFocus={(e) => e.currentTarget.select()}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-12 text-center text-lg font-semibold border-2 border-[var(--color-auth-otp-border)] rounded-lg bg-gray-50/50 focus:outline-none focus:border-[var(--color-auth-otp-focus)] focus:ring-2 focus:ring-[var(--color-auth-otp-focus)]/30 transition-all"
            />
          ))}
        </div>

        {error && <p className="text-xs text-red-500 text-center">{error}</p>}

        <Button
          type="submit"
          disabled={isPending}
          className="w-full h-11 bg-[var(--color-auth-btn-bg)] hover:bg-[var(--color-auth-btn-hover)] text-[var(--color-auth-btn-text)] font-semibold rounded-lg border-2 border-[var(--color-auth-btn-border)] shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98]"
        >
          {isPending ? "Sending..." : "Send New Password"}
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        <Link to="/login" className="hover:underline">
          ← Back to Log In
        </Link>
      </p>
    </div>
  );
}