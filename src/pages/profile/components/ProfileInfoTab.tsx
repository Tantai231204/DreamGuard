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
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { FaMars, FaVenus, FaGenderless } from "react-icons/fa6"

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
      <div className="bg-white rounded-[2.5rem] border border-slate-100/80 shadow-[0_15px_40px_rgba(0,0,0,0.02)] overflow-hidden">
        {/* Header Ambient Banner */}
        <div className="relative h-28 bg-gradient-to-r from-sky-200/10 via-primary/5 to-purple-200/10 border-b border-slate-50" />

        <div className="px-8 pb-8 flex flex-col -mt-14">
          {/* Profile Header Row */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-5">
              <div className="relative h-28 w-28 rounded-[2.25rem] ring-4 ring-white shadow-lg overflow-hidden bg-white group/avatar">
                <Avatar className="h-full w-full">
                  <AvatarImage src={profile?.avatarUrl} alt={fullName} className="object-cover" />
                  <AvatarFallback className="bg-slate-900 text-white text-2xl font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <button className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                    <CameraIcon className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="pb-1 max-w-sm">
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">{fullName}</h3>
                <p className="text-sm text-slate-400 font-medium mt-1 truncate">{displayData.email}</p>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 hover:bg-emerald-50 border-none font-black text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full">
                    Verified
                  </Badge>
                  <Badge variant="secondary" className="bg-blue-50 text-blue-600 hover:bg-blue-50 border-none font-black text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full">
                    Elite
                  </Badge>
                </div>
              </div>
            </div>

            <Button
              variant={isEditing ? "outline" : "default"}
              onClick={handleEdit}
              className={cn(
                "px-6 h-11 font-black text-[10px] uppercase tracking-[0.12em] rounded-xl transition-all duration-300 active:scale-95 group overflow-hidden md:self-end",
                !isEditing && "bg-primary text-white shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5"
              )}
            >
              {!isEditing && (
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[1200ms]" />
              )}
              <span className="relative z-10">{isEditing ? "Cancel Editing" : "Edit Profile"}</span>
            </Button>
          </div>

          {/* Form Body */}
          <div className="mt-12 pt-10 border-t border-slate-100/80 grid gap-6 sm:grid-cols-2">
            {/* First Name */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-600 ml-1">First Name</Label>
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
              <Label className="text-xs font-bold text-slate-600 ml-1">Last Name</Label>
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
              <Label className="text-xs font-bold text-slate-600 ml-1">Email Address</Label>
              <div className="relative group/input">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within/input:text-primary transition-colors" />
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
            <div className="space-y-2 flex flex-col">
              <Label className="text-xs font-bold text-slate-600 ml-1 mb-1">Date of Birth</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={!isEditing}
                    className={cn(
                      "h-11 px-3 rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white transition-all font-medium text-slate-900 flex items-center justify-start gap-2",
                      !displayData.dateOfBirth && "text-slate-400"
                    )}
                  >
                    <CalendarIcon className="h-4 w-4 text-slate-400" />
                    {displayData.dateOfBirth ? (
                      format(new Date(displayData.dateOfBirth), "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 rounded-2xl border-slate-100 shadow-xl" align="start">
                  <Calendar
                    mode="single"
                    selected={displayData.dateOfBirth ? new Date(displayData.dateOfBirth) : undefined}
                    onSelect={(date) => setFormData({ ...formData, dateOfBirth: date ? date.toISOString() : "" })}
                    initialFocus
                    disabled={!isEditing}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-600 ml-1">Gender</Label>
              <Select
                value={displayData.gender}
                onValueChange={(value) => setFormData({ ...formData, gender: value })}
                disabled={!isEditing}
              >
                <SelectTrigger className="h-11 rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white transition-all font-medium text-slate-900 flex items-center gap-2">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                  <SelectItem value="Male">
                    <div className="flex items-center gap-2">
                      <FaMars className="h-4 w-4 text-blue-500" />
                      <span>Male</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="Female">
                    <div className="flex items-center gap-2">
                      <FaVenus className="h-4 w-4 text-pink-500" />
                      <span>Female</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="Other">
                    <div className="flex items-center gap-2">
                      <FaGenderless className="h-4 w-4 text-slate-500" />
                      <span>Other</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Footer */}
          {isEditing && (
            <div className="flex items-center justify-end gap-3 mt-10 pt-8 border-t border-slate-100/80">
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
  )
}
