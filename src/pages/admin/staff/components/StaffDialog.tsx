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
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, UserPlus, Phone, Mail, Building, Key, User, ShieldCheck, Eye, EyeOff, Lock, ShieldAlert, Briefcase, Store, Sparkles } from "lucide-react";
import type { Staff } from "../types";

const baseStaffSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(50, "Full name is too long").trim(),
  email: z.string().min(1, "Email is required").email("Invalid email format").trim().toLowerCase(),
  phoneNumber: z.string().regex(/^(0|\+84)\d{9,10}$/, "Invalid phone number format (e.g. 0912345678)"),
  gender: z.enum(["Male", "Female", "Other"]),
  dateOfBirth: z.string().optional().nullable().or(z.literal("")),
  address: z.string().optional().nullable().or(z.literal("")),
  position: z.string().optional().nullable().or(z.literal("")),
  role: z.enum(["Admin", "Manager", "Seller", "CleaningStaff", "User", "DeliveryStaff"]),
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
  const [activeTab, setActiveTab] = useState("profile");
  const [prevOpen, setPrevOpen] = useState(open);

  if (open !== prevOpen) {
    setPrevOpen(open);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setIsSecurityUnlocked(false);
  }

  const schema = isEdit ? updateStaffSchema : createStaffSchema;



  const { register, handleSubmit, reset, control, setValue, watch, formState: { errors } } = useForm<StaffFormValues>({
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
      position: "Seller",
      role: "Seller"
    }
  });

  const selectedRole = watch("role");

  const getRoleHeader = () => {
    switch (selectedRole) {
      case "DeliveryStaff":
        return {
          icon: <img src="/images/delivery.png" alt="Delivery" className="w-6 h-6 object-contain z-10" />,
          title: "Logistics Registry",
          bgColor: "bg-blue-600/10",
          borderColor: "border-blue-600",
          iconColor: "text-blue-600"
        };
      case "Admin":
        return {
          icon: <ShieldCheck className="h-5 w-5 text-indigo-600 z-10" />,
          title: "Privilege Registry",
          bgColor: "bg-indigo-600/10",
          borderColor: "border-indigo-600",
          iconColor: "text-indigo-600"
        };
      case "Manager":
        return {
          icon: <Briefcase className="h-5 w-5 text-emerald-600 z-10" />,
          title: "Executive Registry",
          bgColor: "bg-emerald-600/10",
          borderColor: "border-emerald-600",
          iconColor: "text-emerald-600"
        };
      case "Seller":
        return {
          icon: <Store className="h-5 w-5 text-amber-600 z-10" />,
          title: "Commerce Hub",
          bgColor: "bg-amber-600/10",
          borderColor: "border-amber-600",
          iconColor: "text-amber-600"
        };
      case "CleaningStaff":
        return {
          icon: <Sparkles className="h-5 w-5 text-sky-600 z-10" />,
          title: "Sanctuary Care",
          bgColor: "bg-sky-600/10",
          borderColor: "border-sky-600",
          iconColor: "text-sky-600"
        };
      default:
        return {
          icon: <UserPlus className="h-5 w-5 text-blue-600 z-10" />,
          title: "Staff Identity",
          bgColor: "bg-blue-600/10",
          borderColor: "border-blue-600",
          iconColor: "text-blue-600"
        };
    }
  };

  const header = getRoleHeader();

  useEffect(() => {
    if (open) {
      if (staff) {
        // Edit mode data mapping
        reset({
          fullName: staff.fullName || "",
          email: staff.email || "",
          phoneNumber: staff.phoneNumber || "",
          gender: (staff.gender as "Male" | "Female" | "Other") || "Male",
          dateOfBirth: staff.dateOfBirth ? staff.dateOfBirth.split('T')[0] : "",
          address: staff.address || "",
          position: staff.position || staff.role || "Seller",
          role: (staff.role as StaffFormValues["role"]) || "Seller",
          password: "",
          confirmPassword: ""
        });
      } else {
        // Create mode - force clear everything
        reset({
          fullName: "",
          email: "",
          password: "",
          confirmPassword: "",
          phoneNumber: "",
          gender: "Male",
          dateOfBirth: "",
          address: "",
          position: "Seller",
          role: "Seller"
        });
      }
    }
  }, [staff, open, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px] w-full p-0 gap-0 border-none shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] bg-gray-50 max-h-[85vh] flex flex-col overflow-hidden rounded-2xl animate-in fade-in zoom-in-95 duration-200">
        <VisuallyHidden>
          <DialogTitle>{isEdit ? "Edit Staff" : "Add New Staff"}</DialogTitle>
        </VisuallyHidden>

        {/* Floating Header Panel */}
        <div className="flex flex-col px-6 pt-6 pb-4 bg-white border-b border-gray-100/80 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className={cn("flex h-11 w-11 items-center justify-center rounded-2xl border shadow-sm flex-shrink-0 relative overflow-hidden transition-colors duration-500", header.bgColor, header.borderColor)}>
              {header.icon}
              {selectedRole === "DeliveryStaff" && <div className="absolute inset-0 bg-blue-500/5 animate-pulse" />}
            </div>
            <div>
              <h2 className={cn("text-lg font-black tracking-tight leading-tight uppercase transition-colors duration-500", header.iconColor)}>
                {header.title}
              </h2>
              <p className="text-[10px] text-gray-500 font-bold mt-1 uppercase tracking-widest opacity-60">
                {isEdit ? "Update profile credentials" : "Configure new system account"}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
          <Tabs defaultValue="profile" className="flex-1 flex flex-col overflow-hidden" onValueChange={setActiveTab} value={activeTab}>
            <div className="px-6 pt-3 bg-white/50 backdrop-blur-sm shrink-0">
              <TabsList className="relative grid grid-cols-2 w-full h-12 bg-slate-100/40 p-1.5 rounded-[1rem] border border-slate-200/40 gap-1 overflow-hidden">
                {/* Animated Indicator Background */}
                <div className="absolute inset-y-1.5 left-1.5 right-1.5 grid grid-cols-2 pointer-events-none">
                  {['profile', 'security'].map((tab) => (
                    <div key={tab} className="relative flex items-center justify-center">
                      {activeTab === tab && (
                        <motion.div
                          layoutId="staff-tab-bg"
                          className="absolute inset-0 bg-white rounded-lg shadow-[0_2px_10px_rgba(0,0,0,0.06)] border border-slate-200/10"
                          initial={false}
                          transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                        />
                      )}
                    </div>
                  ))}
                </div>

                <TabsTrigger
                  value="profile"
                  className="relative z-10 rounded-lg text-[11px] font-bold gap-2 transition-all duration-300 data-[state=active]:text-[#4988c4] text-slate-400 hover:text-slate-600 flex items-center justify-center h-full outline-none"
                >
                  <User className={cn("h-4 w-4 transition-transform duration-300", activeTab === 'profile' ? "scale-110" : "scale-100")} />
                  Profile Info
                </TabsTrigger>
                <TabsTrigger
                  value="security"
                  className="relative z-10 rounded-lg text-[11px] font-bold gap-2 transition-all duration-300 data-[state=active]:text-[#4988c4] text-slate-400 hover:text-slate-600 flex items-center justify-center h-full outline-none"
                >
                  <Lock className={cn("h-4 w-4 transition-transform duration-300", activeTab === 'security' ? "scale-110" : "scale-100")} />
                  Security
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
              <TabsContent value="profile" className="flex-1 overflow-y-auto mt-0 px-8 pt-6 pb-10 space-y-9 focus-visible:outline-none scrollbar-hide no-scrollbar">
                {/* 1. Core Identity */}
                <div className="space-y-5">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-px bg-gray-200 flex-1" />
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.25em]">Personal Metrics</span>
                    <div className="h-px bg-gray-200 flex-1" />
                  </div>

                  <div className="grid grid-cols-1 gap-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name *</Label>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-[var(--color-primary)] transition-colors" />
                        <Input
                          id="fullName"
                          placeholder="e.g. Vu Dat"
                          {...register("fullName")}
                          className={cn(
                            "pl-11 h-12 rounded-[18px] bg-white border-gray-200 focus:bg-white focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10 transition-all font-bold text-sm shadow-sm",
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
                            <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
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
                      <Label htmlFor="address" className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Residential Address</Label>
                      <div className="relative group">
                        <Building className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-[var(--color-primary)] transition-colors" />
                        <Input
                          id="address"
                          placeholder="e.g. 123, KP.2, HN"
                          {...register("address")}
                          className="pl-11 h-12 rounded-[18px] bg-white border-gray-200 font-bold text-sm shadow-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. System Level Assignment */}
                <div className="space-y-5">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-px bg-gray-200 flex-1" />
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.25em]">System Delegation</span>
                    <div className="h-px bg-gray-200 flex-1" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Role & Position *</Label>
                    <Controller
                      control={control}
                      name="role"
                      render={({ field }) => (
                        <Select
                          onValueChange={(val) => {
                            field.onChange(val);
                            // Sync Role with Position automatically
                            setValue("position", val);
                          }}
                          defaultValue={field.value}
                          value={field.value}
                          disabled={isEdit}
                        >
                          <SelectTrigger className="h-12 rounded-[18px] bg-white border-gray-200 focus:ring-4 focus:ring-[var(--color-primary)]/10 font-black uppercase text-xs tracking-wider shadow-sm transition-all overflow-hidden">
                            <div className="flex items-center gap-3">
                              {field.value === "DeliveryStaff" ? (
                                <img src="/images/delivery.png" alt="Delivery" className="w-5 h-5 object-contain" />
                              ) : (
                                <ShieldCheck className="w-4 h-4 text-[var(--color-primary)]" />
                              )}
                              <SelectValue placeholder="System Delegation" />
                            </div>
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl shadow-3xl border-gray-100 p-1">
                            <SelectItem value="Manager" className="rounded-xl font-bold cursor-pointer my-0.5 px-3">
                              <div className="flex items-center gap-3">
                                <Briefcase className="w-4 h-4 text-slate-400" />
                                Manager
                              </div>
                            </SelectItem>
                            <SelectItem value="Seller" className="rounded-xl font-bold cursor-pointer my-0.5 px-3">
                              <div className="flex items-center gap-3">
                                <Store className="w-4 h-4 text-slate-400" />
                                Seller
                              </div>
                            </SelectItem>
                            <SelectItem value="DeliveryStaff" className="rounded-xl font-bold cursor-pointer my-0.5 text-blue-600 px-3">
                              <div className="flex items-center gap-3">
                                <img src="/images/delivery.png" alt="v" className="w-4 h-4 object-contain" />
                                Delivery Staff
                              </div>
                            </SelectItem>
                            <SelectItem value="CleaningStaff" className="rounded-xl font-bold cursor-pointer my-0.5 px-3">
                              <div className="flex items-center gap-3">
                                <Sparkles className="w-4 h-4 text-slate-400" />
                                Cleaning Staff
                              </div>
                            </SelectItem>
                            <SelectItem value="User" className="rounded-xl font-bold cursor-pointer my-0.5 px-3">
                              <div className="flex items-center gap-3">
                                <User className="w-4 h-4 text-slate-400" />
                                Standard User
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="security" className="flex-1 overflow-y-auto mt-0 px-8 pt-6 pb-10 space-y-7 focus-visible:outline-none scrollbar-hide no-scrollbar">
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <h3 className="text-[10px] font-black text-gray-800 uppercase tracking-[0.25em]">Account Credentials</h3>
                    {isEdit && (
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
                        {isSecurityUnlocked ? "Lock Safety" : "Modify Auth"}
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Identifier *</Label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="staff@dreamguard.com"
                          disabled={isEdit}
                          {...register("email")}
                          autoComplete="off"
                          className={cn(
                            "pl-11 h-12 rounded-[18px] bg-white border-gray-200 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all font-bold text-sm shadow-sm",
                            isEdit && "bg-gray-50 opacity-60 cursor-not-allowed"
                          )}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber" className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Emergency Phone *</Label>
                      <div className="relative group">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                        <Input
                          id="phoneNumber"
                          placeholder="e.g. 09xxxxxxxx"
                          disabled={isEdit && !isSecurityUnlocked}
                          {...register("phoneNumber")}
                          autoComplete="off"
                          className={cn(
                            "pl-11 h-12 rounded-[18px] bg-white border-gray-200 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 font-bold text-sm shadow-sm transition-all",
                            errors.phoneNumber && "border-red-300 focus:ring-red-500/10"
                          )}
                        />
                      </div>
                      {errors.phoneNumber && <p className="text-[10px] text-red-500 font-bold ml-2">{errors.phoneNumber.message}</p>}
                    </div>

                    {(!isEdit || isSecurityUnlocked) && (
                      <div className="grid grid-cols-1 gap-y-5 animate-in slide-in-from-top-2 duration-300">
                        <div className="space-y-2">
                          <Label htmlFor="password" className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Secure Password *</Label>
                          <div className="relative group">
                            <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                            <Input
                              id="password"
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              {...register("password")}
                              autoComplete="new-password"
                              className="pl-11 pr-11 h-12 rounded-[18px] bg-white border-gray-200 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 font-bold text-sm tracking-widest shadow-sm"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                          {errors.password && <p className="text-[10px] text-red-500 font-bold ml-2">{errors.password.message}</p>}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword" className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Confirm Identity *</Label>
                          <div className="relative group">
                            <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                            <Input
                              id="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="••••••••"
                              {...register("confirmPassword")}
                              autoComplete="new-password"
                              className="pl-11 pr-11 h-12 rounded-[18px] bg-white border-gray-200 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 font-bold text-sm tracking-widest shadow-sm"
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
                </div>
              </TabsContent>
            </div>
          </Tabs>

          <footer className="px-8 py-5 bg-white border-t border-gray-100 flex items-center gap-3 shrink-0 shadow-[0_-4px_12px_rgba(0,0,0,0.02)]">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="flex-1 h-11 font-black text-[10px] uppercase tracking-[0.2em] text-gray-400 hover:text-gray-900 border-gray-200 rounded-[18px] shadow-sm transform active:scale-[0.98] transition-all"
            >
              Abort
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-[1.5] h-11 font-black text-[10px] uppercase tracking-[0.2em] shadow-[0_4px_12px_rgba(37,99,235,0.2)] rounded-[18px] gap-2 transform active:scale-[0.98] transition-all bg-blue-600 hover:bg-blue-700 text-white border-none"
            >
              {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {isEdit ? "Update Staff" : "Initialize Agent"}
            </Button>
          </footer>
        </form>
      </DialogContent>
    </Dialog>
  );
}
