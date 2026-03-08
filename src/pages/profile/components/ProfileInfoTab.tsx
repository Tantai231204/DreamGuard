import { useState } from "react";
import { Pencil1Icon, CameraIcon } from "@radix-ui/react-icons";
import { User, Mail, Calendar, Star, Heart } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Badge } from "../../../components/ui/badge";
import { Card, CardContent } from "../../../components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../components/ui/avatar";
import {
  useUserProfile,
  useUpdateUserProfile,
} from "../../../hooks/useUserProfile";

export default function ProfileInfoTab() {
  const [isEditing, setIsEditing] = useState(false);
  const { data: profile } = useUserProfile();
  const updateProfileMutation = useUpdateUserProfile();

  const [formData, setFormData] = useState(() => ({
    firstName: profile?.firstName ?? "",
    lastName: profile?.lastName ?? "",
    email: profile?.email ?? "",
    dateOfBirth: profile?.dateOfBirth ?? "",
    gender: profile?.gender ?? "",
  }));

  const handleSave = () => {
    updateProfileMutation.mutate(formData, {
      onSuccess: () => {
        setIsEditing(false);
      },
    });
  };

  const formFields = [
    {
      label: "First Name",
      key: "firstName",
      type: "text",
      icon: User,
      placeholder: "Enter first name",
    },
    {
      label: "Last Name",
      key: "lastName",
      type: "text",
      icon: User,
      placeholder: "Enter last name",
    },
    {
      label: "Email",
      key: "email",
      type: "email",
      icon: Mail,
      placeholder: "Enter email",
    },
    {
      label: "Date of Birth",
      key: "dateOfBirth",
      type: "date",
      icon: Calendar,
      placeholder: "",
    },
    {
      label: "Gender",
      key: "gender",
      type: "select",
      icon: User,
      placeholder: "",
    },
  ];

  const handleCancel = () => {
    if (!profile) return;

    setFormData({
      firstName: profile.firstName ?? "",
      lastName: profile.lastName ?? "",
      email: profile.email ?? "",
      dateOfBirth: profile.dateOfBirth ?? "",
      gender: profile.gender ?? "",
    });

    setIsEditing(false);
  };

  const handleEdit = () => {
    if (!profile) return;

    setFormData({
      firstName: profile.firstName ?? "",
      lastName: profile.lastName ?? "",
      email: profile.email ?? "",
      dateOfBirth: profile.dateOfBirth ?? "",
      gender: profile.gender ?? "",
    });

    setIsEditing(true);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Personal Information
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Update your profile information and email address.
          </p>
        </div>
        <Button
          variant={isEditing ? "secondary" : "outline"}
          onClick={isEditing ? handleCancel : handleEdit}
          className="gap-2"
        >
          <Pencil1Icon className="h-4 w-4" />
          {isEditing ? "Cancel" : "Edit"}
        </Button>
      </div>

      {/* Profile Card */}
      <Card className="overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-[#4988c4]/10 via-[#bde8f5]/30 to-transparent" />
        <CardContent className="-mt-12 pb-6">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Avatar */}
            <div className="relative">
              <Avatar
                size="xl"
                className="h-24 w-24 ring-4 ring-white shadow-lg"
              >
                <AvatarImage
                  src="/images/avatar-placeholder.jpg"
                  alt={`${formData.firstName} ${formData.lastName}`}
                />
                <AvatarFallback className="bg-gradient-to-br from-[#4988c4] to-[#3a73a8] text-white text-2xl font-semibold">
                  {`${formData.firstName || profile?.firstName || ""}${
                    formData.lastName || profile?.lastName || ""
                  }`}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <button className="absolute -bottom-1 -right-1 rounded-full bg-[#4988c4] p-2 text-white shadow-lg transition hover:bg-[#3a73a8]">
                  <CameraIcon className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 pt-2">
              <h3 className="text-xl font-bold text-gray-900">
                {formData.firstName || profile?.firstName}{" "}
                {formData.lastName || profile?.lastName}
              </h3>
              <p className="mt-0.5 text-sm text-gray-500">
                {formData.email || profile?.email}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="default" className="gap-1.5">
                  <Heart className="h-3 w-3" />
                  Member
                </Badge>
                <Badge variant="warning" className="gap-1.5">
                  <Star className="h-3 w-3" />
                  150 Points
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-6 sm:grid-cols-2">
            {formFields.map((field) => {
              const Icon = field.icon;
              return (
                <div key={field.key} className="space-y-2">
                  <Label
                    htmlFor={field.key}
                    className="flex items-center gap-2 text-gray-700"
                  >
                    <Icon className="h-4 w-4 text-gray-400" />
                    {field.label}
                  </Label>
                  {field.type === "select" ? (
                    <select
                      id={field.key}
                      value={
                        isEditing
                          ? formData.gender
                          : (profile?.gender?.toLowerCase() ?? "")
                      }
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          gender: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Choose gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  ) : (
                    <Input
                      id={field.key}
                      type={field.type}
                      value={
                        isEditing
                          ? formData[field.key as keyof typeof formData]
                          : (profile?.[field.key as keyof typeof profile] ?? "")
                      }
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          [field.key]: e.target.value,
                        })
                      }
                      disabled={!isEditing}
                      placeholder={field.placeholder}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Actions */}
          {isEditing && (
            <div className="flex justify-end gap-3 pt-6 mt-6 border-t">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={updateProfileMutation.isPending}
              >
                {updateProfileMutation.isPending
                  ? "Saving..."
                  : "Save Changes"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
