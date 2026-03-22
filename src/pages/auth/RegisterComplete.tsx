import { useForm } from "react-hook-form";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useRegisterStore } from "../../store/registerStore";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { AppRoute } from "../../lib/constants";
import { useRegister } from "@/hooks/useAuth";
import { useState } from "react";
import {
  EyeIcon,
  EyeOffIcon,
  Lock,
  // User,
  Mail,
  Smartphone,
  CalendarIcon,
} from "lucide-react";
import { FaMale, FaFemale } from "react-icons/fa";
import { toast } from "sonner";

type FormData = {
  firstName: string;
  lastName: string;
  password: string;
  gender: "Male" | "Female";
  dateOfBirth: string;
};

export default function RegisterComplete() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect");

  const registerData = useRegisterStore((s) => s.registerData);
  const clearRegisterData = useRegisterStore((s) => s.clearRegisterData);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      gender: "Male",
    },
  });

  const { mutate: registerAccount, isPending, isSuccess } = useRegister();
  const [showPassword, setShowPassword] = useState(false);
  const genderValue = watch("gender");

  const onSubmit = (data: FormData) => {
    if (!registerData) return;

    // const payload = {
    //   ...registerData,
    //   ...data,
    //   fullName: `${data.firstName.trim()} ${data.lastName.trim()}`,
    // };

    registerAccount(
    {
      email: registerData.email,
      phoneNumber: registerData.phoneNumber,
      firstName: data.firstName,
      lastName: data.lastName,
      password: data.password,
      gender: data.gender,
      dateOfBirth: data.dateOfBirth,
    },
      {
        onSuccess: () => {
          toast.success("Registration Successful", {
            description: "Your account has been created.",
          });
          clearRegisterData();
          navigate(
            redirect
              ? `${AppRoute.LOGIN}?redirect=${encodeURIComponent(redirect)}`
              : AppRoute.LOGIN,
          );
        },
        onError: (err) => {
          toast.error("Registration Failed", {
            description: (err as Error)?.message || "Something went wrong.",
          });
        },
      },
    );
  };

  // 🛡️ Guard Clause: Redirect back to basic registration step if state is missing
  // Combined with !isSuccess to prevent submission cleanup (clearRegisterData) from triggering a redirect loop.
  if (!registerData && !isSuccess) {
    const redirectParam = redirect
      ? `?redirect=${encodeURIComponent(redirect)}`
      : "";
    return (
      <Navigate to={`${AppRoute.REGISTER_BASIC}${redirectParam}`} replace />
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-[var(--color-border)] p-8 w-full max-w-md mx-auto">
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

      <div className="mb-6 text-center">
        <h2 className="text-lg font-semibold text-[#1C4D8D]">Registration</h2>
        <p className="text-sm text-gray-500 mt-1">
          Fill in your information to start using DreamGuard
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Readonly Section */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" /> Email
            </Label>
            <div className="px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-lg text-slate-500 text-xs truncate">
              {registerData?.email}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-slate-400" /> Phone
            </Label>
            <div className="px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-lg text-slate-500 text-xs">
              {registerData?.phoneNumber}
            </div>
          </div>
        </div>

        {/* Full Name */}
        {/* <div className="space-y-1.5">
          <Label htmlFor="fullName" className="text-sm font-semibold text-slate-700">Full Name</Label>
          <div className="relative">
            <Input
              id="fullName"
              placeholder="E.g. Nguyễn Văn A"
              {...register("fullName", { required: "Full name is required" })}
              className="pl-10 h-11"
            />
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
        </div> */}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>First Name</Label>
            <Input {...register("firstName", { required: "Required" })} />
          </div>
          <div>
            <Label>Last Name</Label>
            <Input {...register("lastName", { required: "Required" })} />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <Label
            htmlFor="password"
            className="text-sm font-semibold text-slate-700"
          >
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="password"
              className="pl-10 pr-10 h-11"
              {...register("password", {
                required: "Password is required",
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/,
                  message: "Required lower/upper/number/special char",
                },
                minLength: { value: 8, message: "Min 8 characters" },
              })}
            />
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Gender */}
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold text-slate-700">Gender</Label>
          <div className="flex gap-2 p-1 bg-gray-50 border border-gray-100 rounded-xl h-11">
            <button
              type="button"
              onClick={() =>
                setValue("gender", "Male", { shouldValidate: true })
              }
              className={`flex-1 rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 transition-all ${
                genderValue === "Male"
                  ? "bg-white shadow-sm border border-blue-100 text-blue-500"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <FaMale className="w-4 h-4" /> Male
            </button>
            <button
              type="button"
              onClick={() =>
                setValue("gender", "Female", { shouldValidate: true })
              }
              className={`flex-1 rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 transition-all ${
                genderValue === "Female"
                  ? "bg-white shadow-sm border border-pink-100 text-pink-500"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <FaFemale className="w-4 h-4" /> Female
            </button>
          </div>
        </div>

        {/* Date of Birth */}
        <div className="space-y-1.5">
          <Label
            htmlFor="dateOfBirth"
            className="text-sm font-semibold text-slate-700 flex items-center gap-1.5"
          >
            <CalendarIcon className="w-3.5 h-3.5 text-slate-400" /> Date of
            Birth
          </Label>
          <Input
            id="dateOfBirth"
            type="date"
            {...register("dateOfBirth", {
              required: "Date of birth is required",
            })}
            className="h-11 rounded-lg border-gray-200 focus:border-[#4988c4] focus:ring-4 focus:ring-[#4988c4]/10 transition-all text-sm"
          />
          {errors.dateOfBirth && (
            <p className="text-red-500 text-xs mt-1">
              Date of birth is required
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="w-full h-11 bg-[var(--color-auth-btn-bg)] hover:bg-[var(--color-auth-btn-hover)] text-[var(--color-auth-btn-text)] font-semibold rounded-lg border-2 border-[var(--color-auth-btn-border)] shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98]"
        >
          {isPending ? "Creating..." : "Complete Registration"}
        </Button>
      </form>
    </div>
  );
}
