import { EyeOpenIcon } from "@radix-ui/react-icons"
import { Package, Truck, CheckCircle, Clock, XCircle, ChevronRight, Search, Filter } from "lucide-react"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Badge } from "../../../components/ui/badge"
import { Card, CardContent } from "../../../components/ui/card"
import { mockOrders, ORDER_STATUS_COLORS } from "../data"
import { formatPrice, formatDate } from "../utils"

const STATUS_ICONS: Record<string, React.ReactNode> = {
    pending: <Clock className="h-4 w-4" />,
    processing: <Package className="h-4 w-4" />,
    shipping: <Truck className="h-4 w-4" />,
    delivered: <CheckCircle className="h-4 w-4" />,
    cancelled: <XCircle className="h-4 w-4" />,
}

const STATUS_LABELS: Record<string, string> = {
    pending: "Chờ xác nhận",
    processing: "Đang xử lý",
    shipping: "Đang giao",
    delivered: "Đã giao",
    cancelled: "Đã hủy",
}

export default function OrdersTab() {
    // Stats summary
    const stats = {
        total: mockOrders.length,
        pending: mockOrders.filter(o => o.status === "pending").length,
        shipping: mockOrders.filter(o => o.status === "shipping").length,
        delivered: mockOrders.filter(o => o.status === "delivered").length,
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-xl font-semibold text-gray-900">Đơn hàng của tôi</h2>
                <p className="text-sm text-gray-500 mt-1">Theo dõi và quản lý các đơn hàng</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-[#e6f7fb] to-[#bde8f5]/50 border-[#94d9ef]">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-[#3a73a8]">Tổng đơn</p>
                                <p className="text-2xl font-bold text-[#2d5f8a]">{stats.total}</p>
                            </div>
                            <Package className="h-8 w-8 text-[#4988c4]" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-amber-600">Chờ xác nhận</p>
                                <p className="text-2xl font-bold text-amber-700">{stats.pending}</p>
                            </div>
                            <Clock className="h-8 w-8 text-amber-400" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-[#bde8f5]/30 to-[#94d9ef]/30 border-[#94d9ef]">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-[#3a73a8]">Đang giao</p>
                                <p className="text-2xl font-bold text-[#2d5f8a]">{stats.shipping}</p>
                            </div>
                            <Truck className="h-8 w-8 text-[#4988c4]" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-green-600">Đã giao</p>
                                <p className="text-2xl font-bold text-green-700">{stats.delivered}</p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-green-400" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input placeholder="Tìm theo mã đơn hàng..." className="pl-10" />
                </div>
                <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Lọc
                </Button>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
                {mockOrders.map((order) => {
                    const statusColor = ORDER_STATUS_COLORS[order.status]
                    return (
                        <Card key={order.id} className="overflow-hidden hover:shadow-md transition-shadow">
                            {/* Order Header */}
                            <div className="px-5 py-3 bg-gray-50 border-b flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-3">
                                    <span className="font-medium text-gray-900">#{order.id}</span>
                                    <Badge variant={statusColor as "default" | "secondary" | "success" | "warning" | "danger" | "outline"} className="flex items-center gap-1">
                                        {STATUS_ICONS[order.status]}
                                        {STATUS_LABELS[order.status]}
                                    </Badge>
                                </div>
                                <span className="text-sm text-gray-500">{formatDate(order.createdAt)}</span>
                            </div>

                            <CardContent className="p-5">
                                {/* Order Items */}
                                <div className="space-y-3">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-4">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-16 h-16 rounded-lg object-cover bg-gray-100 border"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-900 truncate">{item.name}</p>
                                                <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
                                            </div>
                                            <p className="font-medium text-gray-900">{formatPrice(item.price)}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Order Footer */}
                                <div className="mt-4 pt-4 border-t flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <span className="text-sm text-gray-500">Tổng tiền: </span>
                                        <span className="text-lg font-semibold text-[#4988c4]">{formatPrice(order.total)}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        {order.status === "delivered" && (
                                            <Button variant="outline" size="sm">
                                                Mua lại
                                            </Button>
                                        )}
                                        <Button variant="outline" size="sm">
                                            <EyeOpenIcon className="h-4 w-4 mr-1" />
                                            Chi tiết
                                            <ChevronRight className="h-4 w-4 ml-1" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Empty State */}
            {mockOrders.length === 0 && (
                <Card>
                    <CardContent className="py-16 text-center">
                        <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="font-medium text-gray-900 mb-1">Chưa có đơn hàng</h3>
                        <p className="text-sm text-gray-500 mb-4">Hãy khám phá và mua sắm cho bé yêu nhé!</p>
                        <Button>Mua sắm ngay</Button>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
