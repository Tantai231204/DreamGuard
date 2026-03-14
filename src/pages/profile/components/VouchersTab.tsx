import { useState, useMemo } from "react"
import { Ticket, Gift, Search, X, Tag, Sparkles, SortAsc, ChevronLeft, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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

    const ITEMS_PER_PAGE = 4
    const [currentPage, setCurrentPage] = useState(1)

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

    // Pagination logic
    const totalPages = Math.ceil(filteredVouchers.length / ITEMS_PER_PAGE)
    const paginatedVouchers = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE
        return filteredVouchers.slice(start, start + ITEMS_PER_PAGE)
    }, [filteredVouchers, currentPage])

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

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
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">My Vouchers</h2>
                    <p className="text-sm text-slate-500 mt-1 font-medium">Manage and use your personal discount codes.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Available</p>
                        <p className="text-2xl font-bold text-primary leading-tight">{voucherCounts.active}</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm">
                        <Ticket className="h-6 w-6 text-primary" />
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="space-y-4">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="relative group flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            placeholder="Search by name or code..."
                            className="pl-10 h-10 bg-slate-50/50 border-slate-200 rounded-xl focus:bg-white transition-all font-medium text-sm"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => { setSearchQuery(""); setCurrentPage(1); }}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setCurrentPage(1); }}>
                            <SelectTrigger className="w-[160px] h-10 rounded-xl border-slate-200 bg-white font-bold text-[11px] uppercase tracking-wider hover:bg-slate-50 transition-all">
                                <div className="flex items-center gap-2">
                                    <Tag className="h-3.5 w-3.5 text-slate-400" />
                                    <SelectValue placeholder="Category" />
                                </div>
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                                <SelectItem value="all">
                                    <span className="font-bold text-[11px] uppercase tracking-wider">All Categories</span>
                                </SelectItem>
                                {categories.filter(c => c !== "all").map((category) => (
                                    <SelectItem key={category} value={category}>
                                        <span className="font-bold text-[11px] uppercase tracking-wider">{category}</span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={sortBy} onValueChange={(v) => { setSortBy(v); setCurrentPage(1); }}>
                            <SelectTrigger className="w-[180px] h-10 rounded-xl border-slate-200 bg-white font-bold text-[11px] uppercase tracking-wider hover:bg-slate-50 transition-all">
                                <div className="flex items-center gap-2">
                                    <SortAsc className="h-3.5 w-3.5 text-slate-400" />
                                    <SelectValue placeholder="Sort" />
                                </div>
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                                <SelectItem value="expiry-asc">
                                    <span className="font-bold text-[11px] uppercase tracking-wider">Expiring Soon</span>
                                </SelectItem>
                                <SelectItem value="expiry-desc">
                                    <span className="font-bold text-[11px] uppercase tracking-wider">Latest Added</span>
                                </SelectItem>
                                <SelectItem value="discount-desc">
                                    <span className="font-bold text-[11px] uppercase tracking-wider">Highest Discount</span>
                                </SelectItem>
                                <SelectItem value="discount-asc">
                                    <span className="font-bold text-[11px] uppercase tracking-wider">Lowest Discount</span>
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        {(searchQuery || categoryFilter !== "all" || sortBy !== "expiry-asc") && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setSearchQuery("")
                                    setCategoryFilter("all")
                                    setSortBy("expiry-asc")
                                    setCurrentPage(1)
                                }}
                                className="h-10 px-4 rounded-xl text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
                            >
                                Reset Filters
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <Tabs value={filterStatus} onValueChange={(value) => { setFilterStatus(value as typeof filterStatus); setCurrentPage(1); }} className="w-full space-y-6">
                <TabsList className="w-full bg-slate-100/50 p-1 rounded-xl h-12 border border-slate-200/60 flex overflow-x-auto no-scrollbar">
                    {[
                        { id: "all", label: "All Items", count: voucherCounts.all },
                        { id: "active", label: "Available", count: voucherCounts.active },
                        { id: "used", label: "Collected", count: voucherCounts.used },
                        { id: "expired", label: "Archived", count: voucherCounts.expired }
                    ].map((tab) => (
                        <TabsTrigger
                            key={tab.id}
                            value={tab.id}
                            className="flex-1 rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all"
                        >
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-[11px] uppercase tracking-wider">{tab.label}</span>
                                <Badge className="h-5 min-w-[20px] rounded-md bg-slate-200/50 group-data-[state=active]:bg-blue-50 group-data-[state=active]:text-[#4988c4] text-[9px] font-bold border-none shadow-none text-slate-500">
                                    {tab.count}
                                </Badge>
                            </div>
                        </TabsTrigger>
                    ))}
                </TabsList>

                <TabsContent value={filterStatus} className="mt-0 focus-visible:ring-0 space-y-6">
                    {filteredVouchers.length === 0 ? (
                        <Card className="border border-dashed border-slate-200 bg-slate-50/50 rounded-2xl">
                            <CardContent className="flex flex-col items-center justify-center py-20">
                                <div className="w-16 h-16 rounded-xl bg-white shadow-sm flex items-center justify-center mb-6">
                                    <Ticket className="h-8 w-8 text-slate-200" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">No vouchers found</h3>
                                <p className="text-sm text-slate-500 font-medium text-center max-w-sm mt-2">
                                    {searchQuery || categoryFilter !== "all"
                                        ? "Try adjusting your filters to find what you're looking for."
                                        : "Your voucher collection is currently empty."}
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
                            {paginatedVouchers.map((voucher) => (
                                <VoucherCard
                                    key={voucher.id}
                                    voucher={voucher}
                                    onClick={() => handleVoucherClick(voucher)}
                                />
                            ))}
                        </div>
                    )}

                    {/* Simple Pagination Footer for Vouchers */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                Page {currentPage} of {totalPages}
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={currentPage === 1}
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    className="h-9 px-4 rounded-xl border-slate-200 text-slate-600 font-bold text-[10px] uppercase tracking-wider"
                                >
                                    <ChevronLeft className="h-4 w-4 mr-1" />
                                    Prev
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={currentPage === totalPages}
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    className="h-9 px-4 rounded-xl border-slate-200 text-slate-600 font-bold text-[10px] uppercase tracking-wider"
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Help & Tips Section */}
            <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-none rounded-2xl bg-slate-50/50 relative overflow-hidden">
                    <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center border border-slate-100 shrink-0">
                                <Gift className="h-5 w-5 text-slate-400" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-slate-900 text-sm mb-3">How to use</h4>
                                <ul className="space-y-2">
                                    {[
                                        "Copy the code and apply it at checkout.",
                                        "Check minimum spend and expiry requirements.",
                                        "Available for one-time use per customer."
                                    ].map((text, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-[11px] font-medium text-slate-500">
                                            <span className="w-1 h-1 rounded-full bg-slate-300 mt-1.5 shrink-0" />
                                            <span>{text}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none rounded-2xl bg-slate-50/50 relative overflow-hidden">
                    <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center border border-slate-100 shrink-0">
                                <Sparkles className="h-5 w-5 text-slate-400" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-slate-900 text-sm mb-3">Terms & Conditions</h4>
                                <ul className="space-y-2">
                                    {[
                                        "Vouchers cannot be exchanged for cash.",
                                        "Cannot be combined with other promotions.",
                                        "Expired vouchers will be removed automatically."
                                    ].map((text, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-[11px] font-medium text-slate-500">
                                            <span className="w-1 h-1 rounded-full bg-slate-300 mt-1.5 shrink-0" />
                                            <span>{text}</span>
                                        </li>
                                    ))}
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