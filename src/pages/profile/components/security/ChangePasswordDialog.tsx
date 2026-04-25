import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  EyeOpenIcon,
  EyeNoneIcon,
  CheckCircledIcon,
} from "@radix-ui/react-icons";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import { useChangePassword, useLogout } from "../../../../hooks/useAuth";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "../../../../components/ui/dialog";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least 1 uppercase letter")
      .regex(/[a-z]/, "Must contain at least 1 lowercase letter")
      .regex(/[0-9]/, "Must contain at least 1 number")
      .regex(/[^A-Za-z0-9]/, "Must contain at least 1 special character"),
    confirmNewPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  });

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ChangePasswordDialog({ open, onOpenChange }: ChangePasswordDialogProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    }
  });

  const { mutate: changePasswordMutation, isPending } = useChangePassword();
  const { mutate: logout } = useLogout();

  const onSubmitChangePassword = (data: ChangePasswordFormValues) => {
    changePasswordMutation(
      { currentPassword: data.currentPassword, newPassword: data.newPassword },
      {
        onSuccess: () => {
          toast.success("Password changed successfully.", {
            description: "Please log in again with your new password."
          });
          onOpenChange(false);
          reset();
          // Log out immediately to force re-authentication
          logout();
        },
        onError: (err) => {
          toast.error("Failed to update password.", {
            description: (err as Error)?.message || "Something went wrong."
          });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] rounded-2xl border-none shadow-2xl p-0 overflow-hidden [&>button]:text-slate-500 [&>button]:hover:text-slate-800 [&>button]:bg-slate-50/50 [&>button]:hover:bg-slate-100 [&>button]:rounded-xl [&>button]:top-6 [&>button]:right-6 [&>button]:p-1.5 [&>button]:transition-all [&>button]:border [&>button]:border-slate-100">
        <div className="p-6 flex items-center gap-4 border-b border-slate-100 bg-slate-50/30">
          <div className="w-11 h-11 rounded-xl bg-[#4988c4]/10 flex items-center justify-center text-[#4988c4] shrink-0">
            <Lock className="h-5 w-5" />
          </div>
          <div className="text-left">
            <DialogTitle className="text-base font-black text-slate-800 tracking-tight">Update Password</DialogTitle>
            <DialogDescription className="text-slate-400 text-[11px] font-medium mt-0.5">
              Set a new strong password for your account.
            </DialogDescription>
          </div>
        </div>

        <form className="p-6 space-y-4" onSubmit={handleSubmit(onSubmitChangePassword)}>
          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Current Password</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                {...register("currentPassword")}
                autoComplete="current-password"
                className="h-10 rounded-xl border-slate-200 focus:border-[#4988c4] transition-all font-medium text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeNoneIcon className="h-4 w-4" /> : <EyeOpenIcon className="h-4 w-4" />}
              </button>
            </div>
            {errors.currentPassword && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.currentPassword.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">New Password</Label>
            <div className="relative">
              <Input
                type={showNewPassword ? "text" : "password"}
                {...register("newPassword")}
                autoComplete="new-password"
                className="h-10 rounded-xl border-slate-200 focus:border-[#4988c4] transition-all font-medium text-sm"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showNewPassword ? <EyeNoneIcon className="h-4 w-4" /> : <EyeOpenIcon className="h-4 w-4" />}
              </button>
            </div>
            {errors.newPassword && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.newPassword.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Confirm New Password</Label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                {...register("confirmNewPassword")}
                autoComplete="new-password"
                className="h-10 rounded-xl border-slate-200 focus:border-[#4988c4] transition-all font-medium text-sm"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showConfirmPassword ? <EyeNoneIcon className="h-4 w-4" /> : <EyeOpenIcon className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmNewPassword && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.confirmNewPassword.message}</p>}
          </div>

          <div className="p-4 rounded-xl bg-[#4988c4]/5 border border-[#4988c4]/10">
            <p className="text-[10px] font-bold text-[#4988c4] uppercase tracking-wider mb-2">Requirements</p>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-700">
                <CheckCircledIcon className="h-3.5 w-3.5 text-[#4988c4]" /> At least 8 characters
              </div>
              <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-700">
                <CheckCircledIcon className="h-3.5 w-3.5 text-[#4988c4]" /> Upper & lowercase letters
              </div>
              <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-700">
                <CheckCircledIcon className="h-3.5 w-3.5 text-[#4988c4]" /> At least 1 number & 1 special character
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              className="flex-1 h-11 rounded-xl font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-50 text-sm transition-all"
              onClick={() => { onOpenChange(false); reset(); }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="group/btn relative flex-1 h-11 rounded-xl bg-[#4988c4] hover:bg-[#4988c4]/90 text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-[#4988c4]/20 hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 overflow-hidden border-none"
              disabled={isPending}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
              <span className="relative z-10">{isPending ? "UPDATING..." : "UPDATE PASSWORD"}</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
