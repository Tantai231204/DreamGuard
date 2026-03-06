import { useState } from "react"
import { Pencil1Icon, CameraIcon } from "@radix-ui/react-icons"
import { User, Mail, Phone, Calendar, Star, Heart } from "lucide-react"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Badge } from "../../../components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar"
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
        phoneNumber: "",
        dateOfBirth: "",
    })

    const handleEdit = () => {
        if (!isEditing && profile) {
            setFormData({
                firstName: profile.firstName || "",
                lastName: profile.lastName || "",
                email: profile.email || "",
                phoneNumber: profile.phoneNumber || "",
                dateOfBirth: profile.dateOfBirth || "",
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
        phoneNumber: profile?.phoneNumber || "",
        dateOfBirth: profile?.dateOfBirth || "",
    }

    const fullName = `${displayData.firstName} ${displayData.lastName}`.trim() || "User"
    const initials = displayData.firstName && displayData.lastName
        ? `${displayData.firstName[0]}${displayData.lastName[0]}`.toUpperCase()
        : (displayData.firstName ? displayData.firstName[0].toUpperCase() : "U")

    const formFields = [
        { label: "First Name", key: "firstName", type: "text", icon: User, placeholder: "Enter first name" },
        { label: "Last Name", key: "lastName", type: "text", icon: User, placeholder: "Enter last name" },
        { label: "Email", key: "email", type: "email", icon: Mail, placeholder: "Enter email address" },
        { label: "Phone Number", key: "phoneNumber", type: "tel", icon: Phone, placeholder: "Enter phone number" },
        { label: "Date of Birth", key: "dateOfBirth", type: "date", icon: Calendar, placeholder: "" },
    ]

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Personal Information</h2>
                    <p className="mt-1 text-sm text-gray-400 font-medium">Update and manage your account details</p>
                </div>
                <Button
                    variant={isEditing ? "secondary" : "default"}
                    onClick={handleEdit}
                    className={`gap-2 h-11 px-5 rounded-2xl font-semibold transition-all active:scale-95 ${isEditing
                        ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        : "bg-[#4988c4] hover:bg-[#3b6fa3] text-white shadow-lg shadow-[#4988c4]/25"
                        }`}
                >
                    <Pencil1Icon className="h-4 w-4" />
                    {isEditing ? "Cancel" : "Edit Profile"}
                </Button>
            </div>

            {/* Profile Card */}
            <div
                className="group relative rounded-3xl bg-white border border-gray-100 shadow-sm transition-all duration-300 overflow-hidden"
                style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)" }}
            >
                {/* Colored accent stripe - matching BabiesTab boy style */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#4988c4] via-[#bde8f5] to-[#4988c4]" />

                <div className="h-24 bg-gradient-to-r from-[#4988c4]/5 via-[#bde8f5]/20 to-transparent" />
                <div className="px-6 -mt-12 pb-8 flex flex-col sm:flex-row gap-6">
                    {/* Avatar */}
                    <div className="relative">
                        <Avatar className="h-24 w-24 ring-4 ring-white shadow-lg rounded-2xl">
                            <AvatarImage src={profile?.avatarUrl} alt={fullName} />
                            <AvatarFallback className="rounded-2xl bg-gradient-to-br from-[#4988c4] to-[#3a73a8] text-white text-2xl font-semibold">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        {isEditing && (
                            <button className="absolute -bottom-1 -right-1 rounded-xl bg-[#4988c4] p-2 text-white shadow-lg transition hover:bg-[#3a73a8] hover:scale-110 active:scale-90">
                                <CameraIcon className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 pt-2">
                        <div className="flex items-center gap-3">
                            <h3 className="text-xl font-bold text-gray-900 leading-tight">
                                {fullName}
                            </h3>
                            <Badge variant="default" className="bg-[#4988c4]/10 text-[#4988c4] border-none font-semibold px-3">
                                Verified User
                            </Badge>
                        </div>
                        <p className="mt-1 text-sm text-gray-500 font-medium">{displayData.email}</p>

                        <div className="mt-5 flex flex-wrap gap-2">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 text-[#4988c4] border border-blue-100/50">
                                <Heart className="h-3.5 w-3.5 fill-[#4988c4]" />
                                <span className="text-xs font-bold uppercase tracking-wider">Member</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-100/50">
                                <Star className="h-3.5 w-3.5 fill-amber-500" />
                                <span className="text-xs font-bold uppercase tracking-wider">150 Points</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form */}
            <div
                className="rounded-3xl bg-white border border-gray-100 shadow-sm overflow-hidden"
                style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)" }}
            >
                <div className="p-6 md:p-8">
                    <div className="grid gap-6 sm:grid-cols-2">
                        {formFields.map((field) => {
                            const Icon = field.icon
                            return (
                                <div key={field.key} className="space-y-1.5">
                                    <Label htmlFor={field.key} className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <Icon className="h-4 w-4 text-gray-400" />
                                        {field.label}
                                    </Label>
                                    <Input
                                        id={field.key}
                                        type={field.type}
                                        value={displayData[field.key as keyof typeof displayData]}
                                        onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                                        disabled={!isEditing}
                                        placeholder={field.placeholder}
                                        className="h-11 rounded-xl border-gray-200 focus:border-[#4988c4] focus:ring-[#4988c4]/10 transition-all"
                                    />
                                </div>
                            )
                        })}
                    </div>

                    {/* Actions */}
                    {isEditing && (
                        <div className="flex justify-end gap-3 pt-8 mt-8 border-t border-gray-50">
                            <Button
                                variant="outline"
                                onClick={() => setIsEditing(false)}
                                disabled={isUpdating}
                                className="h-11 px-6 rounded-2xl font-semibold text-gray-500 border-gray-200 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={isUpdating}
                                className="h-11 px-8 rounded-2xl bg-[#4988c4] hover:bg-[#3b6fa3] text-white font-semibold shadow-lg shadow-[#4988c4]/25 transition-all active:scale-95"
                            >
                                {isUpdating ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
