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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, UserPlus, Phone, Mail, Building, Briefcase, Key, User, Calendar, ShieldCheck, BadgeCheck, Eye, EyeOff, Lock, ShieldAlert } from "lucide-react";
import { FaMars, FaVenus, FaTransgender, FaVenusMars } from "react-icons/fa";
import type { Staff } from "../types";
// import type { CreateStaffRequest, UpdateStaffRequest } from "@/api/types/staff.types";
import { cn } from "@/lib/utils";

const baseStaffSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(50, "Full name is too long").trim(),
  email: z.string().min(1, "Email is required").email("Invalid email format").trim().toLowerCase(),
  phoneNumber: z.string().regex(/^(0|\+84)\d{9,10}$/, "Invalid phone number format (e.g. 0912345678)"),
  gender: z.enum(["Male", "Female", "Other"]),
  dateOfBirth: z.string().optional().nullable().or(z.literal("")),
  address: z.string().optional().nullable().or(z.literal("")),
  position: z.string().optional().nullable().or(z.literal("")),
  role: z.enum(["Manager", "Seller", "CleaningStaff"]),
});

const createStaffSchema = baseStaffSchema.extend({
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .max(32, "Password is too long"),
  confirmPassword: z.string().min(1, "Please confirm your password")
}).refine((data) => data.password === data.confirmPassword, {
  path: ["confirmPassword"],
  message: "Passwords do not match",
});

const updateStaffSchema = baseStaffSchema.extend({
  password: z.string().optional().or(z.literal("")),
  confirmPassword: z.string().optional().or(z.literal(""))
}).refine((data) => {
  if (data.password && data.password.length > 0) {
    return data.password === data.confirmPassword;
  }
  return true;
}, {
  path: ["confirmPassword"],
  message: "Passwords do not match",
});

export type StaffFormValues = z.infer<typeof createStaffSchema> & { confirmPassword?: string };

interface StaffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff?: Staff | null;
  onSubmit: (data: StaffFormValues) => Promise<void>;
  isLoading?: boolean;
}

