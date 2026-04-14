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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnimatePresence, motion } from "framer-motion";
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

  const profileErrorFields: (keyof StaffFormValues)[] = ["fullName", "gender", "dateOfBirth", "address", "role", "position"];
  const securityErrorFields: (keyof StaffFormValues)[] = ["email", "phoneNumber", "password", "confirmPassword"];

  const hasProfileError = profileErrorFields.some(field => !!errors[field]);
  const hasSecurityError = securityErrorFields.some(field => !!errors[field]);

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
          icon: <ShieldCheck className="h-5 w-5 text-primary-600 z-10" />,
          title: "Privilege Registry",
          bgColor: "bg-primary-600/10",
          borderColor: "border-primary-600",
          iconColor: "text-primary-600"
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
              <TabsList className="relative grid grid-cols-2 w-full h-11 bg-slate-200/50 p-1 rounded-xl border border-slate-200/60 gap-1 overflow-hidden">
                {/* Animated Indicator Background */}
                <div className="absolute inset-y-1.5 left-1.5 right-1.5 grid grid-cols-2 pointer-events-none">
                  {['profile', 'security'].map((tab) => (
                    <div key={tab} className="relative flex items-center justify-center">
                      {activeTab === tab && (
                        <motion.div
                          layoutId="staff-tab-bg"
                          className="absolute inset-0 bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-slate-200/20"
                          initial={false}
                          transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                        />
                      )}
                    </div>
                  ))}
                </div>

                <TabsTrigger
                  value="profile"
                  className="relative z-10 rounded-lg text-[11px] font-black gap-2 transition-all duration-300 data-[state=active]:text-primary text-slate-500 hover:text-slate-700 flex items-center justify-center h-full outline-none"
                >
                  <User className={cn("h-4 w-4 transition-transform duration-300", activeTab === 'profile' ? "scale-110" : "scale-100")} />
                  Profile Info
                  {hasProfileError && (
                    <motion.div 
                      initial={{ scale: 0 }} 
                      animate={{ scale: 1 }} 
                      className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" 
                    />
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="security"
                  className="relative z-10 rounded-lg text-[11px] font-black gap-2 transition-all duration-300 data-[state=active]:text-primary text-slate-500 hover:text-slate-700 flex items-center justify-center h-full outline-none"
                >
                  <Lock className={cn("h-4 w-4 transition-transform duration-300", activeTab === 'security' ? "scale-110" : "scale-100")} />
                  Security
                  {hasSecurityError && (
                    <motion.div 
                      initial={{ scale: 0 }} 
                      animate={{ scale: 1 }} 
                      className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" 
                    />
                  )}
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="relative h-[520px] overflow-hidden bg-gray-50/50">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="h-full overflow-y-auto scrollbar-hide no-scrollbar focus-visible:outline-none"
                >
                  <TabsContent value="profile" className="m-0 p-0 border-none ring-0 outline-none">
                    <div className="px-8 pt-6 pb-10 space-y-9">
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
                              <SelectTrigger className="h-12 rounded-[18px] bg-white border-gray-200 focus:ring-4 focus:ring-primary/10 font-black uppercase text-xs tracking-wider shadow-sm transition-all overflow-hidden">
                                <div className="flex items-center gap-3">
                                  {field.value === "DeliveryStaff" ? (
                                    <img src="/images/delivery.png" alt="Delivery" className="w-5 h-5 object-contain" />
                                  ) : (
                                    <ShieldCheck className="w-4 h-4 text-primary" />
                                  )}
                                  <SelectValue placeholder="System Delegation" />
                                </div>
                              </SelectTrigger>
                              <SelectContent className="rounded-2xl shadow-3xl border-gray-100 p-1.5 min-w-[260px]">
                                <SelectItem value="Manager" className="rounded-xl font-bold cursor-pointer my-0.5 pl-11 pr-3 py-3 focus:bg-slate-50 relative group">
                                  <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                                      <Briefcase className="w-4.5 h-4.5 text-emerald-600" />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                      <span className="text-sm font-black text-slate-700 truncate">Manager</span>
                                      <span className="text-[10px] text-slate-400 font-medium truncate">Executive & Operations</span>
                                    </div>
                                  </div>
                                </SelectItem>
                                <SelectItem value="Seller" className="rounded-xl font-bold cursor-pointer my-0.5 pl-11 pr-3 py-3 focus:bg-slate-50 relative group">
                                  <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                                      <Store className="w-4.5 h-4.5 text-amber-600" />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                      <span className="text-sm font-black text-slate-700 truncate">Seller</span>
                                      <span className="text-[10px] text-slate-400 font-medium truncate">Commerce & Inventory</span>
                                    </div>
                                  </div>
                                </SelectItem>
                                <SelectItem value="DeliveryStaff" className="rounded-xl font-bold cursor-pointer my-0.5 pl-11 pr-3 py-3 focus:bg-blue-50/50 relative group">
                                  <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                                      <img src="/images/delivery.png" alt="v" className="w-4.5 h-4.5 object-contain" />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                      <span className="text-sm font-black text-blue-700 truncate">Delivery Staff</span>
                                      <span className="text-[10px] text-blue-400 font-medium truncate">Logistics & Handling</span>
                                    </div>
                                  </div>
                                </SelectItem>
                                <SelectItem value="CleaningStaff" className="rounded-xl font-bold cursor-pointer my-0.5 pl-11 pr-3 py-3 focus:bg-slate-50 relative group">
                                  <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-sky-50 flex items-center justify-center shrink-0">
                                      <Sparkles className="w-4.5 h-4.5 text-sky-600" />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                      <span className="text-sm font-black text-slate-700 truncate">Cleaning Staff</span>
                                      <span className="text-[10px] text-slate-400 font-medium truncate">Maintenance & Care</span>
                                    </div>
                                  </div>
                                </SelectItem>
                                <SelectItem value="User" className="rounded-xl font-bold cursor-pointer my-0.5 pl-11 pr-3 py-3 focus:bg-slate-50 relative group">
                                  <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                                      <User className="w-4.5 h-4.5 text-slate-500" />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                      <span className="text-sm font-black text-slate-700 truncate">Standard User</span>
                                      <span className="text-[10px] text-slate-400 font-medium truncate">General Application Access</span>
                                    </div>
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                  <TabsContent value="security" className="m-0 p-0 border-none ring-0 outline-none">
                    <div className="px-8 pt-6 pb-10 space-y-7">
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
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                            <Input
                              id="email"
                              type="email"
                              placeholder="staff@dreamguard.com"
                              disabled={isEdit}
                              {...register("email")}
                              autoComplete="off"
                              className={cn(
                                "pl-11 h-12 rounded-[18px] bg-white border-gray-200 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm shadow-sm",
                                isEdit && "bg-gray-50 opacity-60 cursor-not-allowed"
                              )}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phoneNumber" className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Emergency Phone *</Label>
                          <div className="relative group">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                            <Input
                              id="phoneNumber"
                              placeholder="e.g. 09xxxxxxxx"
                              disabled={isEdit && !isSecurityUnlocked}
                              {...register("phoneNumber")}
                              autoComplete="off"
                              className={cn(
                                "pl-11 h-12 rounded-[18px] bg-white border-gray-200 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 font-bold text-sm shadow-sm transition-all",
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
                                <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                                <Input
                                  id="password"
                                  type={showPassword ? "text" : "password"}
                                  placeholder="••••••••"
                                  {...register("password")}
                                  autoComplete="new-password"
                                  className="pl-11 pr-11 h-12 rounded-[18px] bg-white border-gray-200 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 font-bold text-sm tracking-widest shadow-sm"
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
                                <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                                <Input
                                  id="confirmPassword"
                                  type={showConfirmPassword ? "text" : "password"}
                                  placeholder="••••••••"
                                  {...register("confirmPassword")}
                                  autoComplete="new-password"
                                  className="pl-11 pr-11 h-12 rounded-[18px] bg-white border-gray-200 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 font-bold text-sm tracking-widest shadow-sm"
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
                  </div>
                </TabsContent>
                </motion.div>
              </AnimatePresence>
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
              className="flex-[1.5] h-11 font-black text-[10px] uppercase tracking-[0.2em] shadow-[0_4px_12px_rgba(var(--primary-rgb),0.2)] rounded-[18px] gap-2 transform active:scale-[0.98] transition-all bg-primary hover:opacity-90 text-white border-none"
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
