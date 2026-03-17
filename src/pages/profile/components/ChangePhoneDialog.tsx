import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Smartphone, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "../../../components/ui/dialog";
import { requestChangePhoneNumber, confirmChangePhoneNumber } from "../../../api/services/userProfile.service";

const changePhoneSchema = z.object({
  phoneNumber: z.string()
    .min(10, "Phone number must be at least 10 digits")
    .max(11, "Phone number cannot exceed 11 digits")
    .regex(/^[0-9]+$/, "Invalid phone number format"),
  otpCode: z.string().length(6, "OTP must be exactly 6 digits")
});

type ChangePhoneFormValues = z.infer<typeof changePhoneSchema>;

interface ChangePhoneDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPhone?: string;
}

export default function ChangePhoneDialog({ open, onOpenChange, currentPhone }: ChangePhoneDialogProps) {
  const queryClient = useQueryClient();
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const { register, handleSubmit, formState: { errors }, reset, setError } = useForm<ChangePhoneFormValues>({
    resolver: zodResolver(changePhoneSchema),
    defaultValues: {
      phoneNumber: "",
      otpCode: ""
    }
  });

  const requestOtpMutation = useMutation({
    mutationFn: requestChangePhoneNumber,
    onSuccess: () => {
      toast.success("OTP sent to your current phone/email.");
      setOtpSent(true);
      setCountdown(60);
    },
    onError: (err: Error) => {
      toast.error("Failed to requests OTP.", { description: err.message });
    }
  });

  const confirmMutation = useMutation({
    mutationFn: confirmChangePhoneNumber,
    onSuccess: () => {
      toast.success("Phone number updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      onOpenChange(false);
      reset();
      setOtpSent(false);
    },
    onError: (err: Error) => {
      toast.error("Failed to update phone number.", { description: err.message });
    }
  });

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const onSubmit = (data: ChangePhoneFormValues) => {
    if (!otpSent) {
      toast.error("Please click 'Send OTP' first to verify your ownership.");
      return;
    }
    if (currentPhone && data.phoneNumber === currentPhone) {
      setError("phoneNumber", { message: "New phone number cannot be the same as the current number." });
      return;
    }
    confirmMutation.mutate(data);
  };

  const handleSendOtp = () => {
    requestOtpMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { onOpenChange(val); if (!val) { reset(); setOtpSent(false); } }}>
      <DialogContent className="sm:max-w-[400px] rounded-2xl border-none shadow-2xl p-0 overflow-hidden [&>button]:text-slate-500 [&>button]:hover:text-slate-800 [&>button]:bg-slate-50/50 [&>button]:hover:bg-slate-100 [&>button]:rounded-xl [&>button]:top-6 [&>button]:right-6 [&>button]:p-1.5 [&>button]:transition-all [&>button]:border [&>button]:border-slate-100">
        <div className="p-6 flex items-center gap-4 border-b border-slate-100 bg-slate-50/30">
          <div className="w-11 h-11 rounded-xl bg-[#4988c4]/10 flex items-center justify-center text-[#4988c4] shrink-0">
            <Smartphone className="h-5 w-5" />
          </div>
          <div className="text-left">
            <DialogTitle className="text-base font-black text-slate-800 tracking-tight">Change Phone Number</DialogTitle>
            <DialogDescription className="text-slate-400 text-[11px] font-medium mt-0.5">
              Verify your identity and update your setting.
            </DialogDescription>
          </div>
        </div>

        <form className="p-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          {/* Step 1: Request OTP */}
          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Current Status</Label>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Phone</p>
                <p className="text-sm font-bold text-slate-700 mt-0.5">{currentPhone || "Not set"}</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 px-3 rounded-lg text-xs font-bold border-slate-200"
                onClick={handleSendOtp}
                disabled={requestOtpMutation.isPending || countdown > 0}
              >
                {requestOtpMutation.isPending ? "Sending..." : countdown > 0 ? `Resend (${countdown}s)` : otpSent ? "Resend" : "Send OTP"}
              </Button>
            </div>
          </div>

          {/* Step 2: Input OTP & New Phone */}
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">OTP Code</Label>
              <Input
                {...register("otpCode")}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                disabled={!otpSent}
                className={cn(
                  "h-11 rounded-xl border-slate-200 focus:border-[#4988c4] transition-all font-medium text-sm",
                  !otpSent && "bg-slate-50/80 text-slate-400 border-dashed cursor-not-allowed"
                )}
              />
              {errors.otpCode && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.otpCode.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">New Phone Number</Label>
              <Input
                {...register("phoneNumber")}
                placeholder="E.g. 0376880798"
                disabled={!otpSent}
                className={cn(
                  "h-11 rounded-xl border-slate-200 focus:border-[#4988c4] transition-all font-medium text-sm",
                  !otpSent && "bg-slate-50/80 text-slate-400 border-dashed cursor-not-allowed"
                )}
              />
              {errors.phoneNumber && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.phoneNumber.message}</p>}
            </div>

            <div className="p-3 rounded-lg bg-[#4988c4]/5 border border-[#4988c4]/10 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#4988c4]" />
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">We will send a code to confirm.</span>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                className="flex-1 h-11 rounded-xl font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 text-sm transition-all"
                onClick={() => { onOpenChange(false); reset(); setOtpSent(false); }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="group/btn relative flex-1 h-11 rounded-xl bg-[#4988c4] hover:bg-[#4988c4]/90 text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-[#4988c4]/20 hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 overflow-hidden border-none"
                disabled={confirmMutation.isPending}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                <span className="relative z-10">{confirmMutation.isPending ? "UPDATING..." : "CONFIRM"}</span>
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
