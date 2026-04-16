import { useState, useCallback, useEffect } from "react";
import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "../../store/authStore";
import { AppRoute, UserRole } from "../../lib/constants";
import { Eye, EyeOff, Lock, Phone } from "lucide-react";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { useLogin } from "../../hooks/useAuth";

const loginSchema = z.object({
  phoneNumber: z.string().min(9, "Invalid phone number"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { isAuthenticated, role } = useAuthStore();
  
  const redirect = searchParams.get("redirect");
  const from = location.state?.from?.pathname || location.state?.from || redirect;
  const [showPassword, setShowPassword] = useState(false);

  // Proactive redirection if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // Resolve "from" path
      const isStaff = role === UserRole.ADMIN || role === UserRole.MANAGER || role === UserRole.SELLER;
      let targetPath: string = AppRoute.PROFILE;

      if (isStaff) {
        targetPath = role === UserRole.SELLER ? "/admin/orders" : AppRoute.ADMIN;
      }
      
      if (from) {
        let fromPath = '';
        if (typeof from === 'string') fromPath = from;
        else if (typeof from === 'object' && from && 'pathname' in from) {
            fromPath = (from as { pathname: string }).pathname;
        }

        // Only use 'from' if it's actually a specific deep link, not just the home page
        if (fromPath && fromPath !== '/' && fromPath !== AppRoute.HOME) {
            targetPath = fromPath;
        }
      }

      // Avoid infinite loop if target is somehow login
      if (targetPath === AppRoute.LOGIN || targetPath === "/login") {
        targetPath = role === UserRole.SELLER ? "/admin/orders" : (isStaff ? AppRoute.ADMIN : AppRoute.PROFILE);
      }

      navigate(targetPath, { replace: true });
    }
  }, [isAuthenticated, role, navigate, from]);

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
    login(data);
  };

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
      </form>

      {/* Register Link */}
      <p className="text-center text-sm text-gray-600 mt-6">
        Don't have an account yet?{" "}
        <Link
          to={redirect ? `/register?redirect=${encodeURIComponent(redirect)}` : "/register"}
          className="text-[var(--color-auth-link-dark)] font-semibold hover:underline"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
