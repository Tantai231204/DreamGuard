import { useState } from "react"
import { PlusIcon, Pencil1Icon, TrashIcon, CheckIcon } from "@radix-ui/react-icons"
import { MapPin, Home, Building2, Phone, User } from "lucide-react"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Badge } from "../../../components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card"
import { mockAddresses } from "../data"
import type { Address } from "../types"

export default function AddressesTab() {
    const [addresses, setAddresses] = useState<Address[]>(mockAddresses)
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)

    const handleSetDefault = (id: string) => {
        setAddresses(prev => prev.map(addr => ({
            ...addr,
            isDefault: addr.id === id
        })))
    }

    const handleDelete = (id: string) => {
        setAddresses(prev => prev.filter(addr => addr.id !== id))
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">Sổ địa chỉ</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Quản lý địa chỉ giao hàng của bạn
                    </p>
                </div>
                <Button onClick={() => setShowForm(true)}>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Thêm địa chỉ
                </Button>
            </div>

            {/* Address Cards */}
            <div className="grid gap-4 md:grid-cols-2">
                {addresses.map((address) => (
                    <Card 
                        key={address.id} 
                        className={`relative overflow-hidden transition-all ${
                            address.isDefault 
                                ? "ring-2 ring-[#4988c4] border-[#4988c4]" 
                                : "hover:shadow-md"
                        }`}
                    >
                        {/* Default Badge */}
                        {address.isDefault && (
                            <div className="absolute top-0 right-0">
                                <div className="bg-[#4988c4] text-white text-xs font-medium px-3 py-1 rounded-bl-lg">
                                    Mặc định
                                </div>
                            </div>
                        )}

                        <CardContent className="p-5">
                            {/* Type Icon */}
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-xl ${
                                    address.type === "home" 
                                        ? "bg-blue-100 text-blue-600" 
                                        : "bg-purple-100 text-purple-600"
                                }`}>
                                    {address.type === "home" ? (
                                        <Home className="h-5 w-5" />
                                    ) : (
                                        <Building2 className="h-5 w-5" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-semibold text-gray-900">{address.label}</h3>
                                        <Badge variant="outline" className="text-xs">
                                            {address.type === "home" ? "Nhà riêng" : "Công ty"}
                                        </Badge>
                                    </div>

                                    {/* Recipient Info */}
                                    <div className="space-y-1 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-gray-400" />
                                            <span>{address.recipient}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-gray-400" />
                                            <span>{address.phone}</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                            <span className="line-clamp-2">{address.address}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="mt-4 pt-4 border-t flex items-center justify-between">
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => setEditingId(address.id)}
                                        className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#4988c4] transition-colors"
                                    >
                                        <Pencil1Icon className="h-4 w-4" />
                                        Sửa
                                    </button>
                                    <span className="text-gray-300">|</span>
                                    <button 
                                        onClick={() => handleDelete(address.id)}
                                        className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 transition-colors"
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                        Xóa
                                    </button>
                                </div>
                                {!address.isDefault && (
                                    <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => handleSetDefault(address.id)}
                                    >
                                        <CheckIcon className="h-4 w-4 mr-1" />
                                        Đặt mặc định
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Empty State */}
            {addresses.length === 0 && (
                <Card>
                    <CardContent className="py-16 text-center">
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                            <MapPin className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="font-medium text-gray-900 mb-1">Chưa có địa chỉ</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Thêm địa chỉ để việc mua sắm trở nên dễ dàng hơn
                        </p>
                        <Button onClick={() => setShowForm(true)}>
                            <PlusIcon className="h-4 w-4 mr-2" />
                            Thêm địa chỉ đầu tiên
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Add/Edit Form Modal */}
            {(showForm || editingId) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <Card className="w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-[#4988c4]" />
                                {editingId ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}
                            </CardTitle>
                            <CardDescription>
                                {editingId ? "Cập nhật thông tin địa chỉ giao hàng" : "Thêm địa chỉ mới để nhận hàng nhanh hơn"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="recipient">Người nhận</Label>
                                    <Input id="recipient" placeholder="Họ và tên" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Số điện thoại</Label>
                                    <Input id="phone" placeholder="0912 345 678" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Loại địa chỉ</Label>
                                <div className="flex gap-3">
                                    <Button variant="outline" className="flex-1 justify-start">
                                        <Home className="h-4 w-4 mr-2" />
                                        Nhà riêng
                                    </Button>
                                    <Button variant="outline" className="flex-1 justify-start">
                                        <Building2 className="h-4 w-4 mr-2" />
                                        Công ty
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="label">Tên địa chỉ</Label>
                                <Input id="label" placeholder="VD: Nhà riêng, Công ty..." />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">Địa chỉ chi tiết</Label>
                                <Input id="address" placeholder="Số nhà, tên đường, phường/xã..." />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="district">Quận/Huyện</Label>
                                    <Input id="district" placeholder="Chọn quận/huyện" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="city">Tỉnh/Thành phố</Label>
                                    <Input id="city" placeholder="Chọn tỉnh/thành" />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button 
                                    variant="outline" 
                                    className="flex-1" 
                                    onClick={() => {
                                        setShowForm(false)
                                        setEditingId(null)
                                    }}
                                >
                                    Hủy
                                </Button>
                                <Button className="flex-1">
                                    {editingId ? "Cập nhật" : "Thêm địa chỉ"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
