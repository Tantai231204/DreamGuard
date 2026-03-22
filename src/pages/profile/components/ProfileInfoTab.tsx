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
// import { uploadUserAvatar } from "@/api/services/userProfile.service"
import { uploadToCloudinary } from "@/lib/uploadCloudinary"
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
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState("")

  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null)
  const [calendarStage, setCalendarStage] = useState<'year' | 'month' | 'day'>('year')

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    fullName: "",
    email: "",
    dateOfBirth: "",
    gender: "",
    avatarUrl: ""
  })

  const handleEdit = () => {
    if (!isEditing && profile) {
      const profileFullName = profile.fullName?.trim() || ""
      const fallbackFullName = `${profile.firstName || ""} ${profile.lastName || ""}`.trim()

      setFormData({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        fullName: profileFullName || fallbackFullName,
        email: profile.email || "",
        dateOfBirth: profile.dateOfBirth || "",
        gender: profile.gender || "",
        avatarUrl: profile.avatarUrl || ""
      })
    }
    setIsEditing(!isEditing)
  }

  const handleSave = async () => {
    let avatarUrl = formData.avatarUrl || profile?.avatarUrl || ""

    // if (avatarFile) {
    //   try {
    //     const result = await uploadUserAvatar(avatarFile)
    //     if (result?.avatarUrl) {
    //       avatarUrl = result.avatarUrl
    //     } else if (avatarPreview) {
    //       // avatarUrl = avatarPreview
    //       toast.warning("Upload endpoint not available. Using uploaded preview data (base64) as avatarUrl.")
    //     }
    //   } catch (err) {
    //     console.error("Avatar upload error", err)
    //     if (avatarPreview) {
    //       avatarUrl = avatarPreview
    //       toast.warning("Upload error, still using local preview data URL for avatar.")
    //     } else {
    //       toast.error("Avatar upload failed and no preview available, profile will continue without avatar update.")
    //     }
    //   }
    // }

    if (avatarFile) {
  try {
    const url = await uploadToCloudinary(avatarFile)
    avatarUrl = url
  } catch (err) {
    console.error(err)
    toast.error("Upload avatar failed")
    return 
  }
}

    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      fullName: `${formData.firstName} ${formData.lastName}`.trim() || formData.fullName,
      email: formData.email,
      dateOfBirth: formData.dateOfBirth ? formData.dateOfBirth.slice(0, 10) : "",
      gender: formData.gender,
      avatarUrl,
    }

    updateProfile(payload, {
      onSuccess: () => {
        toast.success("Profile updated successfully")
        setIsEditing(false)
      },
      onError: () => {
        toast.error("Failed to update profile")
      }
    })
  }

  const handleAvatarChange = (file: File | null) => {
    if (!file) return

    setAvatarFile(file)

    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      setAvatarPreview(dataUrl)
      // setFormData((prev) => ({ ...prev, avatarUrl: dataUrl }))
    }
    reader.readAsDataURL(file)
  }

  const profileFullName = profile?.fullName?.trim() || ""
  const [firstNameFromFull = "", ...restFromFull] = profileFullName.split(" ").filter(Boolean)
  const lastNameFromFull = restFromFull.join(" ")

  const displayData = isEditing ? formData : {
    firstName: profile?.firstName || firstNameFromFull || "",
    lastName: profile?.lastName || lastNameFromFull || "",
    fullName: profileFullName || `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim() || "",
    email: profile?.email || "",
    dateOfBirth: profile?.dateOfBirth || "",
    gender: profile?.gender || "",
    avatarUrl: profile?.avatarUrl || ""
  }

  const yearOptions = Array.from({ length: new Date().getFullYear() - 1900 + 1 }, (_, i) => 1900 + i).reverse()
  const monthOptions = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const computedMonth = selectedYear !== null && selectedMonth !== null ? new Date(selectedYear, selectedMonth, 1) : undefined
  const computedSelectedDay = displayData.dateOfBirth ? new Date(displayData.dateOfBirth) : undefined


  const fullName = profileFullName || `${displayData.firstName} ${displayData.lastName}`.trim() || "User"
  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .map((word: string) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U"

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
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null
                    handleAvatarChange(file)
                  }}
                />

                <Avatar className="h-full w-full">
                  <AvatarImage
                    src={
                      avatarPreview ||
                      formData.avatarUrl ||
                      profile?.avatarUrl ||
                      undefined
                    }
                    alt={fullName}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-slate-900 text-white text-2xl font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => document.getElementById("avatar-upload")?.click()}
                    className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity"
                  >
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
              variant={isEditing ? "outline" : "premium"}
              onClick={handleEdit}
              className={cn(
                "px-6 h-11 rounded-xl md:self-end",
                isEditing && "font-bold text-xs uppercase tracking-wider"
              )}
            >
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
                      format(new Date(displayData.dateOfBirth), "yyyy-MM-dd")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-4 rounded-2xl border border-slate-200 shadow-xl" align="start">
                  {calendarStage === 'year' && (
                    <div className="max-h-72 overflow-auto grid gap-2 sm:grid-cols-4">
                      {yearOptions.map((year) => (
                        <button
                          key={year}
                          type="button"
                          onClick={() => {
                            setSelectedYear(year)
                            setSelectedMonth(null)
                            setCalendarStage('month')
                          }}
                          className={cn(
                            'text-left px-3 py-2 rounded-lg border transition-all',
                            selectedYear === year
                              ? 'bg-primary/10 border-primary text-primary font-semibold'
                              : 'bg-white border-slate-200 hover:bg-slate-100'
                          )}
                        >
                          {year}
                        </button>
                      ))}
                    </div>
                  )}

                  {calendarStage === 'month' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between mb-2">
                        <button
                          type="button"
                          onClick={() => setCalendarStage('year')}
                          className="text-sm text-slate-500 hover:text-slate-900"
                        >
                          Back to year
                        </button>
                        <span className="text-sm font-semibold">Year: {selectedYear}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {monthOptions.map((month, index) => (
                          <button
                            key={month}
                            type="button"
                            onClick={() => {
                              setSelectedMonth(index)
                              setCalendarStage('day')
                            }}
                            className={cn(
                              'text-left px-3 py-2 rounded-lg border transition-all',
                              selectedMonth === index
                                ? 'bg-primary/10 border-primary text-primary font-semibold'
                                : 'bg-white border-slate-200 hover:bg-slate-100'
                            )}
                          >
                            {month}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {calendarStage === 'day' && selectedYear !== null && selectedMonth !== null && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between mb-2">
                        <button
                          type="button"
                          onClick={() => setCalendarStage('month')}
                          className="text-sm text-slate-500 hover:text-slate-900"
                        >
                          Back to month
                        </button>
                        <span className="text-sm font-semibold">{monthOptions[selectedMonth]} {selectedYear}</span>
                      </div>

                      <Calendar
                        mode="single"
                        month={computedMonth}
                        selected={computedSelectedDay}
                        onSelect={(date) => {
                          if (!date) return
                          // Lưu chính xác format năm-tháng-ngày
                          setFormData({ ...formData, dateOfBirth: date.toISOString().slice(0, 10) })
                          setCalendarStage('year')
                          setSelectedYear(null)
                          setSelectedMonth(null)
                        }}
                        fromYear={1900}
                        toYear={new Date().getFullYear()}
                        disabled={{ after: new Date() }}
                        initialFocus
                        className="!p-0"
                      />
                    </div>
                  )}
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
                variant="premium"
                onClick={handleSave}
                disabled={isUpdating}
                className="h-12 px-10 rounded-2xl"
              >
                <span className="relative z-10">{isUpdating ? "Saving..." : "Save Changes"}</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
