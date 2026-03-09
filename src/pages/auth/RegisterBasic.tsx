import { useForm } from "react-hook-form";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useRegisterStore } from "../../store/registerStore";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { useSendRegisterOtp } from "../../hooks/useAuth";
import type { AxiosError } from "axios";
import { toast } from "sonner";

type FormData = {
  email: string;
  phoneNumber: string;
  agree: boolean;
};

export default function RegisterBasic() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect");
  const setRegisterData = useRegisterStore((s) => s.setRegisterData);
  const { mutate: sendOtp, isPending } = useSendRegisterOtp();

  const onSubmit = (data: FormData) => {
    sendOtp(
      {
        email: data.email,
        phone: data.phoneNumber,
      },
      {
        onSuccess: () => {
          setRegisterData({
            email: data.email,
            phoneNumber: data.phoneNumber,
          });

          navigate(redirect ? `/verify-register-otp?redirect=${encodeURIComponent(redirect)}` : "/verify-register-otp");
        },

        onError: (err: Error) => {
          const axiosError = err as AxiosError<{ message: string }>;
          toast.error("Process Failed", {
            description: axiosError.response?.data?.message || "Failed to send OTP. Please try again.",
          });
        },
      },
    );
  };

  const {
    register,
    handleSubmit,
    formState: { isValid, errors },
  } = useForm<FormData>({
    mode: "onChange",
  });

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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email */}
        <div>
          <Label className="text-sm font-medium text-[#1C4D8D]">Email *</Label>
          <Input
            type="email"
            placeholder="Email"
            {...register("email", { required: true })}
            className="h-11 mt-1"
          />
        </div>

        {/* Phone */}
        <div>
          <Label className="text-sm font-medium text-[#1C4D8D]">
            Phone number *
          </Label>

          <Input
            placeholder="Phone number"
            {...register("phoneNumber", {
              required: "Phone number is required",
              pattern: {
                value: /^(0|\+84)[0-9]{9}$/,
                message: "Phone number must be valid (ex: 0912345678)",
              },
            })}
            className="h-11 mt-1"
          />

          {errors.phoneNumber && (
            <p className="text-red-500 text-xs mt-1">
              {errors.phoneNumber.message}
            </p>
          )}
        </div>

        {/* Terms */}
        <div className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            {...register("agree", { required: true })}
            className="mt-1"
          />

          <p className="text-gray-500">
            I have read and agree to the{" "}
            <span className="text-[#1C4D8D] font-medium cursor-pointer">
              Terms & Conditions
            </span>{" "}
            and{" "}
            <span className="text-[#1C4D8D] font-medium cursor-pointer">
              Privacy Policy
            </span>{" "}
            provided.
          </p>
        </div>

        {/* Send OTP */}
        <Button
          type="submit"
          disabled={!isValid || isPending}
          className="w-full h-11 bg-[var(--color-auth-btn-bg)] hover:bg-[var(--color-auth-btn-hover)] text-[var(--color-auth-btn-text)] font-semibold rounded-lg border-2 border-[var(--color-auth-btn-border)] shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98]"
        >
          {isPending ? "Sending..." : "Send OTP"}
        </Button>

        {/* Login */}
        <p className="text-center text-sm text-gray-500 mt-3">
          Do you already have an account?{" "}
          <Link
            to={redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : "/login"}
            className="text-[var(--color-auth-link-dark)] font-semibold hover:underline"
          >
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}
