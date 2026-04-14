// import { useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Phone } from "lucide-react";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { useForgotPassword } from "../../hooks/useAuth";
import { AppRoute } from "@/lib/constants";
import { useForgotPasswordStore } from "../../store/forgotPasswordStore";

const forgotPasswordSchema = z.object({
  phoneNumber: z.string().min(10, "Invalid phone number"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const navigate = useNavigate();
  const setPhoneNumber = useForgotPasswordStore((s) => s.setPhoneNumber);
  // const setEmail = useForgotPasswordStore((s) => s.setEmail);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      phoneNumber: "",
    },
  });

  const { mutate, isPending, error } = useForgotPassword();

  const onSubmit = (data: ForgotPasswordFormData) => {
    mutate(
      { phoneNumber: data.phoneNumber },
      {
        onSuccess: () => {
          setPhoneNumber(data.phoneNumber);
          navigate(AppRoute.RESET_PASSWORD_OTP);
        },
        onError: (err) => {
          console.log("ERROR", err);
        },
      },
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-[var(--color-border)] p-8 w-full max-w-md">
      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <div className="mb-1">
          <img
            src="/images/logo_with_name.svg"
            alt="DreamGuard Logo"
            className="h-20 w-20 rounded-lg object-contain shadow-md"
          />
        </div>
        <span className="text-xl font-bold text-[var(--color-primary-dark)]">
          DreamGuard
        </span>
      </div>

      {/* Title */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-[var(--color-primary-dark)]">
          Forgot Password
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Enter your phone number to receive OTP.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />{" "}
            <Input
              id="phoneNumber"
              type="text"
              placeholder="Enter phone number"
              className="pl-10 h-11"
              {...register("phoneNumber")}
            />
          </div>

          {errors.phoneNumber && (
            <p className="text-xs text-red-500">{errors.phoneNumber.message}</p>
          )}
        </div>

        {error instanceof Error && (
          <p className="text-sm text-red-500">{error.message}</p>
        )}

        {/* Reset Password Button */}
        <Button
          type="submit"
          disabled={isPending}
          className="w-full h-11 bg-[var(--color-auth-btn-bg)] hover:bg-[var(--color-auth-btn-hover)] text-[var(--color-auth-btn-text)] font-semibold rounded-lg border-2 border-[var(--color-auth-btn-border)] shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98]"
        >
          {isPending ? "Sending OTP..." : "Send OTP"}
        </Button>
      </form>

      {/* Back to Login */}
      <p className="text-center text-sm text-gray-600 mt-6">
        Remember your password?{" "}
        <Link
          to="/login"
          className="text-[var(--color-auth-link-dark)] font-semibold hover:underline"
        >
          Log In
        </Link>
      </p>
    </div>
  );
}
