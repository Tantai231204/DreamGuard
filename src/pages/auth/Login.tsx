import { useState, useCallback } from "react";
import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
// import { useAuthStore } from "../../store/authStore";
// import { AppRoute } from "../../lib/constants";
import { Eye, EyeOff, Lock, Phone } from "lucide-react";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { useLogin } from "../../hooks/useAuth";

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

const loginSchema = z.object({
  phoneNumber: z.string().min(9, "Invalid phone number"),
  //   const setAuth = useAuthStore((state) => state.setAuth);
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const redirect = searchParams.get("redirect");
  const from = location.state?.from?.pathname || location.state?.from || redirect;
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phoneNumber: "",
      password: "",
    },
  });

  const { mutate: login, isPending, error } = useLogin();

  const onSubmit = (data: LoginFormData) => {
    login(data, {
      onSuccess: (res) => {
        if (from) {
          navigate(from);
        } else if (res.roleName === "Admin") {
          navigate("/admin");
        } else {
          navigate("/profile");
        }
      },
    });
  };

  //   const handleGoogleLogin = useCallback(() => {
  //   setAuth({
  //     accessToken: `google-token-${Date.now()}`,
  //     refreshToken: "",
  //     roleName: "User",
  //   });

  //   navigate(AppRoute.PROFILE);
  // }, [navigate]);

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
        {/* phoneNumber */}
        <div className="space-y-1.5">
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="phoneNumber"
              type="text"
              placeholder="phoneNumber"
              className="pl-10 h-11"
              {...register("phoneNumber")}
            />
          </div>
          {errors.phoneNumber && (
            <p className="text-xs text-red-500">{errors.phoneNumber.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="password"
              className="pl-10 pr-10 h-11"
              {...register("password")}
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
          {/* Forgot Password */}
          <div className="text-right">
            <Link
              to="/forgot-password"
              className="text-sm text-[var(--color-auth-link)] hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        {error instanceof Error && (
          <p className="text-sm text-red-500">{error.message}</p>
        )}

        {/* Log In Button */}
        <Button
          type="submit"
          disabled={isPending}
          className="w-full h-11 bg-[var(--color-auth-btn-bg)] hover:bg-[var(--color-auth-btn-hover)] text-[var(--color-auth-btn-text)] font-semibold rounded-lg border-2 border-[var(--color-auth-btn-border)] shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98]"
        >
          {isPending ? "Logging in..." : "Log In"}
        </Button>

        {/* Google Login */}
        <Button
          type="button"
          variant="outline"
          //   onClick={handleGoogleLogin}
          className="w-full h-11 bg-[var(--color-auth-btn-outline-bg)] text-[var(--color-auth-btn-outline-text)] border-2 border-[var(--color-auth-btn-border)] rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-[var(--color-auth-btn-outline-hover-bg)] shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98]"
        >
          <GoogleIcon />
          Login with Google
        </Button>
      </form>

      {/* Register Link */}
      <p className="text-center text-sm text-gray-600 mt-6">
        Don't have an account yet?{" "}
        <Link
          to={redirect ? `/register?redirect=${encodeURIComponent(redirect)}` : "/register"}
          className="text-[var(--color-auth-link-dark)] font-semibold hover:underline"
        >
          Sign In
        </Link>
      </p>
    </div>
  );
}
