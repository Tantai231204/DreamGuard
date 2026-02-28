import { useState } from "react"
import { Bell, Mail, MessageSquare, Truck, Tag, Gift, Megaphone, Shield, Smartphone, Volume2 } from "lucide-react"
import { Switch } from "../../../components/ui/switch"
import { Badge } from "../../../components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card"
import { Label } from "../../../components/ui/label"

interface NotificationSetting {
    id: string
    title: string
    description: string
    icon: React.ReactNode
    enabled: boolean
}

interface NotificationGroup {
    id: string
    title: string
    icon: React.ReactNode
    settings: NotificationSetting[]
}

const initialSettings: NotificationGroup[] = [
    {
        id: "orders",
        title: "Đơn hàng",
        icon: <Truck className="h-5 w-5" />,
        settings: [
            { id: "order_status", title: "Cập nhật trạng thái đơn", description: "Nhận thông báo khi đơn hàng có thay đổi", icon: <Truck className="h-4 w-4" />, enabled: true },
            { id: "order_delivery", title: "Thông báo giao hàng", description: "Nhận thông báo khi đơn hàng sắp đến", icon: <Bell className="h-4 w-4" />, enabled: true },
        ]
    },
    {
        id: "promotions",
        title: "Khuyến mãi",
        icon: <Tag className="h-5 w-5" />,
        settings: [
            { id: "flash_sale", title: "Flash Sale", description: "Thông báo khi có chương trình giảm giá sốc", icon: <Tag className="h-4 w-4" />, enabled: true },
            { id: "voucher", title: "Voucher mới", description: "Nhận thông báo khi có voucher dành riêng cho bạn", icon: <Gift className="h-4 w-4" />, enabled: true },
            { id: "new_products", title: "Sản phẩm mới", description: "Thông báo sản phẩm mới phù hợp với bé", icon: <Megaphone className="h-4 w-4" />, enabled: false },
        ]
    },
    {
        id: "baby",
        title: "Nhắc nhở cho bé",
        icon: <Shield className="h-5 w-5" />,
        settings: [
            { id: "milestone", title: "Mốc phát triển", description: "Nhắc nhở các mốc phát triển quan trọng của bé", icon: <Shield className="h-4 w-4" />, enabled: true },
            { id: "birthday", title: "Sinh nhật bé", description: "Nhận ưu đãi đặc biệt vào sinh nhật bé", icon: <Gift className="h-4 w-4" />, enabled: true },
        ]
    },
]

export default function NotificationsTab() {
    const [settings, setSettings] = useState<NotificationGroup[]>(initialSettings)
    const [channels, setChannels] = useState({
        email: true,
        push: true,
        sms: false,
    })

    const handleToggle = (groupId: string, settingId: string) => {
        setSettings(prev => prev.map(group => {
            if (group.id === groupId) {
                return {
                    ...group,
                    settings: group.settings.map(setting => {
                        if (setting.id === settingId) {
                            return { ...setting, enabled: !setting.enabled }
                        }
                        return setting
                    })
                }
            }
            return group
        }))
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-xl font-semibold text-gray-900">Cài đặt thông báo</h2>
                <p className="text-sm text-gray-500 mt-1">Quản lý cách bạn nhận thông báo từ DreamGuard</p>
            </div>

            {/* Notification Channels */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Kênh thông báo</CardTitle>
                    <CardDescription>Chọn cách bạn muốn nhận thông báo</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                                <Mail className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">Email</p>
                                <p className="text-sm text-gray-500">minhanh@email.com</p>
                            </div>
                        </div>
                        <Switch 
                            checked={channels.email} 
                            onCheckedChange={(checked: boolean) => setChannels(prev => ({ ...prev, email: checked }))}
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                                <Smartphone className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">Push notification</p>
                                <p className="text-sm text-gray-500">Thông báo trên thiết bị</p>
                            </div>
                        </div>
                        <Switch 
                            checked={channels.push}
                            onCheckedChange={(checked: boolean) => setChannels(prev => ({ ...prev, push: checked }))}
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-100 text-green-600">
                                <MessageSquare className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">SMS</p>
                                <p className="text-sm text-gray-500">0912 345 678</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">Phí có thể áp dụng</Badge>
                            <Switch 
                                checked={channels.sms}
                                onCheckedChange={(checked: boolean) => setChannels(prev => ({ ...prev, sms: checked }))}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Notification Settings */}
            {settings.map((group) => (
                <Card key={group.id}>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <span className="text-[#4988c4]">{group.icon}</span>
                            {group.title}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1">
                        {group.settings.map((setting, idx) => (
                            <div 
                                key={setting.id}
                                className={`flex items-center justify-between py-4 ${
                                    idx !== group.settings.length - 1 ? "border-b" : ""
                                }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`p-2 rounded-lg ${
                                        setting.enabled ? "bg-[#4988c4]/10 text-[#4988c4]" : "bg-gray-100 text-gray-400"
                                    }`}>
                                        {setting.icon}
                                    </div>
                                    <div>
                                        <Label className="font-medium text-gray-900 cursor-pointer">
                                            {setting.title}
                                        </Label>
                                        <p className="text-sm text-gray-500 mt-0.5">{setting.description}</p>
                                    </div>
                                </div>
                                <Switch 
                                    checked={setting.enabled}
                                    onCheckedChange={() => handleToggle(group.id, setting.id)}
                                />
                            </div>
                        ))}
                    </CardContent>
                </Card>
            ))}

            {/* Sound Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Volume2 className="h-5 w-5 text-[#4988c4]" />
                        Âm thanh thông báo
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                        <div>
                            <p className="font-medium text-gray-900">Bật âm thanh</p>
                            <p className="text-sm text-gray-500">Phát âm thanh khi có thông báo mới</p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
