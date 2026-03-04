import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "../../store/authStore";
import { AppRoute } from "../../lib/constants";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { Checkbox } from "../../components/ui/checkbox";
import { authService } from "../../services/auth.service";
import { AxiosError } from "axios";

// Google Icon Component
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M19.6 10.23c0-.68-.06-1.36-.17-2H10v3.8h5.38a4.6 4.6 0 01-2 3.02v2.5h3.24c1.89-1.74 2.98-4.3 2.98-7.32z"
    />
    <path
      fill="#34A853"
      d="M10 20c2.7 0 4.96-.9 6.62-2.42l-3.24-2.5c-.9.6-2.04.95-3.38.95-2.6 0-4.8-1.76-5.58-4.12H1.08v2.58A9.99 9.99 0 0010 20z"
    />
    <path
      fill="#FBBC05"
      d="M4.42 11.91A6.01 6.01 0 014.1 10c0-.66.11-1.3.32-1.91V5.51H1.08A9.99 9.99 0 000 10c0 1.61.39 3.14 1.08 4.49l3.34-2.58z"
    />
    <path
      fill="#EA4335"
      d="M10 3.98c1.47 0 2.79.5 3.83 1.5l2.87-2.87C14.96.99 12.7 0 10 0 6.09 0 2.71 2.24 1.08 5.51l3.34 2.58c.78-2.36 2.98-4.11 5.58-4.11z"
    />
  </svg>
);

const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Email không hợp lệ"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#()_\-+=]).+$/,
      "Password must contain uppercase, lowercase, number and special character",
    ),
  phoneNumber: z.string().min(8, "Số điện thoại không hợp lệ"),
  gender: z.enum(["Male", "Female"]),
  dateOfBirth: z.string().min(1, "Vui lòng chọn ngày sinh"),
  agreeTerms: z.boolean().refine((val) => val === true, {
    message: "Bạn phải đồng ý với Điều khoản & Điều kiện",
  }),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function Register() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      phoneNumber: "",
      gender: "Male",
      dateOfBirth: "",
      agreeTerms: false,
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const formattedDate = new Date(data.dateOfBirth)
        .toISOString()
        .split("T")[0];

      await authService.register({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        gender: data.gender,
        dateOfBirth: formattedDate,
      });

      navigate(AppRoute.LOGIN);
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        console.log("STATUS:", error.response?.status);
        console.log("DATA:", error.response?.data);
      } else {
        console.log("UNKNOWN ERROR:", error);
      }
    }
  };

  const handleGoogleLogin = useCallback(() => {
    setAuth({
      accessToken: `google-token-${Date.now()}`,
      refreshToken: `google-refresh-${Date.now()}`,
      roleName: "user",
    });

    navigate(AppRoute.PROFILE);
  }, [setAuth, navigate]);

  const togglePassword = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

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

        <span className="text-xl font-bold text-[var(--color-auth-title)]">
          DreamGuard
        </span>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* First Name */}
        <div className="space-y-1.5">
          <Label htmlFor="firstName">
            First Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="firstName"
            placeholder="First name"
            {...register("firstName")}
          />
          {errors.firstName && (
            <p className="text-xs text-red-500">{errors.firstName.message}</p>
          )}
        </div>

        {/* Last Name */}

        <div className="space-y-1.5">
          <Label htmlFor="lastName">
            Last Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="lastName"
            placeholder="Last name"
            {...register("lastName")}
          />
          {errors.lastName && (
            <p className="text-xs text-red-500">{errors.lastName.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="email">
            Email <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="email"
              type="email"
              placeholder="Email"
              className="pl-10 h-11"
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <Label htmlFor="password">
            Password <span className="text-red-500">*</span>
          </Label>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />

            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="pl-10 pr-10 h-11"
              {...register("password", {
                required: "Password is required",
                pattern: {
                  value:
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#()_\-+=]).{8,}$/,
                  message:
                    "Password must contain uppercase, lowercase, number and special character",
                },
              })}
            />

            <button
              type="button"
              onClick={togglePassword}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

          {errors.password && (
            <p className="text-xs text-red-500">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phoneNumber">
            Phone Number <span className="text-red-500">*</span>
          </Label>
          <Input
            id="phoneNumber"
            type="text"
            placeholder="Phone number"
            {...register("phoneNumber")}
          />
          {errors.phoneNumber && (
            <p className="text-xs text-red-500">{errors.phoneNumber.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label>Gender *</Label>
          <select
            className="w-full border rounded-md h-11 px-3"
            {...register("gender")}
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
          {errors.gender && (
            <p className="text-xs text-red-500">{errors.gender.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="dateOfBirth">
            Date of Birth <span className="text-red-500">*</span>
          </Label>
          <Input id="dateOfBirth" type="date" {...register("dateOfBirth")} />
          {errors.dateOfBirth && (
            <p className="text-xs text-red-500">{errors.dateOfBirth.message}</p>
          )}
        </div>

        {/* Terms & Conditions */}
        <div className="space-y-1">
          <div className="flex items-start gap-2">
            <Checkbox
              id="terms"
              className="mt-0.5"
              {...register("agreeTerms")}
            />
            <label
              htmlFor="terms"
              className="text-sm text-gray-600 leading-tight"
            >
              I have read and agree to the{" "}
              <Link
                to="/terms"
                className="text-[var(--color-auth-link)] hover:underline"
              >
                Terms & Conditions
              </Link>{" "}
              and{" "}
              <Link
                to="/privacy"
                className="text-[var(--color-auth-link)] hover:underline"
              >
                Privacy Policy
              </Link>{" "}
              provided.
            </label>
          </div>
          {errors.agreeTerms && (
            <p className="text-xs text-red-500">{errors.agreeTerms.message}</p>
          )}
        </div>

        {/* Sign Up Button */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-11 bg-[var(--color-auth-btn-bg)] hover:bg-[var(--color-auth-btn-hover)] text-[var(--color-auth-btn-text)] font-semibold rounded-lg border-2 border-[var(--color-auth-btn-border)] shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98]"
        >
          {isSubmitting ? "Signing up..." : "Sign Up"}
        </Button>

        {/* Google Login */}
        <Button
          type="button"
          variant="outline"
          onClick={handleGoogleLogin}
          className="w-full h-11 bg-[var(--color-auth-btn-outline-bg)] text-[var(--color-auth-btn-outline-text)] border-2 border-[var(--color-auth-btn-border)] rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-[var(--color-auth-btn-outline-hover-bg)] shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98]"
        >
          <GoogleIcon />
          Sign up with Google
        </Button>
      </form>

      {/* Login Link */}
      <p className="text-center text-sm text-gray-600 mt-6">
        Do you already have an account?{" "}
        <Link
          to="/login"
          className="text-[var(--color-auth-link-dark)] font-semibold hover:underline"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}
