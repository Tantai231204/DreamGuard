import { useState } from "react"
import { Pencil1Icon, CameraIcon } from "@radix-ui/react-icons"
import { User, Mail, Phone, Calendar, Star, Heart } from "lucide-react"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Badge } from "../../../components/ui/badge"
import { Card, CardContent } from "../../../components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar"

export default function ProfileInfoTab() {
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState({
        fullName: "Nguyễn Thị Minh Anh",
        email: "minhanh.nguyen@email.com",
        phone: "0912 345 678",
        birthday: "1992-05-20",
    })

    const formFields = [
        { label: "Họ và tên", key: "fullName", type: "text", icon: User, placeholder: "Nhập họ và tên" },
        { label: "Email", key: "email", type: "email", icon: Mail, placeholder: "Nhập email" },
        { label: "Số điện thoại", key: "phone", type: "tel", icon: Phone, placeholder: "Nhập số điện thoại" },
        { label: "Ngày sinh", key: "birthday", type: "date", icon: Calendar, placeholder: "" },
    ]

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-semibold text-gray-900">Thông tin cá nhân</h2>
                    <p className="mt-1 text-sm text-gray-500">Cập nhật và quản lý thông tin tài khoản của bạn</p>
                </div>
                <Button 
                    variant={isEditing ? "secondary" : "outline"} 
                    onClick={() => setIsEditing(!isEditing)}
                    className="gap-2"
                >
                    <Pencil1Icon className="h-4 w-4" />
                    {isEditing ? "Hủy" : "Chỉnh sửa"}
                </Button>
            </div>

            {/* Profile Card */}
            <Card className="overflow-hidden">
                <div className="h-24 bg-gradient-to-r from-[#4988c4]/10 via-[#bde8f5]/30 to-transparent" />
                <CardContent className="-mt-12 pb-6">
                    <div className="flex flex-col sm:flex-row gap-6">
                        {/* Avatar */}
                        <div className="relative">
                            <Avatar size="xl" className="h-24 w-24 ring-4 ring-white shadow-lg">
                                <AvatarImage src="/images/avatar-placeholder.jpg" alt={formData.fullName} />
                                <AvatarFallback className="bg-gradient-to-br from-[#4988c4] to-[#3a73a8] text-white text-2xl font-semibold">
                                    {formData.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
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
                            <h3 className="text-xl font-bold text-gray-900">{formData.fullName}</h3>
                            <p className="mt-0.5 text-sm text-gray-500">{formData.email}</p>
                            <div className="mt-4 flex flex-wrap gap-2">
                                <Badge variant="default" className="gap-1.5">
                                    <Heart className="h-3 w-3" />
                                    Thành viên
                                </Badge>
                                <Badge variant="warning" className="gap-1.5">
                                    <Star className="h-3 w-3" />
                                    150 điểm
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
                            const Icon = field.icon
                            return (
                                <div key={field.key} className="space-y-2">
                                    <Label htmlFor={field.key} className="flex items-center gap-2 text-gray-700">
                                        <Icon className="h-4 w-4 text-gray-400" />
                                        {field.label}
                                    </Label>
                                    <Input
                                        id={field.key}
                                        type={field.type}
                                        value={formData[field.key as keyof typeof formData]}
                                        onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                                        disabled={!isEditing}
                                        placeholder={field.placeholder}
                                    />
                                </div>
                            )
                        })}
                    </div>

                    {/* Actions */}
                    {isEditing && (
                        <div className="flex justify-end gap-3 pt-6 mt-6 border-t">
                            <Button variant="outline" onClick={() => setIsEditing(false)}>
                                Hủy bỏ
                            </Button>
                            <Button>Lưu thay đổi</Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
