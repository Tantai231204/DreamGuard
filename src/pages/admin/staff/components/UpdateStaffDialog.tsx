import { useEffect, useState } from "react";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, User, Phone, Building, Briefcase, Lock, Key, Eye, EyeOff, ShieldAlert, Mail, Save, AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Staff } from "../types";

const updateStaffSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(50, "Full name is too long").trim(),
  phoneNumber: z.string().regex(/^(0|\+84)\d{9,10}$/, "Invalid phone number format (e.g. 0912345678)"),
  gender: z.enum(["Male", "Female", "Other"]),
  dateOfBirth: z.string().optional().nullable().or(z.literal("")),
  address: z.string().optional().nullable().or(z.literal("")),
  password: z.string().optional().or(z.literal("")),
  confirmPassword: z.string().optional().or(z.literal("")),
}).refine((data) => {
  if (data.password && data.password.length > 0) {
    return data.password === data.confirmPassword;
  }
  return true;
}, {
  path: ["confirmPassword"],
  message: "Passwords do not match",
});

export type UpdateInfoFormValues = z.infer<typeof updateStaffSchema>;

interface UpdateStaffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff: Staff;
  onSubmit: (data: UpdateInfoFormValues) => Promise<void>;
  isLoading?: boolean;
}

export function UpdateStaffDialog({ open, onOpenChange, staff, onSubmit, isLoading }: UpdateStaffDialogProps) {
  const [activeTab, setActiveTab] = useState("profile");
  const [isSecurityUnlocked, setIsSecurityUnlocked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [prevOpen, setPrevOpen] = useState(open);

  const { register, handleSubmit, reset, control, formState: { errors, isDirty } } = useForm<UpdateInfoFormValues>({
    resolver: zodResolver(updateStaffSchema) as Resolver<UpdateInfoFormValues>,
    mode: "onChange",
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      gender: "Male",
      dateOfBirth: "",
      address: "",
      password: "",
      confirmPassword: "",
    }
  });

  // Sync state during render when dialog opens/closes
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setIsSecurityUnlocked(false);
      setActiveTab("profile");
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  }

  useEffect(() => {
    if (open && staff) {
      reset({
        fullName: staff.fullName || "",
        phoneNumber: staff.phoneNumber || "",
        gender: (staff.gender as "Male" | "Female" | "Other") || "Male",
        dateOfBirth: staff.dateOfBirth ? staff.dateOfBirth.split('T')[0] : "",
        address: staff.address || "",
        password: "",
        confirmPassword: "",
      });
    }
  }, [staff, open, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px] w-full p-0 gap-0 border-none shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] bg-gray-50 flex flex-col overflow-hidden rounded-2xl">
        <VisuallyHidden>
          <DialogTitle>Update Staff Profile</DialogTitle>
        </VisuallyHidden>

        {/* Header Panel */}
        <div className="flex flex-col px-6 pt-6 pb-4 bg-white border-b border-gray-100/80 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 shadow-sm flex-shrink-0">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight leading-tight uppercase text-primary">
                Update Profile
              </h2>
              <p className="text-[10px] text-gray-500 font-bold mt-1 uppercase tracking-widest opacity-60">
                Modify staff personal information & security
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            <div className="px-6 pt-3 bg-white/50 backdrop-blur-sm shrink-0">
              <TabsList className="relative grid grid-cols-2 w-full h-11 bg-slate-200/50 p-1 rounded-xl border border-slate-200/60 gap-1 overflow-hidden">
                <TabsTrigger
                  value="profile"
                  className="rounded-lg text-[11px] font-black gap-2 data-[state=active]:text-primary text-slate-500 flex items-center justify-center h-full outline-none transition-all"
                >
                  <User className="h-4 w-4" />
                  Info
                </TabsTrigger>
                <TabsTrigger
                  value="security"
                  className="rounded-lg text-[11px] font-black gap-2 data-[state=active]:text-primary text-slate-500 flex items-center justify-center h-full outline-none transition-all"
                >
                  <Lock className="h-4 w-4" />
                  Security
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="relative h-[480px] overflow-hidden bg-gray-50/50">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="h-full overflow-y-auto no-scrollbar pt-6 pb-10 px-8"
                >
                  <TabsContent value="profile" className="m-0 space-y-6">
                    {/* Identity Metrics */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-px bg-gray-200 flex-1" />
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.25em]">Personal Metrics</span>
                        <div className="h-px bg-gray-200 flex-1" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="fullName" className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name *</Label>
                        <div className="relative group">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                          <Input
                            id="fullName"
                            placeholder="e.g. Vu Dat"
                            {...register("fullName")}
                            className={cn(
                              "pl-11 h-12 rounded-[18px] bg-white border-gray-200 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm shadow-sm",
                              errors.fullName && "border-red-300 focus:border-red-400 focus:ring-red-500/10"
                            )}
                          />
                        </div>
                        {errors.fullName && <p className="text-[10px] text-red-500 font-bold ml-2">{errors.fullName.message}</p>}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="gender" className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Gender</Label>
                          <Controller
                            control={control}
                            name="gender"
                            render={({ field }) => (
                              <Select onValueChange={field.onChange} value={field.value || "Male"}>
                                <SelectTrigger className="h-12 rounded-[18px] bg-white border-gray-200 font-bold shadow-sm">
                                  <SelectValue placeholder="Gender" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl shadow-2xl border-gray-100">
                                  <SelectItem value="Male" className="font-bold cursor-pointer">Male</SelectItem>
                                  <SelectItem value="Female" className="font-bold cursor-pointer">Female</SelectItem>
                                  <SelectItem value="Other" className="font-bold cursor-pointer">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="dateOfBirth" className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">DOB</Label>
                          <Controller
                            control={control}
                            name="dateOfBirth"
                            render={({ field }) => (
                              <DatePicker
                                mode="single"
                                value={field.value ? new Date(field.value) : undefined}
                                onChange={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                                placeholder="YYYY-MM-DD"
                                className="h-12 rounded-[18px] font-bold"
                              />
                            )}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address" className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Address</Label>
                        <div className="relative group">
                          <Building className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                          <Input
                            id="address"
                            placeholder="e.g. 123, KP.2, HN"
                            {...register("address")}
                            className="pl-11 h-12 rounded-[18px] bg-white border-gray-200 font-bold text-sm shadow-sm"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Read-only Badge for Role */}
                    <div className="flex items-center justify-between p-4 bg-slate-100 rounded-2xl border border-slate-200/50 mt-6">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-slate-400" />
                        <span className="text-xs font-black uppercase tracking-widest text-slate-500">System Role</span>
                      </div>
                      <span className="px-3 py-1 bg-slate-500 text-white text-[9px] font-black uppercase tracking-widest rounded-full">{staff.role}</span>
                    </div>
                  </TabsContent>

                  <TabsContent value="security" className="m-0 space-y-6">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                      <h3 className="text-[10px] font-black text-gray-800 uppercase tracking-[0.25em]">Security Access</h3>
                      <button
                        type="button"
                        onClick={() => setIsSecurityUnlocked(!isSecurityUnlocked)}
                        className={cn(
                          "inline-flex items-center gap-2 h-7 px-3 text-[9px] font-black uppercase tracking-widest rounded-full border transition-all shadow-sm",
                          isSecurityUnlocked
                            ? "bg-amber-100 border-amber-300 text-amber-800"
                            : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                        )}
                      >
                        {isSecurityUnlocked ? <ShieldAlert className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                        {isSecurityUnlocked ? "Lock Security" : "Unlock to Edit"}
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 opacity-50">System Email</Label>
                        <div className="relative group opacity-60">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="email"
                            value={staff.email || ""}
                            disabled
                            className="pl-11 h-12 rounded-[18px] bg-gray-100 border-gray-200 font-bold text-sm cursor-not-allowed"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phoneNumber" className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number *</Label>
                        <div className="relative group">
                          <Phone className={cn("absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors", isSecurityUnlocked ? "text-primary" : "text-gray-400")} />
                          <Input
                            id="phoneNumber"
                            placeholder="e.g. 09xxxxxxxx"
                            disabled={!isSecurityUnlocked}
                            {...register("phoneNumber")}
                            className={cn(
                              "pl-11 h-12 rounded-[18px] bg-white border-gray-200 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 font-bold text-sm shadow-sm transition-all",
                              !isSecurityUnlocked && "bg-gray-100/50 cursor-not-allowed",
                              errors.phoneNumber && "border-red-300 focus:ring-red-500/10"
                            )}
                          />
                        </div>
                        {errors.phoneNumber && <p className="text-[10px] text-red-500 font-bold ml-2">{errors.phoneNumber.message}</p>}
                      </div>

                      {isSecurityUnlocked && (
                        <div className="grid grid-cols-1 gap-y-4 pt-2 animate-in slide-in-from-top-2 duration-300">
                          <div className="space-y-2">
                            <Label htmlFor="password" className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Set New Password</Label>
                            <div className="relative group">
                              <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                              <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Leave blank to keep current"
                                {...register("password")}
                                autoComplete="new-password"
                                className="pl-11 pr-11 h-12 rounded-[18px] bg-white border-gray-200 focus:border-primary font-bold text-sm tracking-widest shadow-sm"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                              >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Confirm New Password</Label>
                            <div className="relative group">
                              <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                              <Input
                                id="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm your new password"
                                {...register("confirmPassword")}
                                autoComplete="new-password"
                                className="pl-11 pr-11 h-12 rounded-[18px] bg-white border-gray-200 focus:border-primary font-bold text-sm tracking-widest shadow-sm"
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                              >
                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                            {errors.confirmPassword && <p className="text-[10px] text-red-500 font-bold ml-2">{errors.confirmPassword.message}</p>}
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </motion.div>
              </AnimatePresence>
            </div>
          </Tabs>

          <footer className="px-8 py-5 bg-white border-t border-gray-100 flex flex-col gap-3 shrink-0 shadow-[0_-4px_12px_rgba(0,0,0,0.02)]">
            {!isDirty && (
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-100 animate-in fade-in duration-500">
                <AlertCircle className="w-3 h-3 text-slate-400" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">No modifications detected</span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
                className="flex-1 h-11 font-black text-[10px] uppercase tracking-[0.2em] text-gray-400 hover:text-gray-900 border-gray-200 rounded-[18px] shadow-sm transform active:scale-[0.98] transition-all"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !isDirty}
                className={cn(
                  "flex-[1.5] h-11 font-black text-[10px] uppercase tracking-[0.2em] rounded-[18px] gap-2 transform active:scale-[0.98] transition-all border-none text-white shadow-lg",
                  isDirty 
                    ? "bg-primary hover:opacity-90 shadow-primary/20" 
                    : "bg-slate-300 cursor-not-allowed shadow-none"
                )}
              >
                {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                {isDirty ? "Confirm Changes" : "Save Changes"}
              </Button>
            </div>
          </footer>
        </form>
      </DialogContent>
    </Dialog>
  );
}
