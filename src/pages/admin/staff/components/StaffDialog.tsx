import { useState } from "react";
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
import { Loader2, UserPlus, Phone, Mail, Building, Key, User, ShieldCheck, Eye, EyeOff, Lock, Briefcase, Store, Sparkles } from "lucide-react";

const createStaffSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(50, "Full name is too long").trim(),
  email: z.string().min(1, "Email is required").email("Invalid email format").trim().toLowerCase(),
  phoneNumber: z.string().regex(/^(0|\+84)\d{9,10}$/, "Invalid phone number format (e.g. 0912345678)"),
  gender: z.enum(["Male", "Female", "Other"]),
  dateOfBirth: z.string().optional().nullable().or(z.literal("")),
  address: z.string().optional().nullable().or(z.literal("")),
  position: z.string().optional().nullable().or(z.literal("")),
  role: z.enum(["Manager", "Seller", "CleaningStaff"]),
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

export type StaffFormValues = z.infer<typeof createStaffSchema>;

interface StaffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff?: null; // Always null now for Creation
  onSubmit: (data: StaffFormValues) => Promise<void>;
  isLoading?: boolean;
}

export function StaffDialog({ open, onOpenChange, onSubmit, isLoading }: StaffDialogProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  const { register, handleSubmit, reset, control, setValue, watch, formState: { errors } } = useForm<StaffFormValues>({
    resolver: zodResolver(createStaffSchema) as Resolver<StaffFormValues>,
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

  const handleClose = () => {
    onOpenChange(false);
    reset();
    setActiveTab("profile");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[480px] w-full p-0 gap-0 border-none shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] bg-gray-50 max-h-[85vh] flex flex-col overflow-hidden rounded-2xl">
        <VisuallyHidden>
          <DialogTitle>Initialize New Staff Identity</DialogTitle>
        </VisuallyHidden>

        {/* Floating Header Panel */}
        <div className="flex flex-col px-6 pt-6 pb-4 bg-white border-b border-gray-100/80 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className={cn("flex h-11 w-11 items-center justify-center rounded-2xl border shadow-sm flex-shrink-0 relative overflow-hidden transition-colors duration-500", header.bgColor, header.borderColor)}>
              {header.icon}
            </div>
            <div>
              <h2 className={cn("text-lg font-black tracking-tight leading-tight uppercase transition-colors duration-500", header.iconColor)}>
                {header.title}
              </h2>
              <p className="text-[10px] text-gray-500 font-bold mt-1 uppercase tracking-widest opacity-60">
                Configure new system agent account
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
          <Tabs value={activeTab} className="flex-1 flex flex-col overflow-hidden" onValueChange={setActiveTab}>
            <div className="px-6 pt-3 bg-white/50 backdrop-blur-sm shrink-0">
              <TabsList className="relative grid grid-cols-2 w-full h-11 bg-slate-200/50 p-1 rounded-xl border border-slate-200/60 gap-1 overflow-hidden">
                <TabsTrigger
                  value="profile"
                  className="relative z-10 rounded-lg text-[11px] font-black gap-2 transition-all duration-300 data-[state=active]:text-primary text-slate-500 hover:text-slate-700 flex items-center justify-center h-full outline-none"
                >
                  <User className="h-4 w-4" />
                  Profile Info
                  {hasProfileError && (
                    <div className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="security"
                  className="relative z-10 rounded-lg text-[11px] font-black gap-2 transition-all duration-300 data-[state=active]:text-primary text-slate-500 hover:text-slate-700 flex items-center justify-center h-full outline-none"
                >
                  <Lock className="h-4 w-4" />
                  Auth Metrics
                  {hasSecurityError && (
                    <div className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
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
                      {/* Identity Section */}
                      <div className="space-y-5">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="h-px bg-gray-200 flex-1" />
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.25em]">Personal Metrics</span>
                          <div className="h-px bg-gray-200 flex-1" />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="fullName" className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name *</Label>
                          <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                            <Input id="fullName" placeholder="e.g. Vu Dat" {...register("fullName")} className="pl-11 h-12 rounded-[18px] bg-white border-gray-200 focus:border-primary font-bold text-sm shadow-sm" />
                          </div>
                          {errors.fullName && <p className="text-[10px] text-red-500 font-bold ml-2">{errors.fullName.message}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="gender" className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Gender</Label>
                                <Controller control={control} name="gender" render={({ field }) => (
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <SelectTrigger className="h-12 rounded-[18px] bg-white border-gray-200 font-bold shadow-sm">
                                            <SelectValue placeholder="Gender" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl shadow-2xl border-gray-100">
                                            <SelectItem value="Male" className="font-bold cursor-pointer">Male</SelectItem>
                                            <SelectItem value="Female" className="font-bold cursor-pointer">Female</SelectItem>
                                            <SelectItem value="Other" className="font-bold cursor-pointer">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="dateOfBirth" className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">DOB</Label>
                                <Controller control={control} name="dateOfBirth" render={({ field }) => (
                                    <DatePicker mode="single" value={field.value ? new Date(field.value) : undefined} onChange={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")} placeholder="YYYY-MM-DD" className="h-12 rounded-[18px] font-bold" />
                                )} />
                            </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="address" className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Residential Address</Label>
                          <div className="relative group">
                            <Building className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                            <Input id="address" placeholder="e.g. 123 Street, City" {...register("address")} className="pl-11 h-12 rounded-[18px] bg-white border-gray-200 font-bold text-sm shadow-sm" />
                          </div>
                        </div>
                      </div>

                      {/* Delegation Section */}
                      <div className="space-y-5">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="h-px bg-gray-200 flex-1" />
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.25em]">System Delegation</span>
                          <div className="h-px bg-gray-200 flex-1" />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="role" className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Role *</Label>
                          <Controller control={control} name="role" render={({ field }) => (
                            <Select onValueChange={(val) => { field.onChange(val); setValue("position", val); }} defaultValue={field.value}>
                              <SelectTrigger className="h-12 rounded-[18px] bg-white border-gray-200 focus:ring-4 focus:ring-primary/10 font-black uppercase text-xs tracking-wider shadow-sm transition-all overflow-hidden pl-11">
                                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                                <SelectValue placeholder="Select Role" />
                              </SelectTrigger>
                              <SelectContent className="rounded-2xl shadow-3xl border-gray-100 p-1.5 min-w-[260px]">
                                {[
                                  { value: "Manager", title: "Manager", desc: "Executive & Operations", icon: <Briefcase className="w-4 h-4 text-emerald-600" />, bg: "bg-emerald-50" },
                                  { value: "Seller", title: "Seller", desc: "Commerce & Inventory", icon: <Store className="w-4 h-4 text-amber-600" />, bg: "bg-amber-50" },
                                  { value: "CleaningStaff", title: "Sanctuary Care", desc: "Maintenance & Care", icon: <Sparkles className="w-4 h-4 text-sky-600" />, bg: "bg-sky-50" },
                                ].map((r) => (
                                  <SelectItem key={r.value} value={r.value} className="rounded-xl font-bold cursor-pointer my-0.5 py-3 focus:bg-slate-50">
                                    <div className="flex items-center gap-3">
                                      <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", r.bg)}>{r.icon}</div>
                                      <div className="flex flex-col min-w-0">
                                        <span className="text-sm font-black text-slate-700">{r.title}</span>
                                        <span className="text-[10px] text-slate-400 font-medium">{r.desc}</span>
                                      </div>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )} />
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="security" className="m-0 p-0 border-none ring-0 outline-none">
                    <div className="px-8 pt-6 pb-10 space-y-7">
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="h-px bg-gray-200 flex-1" />
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.25em]">Auth Metrics</span>
                          <div className="h-px bg-gray-200 flex-1" />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Identifier *</Label>
                          <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                            <Input id="email" type="email" placeholder="staff@dreamguard.com" {...register("email")} className="pl-11 h-12 rounded-[18px] bg-white border-gray-200 font-bold text-sm shadow-sm" />
                          </div>
                          {errors.email && <p className="text-[10px] text-red-500 font-bold ml-2">{errors.email.message}</p>}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phoneNumber" className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone *</Label>
                          <div className="relative group">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                            <Input id="phoneNumber" placeholder="09xxxxxxxx" {...register("phoneNumber")} className="pl-11 h-12 rounded-[18px] bg-white border-gray-200 font-bold text-sm shadow-sm" />
                          </div>
                          {errors.phoneNumber && <p className="text-[10px] text-red-500 font-bold ml-2">{errors.phoneNumber.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Password *</Label>
                            <div className="relative">
                                <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" {...register("password")} className="pl-11 pr-11 h-12 rounded-[18px] font-bold tracking-widest shadow-sm" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none">
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {errors.password && <p className="text-[10px] text-red-500 font-bold ml-2">{errors.password.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Confirm *</Label>
                            <div className="relative">
                                <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" {...register("confirmPassword")} className="pl-11 pr-11 h-12 rounded-[18px] font-bold tracking-widest shadow-sm" />
                                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none">
                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {errors.confirmPassword && <p className="text-[10px] text-red-500 font-bold ml-2">{errors.confirmPassword.message}</p>}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </motion.div>
              </AnimatePresence>
            </div>
          </Tabs>

          <footer className="px-8 py-5 bg-white border-t border-gray-100 flex items-center gap-3 shrink-0 shadow-[0_-4px_12px_rgba(0,0,0,0.02)]">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading} className="flex-1 h-11 font-black text-[10px] uppercase tracking-[0.2em] text-gray-400 hover:text-gray-900 border-gray-200 rounded-[18px] shadow-sm transform active:scale-[0.98] transition-all">Abort</Button>
            <Button type="submit" disabled={isLoading} className="flex-[1.5] h-11 font-black text-[10px] uppercase tracking-[0.2em] shadow-[0_4px_12px_rgba(var(--primary-rgb),0.2)] rounded-[18px] gap-2 transform active:scale-[0.98] transition-all bg-primary hover:opacity-90 text-white border-none">
              {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Initialize Agent
            </Button>
          </footer>
        </form>
      </DialogContent>
    </Dialog>
  );
}
