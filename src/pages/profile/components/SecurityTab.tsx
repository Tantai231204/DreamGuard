import { useState } from "react"
import { EyeOpenIcon, EyeNoneIcon, CheckCircledIcon } from "@radix-ui/react-icons"
import { Shield, Key, Smartphone, Mail, AlertTriangle, Lock, History, LogOut } from "lucide-react"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Badge } from "../../../components/ui/badge"
import { Switch } from "../../../components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card"

export default function SecurityTab() {
    const [showPassword, setShowPassword] = useState(false)
    const [showChangePassword, setShowChangePassword] = useState(false)
    const [twoFactor, setTwoFactor] = useState(false)

    const loginHistory = [
        { id: 1, device: "Chrome on Windows", location: "Hà Nội, Việt Nam", time: "Đang hoạt động", current: true },
        { id: 2, device: "Safari on iPhone", location: "Hà Nội, Việt Nam", time: "2 giờ trước", current: false },
        { id: 3, device: "Firefox on Mac", location: "Hồ Chí Minh, Việt Nam", time: "3 ngày trước", current: false },
    ]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-xl font-semibold text-gray-900">Bảo mật tài khoản</h2>
                <p className="text-sm text-gray-500 mt-1">Quản lý mật khẩu và các tùy chọn bảo mật</p>
            </div>

            {/* Security Status */}
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                <CardContent className="p-5">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-green-100 text-green-600">
                            <Shield className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-green-800">Tài khoản của bạn được bảo vệ</h3>
                                <Badge variant="success">An toàn</Badge>
                            </div>
                            <p className="text-sm text-green-600 mt-1">
                                Bạn đã kích hoạt các tính năng bảo mật cơ bản
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Password */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Key className="h-5 w-5 text-[#4988c4]" />
                            <CardTitle className="text-base">Mật khẩu</CardTitle>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setShowChangePassword(true)}>
                            Đổi mật khẩu
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-50">
                        <div className="flex-1">
                            <p className="text-sm text-gray-600">Mật khẩu hiện tại</p>
                            <p className="font-medium text-gray-900 mt-1">••••••••••••</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-500">Cập nhật lần cuối</p>
                            <p className="text-sm text-gray-600">30 ngày trước</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Two-Factor Authentication */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Smartphone className="h-5 w-5 text-[#4988c4]" />
                                Xác thực 2 bước
                            </CardTitle>
                            <CardDescription className="mt-1">
                                Thêm lớp bảo mật cho tài khoản của bạn
                            </CardDescription>
                        </div>
                        <Switch checked={twoFactor} onCheckedChange={setTwoFactor} />
                    </div>
                </CardHeader>
                {twoFactor && (
                    <CardContent className="pt-0">
                        <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
                            <div className="flex items-start gap-3">
                                <CheckCircledIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                                <div>
                                    <p className="font-medium text-blue-800">Đã kích hoạt</p>
                                    <p className="text-sm text-blue-600 mt-1">
                                        Mã xác thực sẽ được gửi đến số điện thoại ****678
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                )}
            </Card>

            {/* Email Verification */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Mail className="h-5 w-5 text-[#4988c4]" />
                        Email xác thực
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-green-100 text-green-600">
                                <CheckCircledIcon className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">minhanh@email.com</p>
                                <p className="text-sm text-green-600">Đã xác thực</p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm">Thay đổi</Button>
                    </div>
                </CardContent>
            </Card>

            {/* Login History */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <History className="h-5 w-5 text-[#4988c4]" />
                        Lịch sử đăng nhập
                    </CardTitle>
                    <CardDescription>Các thiết bị đã đăng nhập gần đây</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {loginHistory.map((session) => (
                        <div
                            key={session.id}
                            className={`flex items-center justify-between p-4 rounded-lg ${session.current ? "bg-[#4988c4]/5 border border-[#4988c4]/20" : "bg-gray-50"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${session.current ? "bg-[#4988c4]/10 text-[#4988c4]" : "bg-gray-200 text-gray-500"
                                    }`}>
                                    <Smartphone className="h-5 w-5" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium text-gray-900">{session.device}</p>
                                        {session.current && (
                                            <Badge variant="success" className="text-xs">Thiết bị này</Badge>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        {session.location} • {session.time}
                                    </p>
                                </div>
                            </div>
                            {!session.current && (
                                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                    <LogOut className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-red-200">
                <CardHeader>
                    <CardTitle className="text-base text-red-600 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Vùng nguy hiểm
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-red-50 border border-red-100">
                        <div>
                            <p className="font-medium text-red-800">Xóa tài khoản</p>
                            <p className="text-sm text-red-600 mt-1">
                                Xóa vĩnh viễn tài khoản và tất cả dữ liệu của bạn
                            </p>
                        </div>
                        <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-100">
                            Xóa tài khoản
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Change Password Modal */}
            {showChangePassword && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <Card className="w-full max-w-md mx-4 animate-in fade-in zoom-in-95 duration-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Lock className="h-5 w-5 text-[#4988c4]" />
                                Đổi mật khẩu
                            </CardTitle>
                            <CardDescription>Nhập mật khẩu mới để bảo vệ tài khoản</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                                <div className="relative">
                                    <Input
                                        id="currentPassword"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Nhập mật khẩu hiện tại"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeNoneIcon className="h-4 w-4" /> : <EyeOpenIcon className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="newPassword">Mật khẩu mới</Label>
                                <Input id="newPassword" type="password" placeholder="Nhập mật khẩu mới" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                                <Input id="confirmPassword" type="password" placeholder="Nhập lại mật khẩu mới" />
                            </div>

                            {/* Password Requirements */}
                            <div className="p-3 rounded-lg bg-gray-50 space-y-2 text-sm">
                                <p className="font-medium text-gray-700">Yêu cầu mật khẩu:</p>
                                <ul className="space-y-1 text-gray-600">
                                    <li className="flex items-center gap-2">
                                        <CheckCircledIcon className="h-4 w-4 text-green-500" />
                                        Ít nhất 8 ký tự
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircledIcon className="h-4 w-4 text-gray-300" />
                                        Chứa chữ hoa và chữ thường
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircledIcon className="h-4 w-4 text-gray-300" />
                                        Chứa ít nhất 1 số
                                    </li>
                                </ul>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button variant="outline" className="flex-1" onClick={() => setShowChangePassword(false)}>
                                    Hủy
                                </Button>
                                <Button className="flex-1">
                                    Đổi mật khẩu
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
