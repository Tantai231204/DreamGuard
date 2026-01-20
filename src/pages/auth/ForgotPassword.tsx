import { useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail } from "lucide-react";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";

const forgotPasswordSchema = z.object({
    email: z.string().email("Email không hợp lệ"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: "",
        },
    });

    const onSubmit = useCallback((data: ForgotPasswordFormData) => {
        console.log(data);
        // Store email in sessionStorage for OTP page
        sessionStorage.setItem("resetEmail", data.email);
        navigate("/verify-otp");
    }, [navigate]);

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
                <h2 className="text-lg font-semibold text-[#1C4D8D]">Forgot Password</h2>
                <p className="text-sm text-gray-500 mt-1">
                    Enter your email address to reset your password.
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Email */}
                <div className="space-y-1.5">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            id="email"
                            type="email"
                            placeholder="Enter email"
                            className="pl-10 h-11"
                            {...register("email")}
                        />
                    </div>
                    {errors.email && (
                        <p className="text-xs text-red-500">{errors.email.message}</p>
                    )}
                </div>

                {/* Reset Password Button */}
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-11 bg-[var(--color-auth-btn-bg)] hover:bg-[var(--color-auth-btn-hover)] text-[var(--color-auth-btn-text)] font-semibold rounded-lg border-2 border-[var(--color-auth-btn-border)] shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98]"
                >
                    {isSubmitting ? "Sending..." : "Reset Password"}
                </Button>
            </form>

            {/* Back to Login */}
            <p className="text-center text-sm text-gray-600 mt-6">
                Remember your password?{" "}
                <Link to="/login" className="text-[var(--color-auth-link-dark)] font-semibold hover:underline">
                    Log in
                </Link>
            </p>
        </div>
    );
}
