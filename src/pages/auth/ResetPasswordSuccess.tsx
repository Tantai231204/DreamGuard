import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { Button } from "../../components/ui/button";

export default function ResetPasswordSuccess() {
    const navigate = useNavigate();

    const handleContinue = useCallback(() => {
        navigate("/login");
    }, [navigate]);

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-[var(--color-border)] p-8 w-full max-w-md">
            {/* Logo */}
            <div className="flex flex-col items-center mb-8">
                <div className="mb-1">
                    <img
                        src="/images/logo_no_name.svg"
                        alt="DreamGuard Logo"
                        className="h-20 w-20 rounded-lg object-contain shadow-md"
                    />
                </div>
                <span className="text-xl font-bold text-[var(--color-primary-dark)]">
                    DreamGuard
                </span>
            </div>

            {/* Success Icon */}
            <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
            </div>

            {/* Title */}
            <div className="text-center mb-6">
                <h2 className="text-lg font-semibold text-[var(--color-primary-dark)]">Password reset successful</h2>
                <p className="text-sm text-gray-500 mt-2">
                    Your password has been successfully reset.
                    <br />
                    Your new password has been sent to your email.
                    <br/>
                    Click continue to set up login.
                </p>
            </div>

            {/* Continue Button */}
            <Button
                type="button"
                onClick={handleContinue}
                className="w-full h-11 bg-[var(--color-primary-light)] hover:bg-[var(--color-primary)] text-gray-900 hover:text-white font-semibold rounded-lg border-2 border-[var(--color-primary)] shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98]"
            >
                Continue
            </Button>
        </div>
    );
}
