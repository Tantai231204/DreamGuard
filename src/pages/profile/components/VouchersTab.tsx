import { useState, useMemo } from "react"
import { Ticket, Gift, Search, Filter, SortAsc, X, Tag, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { mockVouchers } from "../data"
import type { Voucher } from "../types"
import { VoucherCard, VoucherDetailModal } from "./voucher"

export default function VouchersTab() {
    const [filterStatus, setFilterStatus] = useState<"all" | "active" | "used" | "expired">("all")
    const [searchQuery, setSearchQuery] = useState("")
    const [categoryFilter, setCategoryFilter] = useState<string>("all")
    const [sortBy, setSortBy] = useState<string>("expiry-asc")
    const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null)
    const [modalOpen, setModalOpen] = useState(false)

    // Get unique categories
    const categories = useMemo(() => {
        const cats = new Set(mockVouchers.map(v => v.category).filter((cat): cat is string => cat !== undefined))
        return ["all", ...Array.from(cats)]
    }, [])

    // Filter and sort vouchers
    const filteredVouchers = useMemo(() => {
        const result = mockVouchers.filter(voucher => {
            // Status filter
            if (filterStatus !== "all" && voucher.status !== filterStatus) return false

            // Search filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase()
                const matchesSearch =
                    voucher.title.toLowerCase().includes(query) ||
                    voucher.code.toLowerCase().includes(query) ||
                    voucher.description.toLowerCase().includes(query)
                if (!matchesSearch) return false
            }

            // Category filter
            if (categoryFilter !== "all" && voucher.category !== categoryFilter) return false

            return true
        })

        // Sort
        result.sort((a, b) => {
            switch (sortBy) {
                case "expiry-asc":
                    return new Date(a.validTo).getTime() - new Date(b.validTo).getTime()
                case "expiry-desc":
                    return new Date(b.validTo).getTime() - new Date(a.validTo).getTime()
                case "discount-asc":
                    return a.discount - b.discount
                case "discount-desc":
                    return b.discount - a.discount
                default:
                    return 0
            }
        })

        return result
    }, [filterStatus, searchQuery, categoryFilter, sortBy])

    const voucherCounts = {
        all: mockVouchers.length,
        active: mockVouchers.filter(v => v.status === "active").length,
        used: mockVouchers.filter(v => v.status === "used").length,
        expired: mockVouchers.filter(v => v.status === "expired").length,
    }

    const handleVoucherClick = (voucher: Voucher) => {
        setSelectedVoucher(voucher)
        setModalOpen(true)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Ticket className="h-7 w-7 text-[#4988c4]" />
                        Voucher của tôi
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Quản lý và sử dụng các voucher giảm giá
                    </p>
                </div>

                {/* Summary Stats */}
                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <p className="text-sm text-gray-500">Voucher khả dụng</p>
                        <p className="text-2xl font-bold text-[#4988c4]">{voucherCounts.active}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-br from-[#4988c4] to-[#3a73a8] shadow-lg">
                        <Gift className="h-6 w-6 text-white" />
                    </div>
                </div>
            </div>

            {/* Search and Filters - Shopee Style */}
            <Card className="border-2 border-gray-200 shadow-sm">
                <CardContent className="p-4">
                    <div className="space-y-4">
                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Tìm kiếm voucher theo tên, mã code..."
                                className="pl-10 pr-10 h-11 border-2 border-gray-200 focus:border-[#4988c4] rounded-xl transition-all"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        <Separator />

                        {/* Filters Row */}
                        <div className="flex items-center gap-3 flex-wrap">
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                <Filter className="h-4 w-4" />
                                <span>Lọc:</span>
                            </div>

                            {/* Category Filter */}
                            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                <SelectTrigger className="w-[180px] h-9 rounded-lg border-2">
                                    <div className="flex items-center gap-2">
                                        <Tag className="h-4 w-4 text-gray-500" />
                                        <SelectValue placeholder="Danh mục" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        <span className="font-medium">Tất cả danh mục</span>
                                    </SelectItem>
                                    {categories.filter(c => c !== "all").map((category) => (
                                        <SelectItem key={category} value={category}>
                                            {category}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Sort Options */}
                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger className="w-[200px] h-9 rounded-lg border-2">
                                    <div className="flex items-center gap-2">
                                        <SortAsc className="h-4 w-4 text-gray-500" />
                                        <SelectValue placeholder="Sắp xếp" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="expiry-asc">
                                        <span className="font-medium">Sắp hết hạn</span>
                                    </SelectItem>
                                    <SelectItem value="expiry-desc">
                                        <span className="font-medium">Mới nhất</span>
                                    </SelectItem>
                                    <SelectItem value="discount-desc">
                                        <span className="font-medium">Giảm giá cao nhất</span>
                                    </SelectItem>
                                    <SelectItem value="discount-asc">
                                        <span className="font-medium">Giảm giá thấp nhất</span>
                                    </SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Active Filters Count */}
                            {(searchQuery || categoryFilter !== "all" || sortBy !== "expiry-asc") && (
                                <Badge variant="secondary" className="bg-[#4988c4]/10 text-[#4988c4] border-[#4988c4]/20">
                                    {[searchQuery, categoryFilter !== "all", sortBy !== "expiry-asc"].filter(Boolean).length} bộ lọc
                                </Badge>
                            )}

                            {/* Clear Filters */}
                            {(searchQuery || categoryFilter !== "all" || sortBy !== "expiry-asc") && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setSearchQuery("")
                                        setCategoryFilter("all")
                                        setSortBy("expiry-asc")
                                    }}
                                    className="h-9 text-gray-600 hover:text-gray-900"
                                >
                                    Xóa bộ lọc
                                </Button>
                            )}
                        </div>

                        {/* Results Count */}
                        <div className="flex items-center justify-between pt-2 border-t">
                            <p className="text-sm text-gray-600">
                                Hiển thị <span className="font-semibold text-gray-900">{filteredVouchers.length}</span> voucher
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Filter Tabs */}
            <Tabs value={filterStatus} onValueChange={(value) => setFilterStatus(value as typeof filterStatus)} className="w-full">
                <TabsList className="grid w-full grid-cols-4 h-auto p-1 bg-gray-100/80 rounded-xl">
                    <TabsTrigger
                        value="all"
                        className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all py-2.5"
                    >
                        <div className="flex flex-col items-center gap-1">
                            <span className="font-semibold">Tất cả</span>
                            <Badge variant="secondary" className="bg-gray-100 text-gray-700 text-xs">
                                {voucherCounts.all}
                            </Badge>
                        </div>
                    </TabsTrigger>
                    <TabsTrigger
                        value="active"
                        className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all py-2.5"
                    >
                        <div className="flex flex-col items-center gap-1">
                            <span className="font-semibold">Khả dụng</span>
                            <Badge className="bg-green-100 text-green-700 text-xs border-0">
                                {voucherCounts.active}
                            </Badge>
                        </div>
                    </TabsTrigger>
                    <TabsTrigger
                        value="used"
                        className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all py-2.5"
                    >
                        <div className="flex flex-col items-center gap-1">
                            <span className="font-semibold">Đã dùng</span>
                            <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">
                                {voucherCounts.used}
                            </Badge>
                        </div>
                    </TabsTrigger>
                    <TabsTrigger
                        value="expired"
                        className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all py-2.5"
                    >
                        <div className="flex flex-col items-center gap-1">
                            <span className="font-semibold">Hết hạn</span>
                            <Badge variant="secondary" className="bg-red-100 text-red-600 text-xs">
                                {voucherCounts.expired}
                            </Badge>
                        </div>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value={filterStatus} className="mt-6">
                    {filteredVouchers.length === 0 ? (
                        <Card className="border-2 border-dashed border-gray-200">
                            <CardContent className="flex flex-col items-center justify-center py-16">
                                <div className="relative">
                                    <div className="p-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 mb-4">
                                        <Ticket className="h-12 w-12 text-gray-400" />
                                    </div>
                                    {/* Decorative sparkles */}
                                    <Sparkles className="absolute -top-1 -right-1 h-6 w-6 text-gray-300" />
                                </div>
                                <p className="text-xl font-bold text-gray-900 mb-2">
                                    {searchQuery || categoryFilter !== "all"
                                        ? "Không tìm thấy voucher"
                                        : "Không có voucher"}
                                </p>
                                <p className="text-sm text-gray-500 text-center max-w-md mb-4">
                                    {searchQuery || categoryFilter !== "all" ? (
                                        "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
                                    ) : (
                                        <>
                                            {filterStatus === "active" && "Bạn chưa có voucher khả dụng nào"}
                                            {filterStatus === "used" && "Bạn chưa sử dụng voucher nào"}
                                            {filterStatus === "expired" && "Không có voucher hết hạn"}
                                            {filterStatus === "all" && "Bạn chưa có voucher nào"}
                                        </>
                                    )}
                                </p>
                                {(searchQuery || categoryFilter !== "all") && (
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setSearchQuery("")
                                            setCategoryFilter("all")
                                        }}
                                        className="mt-2"
                                    >
                                        Xóa bộ lọc
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
                            {filteredVouchers.map((voucher) => (
                                <VoucherCard
                                    key={voucher.id}
                                    voucher={voucher}
                                    onClick={() => handleVoucherClick(voucher)}
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Help & Tips Section */}
            <div className="grid md:grid-cols-2 gap-4">
                <Card className="border-2 border-[#4988c4]/20 bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50">
                    <CardContent className="p-5">
                        <div className="flex items-start gap-3">
                            <div className="p-2.5 rounded-xl bg-white shadow-md">
                                <Gift className="h-5 w-5 text-[#4988c4]" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                                    Cách sử dụng voucher
                                </h4>
                                <ul className="text-sm text-gray-700 space-y-1.5">
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#4988c4] font-bold mt-0.5">•</span>
                                        <span>Copy mã voucher và áp dụng khi thanh toán</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#4988c4] font-bold mt-0.5">•</span>
                                        <span>Kiểm tra điều kiện áp dụng và hạn sử dụng</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[#4988c4] font-bold mt-0.5">•</span>
                                        <span>Mỗi voucher chỉ được sử dụng 1 lần</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 via-amber-50 to-orange-50">
                    <CardContent className="p-5">
                        <div className="flex items-start gap-3">
                            <div className="p-2.5 rounded-xl bg-white shadow-md">
                                <Sparkles className="h-5 w-5 text-orange-500" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                                    Lưu ý khi dùng voucher
                                </h4>
                                <ul className="text-sm text-gray-700 space-y-1.5">
                                    <li className="flex items-start gap-2">
                                        <span className="text-orange-500 font-bold mt-0.5">•</span>
                                        <span>Voucher không được hoàn lại sau khi sử dụng</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-orange-500 font-bold mt-0.5">•</span>
                                        <span>Không áp dụng đồng thời nhiều voucher</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-orange-500 font-bold mt-0.5">•</span>
                                        <span>Voucher hết hạn sẽ tự động bị xóa</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Voucher Detail Modal */}
            <VoucherDetailModal
                voucher={selectedVoucher}
                open={modalOpen}
                onOpenChange={setModalOpen}
            />
        </div>
    )
}
