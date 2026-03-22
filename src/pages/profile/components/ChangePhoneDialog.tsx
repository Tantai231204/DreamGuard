import { useState, useEffect, useMemo } from "react";
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

const createChangePhoneSchema = (currentPhone?: string) =>
  z.object({
    phoneNumber: z.string()
      .length(10, "Phone number must be exactly 10 digits")
      .regex(/^0[35789][0-9]{8}$/, "Invalid format (must start with 03, 05, 07, 08, 09)"),
    otpCode: z.string().length(6, "OTP must be exactly 6 digits")
  }).refine(data => {
    if (!currentPhone) return true;
    const clean = (p: string) => {
      let c = p.replace(/\D/g, "");
      if (c.startsWith("84")) c = "0" + c.slice(2);
      return c;
    };
    return clean(data.phoneNumber) !== clean(currentPhone);
  }, {
    message: "New phone number cannot be the same as current number",
    path: ["phoneNumber"]
  });

type ChangePhoneFormValues = z.infer<ReturnType<typeof createChangePhoneSchema>>;

interface ChangePhoneDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPhone?: string;
}

export default function ChangePhoneDialog({ open, onOpenChange, currentPhone }: ChangePhoneDialogProps) {
  const queryClient = useQueryClient();
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const changePhoneSchema = useMemo(() => createChangePhoneSchema(currentPhone), [currentPhone]);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ChangePhoneFormValues>({
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
    confirmMutation.mutate(data);
  };

  const handleSendOtp = () => {
    requestOtpMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { onOpenChange(val); if (!val) { reset(); setOtpSent(false); setCountdown(0); } }}>
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
          {!otpSent ? (
            <div className="space-y-5 animate-in fade-in duration-300">
              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Step 1: Identity Verification</Label>
                <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Phone</p>
                    <p className="text-sm font-bold text-slate-700 mt-0.5">{currentPhone || "Not set"}</p>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-100/50 flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-[#4988c4] mt-0.5" />
                <p className="text-xs font-medium text-slate-600 leading-normal">To protect your account, we will send a 6-digit verification code to your registered contact method.</p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="flex-1 h-11 rounded-xl font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 text-sm transition-all"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={requestOtpMutation.isPending || countdown > 0}
                  className="group/btn relative flex-1 h-11 rounded-xl bg-[#4988c4] hover:bg-[#4988c4]/90 text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-[#4988c4]/10 hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 overflow-hidden border-none"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                  <span className="relative z-10">
                    {requestOtpMutation.isPending ? "SENDING..." : countdown > 0 ? `RESEND (${countdown}s)` : "SEND OTP CODE"}
                  </span>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-3 duration-300">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between mb-1">
                  <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Step 2: Verification Details</Label>
                  {countdown > 0 && <span className="text-[10px] font-bold text-[#4988c4]">Code sent ({countdown}s)</span>}
                </div>

                <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">OTP Code</Label>
                <Input
                  {...register("otpCode")}
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  className="h-11 rounded-xl border-slate-200 focus:border-[#4988c4] transition-all font-medium text-sm"
                />
                {errors.otpCode && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.otpCode.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">New Phone Number</Label>
                <Input
                  {...register("phoneNumber")}
                  placeholder="E.g. 0376880798"
                  className="h-11 rounded-xl border-slate-200 focus:border-[#4988c4] transition-all font-medium text-sm"
                />
                {errors.phoneNumber && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.phoneNumber.message}</p>}
              </div>

              <div className="flex gap-3 pt-3">
                <Button
                  type="button"
                  variant="ghost"
                  className="flex-1 h-11 rounded-xl font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 text-sm transition-all"
                  onClick={() => setOtpSent(false)}
                >
                  Back
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
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
