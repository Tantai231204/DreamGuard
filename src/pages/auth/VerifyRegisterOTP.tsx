import { useState, useCallback, useRef, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { useRegisterStore } from "../../store/registerStore";
import { useVerifyOtp, useSendRegisterOtp } from "../../hooks/useAuth";
import { AppRoute } from "../../lib/constants";

const OTP_LENGTH = 6;

export default function VerifyRegisterOTP() {

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect");

  const registerData = useRegisterStore((s) => s.registerData);

  const { mutate: verifyOtp, isPending, error: apiError } = useVerifyOtp();
  const { mutate: resendOtp } = useSendRegisterOtp();

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(60);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!registerData) {
      navigate(AppRoute.REGISTER_BASIC);
    }
  }, [registerData, navigate]);

  useEffect(() => {
    if (countdown === 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

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

      const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
      if (!pasted) return;

      setError("");
      setOtp((prev) => {
        const next = [...prev];
        pasted.split("").forEach((char, index) => {
          next[index] = char;
        });
        return next;
      });

      const focusIndex = Math.min(pasted.length, OTP_LENGTH - 1);
      inputRefs.current[focusIndex]?.focus();
    },
    []
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const otpValue = otp.join("");
      if (otpValue.length !== OTP_LENGTH) {
        setError("Please enter the full 6-digit code");
        return;
      }
      if (!registerData) return;

      verifyOtp(
        {
          email: registerData.email,
          phoneNumber: registerData.phoneNumber,
          // email: registerData.email,
          otpCode: otpValue,
        },
        {
          onSuccess: () => {
            navigate(
              redirect
                ? `${AppRoute.REGISTER_COMPLETE}?redirect=${encodeURIComponent(redirect)}`
                : AppRoute.REGISTER_COMPLETE
            );
          },
          onError: (err) => {
            if (err instanceof Error && err.message) {
              setError(err.message);
            } else {
              setError("Invalid or expired OTP code");
            }
          },
        }
      );
    },
    [otp, registerData, navigate, verifyOtp, redirect]
  );

  const handleResendOtp = () => {
    if (!registerData || countdown > 0) return;
    resendOtp(
      {
        email: registerData.email,
        phone: registerData.phoneNumber,
      },
      {
        onSuccess: () => {
          setCountdown(60);
        },
      }
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-[var(--color-border)] p-8 w-full max-w-md">

      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <img
          src="/images/logo_with_name.svg"
          alt="DreamGuard Logo"
          className="h-20 w-20 rounded-lg object-contain shadow-md"
        />
        <span className="text-xl font-bold text-[var(--color-auth-title)] mt-2">
          DreamGuard
        </span>
      </div>

      {/* Title */}
      <div className="mb-6 text-center">
        <h2 className="text-lg font-semibold text-[#1C4D8D]">
          Verify your email
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          We have sent a verification code to
          <br />
          <span className="font-medium">{registerData?.email}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* OTP inputs */}
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

        {(error || apiError) && (
          <p className="text-xs text-red-500 text-center">
            {error || (apiError instanceof Error ? apiError.message : "")}
          </p>
        )}

        {/* Verify button */}
        <Button
          type="submit"
          disabled={isPending}
          className="w-full h-11 bg-[var(--color-auth-btn-bg)] hover:bg-[var(--color-auth-btn-hover)] text-[var(--color-auth-btn-text)] font-semibold rounded-lg border-2 border-[var(--color-auth-btn-border)] shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98]"
        >
          {isPending ? "Verifying..." : "Verify code"}
        </Button>

      </form>

      {/* Resend */}
      <p className="text-center text-sm text-gray-600 mt-6">
        Didn't receive the code?{" "}
        {countdown > 0 ? (
          <span className="text-gray-400">Resend in {countdown}s</span>
        ) : (
          <button
            type="button"
            onClick={handleResendOtp}
            className="text-[var(--color-auth-link-dark)] font-semibold hover:underline"
          >
            Resend OTP
          </button>
        )}
      </p>

      {/* Back */}
      <p className="text-center text-sm text-gray-500 mt-3">
        <Link
          to={
            redirect
              ? `${AppRoute.LOGIN}?redirect=${encodeURIComponent(redirect)}`
              : AppRoute.LOGIN
          }
          className="hover:underline"
        >
          ← Back to Log In
        </Link>
      </p>

    </div>
  );
}