import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useRegisterStore } from "../../store/registerStore";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { AppRoute } from "../../lib/constants";
import { useRegister } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";

type FormData = {
  firstName: string;
  lastName: string;
  password: string;
  gender: "Male" | "Female";
  dateOfBirth: string;
};

export default function RegisterComplete() {
  const navigate = useNavigate();

  const registerData = useRegisterStore((s) => s.registerData);
  const clearRegisterData = useRegisterStore((s) => s.clearRegisterData);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const { mutate: registerAccount, isPending } = useRegister();

  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = (data: FormData) => {
    if (!registerData) return;

    registerAccount(
      {
        ...registerData,
        ...data,
      },
      {
        onSuccess: () => {
          alert("Register success");
          clearRegisterData();
          navigate("/login");
        },
        onError: () => {
          alert("Register failed");
        },
      },
    );
  };

  useEffect(() => {
  if (!registerData) {
    navigate(AppRoute.REGISTER_BASIC, { replace: true });
  }
}, [registerData, navigate]);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 w-full max-w-md mx-auto">
      {/* Logo */}
      <div className="flex flex-col items-center mb-6">
        <img src="/images/logo_with_name.svg" className="h-20 object-contain" />
      </div>

      <h2 className="text-lg font-semibold text-center mb-6">
        Complete Registration
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div>
          <Label>Email</Label>
          <Input value={registerData?.email || ""} disabled />
        </div>

        {/* Phone */}
        <div>
          <Label>Phone Number</Label>
          <Input value={registerData?.phoneNumber || ""} disabled />
        </div>

        {/* First Name */}
        <div>
          <Label>First Name</Label>
          <Input
            {...register("firstName", { required: "First name is required" })}
          />
          {errors.firstName && (
            <p className="text-red-500 text-xs mt-1">
              {errors.firstName.message}
            </p>
          )}
        </div>

        {/* Last Name */}
        <div>
          <Label>Last Name</Label>
          <Input
            {...register("lastName", { required: "Last name is required" })}
          />
          {errors.lastName && (
            <p className="text-red-500 text-xs mt-1">
              {errors.lastName.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <Label>Password</Label>

          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              {...register("password", {
                required: "Password is required",
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/,
                  message:
                    "Password must contain lowercase, uppercase, number and special character",
                },
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters",
                },
              })}
            />

            <button
              type="button"
              className="absolute right-3 top-2.5 text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
            </button>
          </div>

          {errors.password && (
            <p className="text-red-500 text-xs mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Gender */}
        <div>
          <Label>Gender</Label>
          <select
            {...register("gender", { required: true })}
            className="w-full border rounded-md h-10 px-2"
          >
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        {/* Date of Birth */}
        <div>
          <Label>Date of Birth</Label>
          <Input type="date" {...register("dateOfBirth", { required: true })} />
        </div>

        <Button type="submit" disabled={isPending} className="w-full h-11">
          {isPending ? "Creating..." : "Complete Register"}
        </Button>
      </form>
    </div>
  );
}
