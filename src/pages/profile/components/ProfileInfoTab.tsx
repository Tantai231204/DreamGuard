import { useState, useEffect } from "react"
import { CameraIcon } from "@radix-ui/react-icons"
import ChangePhoneDialog from "./ChangePhoneDialog"
import { Mail, Smartphone } from "lucide-react"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Badge } from "../../../components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar"
import { cn, formatDate } from "@/lib/utils"
import { useProfile, useUpdateProfile } from "@/hooks/queries"
import { toast } from "sonner"
import { FaMars, FaVenus } from "react-icons/fa6"
import { useForm, Controller } from "react-hook-form"
import { DatePicker } from "@/components/ui/date-picker"
import { format } from "date-fns"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { uploadToCloudinary } from "@/lib/uploadCloudinary"
const profileSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(50, "Full name cannot exceed 50 characters"),
  email: z.string().email("Invalid email address"),
  dateOfBirth: z.string().optional().or(z.literal("")),
  gender: z.string().optional().or(z.literal("")),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfileInfoTab() {
  const { data: profile, isLoading } = useProfile();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();

  const [isEditing, setIsEditing] = useState(false)
  const [showPhoneDialog, setShowPhoneDialog] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch, control } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "",
      email: "",
      dateOfBirth: "",
      gender: "",
    },
  });

  const watchedGender = watch("gender");

  useEffect(() => {
    if (profile) {
      reset({
        fullName: profile.fullName || "",
        email: profile.email || "",
        dateOfBirth: profile.dateOfBirth || "",
        gender: profile.gender || "",
      });
    }
  }, [profile, reset]);

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  const handleEdit = () => {
    if (isEditing) {
      setAvatarFile(null);
      // Discarding
      if (profile) {
        reset({
          fullName: profile.fullName || "",
          dateOfBirth: profile.dateOfBirth || "",
          gender: profile.gender || "",
        });
      }
    }
    setIsEditing(!isEditing);
  };

  const handleSave = async (data: ProfileFormData) => {
    let avatarUrl = profile?.avatarUrl || "";

    if (avatarFile) {
      try {
        if (avatarFile instanceof File) {
          avatarUrl = await uploadToCloudinary(avatarFile);
        }
      } catch (err) {
        toast.error("Upload avatar failed");
        return;
      }
    }

    updateProfile(
      {
        ...data,
        avatarUrl,
      },
      {
        onSuccess: () => {
          toast.success("Profile updated successfully");
          setIsEditing(false);
        },
      },
    );
  };

  const displayData = {
    fullName: isEditing ? watch("fullName") : profile?.fullName || "",
    email: profile?.email || "",
    dateOfBirth: isEditing
      ? watch("dateOfBirth")
      : formatDate(profile?.dateOfBirth || ""),
    gender: isEditing ? watchedGender : profile?.gender || "",
    phoneNumber: profile?.phoneNumber || "",
  };

  const initials = displayData.fullName
    ? displayData.fullName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white rounded-[2.5rem] border border-slate-100/80 shadow-[0_15px_40px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="p-8 flex flex-col">
          {/* Profile Header Row */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              <div className="relative h-24 w-24 rounded-full border-2 border-slate-200/70 overflow-hidden bg-white group/avatar">
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setAvatarFile(file);
                  }}
                />
                <Avatar className="h-full w-full">
                  {profile?.avatarUrl && (
                    <AvatarImage
                      src={
                        avatarFile
                          ? URL.createObjectURL(avatarFile)
                          : profile?.avatarUrl
                      }
                      alt={displayData.fullName}
                      className="object-cover"
                    />
                  )}
                  <AvatarFallback className="bg-slate-900 text-white text-2xl font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <button
                    type="button"
                    onClick={() =>
                      document.getElementById("avatar-upload")?.click()
                    }
                    className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity"
                  >
                    <CameraIcon className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="pb-1 max-w-sm">
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                  {displayData.fullName}
                </h3>
                <p className="text-sm text-slate-400 font-medium mt-1 truncate">
                  {displayData.email}
                </p>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  <Badge
                    variant="secondary"
                    className="bg-emerald-50 text-emerald-600 hover:bg-emerald-50 border-none font-black text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full"
                  >
                    Verified
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="bg-blue-50 text-blue-600 hover:bg-blue-50 border-none font-black text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full"
                  >
                    Elite
                  </Badge>
                </div>
              </div>
            </div>

            <Button
              variant={isEditing ? "outline" : "premium"}
              onClick={handleEdit}
              className={cn(
                "px-6 h-11 rounded-xl md:self-end",
                isEditing && "font-bold text-xs uppercase tracking-wider",
              )}
            >
              <span className="relative z-10">
                {isEditing ? "Discard Editing" : "Edit Profile"}
              </span>
            </Button>
          </div>

          {/* Form Body */}
          <form
            onSubmit={handleSubmit(handleSave)}
            className="mt-12 pt-10 border-t border-slate-100/80 grid gap-6 sm:grid-cols-2"
          >
            {/* Full Name */}
            <div className="space-y-2 sm:col-span-2">
              <Label className="text-xs font-bold text-slate-600 ml-1">
                Full Name
              </Label>
              <div className="relative group/input">
                <Input
                  {...register("fullName")}
                  disabled={!isEditing}
                  placeholder="E.g. Nguyễn Văn A"
                  className={cn(
                    "h-11 rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white transition-all font-medium text-slate-900",
                    !isEditing &&
                      "disabled:opacity-100 disabled:bg-slate-50/20 disabled:border-transparent disabled:text-slate-800 disabled:cursor-default shadow-none",
                  )}
                />
              </div>
              {errors.fullName && (
                <p className="text-red-500 text-[10px] mt-1 ml-1">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-600 ml-1">
                Email Address
              </Label>
              <div className="relative group/input">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within/input:text-primary transition-colors" />
                <Input
                  type="email"
                  {...register("email")}
                  disabled={!isEditing}
                  placeholder="E.g. example@gmail.com"
                  className={cn(
                    "h-11 pl-10 rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white transition-all font-medium text-slate-900",
                    !isEditing &&
                      "disabled:opacity-60 disabled:bg-slate-50/20 disabled:border-transparent disabled:text-slate-800 disabled:cursor-default shadow-none",
                  )}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-[10px] mt-1 ml-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-600 ml-1">
                Phone Number
              </Label>
              <div className="relative group/input">
                <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  value={displayData.phoneNumber}
                  disabled
                  className={cn(
                    "h-11 pl-10 rounded-xl bg-slate-50/50 border-slate-200 font-medium text-slate-900",
                    "disabled:opacity-100 disabled:bg-slate-100/30 disabled:border-transparent disabled:text-slate-500 disabled:cursor-not-allowed shadow-none",
                  )}
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setShowPhoneDialog(true)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-7 rounded-lg text-[10px] font-black uppercase tracking-wider bg-[#4988c4] hover:bg-[#4988c4]/90 text-white px-3 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  Update
                </Button>
              </div>
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-600 ml-1">Date of Birth</Label>
              <Controller
                control={control}
                name="dateOfBirth"
                render={({ field }) => (
                  <DatePicker
                    mode="single"
                    value={field.value ? new Date(field.value) : undefined}
                    onChange={(date) => {
                      if (date instanceof Date) {
                        field.onChange(format(date, "yyyy-MM-dd"));
                      } else {
                        field.onChange("");
                      }
                    }}
                    disabled={!isEditing}
                    placeholder="DD/MM/YYYY"
                    className="w-full"
                  />
                )}
              />
              {errors.dateOfBirth && <p className="text-red-500 text-[10px] mt-1 ml-1">{errors.dateOfBirth.message}</p>}
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-600 ml-1">
                Gender
              </Label>
              <div className="flex gap-2 p-1 bg-slate-50/50 border border-slate-200 rounded-xl h-11">
                <button
                  type="button"
                  disabled={!isEditing}
                  onClick={() =>
                    setValue("gender", "Male", { shouldDirty: true })
                  }
                  className={cn(
                    "flex-1 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all text-slate-600",
                    displayData.gender === "Male" &&
                      "bg-white shadow-sm border border-blue-100 text-[#4988c4]",
                    !isEditing && "disabled:opacity-100 cursor-default",
                  )}
                >
                  <FaMars className="w-3.5 h-3.5 text-blue-500" /> Male
                </button>
                <button
                  type="button"
                  disabled={!isEditing}
                  onClick={() =>
                    setValue("gender", "Female", { shouldDirty: true })
                  }
                  className={cn(
                    "flex-1 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all text-slate-600",
                    displayData.gender === "Female" &&
                      "bg-white shadow-sm border border-pink-100 text-pink-500",
                    !isEditing && "disabled:opacity-100 cursor-default",
                  )}
                >
                  <FaVenus className="w-3.5 h-3.5 text-pink-500" /> Female
                </button>
              </div>
            </div>

            {/* Action Footer */}
            {isEditing && (
              <div className="flex items-center justify-end gap-3 mt-10 pt-8 border-t border-slate-100/80 sm:col-span-2 w-full">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleEdit}
                  disabled={isUpdating}
                  className="h-11 px-6 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-500 hover:text-slate-900"
                >
                  Discard
                </Button>
                <Button
                  type="submit"
                  disabled={isUpdating}
                  className="h-11 px-10 rounded-xl bg-[#4988c4] hover:bg-[#4988c4]/90 text-white font-black text-[11px] uppercase tracking-wider"
                >
                  <span className="relative z-10">
                    {isUpdating ? "Saving..." : "Save Changes"}
                  </span>
                </Button>
              </div>
            )}
          </form>
        </div>
      </div>
      <ChangePhoneDialog
        open={showPhoneDialog}
        onOpenChange={setShowPhoneDialog}
        currentPhone={profile?.phoneNumber || ""}
      />
    </div>
  );
}
