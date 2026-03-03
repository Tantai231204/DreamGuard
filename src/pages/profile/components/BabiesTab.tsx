import { useState } from "react"
import { PlusIcon, Pencil1Icon, TrashIcon } from "@radix-ui/react-icons"
import { Baby, Ruler, Scale, Moon, Calendar, Sparkles, Gift, ChevronRight } from "lucide-react"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Badge } from "../../../components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar"
import { mockBabies, mockRecommendations } from "../data"
import { calculateAge, getStageInfo, formatPrice } from "../utils"
import type { BabyProfile } from "../types"

export default function BabiesTab() {
    const [babies] = useState<BabyProfile[]>(mockBabies)
    const [showForm, setShowForm] = useState(false)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">Hồ sơ bé yêu</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Quản lý thông tin và nhận gợi ý sản phẩm phù hợp
                    </p>
                </div>
                <Button onClick={() => setShowForm(true)}>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Thêm bé
                </Button>
            </div>

            {/* Baby Cards */}
            <div className="grid gap-4 md:grid-cols-2">
                {babies.map((baby) => {
                    const stage = getStageInfo(baby.birthDate)
                    return (
                        <Card key={baby.id} className="overflow-hidden">
                            {/* Baby Header */}
                            <div className={`px-5 py-4 ${baby.gender === "male"
                                    ? "bg-gradient-to-r from-blue-50 to-sky-50 border-b border-blue-100"
                                    : "bg-gradient-to-r from-pink-50 to-rose-50 border-b border-pink-100"
                                }`}>
                                <div className="flex items-start gap-4">
                                    <Avatar size="lg" className="h-14 w-14 ring-2 ring-white shadow-sm">
                                        <AvatarImage src={baby.avatar} alt={baby.name} />
                                        <AvatarFallback className={
                                            baby.gender === "male"
                                                ? "bg-blue-100 text-blue-600"
                                                : "bg-pink-100 text-pink-600"
                                        }>
                                            <Baby className="h-6 w-6" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-gray-900">{baby.name}</h3>
                                            <Badge variant={baby.gender === "male" ? "default" : "secondary"} className={
                                                baby.gender === "male"
                                                    ? "bg-blue-100 text-blue-700 border-blue-200"
                                                    : "bg-pink-100 text-pink-700 border-pink-200"
                                            }>
                                                {baby.gender === "male" ? "Bé trai" : "Bé gái"}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-0.5">{calculateAge(baby.birthDate)}</p>
                                    </div>
                                    <div className="flex gap-1">
                                        <button className="p-2 rounded-lg hover:bg-white/50 text-gray-400 hover:text-gray-600 transition-colors">
                                            <Pencil1Icon className="h-4 w-4" />
                                        </button>
                                        <button className="p-2 rounded-lg hover:bg-white/50 text-gray-400 hover:text-red-500 transition-colors">
                                            <TrashIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <CardContent className="p-5 space-y-4">
                                {/* Stats Grid */}
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50">
                                        <Ruler className="h-4 w-4 text-gray-400" />
                                        <div>
                                            <p className="text-xs text-gray-500">Chiều cao</p>
                                            <p className="font-medium text-gray-900">{baby.height} cm</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50">
                                        <Scale className="h-4 w-4 text-gray-400" />
                                        <div>
                                            <p className="text-xs text-gray-500">Cân nặng</p>
                                            <p className="font-medium text-gray-900">{baby.weight} kg</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50">
                                        <Calendar className="h-4 w-4 text-gray-400" />
                                        <div>
                                            <p className="text-xs text-gray-500">Sinh nhật</p>
                                            <p className="font-medium text-gray-900">
                                                {new Date(baby.birthDate).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Stage Info */}
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 border border-amber-100">
                                    <Moon className="h-5 w-5 text-amber-500" />
                                    <div>
                                        <p className="text-sm font-medium text-amber-800">{stage.name}</p>
                                        <p className="text-xs text-amber-600">{stage.tips}</p>
                                    </div>
                                </div>

                                {/* Notes */}
                                {baby.notes && (
                                    <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                                        <p className="text-sm text-gray-600">
                                            <span className="font-medium text-gray-700">Ghi chú:</span> {baby.notes}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Product Recommendations */}
            <Card>
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-[#4988c4]" />
                        <CardTitle>Gợi ý cho bé</CardTitle>
                    </div>
                    <CardDescription>Sản phẩm phù hợp với độ tuổi của bé</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {mockRecommendations.map((product) => (
                            <div key={product.id} className="group flex items-center gap-3 p-3 rounded-xl border bg-white hover:border-[#4988c4]/30 hover:shadow-sm transition-all cursor-pointer">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-16 h-16 rounded-lg object-cover bg-gray-100"
                                />
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-gray-900 text-sm truncate group-hover:text-[#4988c4] transition-colors">
                                        {product.name}
                                    </h4>
                                    <p className="text-sm font-semibold text-[#4988c4] mt-1">
                                        {formatPrice(product.price)}
                                    </p>
                                    <Badge variant="outline" className="mt-1.5 text-xs">
                                        {product.forAge}
                                    </Badge>
                                </div>
                                <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-[#4988c4] transition-colors" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Add Baby Form Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <Card className="w-full max-w-md mx-4 animate-in fade-in zoom-in-95 duration-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Baby className="h-5 w-5 text-[#4988c4]" />
                                Thêm hồ sơ bé
                            </CardTitle>
                            <CardDescription>Nhập thông tin để nhận gợi ý sản phẩm phù hợp</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="babyName">Tên bé</Label>
                                <Input id="babyName" placeholder="Nhập tên bé" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="birthDate">Ngày sinh</Label>
                                    <Input id="birthDate" type="date" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Giới tính</Label>
                                    <div className="flex gap-2">
                                        <Button variant="outline" className="flex-1">Bé trai</Button>
                                        <Button variant="outline" className="flex-1">Bé gái</Button>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="height">Chiều cao (cm)</Label>
                                    <Input id="height" type="number" placeholder="70" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="weight">Cân nặng (kg)</Label>
                                    <Input id="weight" type="number" step="0.1" placeholder="8.5" />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <Button variant="outline" className="flex-1" onClick={() => setShowForm(false)}>
                                    Hủy
                                </Button>
                                <Button className="flex-1">
                                    <Gift className="h-4 w-4 mr-2" />
                                    Thêm bé
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
