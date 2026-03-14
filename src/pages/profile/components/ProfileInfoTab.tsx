import { useState } from "react"
import { CameraIcon } from "@radix-ui/react-icons"
import { Mail } from "lucide-react"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Badge } from "../../../components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar"
import { cn } from "@/lib/utils"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"

import { useProfile, useUpdateProfile } from "@/hooks/queries"
import { toast } from "sonner"

export default function ProfileInfoTab() {
  const { data: profile } = useProfile()
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile()

  const [isEditing, setIsEditing] = useState(false)

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    dateOfBirth: "",
    gender: ""
  })

  const handleEdit = () => {
    if (!isEditing && profile) {
      setFormData({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        email: profile.email || "",
        dateOfBirth: profile.dateOfBirth || "",
        gender: profile.gender || ""
      })
    }
    setIsEditing(!isEditing)
  }

  const handleSave = () => {
    updateProfile(formData, {
      onSuccess: () => {
        toast.success("Profile updated successfully")
        setIsEditing(false)
      },
      onError: () => {
        toast.error("Failed to update profile")
      }
    })
  }

  const displayData = isEditing ? formData : {
    firstName: profile?.firstName || "",
    lastName: profile?.lastName || "",
    email: profile?.email || "",
    dateOfBirth: profile?.dateOfBirth || "",
    gender: profile?.gender || ""
  }

  const fullName = `${displayData.firstName} ${displayData.lastName}`.trim() || "User"
  const initials = displayData.firstName && displayData.lastName
    ? `${displayData.firstName[0]}${displayData.lastName[0]}`.toUpperCase()
    : (displayData.firstName?.[0] || "U").toUpperCase()

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Personal Information</h2>
          <p className="text-sm text-slate-500 mt-1">Manage your account details and profile settings.</p>
        </div>
        <Button
          variant={isEditing ? "outline" : "default"}
          onClick={handleEdit}
          className={cn(
            "px-6 h-11 font-black text-[10px] uppercase tracking-[0.15em] rounded-xl transition-all duration-300 active:scale-95 group overflow-hidden",
            !isEditing && "bg-primary text-white shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5"
          )}
        >
          {!isEditing && (
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[1200ms]" />
          )}
          <span className="relative z-10">{isEditing ? "Cancel Editing" : "Edit Profile"}</span>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Avatar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-200/60 p-8 flex flex-col items-center text-center shadow-sm">
            <div className="relative">
              <div className="h-28 w-28 rounded-full ring-4 ring-slate-50 overflow-hidden bg-slate-100 shadow-sm">
                <Avatar className="h-full w-full">
                  <AvatarImage src={profile?.avatarUrl} alt={fullName} className="object-cover" />
                  <AvatarFallback className="bg-slate-900 text-white text-2xl font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </div>
              {isEditing && (
                <button className="absolute bottom-0 right-0 p-2.5 bg-white rounded-full shadow-lg border border-slate-200 text-slate-600 hover:text-[#4988c4] transition-all">
                  <CameraIcon className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-bold text-slate-900">{fullName}</h3>
              <p className="text-sm text-slate-500 mt-1">{displayData.email}</p>
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-none font-bold text-[10px] uppercase tracking-wider">
                Verified
              </Badge>
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-none font-bold text-[10px] uppercase tracking-wider">
                Elite
              </Badge>
            </div>
          </div>
        </div>

        {/* Right Column: Profile Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200/60 p-8 shadow-sm">
            <div className="grid gap-6 sm:grid-cols-2">
              {/* First Name */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-700 ml-1">First Name</Label>
                <Input
                  value={displayData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Enter first name"
                  className="h-11 rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white transition-all font-medium text-slate-900"
                />
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-700 ml-1">Last Name</Label>
                <Input
                  value={displayData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Enter last name"
                  className="h-11 rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white transition-all font-medium text-slate-900"
                />
              </div>

              {/* Email */}
              <div className="space-y-2 sm:col-span-2">
                <Label className="text-xs font-bold text-slate-700 ml-1">Email Address</Label>
                <div className="relative group/input">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within/input:text-[#4988c4] transition-colors" />
                  <Input
                    type="email"
                    value={displayData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!isEditing}
                    placeholder="email@example.com"
                    className="h-11 pl-10 rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white transition-all font-medium text-slate-900"
                  />
                </div>
              </div>

              {/* Date of Birth */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-700 ml-1">Date of Birth</Label>
                <Input
                  type="date"
                  value={displayData.dateOfBirth?.split("T")[0] || ""}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  disabled={!isEditing}
                  className="h-11 rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white transition-all font-medium text-slate-900"
                />
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-700 ml-1">Gender</Label>
                <Select
                  value={displayData.gender}
                  onValueChange={(value) => setFormData({ ...formData, gender: value })}
                  disabled={!isEditing}
                >
                  <SelectTrigger className="h-11 rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white transition-all font-medium text-slate-900">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isEditing && (
              <div className="flex items-center justify-end gap-3 mt-10 pt-8 border-t border-slate-100">
                <Button
                  variant="ghost"
                  onClick={() => setIsEditing(false)}
                  disabled={isUpdating}
                  className="h-10 px-6 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-500 hover:text-slate-900"
                >
                  Discard
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isUpdating}
                  className="relative h-12 px-10 rounded-2xl bg-primary text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-[0_10px_25px_-8px_rgba(var(--color-primary-rgb),0.5)] hover:shadow-[0_15px_30px_-10px_rgba(var(--color-primary-rgb),0.6)] hover:-translate-y-0.5 transition-all duration-300 active:scale-[0.98] group overflow-hidden"
                >
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[1500ms]" />
                  <span className="relative z-10">{isUpdating ? "Saving..." : "Save Changes"}</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
