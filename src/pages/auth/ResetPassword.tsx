import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Lock } from "lucide-react";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";

const resetPasswordSchema = z.object({
    newPassword: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    confirmPassword: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
    const navigate = useNavigate();
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            newPassword: "",
            confirmPassword: "",
        },
    });

    const onSubmit = useCallback((data: ResetPasswordFormData) => {
        console.log(data);
        // Clear session storage
        sessionStorage.removeItem("resetEmail");
        navigate("/reset-password-success");
    }, [navigate]);

    const toggleNewPassword = useCallback(() => {
        setShowNewPassword(prev => !prev);
    }, []);

    const toggleConfirmPassword = useCallback(() => {
        setShowConfirmPassword(prev => !prev);
    }, []);

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
                <h2 className="text-lg font-semibold text-[#1C4D8D]">Set a new password</h2>
                <p className="text-sm text-gray-500 mt-1">
                    Create a new password. Ensure the new password is different from the previous one.
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* New Password */}
                <div className="space-y-1.5">
                    <Label htmlFor="newPassword">
                        Enter the new password <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            id="newPassword"
                            type={showNewPassword ? "text" : "password"}
                            placeholder="••••••••••"
                            className="pl-10 pr-10 h-11"
                            {...register("newPassword")}
                        />
                        <button
                            type="button"
                            onClick={toggleNewPassword}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            aria-label={showNewPassword ? "Hide password" : "Show password"}
                        >
                            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                    {errors.newPassword && (
                        <p className="text-xs text-red-500">{errors.newPassword.message}</p>
                    )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword">
                        Confirm password <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="••••••••••"
                            className="pl-10 pr-10 h-11"
                            {...register("confirmPassword")}
                        />
                        <button
                            type="button"
                            onClick={toggleConfirmPassword}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                        >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                    {errors.confirmPassword && (
                        <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
                    )}
                </div>

                {/* Update Password Button */}
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-11 bg-[var(--color-auth-btn-bg)] hover:bg-[var(--color-auth-btn-hover)] text-[var(--color-auth-btn-text)] font-semibold rounded-lg border-2 border-[var(--color-auth-btn-border)] shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98]"
                >
                    {isSubmitting ? "Updating..." : "Update password"}
                </Button>
            </form>
        </div>
    );
}
