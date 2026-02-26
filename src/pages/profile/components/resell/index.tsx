import { useState, useCallback, useMemo } from "react"
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    flexRender,
    type SortingState,
    type Row,
} from "@tanstack/react-table"
import { Package, RefreshCw, Plus, Search, ChevronLeft, ChevronRight, TrendingUp, Clock, Check, DollarSign, Eye, Calendar, Image as ImageIcon, MessageSquare, X } from "lucide-react"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "../../../../components/ui/button"
import { Input } from "../../../../components/ui/input"
import { Badge } from "../../../../components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../../../components/ui/table"

// Sub-components
import BenefitsBanner from "./BenefitsBanner"
import CreateWizard from "./wizard"

// Types & Constants
import type { EligibleProduct, MediaFile, SelectedProductWithMedia, TradeInRequest, TradeInStatus } from "./types"
import { mockEligibleProducts, mockTradeInRequests, STATUS_CONFIG } from "./constants"

/* ═══════════════════════════════════════════════════════════
   TABLE COLUMNS DEFINITION
═══════════════════════════════════════════════════════════ */
const columns = [
    {
        accessorKey: "id",
        header: "Mã yêu cầu",
        cell: ({ row }: { row: Row<TradeInRequest> }) => (
            <span className="font-mono text-xs font-semibold text-[#4988c4] bg-blue-50 px-2.5 py-1 rounded-lg">
                {row.original.id}
            </span>
        ),
    },
    {
        accessorKey: "items",
        header: "Sản phẩm",
        cell: ({ row }: { row: Row<TradeInRequest> }) => {
            const items = row.original.items
            return (
                <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                        {items.slice(0, 2).map((item, i) => (
                            <div
                                key={item.productId}
                                className="h-10 w-10 rounded-lg bg-gray-100 border-2 border-white shadow-sm overflow-hidden"
                                style={{ zIndex: 2 - i }}
                            >
                                <img
                                    src={item.productImage}
                                    alt={item.productName}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        ))}
                        {items.length > 2 && (
                            <div className="h-10 w-10 rounded-lg bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-bold text-gray-600">
                                +{items.length - 2}
                            </div>
                        )}
                    </div>
                    <div className="min-w-0">
                        <div className="font-medium text-gray-900 truncate max-w-[140px]">
                            {items[0]?.productName}
                        </div>
                        {items.length > 1 && (
                            <div className="text-xs text-gray-500">+{items.length - 1} sản phẩm</div>
                        )}
                    </div>
                </div>
            )
        },
    },
    {
        id: "mediaCount",
        header: "Hình ảnh",
        cell: ({ row }: { row: Row<TradeInRequest> }) => {
            const totalMedia = row.original.items.reduce((sum, item) => sum + item.mediaCount, 0)
            return (
                <div className="flex items-center gap-1.5 text-gray-600">
                    <ImageIcon className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{totalMedia}</span>
                </div>
            )
        },
    },
    {
        id: "estimatedPrice",
        header: "Định giá",
        cell: ({ row }: { row: Row<TradeInRequest> }) => {
            const total = row.original.totalEstimatedPrice ?? 
                row.original.items.reduce((sum, item) => sum + item.estimatedPrice, 0)
            if (total === 0) {
                return <span className="text-gray-400 italic text-sm">Đang xem xét</span>
            }
            return (
                <span className="font-bold text-emerald-600">
                    {total.toLocaleString("vi-VN")}đ
                </span>
            )
        },
    },
    {
        accessorKey: "createdAt",
        header: "Ngày tạo",
        cell: ({ row }: { row: Row<TradeInRequest> }) => (
            <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-sm">
                    {new Date(row.original.createdAt).toLocaleDateString("vi-VN")}
                </span>
            </div>
        ),
    },
    {
        accessorKey: "status",
        header: "Trạng thái",
        cell: ({ row }: { row: Row<TradeInRequest> }) => {
            const status = row.original.status
            const config = STATUS_CONFIG[status]
            return (
                <Badge className={`${config.color} gap-1.5 px-2.5 py-1`}>
                    {config.icon}
                    {config.label}
                </Badge>
            )
        },
    },
    {
        accessorKey: "staffNote",
        header: "Ghi chú",
        cell: ({ row }: { row: Row<TradeInRequest> }) => {
            const note = row.original.staffNote
            if (!note) return <span className="text-gray-300">—</span>
            return (
                <div className="flex items-center gap-2 max-w-[150px]">
                    <MessageSquare className="h-4 w-4 text-blue-400 flex-shrink-0" />
                    <span className="text-sm text-gray-600 truncate" title={note}>{note}</span>
                </div>
            )
        },
    },
    {
        id: "actions",
        header: "",
        cell: ({ row }: { row: Row<TradeInRequest> }) => (
            <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-[#4988c4]"
                onClick={() => toast.info(`Xem chi tiết yêu cầu ${row.original.id}`)}
            >
                <Eye className="h-4 w-4" />
            </Button>
        ),
    },
]

/* ═══════════════════════════════════════════════════════════
   GLOBAL SEARCH FUNCTION
═══════════════════════════════════════════════════════════ */
const globalFilterFn = (
    row: Row<TradeInRequest>,
    _columnId: string,
    filterValue: string
): boolean => {
    if (!filterValue?.trim()) return true
    const search = filterValue.toLowerCase().trim()
    const { id, items, staffNote } = row.original
    return (
        id.toLowerCase().includes(search) ||
        items.some((item) => item.productName.toLowerCase().includes(search)) ||
        (staffNote?.toLowerCase().includes(search) ?? false)
    )
}

/* ═══════════════════════════════════════════════════════════
   STAT CARD COMPONENT
═══════════════════════════════════════════════════════════ */
interface StatCardProps {
    icon: React.ReactNode
    label: string
    value: string | number
    color: string
    bgColor: string
}

function StatCard({ icon, label, value, color, bgColor }: StatCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl ${bgColor} border border-gray-100 shadow-sm`}
        >
            <div className={`p-2 rounded-lg bg-white shadow-sm ${color}`}>{icon}</div>
            <div>
                <p className="text-xs font-medium text-gray-500">{label}</p>
                <p className="text-lg font-bold text-gray-900">{value}</p>
            </div>
        </motion.div>
    )
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */
export default function ResellTab() {
    const [view, setView] = useState<"list" | "create">("list")
    const [createStep, setCreateStep] = useState(1)
    const [globalFilter, setGlobalFilter] = useState("")
    const [sorting, setSorting] = useState<SortingState>([])
    
    // Multi-select products
    const [selectedProducts, setSelectedProducts] = useState<EligibleProduct[]>([])
    
    // Products with media for staff evaluation
    const [productsWithMedia, setProductsWithMedia] = useState<SelectedProductWithMedia[]>([])
    
    // Terms agreement
    const [agreedTerms, setAgreedTerms] = useState(false)

    // Memoized stats calculation - prevents recalculation on every render
    const stats = useMemo(() => ({
        total: mockTradeInRequests.length,
        pending: mockTradeInRequests.filter((r) => r.status === "pending").length,
        reviewing: mockTradeInRequests.filter((r) => r.status === "reviewing").length,
        completed: mockTradeInRequests.filter((r) => r.status === "completed").length,
        totalEarned: mockTradeInRequests
            .filter((r) => r.status === "completed")
            .reduce((sum, r) => r.items.reduce((s, item) => s + item.estimatedPrice, 0) + sum, 0),
    }), [])
    
    // TanStack Table instance
    const table = useReactTable({
        data: mockTradeInRequests,
        columns,
        state: {
            globalFilter,
            sorting,
        },
        onGlobalFilterChange: setGlobalFilter,
        onSortingChange: setSorting,
        globalFilterFn,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
            pagination: { pageSize: 5 },
        },
    })

    // Memoized eligible products
    const eligibleProducts = useMemo(() => 
        mockEligibleProducts.filter(p => p.canTradeIn),
    [])

    // Toggle single product selection
    const handleToggleProduct = useCallback((product: EligibleProduct) => {
        setSelectedProducts(prev => {
            const isSelected = prev.some(p => p.id === product.id)
            if (isSelected) {
                // Remove from selected and also from productsWithMedia
                setProductsWithMedia(pwm => pwm.filter(p => p.product.id !== product.id))
                return prev.filter(p => p.id !== product.id)
            } else {
                // Add to selected and initialize in productsWithMedia
                setProductsWithMedia(pwm => [...pwm, { product, media: [], note: "" }])
                return [...prev, product]
            }
        })
    }, [])

    // Select all products
    const handleSelectAll = useCallback(() => {
        setSelectedProducts(eligibleProducts)
        setProductsWithMedia(eligibleProducts.map(product => ({
            product,
            media: [],
            note: ""
        })))
    }, [eligibleProducts])

    // Deselect all products
    const handleDeselectAll = useCallback(() => {
        setSelectedProducts([])
        setProductsWithMedia([])
    }, [])

    // Update media for a specific product
    const handleUpdateProductMedia = useCallback((productId: string, media: MediaFile[], note: string) => {
        setProductsWithMedia(prev => 
            prev.map(p => 
                p.product.id === productId 
                    ? { ...p, media, note }
                    : p
            )
        )
    }, [])

    // Reset form with cleanup
    const resetForm = useCallback(() => {
        // Revoke object URLs to prevent memory leaks
        productsWithMedia.forEach(p => {
            p.media.forEach(m => {
                if (m.url.startsWith('blob:')) {
                    URL.revokeObjectURL(m.url)
                }
            })
        })
        
        setView("list")
        setCreateStep(1)
        setSelectedProducts([])
        setProductsWithMedia([])
        setAgreedTerms(false)
    }, [productsWithMedia])

    // Handle submit
    const handleSubmit = useCallback(() => {
        // Here you would send productsWithMedia to the server
        console.log("Submitting:", productsWithMedia)
        
        // Show success toast
        toast.success("Gửi yêu cầu thành công!", {
            description: `Đã gửi ${productsWithMedia.length} sản phẩm để đánh giá. Chúng tôi sẽ phản hồi trong vòng 24 giờ.`,
            duration: 5000,
        })
        
        resetForm()
    }, [productsWithMedia, resetForm])

    // Handle view change
    const handleCreateNew = useCallback(() => setView("create"), [])
    
    // Pagination info
    const pageIndex = table.getState().pagination.pageIndex
    const pageSize = table.getState().pagination.pageSize
    const totalRows = table.getFilteredRowModel().rows.length
    const pageCount = table.getPageCount()
    const startRow = totalRows === 0 ? 0 : pageIndex * pageSize + 1
    const endRow = Math.min((pageIndex + 1) * pageSize, totalRows)

    return (
        <div className="space-y-6">
            {/* ═══════════════════════════════════════════════════
                HEADER
            ═══════════════════════════════════════════════════ */}
            <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#4988c4] to-[#3a73a8] shadow-lg">
                    <RefreshCw className="h-6 w-6 text-white" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Thu mua sản phẩm cũ</h2>
                    <p className="text-sm text-gray-500">
                        Bán lại sản phẩm đã mua cho DreamGuard và nhận hoàn tiền
                    </p>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════
                CONTENT WITH TRANSITIONS
            ═══════════════════════════════════════════════════ */}
            <AnimatePresence mode="wait">
                {view === "list" ? (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                    >
                        {/* Benefits Banner */}
                        <BenefitsBanner />
                        
                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <StatCard
                                icon={<TrendingUp className="h-5 w-5" />}
                                label="Tổng yêu cầu"
                                value={stats.total}
                                color="text-blue-600"
                                bgColor="bg-gradient-to-br from-blue-50 to-sky-50"
                            />
                            <StatCard
                                icon={<Clock className="h-5 w-5" />}
                                label="Đang xử lý"
                                value={stats.pending + stats.reviewing}
                                color="text-amber-600"
                                bgColor="bg-gradient-to-br from-amber-50 to-yellow-50"
                            />
                            <StatCard
                                icon={<Check className="h-5 w-5" />}
                                label="Hoàn thành"
                                value={stats.completed}
                                color="text-green-600"
                                bgColor="bg-gradient-to-br from-green-50 to-emerald-50"
                            />
                            <StatCard
                                icon={<DollarSign className="h-5 w-5" />}
                                label="Tổng thu về"
                                value={`${stats.totalEarned.toLocaleString("vi-VN")}đ`}
                                color="text-purple-600"
                                bgColor="bg-gradient-to-br from-purple-50 to-fuchsia-50"
                            />
                        </div>
                        
                        {/* Trade-In Requests Table */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm"
                        >
                            {/* Table Header */}
                            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <h3 className="font-semibold text-gray-900">Lịch sử yêu cầu</h3>
                                    <div className="flex items-center gap-3">
                                        {/* Search Input */}
                                        <div className="relative flex-1 sm:w-64">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <Input
                                                placeholder="Tìm kiếm..."
                                                value={globalFilter}
                                                onChange={(e) => setGlobalFilter(e.target.value)}
                                                className="pl-9 pr-8 h-9 rounded-lg border-gray-200"
                                            />
                                            {globalFilter && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setGlobalFilter("")}
                                                    className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                </Button>
                                            )}
                                        </div>
                                        {/* Create Button */}
                                        <Button
                                            onClick={handleCreateNew}
                                            size="sm"
                                            className="gap-2 bg-gradient-to-r from-[#4988c4] to-[#3a73a8] hover:shadow-md transition-all"
                                        >
                                            <Plus className="h-4 w-4" />
                                            <span className="hidden sm:inline">Tạo yêu cầu</span>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Table Content */}
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-gray-50">
                                        {table.getHeaderGroups().map((headerGroup) => (
                                            <TableRow key={headerGroup.id} className="border-b border-gray-200">
                                                {headerGroup.headers.map((header) => (
                                                    <TableHead key={header.id} className="font-semibold text-gray-700 text-sm">
                                                        {header.isPlaceholder
                                                            ? null
                                                            : flexRender(header.column.columnDef.header, header.getContext())}
                                                    </TableHead>
                                                ))}
                                            </TableRow>
                                        ))}
                                    </TableHeader>
                                    <TableBody>
                                        {table.getRowModel().rows.length > 0 ? (
                                            table.getRowModel().rows.map((row) => (
                                                <TableRow
                                                    key={row.id}
                                                    className="hover:bg-blue-50/30 transition-colors border-b border-gray-100"
                                                >
                                                    {row.getVisibleCells().map((cell) => (
                                                        <TableCell key={cell.id} className="py-3">
                                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={columns.length} className="h-48 text-center">
                                                    <div className="flex flex-col items-center justify-center text-gray-500">
                                                        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                                                            <Package className="h-7 w-7 text-gray-400" />
                                                        </div>
                                                        <p className="font-medium">Chưa có yêu cầu nào</p>
                                                        <p className="text-sm mt-1 mb-4">Bắt đầu bán lại sản phẩm không dùng đến</p>
                                                        <Button
                                                            onClick={handleCreateNew}
                                                            size="sm"
                                                            className="gap-2 bg-gradient-to-r from-[#4988c4] to-[#3a73a8]"
                                                        >
                                                            <Plus className="h-4 w-4" />
                                                            Tạo yêu cầu mới
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                            
                            {/* Pagination */}
                            {totalRows > 0 && (
                                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50/50">
                                    <div className="text-sm text-gray-600">
                                        Hiển thị <span className="font-semibold">{startRow}</span> - <span className="font-semibold">{endRow}</span> trong <span className="font-semibold">{totalRows}</span> yêu cầu
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => table.previousPage()}
                                            disabled={!table.getCanPreviousPage()}
                                            className="h-8 px-3"
                                        >
                                            <ChevronLeft className="h-4 w-4 mr-1" />
                                            Trước
                                        </Button>
                                        <div className="flex items-center gap-1 px-3 py-1 rounded-lg bg-white border border-gray-200">
                                            <span className="text-sm text-gray-600">Trang</span>
                                            <span className="font-semibold text-[#4988c4]">{pageIndex + 1}</span>
                                            <span className="text-sm text-gray-600">/ {pageCount || 1}</span>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => table.nextPage()}
                                            disabled={!table.getCanNextPage()}
                                            className="h-8 px-3"
                                        >
                                            Sau
                                            <ChevronRight className="h-4 w-4 ml-1" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="create"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <CreateWizard
                            step={createStep}
                            products={mockEligibleProducts}
                            selectedProducts={selectedProducts}
                            productsWithMedia={productsWithMedia}
                            agreedTerms={agreedTerms}
                            onToggleProduct={handleToggleProduct}
                            onSelectAll={handleSelectAll}
                            onDeselectAll={handleDeselectAll}
                            onUpdateProductMedia={handleUpdateProductMedia}
                            onToggleTerms={setAgreedTerms}
                            onStepChange={setCreateStep}
                            onCancel={resetForm}
                            onSubmit={handleSubmit}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
