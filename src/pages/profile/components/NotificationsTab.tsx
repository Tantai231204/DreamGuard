import { useState } from "react"
import { Bell, Mail, MessageSquare, Truck, Tag, Gift, Megaphone, Shield, Smartphone, Volume2 } from "lucide-react"
import { Switch } from "../../../components/ui/switch"
import { Badge } from "../../../components/ui/badge"
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
        title: "Order Updates",
        icon: <Truck className="h-5 w-5" />,
        settings: [
            { id: "order_status", title: "Order Status", description: "Get notified about status changes", icon: <Truck className="h-4 w-4" />, enabled: true },
            { id: "order_delivery", title: "Delivery Updates", description: "Receive alerts when your order is nearby", icon: <Bell className="h-4 w-4" />, enabled: true },
        ]
    },
    {
        id: "promotions",
        title: "Promotions & Offers",
        icon: <Tag className="h-5 w-5" />,
        settings: [
            { id: "flash_sale", title: "Flash Sales", description: "Instant alerts for limited-time discounts", icon: <Tag className="h-4 w-4" />, enabled: true },
            { id: "voucher", title: "Personal Vouchers", description: "Notifications for exclusive coupons", icon: <Gift className="h-4 w-4" />, enabled: true },
            { id: "new_products", title: "New Arrivals", description: "Find out when we launch new baby bedding", icon: <Megaphone className="h-4 w-4" />, enabled: false },
        ]
    },
    {
        id: "baby",
        title: "Baby Milestones",
        icon: <Shield className="h-5 w-5" />,
        settings: [
            { id: "milestone", title: "Development Tracks", description: "Reminders for important growth stages", icon: <Shield className="h-4 w-4" />, enabled: true },
            { id: "birthday", title: "Birthday Rewards", description: "Special gifts for your little one's big day", icon: <Gift className="h-4 w-4" />, enabled: true },
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
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="pb-6 border-b border-slate-100">
                <h2 className="text-xl font-bold text-slate-900">Notifications</h2>
                <p className="text-sm text-slate-500 mt-1 font-medium">Manage how you receive updates and alerts.</p>
            </div>

            {/* Channels Card */}
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 transition-all">
                <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-3 uppercase tracking-wider">
                    <Megaphone className="h-4 w-4 text-slate-400" />
                    Notification Channels
                </h3>
                <div className="grid gap-3">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50/50 border border-slate-100 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                <Mail className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-800">Email Notifications</p>
                                <p className="text-[11px] text-slate-500 font-medium">Updates sent to your registered email</p>
                            </div>
                        </div>
                        <Switch 
                            checked={channels.email} 
                            onCheckedChange={(checked: boolean) => setChannels(prev => ({ ...prev, email: checked }))}
                            className="data-[state=checked]:bg-primary"
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50/50 border border-slate-100 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                                <Smartphone className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-800">Push Notifications</p>
                                <p className="text-[11px] text-slate-500 font-medium">Instant alerts on your device</p>
                            </div>
                        </div>
                        <Switch 
                            checked={channels.push}
                            onCheckedChange={(checked: boolean) => setChannels(prev => ({ ...prev, push: checked }))}
                            className="data-[state=checked]:bg-primary"
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50/50 border border-slate-100 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                                <MessageSquare className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-800">SMS Alerts</p>
                                <p className="text-[11px] text-slate-500 font-medium">Text messages for urgent updates</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Badge className="bg-amber-50 text-amber-600 border-none text-[8px] font-bold uppercase tracking-wider px-2 h-5">FEE APPLIED</Badge>
                            <Switch 
                                checked={channels.sms}
                                onCheckedChange={(checked: boolean) => setChannels(prev => ({ ...prev, sms: checked }))}
                                className="data-[state=checked]:bg-primary"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Notification Topics */}
            <div className="grid gap-6">
                {settings.map((group) => (
                    <div key={group.id} className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden transition-all">
                        <div className="px-5 py-4 flex items-center gap-3 border-b border-slate-100 bg-slate-50/30">
                            <div className="text-slate-400">{group.icon}</div>
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">{group.title}</h3>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {group.settings.map((setting) => (
                                <div key={setting.id} className="flex items-center justify-between p-5 hover:bg-slate-50/30 transition-colors">
                                    <div className="flex items-start gap-4">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${setting.enabled ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-400"}`}>
                                            {setting.icon}
                                        </div>
                                        <div>
                                            <Label className="text-sm font-bold text-slate-800 block mb-0.5">{setting.title}</Label>
                                            <p className="text-xs text-slate-500 font-medium leading-relaxed">{setting.description}</p>
                                        </div>
                                    </div>
                                    <Switch 
                                        checked={setting.enabled}
                                        onCheckedChange={() => handleToggle(group.id, setting.id)}
                                        className="data-[state=checked]:bg-primary"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Sound Settings Card */}
            <div className="bg-blue-50/40 border border-blue-100 rounded-2xl p-6 flex items-center justify-between transition-all">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-primary shadow-sm border border-primary/10">
                        <Volume2 className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-800">Notification Sounds</p>
                        <p className="text-xs text-slate-500 font-medium">Play a sound for new notifications</p>
                    </div>
                </div>
                <Switch defaultChecked className="data-[state=checked]:bg-primary" />
            </div>
        </div>
    )
}