export function StaffDialog({ open, onOpenChange, staff, onSubmit, isLoading }: StaffDialogProps) {
  const isEdit = !!staff;

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSecurityUnlocked, setIsSecurityUnlocked] = useState(false);
  const [prevOpen, setPrevOpen] = useState(open);

  if (open !== prevOpen) {
    setPrevOpen(open);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setIsSecurityUnlocked(false);
  }

  const schema = isEdit ? updateStaffSchema : createStaffSchema;

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<StaffFormValues>({
    resolver: zodResolver(schema) as Resolver<StaffFormValues>,
    mode: "onChange",
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phoneNumber: "",
      gender: "Male",
      dateOfBirth: "",
      address: "",
      position: "",
      role: "Seller"
    }
  });

  useEffect(() => {
    if (staff && open) {
      reset({
        fullName: staff.fullName || "",
        email: staff.email || "",
        phoneNumber: staff.phoneNumber || "",
        gender: (staff.gender as "Male" | "Female" | "Other") || "Male",
        dateOfBirth: staff.dateOfBirth ? staff.dateOfBirth.split('T')[0] : "",
        address: staff.address || "",
        position: staff.position || "",
        role: ((staff.role || staff.position) as "Manager" | "Seller" | "CleaningStaff") || "Seller",
        password: "",
        confirmPassword: ""
      });
    } else if (!open) {
      reset({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        phoneNumber: "",
        gender: "Male",
        dateOfBirth: "",
        address: "",
        position: "",
        role: "Seller"
      });
    }
  }, [staff, open, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px] w-full p-0 gap-0 border-none shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] bg-gray-50 max-h-[85vh] flex flex-col overflow-hidden rounded-2xl">
        <VisuallyHidden>
          <DialogTitle>{isEdit ? "Edit Staff" : "Add New Staff"}</DialogTitle>
        </VisuallyHidden>

        {/* Floating Header Panel */}
        <div className="flex flex-col px-6 pt-6 pb-4 bg-white border-b border-gray-100/80 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 shadow-sm flex-shrink-0">
              <UserPlus className="h-4.5 w-4.5 text-[var(--color-primary)]" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900 tracking-tight">
                {isEdit ? "Edit Profile" : "New Account"}
              </h2>
              <p className="text-[10px] text-gray-500 font-bold mt-0.5">
                {isEdit ? "Update access security details." : "Provision a new staff access account."}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
          <Tabs defaultValue="profile" className="flex-1 flex flex-col overflow-hidden">
            <div className="px-7 pt-4">
              <TabsList className="grid grid-cols-2 p-1 bg-gray-100/80 border border-gray-200/50 rounded-xl w-full">
                <TabsTrigger value="profile" className="flex items-center justify-center rounded-lg text-xs font-black text-gray-700 data-[state=active]:bg-white data-[state=active]:text-[var(--color-primary)] data-[state=active]:shadow-sm transition-all py-1.5">
                  <User className="w-3.5 h-3.5 mr-1.5 text-gray-500 data-[state=active]:text-[var(--color-primary)]" /> Info Profile
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center justify-center rounded-lg text-xs font-black text-gray-700 data-[state=active]:bg-white data-[state=active]:text-[var(--color-primary)] data-[state=active]:shadow-sm transition-all py-1.5">
                  <Lock className="w-3.5 h-3.5 mr-1.5 text-gray-500 data-[state=active]:text-[var(--color-primary)]" /> Security
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Profile Information Tab */}
              <TabsContent value="profile" className="flex-1 overflow-y-auto mt-0 px-7 pt-5 pb-7 space-y-7 focus-visible:outline-none scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent pr-2 mr-1">
                {/* 1. Personal & Profile Information */}
                <div className="space-y-4">
                  <h3 className="flex items-center gap-2 text-xs font-black text-gray-800 uppercase tracking-widest pb-1 border-b border-gray-100">
                    <User className="w-3.5 h-3.5 text-[var(--color-primary)]" /> Personal Details
                  </h3>
                  <div className="grid grid-cols-1 gap-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="fullName" className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">Full Name <span className="text-red-500">*</span></Label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="fullName"
                          placeholder="e.g. John Doe"
                          {...register("fullName")}
                          className={cn(
                            "pl-10 h-11 rounded-xl bg-white border-gray-200 focus:bg-white focus:border-[var(--color-primary)]/50 focus:ring-4 focus:ring-[var(--color-primary)]/10 transition-all font-medium text-sm shadow-sm",
                            errors.fullName && "border-red-300 focus:border-red-400 focus:ring-red-500/10 bg-red-50/50"
                          )}
                        />
                      </div>
                      {errors.fullName && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.fullName.message}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="gender" className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">Gender</Label>
                      <Controller
                        control={control}
                        name="gender"
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                            <SelectTrigger className="h-11 rounded-xl bg-white border-gray-200 focus:bg-white focus:border-[var(--color-primary)]/50 focus:ring-4 focus:ring-[var(--color-primary)]/10 transition-all font-medium shadow-sm">
                              <div className="flex items-center gap-2 text-sm">
                                <FaVenusMars className="w-4 h-4 text-gray-400" />
                                <SelectValue placeholder="Select gender" />
                              </div>
                            </SelectTrigger>
                            <SelectContent className="rounded-xl shadow-xl border-gray-100">
                              <SelectItem value="Male" className="rounded-lg font-medium cursor-pointer">
                                <div className="flex items-center gap-2"><FaMars className="w-4 h-4 text-blue-500" /> Male</div>
                              </SelectItem>
                              <SelectItem value="Female" className="rounded-lg font-medium cursor-pointer">
                                <div className="flex items-center gap-2"><FaVenus className="w-4 h-4 text-pink-500" /> Female</div>
                              </SelectItem>
                              <SelectItem value="Other" className="rounded-lg font-medium cursor-pointer">
                                <div className="flex items-center gap-2"><FaTransgender className="w-4 h-4 text-purple-500" /> Other</div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="dateOfBirth" className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">Date of Birth</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="dateOfBirth"
                          type="date"
                          {...register("dateOfBirth")}
                          className="pl-10 h-11 rounded-xl bg-white border-gray-200 focus:bg-white focus:border-[var(--color-primary)]/50 focus:ring-4 focus:ring-[var(--color-primary)]/10 transition-all font-medium text-sm shadow-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="address" className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">Address</Label>
                      <div className="relative">
                        <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="address"
                          placeholder="Street name, City..."
                          {...register("address")}
                          className="pl-10 h-11 rounded-xl bg-white border-gray-200 focus:bg-white focus:border-[var(--color-primary)]/50 focus:ring-4 focus:ring-[var(--color-primary)]/10 transition-all font-medium text-sm shadow-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Employment Information */}
                <div className="space-y-4">
                  <h3 className="flex items-center gap-2 text-xs font-black text-gray-800 uppercase tracking-widest pb-1 border-b border-gray-100">
                    <Briefcase className="w-3.5 h-3.5 text-[var(--color-primary)]" /> Employment Profile
                  </h3>
                  <div className="grid grid-cols-1 gap-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="role" className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">System Role <span className="text-red-500">*</span></Label>
                      <Controller
                        control={control}
                        name="role"
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value} disabled={isEdit}>
                            <SelectTrigger className="h-11 rounded-xl bg-white border-gray-200 disabled:opacity-75 disabled:bg-gray-50 focus:bg-white focus:border-[var(--color-primary)]/50 focus:ring-4 focus:ring-[var(--color-primary)]/10 transition-all font-medium shadow-sm">
                              <div className="flex items-center gap-2 text-sm">
                                <ShieldCheck className="w-4 h-4 text-gray-400" />
                                <SelectValue placeholder="Select a role" />
                              </div>
                            </SelectTrigger>
                            <SelectContent className="rounded-xl shadow-xl border-gray-100">
                              <SelectItem value="Manager" className="rounded-lg font-medium cursor-pointer">Manager</SelectItem>
                              <SelectItem value="Seller" className="rounded-lg font-medium cursor-pointer">Seller</SelectItem>
                              <SelectItem value="CleaningStaff" className="rounded-lg font-medium cursor-pointer">Cleaning Staff</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="position" className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">Position / Title</Label>
                      <div className="relative">
                        <BadgeCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="position"
                          placeholder="e.g. Senior Associate"
                          {...register("position")}
                          className="pl-10 h-11 rounded-xl bg-white border-gray-200 focus:bg-white focus:border-[var(--color-primary)]/50 focus:ring-4 focus:ring-[var(--color-primary)]/10 transition-all font-medium text-sm shadow-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Account Security Tab */}
              <TabsContent value="security" className="flex-1 overflow-y-auto mt-0 px-7 pt-5 pb-7 space-y-7 focus-visible:outline-none scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent pr-2 mr-1">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-1">
                    <h3 className="flex items-center gap-2 text-xs font-black text-gray-800 uppercase tracking-widest">
                      <Key className="w-3.5 h-3.5 text-[var(--color-primary)]" /> Account Identity
                    </h3>
                    {isEdit && (
                      <button
                        type="button"
                        onClick={() => setIsSecurityUnlocked(!isSecurityUnlocked)}
                        className={cn(
                          "inline-flex items-center gap-1.5 h-6 px-2.5 text-[10px] font-extrabold rounded-lg border transition-all shadow-sm select-none",
                          isSecurityUnlocked
                            ? "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100"
                            : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                        )}
                      >
                        {isSecurityUnlocked ? <ShieldAlert className="w-3 h-3 text-amber-600" /> : <Lock className="w-3 h-3" />}
                        {isSecurityUnlocked ? "Lock" : "Unlock"}
                      </button>
                    )}
                  </div>

                  {isEdit && isSecurityUnlocked && (
                    <div className="p-2.5 bg-amber-50/70 border border-amber-200/40 rounded-xl flex items-start gap-2 shadow-sm animate-in fade-in-50 duration-200">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-extrabold text-amber-800">Caution: Sensitive Updates</p>
                        <p className="text-[9px] text-amber-700/90 font-medium">Changing credentials directly impacts logs.</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">Corporate Email <span className="text-red-500">*</span></Label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="admin@example.com"
                          disabled={true}
                          {...register("email")}
                          className="pl-10 h-11 rounded-xl bg-gray-50 border-gray-200 disabled:opacity-75 disabled:cursor-not-allowed disabled:bg-gray-50 focus:bg-white focus:border-[var(--color-primary)]/50 focus:ring-4 focus:ring-[var(--color-primary)]/10 transition-all font-medium text-sm shadow-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="phoneNumber" className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">Phone Number <span className="text-red-500">*</span></Label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="phoneNumber"
                          placeholder="+84..."
                          disabled={isEdit && !isSecurityUnlocked}
                          {...register("phoneNumber")}
                          className={cn(
                            "pl-10 h-11 rounded-xl bg-white border-gray-200 focus:bg-white focus:border-[var(--color-primary)]/50 focus:ring-4 focus:ring-[var(--color-primary)]/10 transition-all font-medium text-sm shadow-sm",
                            errors.phoneNumber && "border-red-300 focus:border-red-400 focus:ring-red-500/10 bg-red-50/50",
                            isEdit && !isSecurityUnlocked && "bg-gray-50 border-gray-100 opacity-75 shadow-none"
                          )}
                        />
                      </div>
                      {errors.phoneNumber && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.phoneNumber.message}</p>}
                    </div>

                    {(!isEdit || isSecurityUnlocked) && (
                      <div className="grid grid-cols-1 gap-y-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="password" className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">
                            {isEdit ? "Set New Password" : "Secure Password"} <span className="text-red-500">*</span>
                          </Label>
                          <div className="relative">
                            <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              id="password"
                              type={showPassword ? "text" : "password"}
                              placeholder={isEdit ? "Leave empty to keep" : "••••••••"}
                              {...register("password")}
                              className={cn(
                                "pl-10 pr-10 h-11 rounded-xl bg-white border-gray-200 focus:bg-white focus:border-[var(--color-primary)]/50 focus:ring-4 focus:ring-[var(--color-primary)]/10 transition-all font-medium text-sm tracking-widest shadow-sm",
                                errors.password && "border-red-300 focus:border-red-400 focus:ring-red-500/10 bg-red-50/50"
                              )}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                          {errors.password && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.password.message}</p>}
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="confirmPassword" className="text-[11px] font-bold text-gray-500 uppercase tracking-wider ml-1">Confirm Password <span className="text-red-500">*</span></Label>
                          <div className="relative">
                            <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              id="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder={isEdit ? "Repeat new password" : "Re-enter password"}
                              {...register("confirmPassword")}
                              className={cn(
                                "pl-10 pr-10 h-11 rounded-xl bg-white border-gray-200 focus:bg-white focus:border-[var(--color-primary)]/50 focus:ring-4 focus:ring-[var(--color-primary)]/10 transition-all font-medium text-sm tracking-widest shadow-sm",
                                errors.confirmPassword && "border-red-300 focus:border-red-400 focus:ring-red-500/10 bg-red-50/50"
                              )}
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                            >
                              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                          {errors.confirmPassword && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.confirmPassword.message}</p>}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>

          {/* Sticky Actions Footer */}
          <div className="px-7 py-4 bg-white border-t border-gray-100 flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="flex-1 h-11 font-black text-xs uppercase tracking-wider text-gray-600 hover:text-gray-800 border border-gray-200 shadow-sm rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="premium"
              disabled={isLoading}
              className="flex-1 h-11 font-black text-xs uppercase tracking-wider shadow-md rounded-xl"
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isEdit ? "Save Profile" : "Create Staff"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
