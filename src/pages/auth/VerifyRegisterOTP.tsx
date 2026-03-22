import { useState, useCallback, useRef, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { useRegisterStore } from "../../store/registerStore";
import { useVerifyOtp, useSendRegisterOtp } from "../../hooks/useAuth";
import { AppRoute } from "../../lib/constants";

export default function VerifyRegisterOTP() {

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect");

  const registerData = useRegisterStore((s) => s.registerData);

  const { mutate: verifyOtp, isPending, error: apiError } = useVerifyOtp();
  const { mutate: resendOtp } = useSendRegisterOtp();

  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
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
      if (value && !/^\d+$/.test(value)) return;
      const newOtp = [...otp];
      newOtp[index] = value.slice(-1);
      setOtp(newOtp);
      setError("");
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [otp]
  );

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace" && !otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    },
    [otp]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault();
      const pasted = e.clipboardData.getData("text").slice(0, 6);
      if (!/^\d+$/.test(pasted)) return;
      const newOtp = [...otp];
      pasted.split("").forEach((char, index) => {
        if (index < 6) newOtp[index] = char;
      });
      setOtp(newOtp);
      const nextEmpty = newOtp.findIndex((v) => !v);
      const focusIndex = nextEmpty === -1 ? 5 : nextEmpty;
      inputRefs.current[focusIndex]?.focus();
    },
    [otp]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const otpValue = otp.join("");
      if (otpValue.length !== 6) {
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
          ← Back to login
        </Link>
      </p>

    </div>
  );
}