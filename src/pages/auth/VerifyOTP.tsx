import { useState, useCallback, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";

export default function VerifyOTP() {
    const navigate = useNavigate();
    const [otp, setOtp] = useState<string[]>(["", "", "", "", ""]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    
    // Get email from sessionStorage
    const email = sessionStorage.getItem("resetEmail") || "your-email@gmail.com";

    useEffect(() => {
        // Focus first input on mount
        inputRefs.current[0]?.focus();
    }, []);

    const handleChange = useCallback((index: number, value: string) => {
        // Only allow numbers
        if (value && !/^\d+$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.slice(-1); // Only take last character
        setOtp(newOtp);
        setError("");

        // Auto focus next input
        if (value && index < 4) {
            inputRefs.current[index + 1]?.focus();
        }
    }, [otp]);

    const handleKeyDown = useCallback((index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        // Move to previous input on backspace if current is empty
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    }, [otp]);

    const handlePaste = useCallback((e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").slice(0, 5);
        if (!/^\d+$/.test(pastedData)) return;

        const newOtp = [...otp];
        pastedData.split("").forEach((char, index) => {
            if (index < 5) newOtp[index] = char;
        });
        setOtp(newOtp);

        // Focus the next empty input or last input
        const nextEmptyIndex = newOtp.findIndex(val => !val);
        const focusIndex = nextEmptyIndex === -1 ? 4 : nextEmptyIndex;
        inputRefs.current[focusIndex]?.focus();
    }, [otp]);

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        const otpValue = otp.join("");
        
        if (otpValue.length !== 5) {
            setError("Vui lòng nhập đủ 5 số");
            return;
        }

        setIsSubmitting(true);
        console.log("OTP:", otpValue);
        
        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            navigate("/reset-password");
        }, 1000);
    }, [otp, navigate]);

    const handleResendEmail = useCallback(() => {
        console.log("Resending email to:", email);
        // Add resend logic here
    }, [email]);

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-[var(--color-border)] p-8 w-full max-w-md">
            {/* Logo */}
            <div className="flex flex-col items-center mb-8">
                <div className="mb-1">
                    <img
                        src="/public/images/logo_no_name.svg"
                        alt="DreamGuard Logo"
                        className="h-20 w-20 rounded-lg object-contain shadow-md"
                    />
                </div>
                <span className="text-xl font-bold text-[var(--color-auth-title)]">
                    DreamGuard
                </span>
            </div>

            {/* Title */}
            <div className="mb-6">
                <h2 className="text-lg font-semibold text-[#1C4D8D]">Check your email</h2>
                <p className="text-sm text-gray-500 mt-1">
                    We have sent a reset link to <span className="font-medium">{email}</span>
                    <br />
                    Enter the 5-digit code mentioned in the email.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* OTP Inputs */}
                <div className="flex justify-center gap-3" onPaste={handlePaste}>
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            ref={(el) => { inputRefs.current[index] = el; }}
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
                {error && (
                    <p className="text-xs text-red-500 text-center">{error}</p>
                )}

                {/* Verify Button */}
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-11 bg-[var(--color-auth-btn-bg)] hover:bg-[var(--color-auth-btn-hover)] text-[var(--color-auth-btn-text)] font-semibold rounded-lg border-2 border-[var(--color-auth-btn-border)] shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98]"
                >
                    {isSubmitting ? "Verifying..." : "Verify code"}
                </Button>
            </form>

            {/* Resend Link */}
            <p className="text-center text-sm text-gray-600 mt-6">
                Haven't received the email yet?{" "}
                <button
                    type="button"
                    onClick={handleResendEmail}
                    className="text-[var(--color-auth-link-dark)] font-semibold hover:underline"
                >
                    Resend the email
                </button>
            </p>

            {/* Back to Login */}
            <p className="text-center text-sm text-gray-500 mt-3">
                <Link to="/login" className="hover:underline">
                    ← Back to login
                </Link>
            </p>
        </div>
    );
}
