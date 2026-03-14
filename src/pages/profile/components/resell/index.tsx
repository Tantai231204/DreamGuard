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
import { Package, RefreshCw, Plus, Search, TrendingUp, Clock, Check, DollarSign, Eye, Calendar, Image as ImageIcon } from "lucide-react"
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
import type { EligibleProduct, MediaFile, SelectedProductWithMedia, TradeInRequest } from "./types"
import { mockEligibleProducts, mockTradeInRequests, STATUS_CONFIG } from "./constants"
import { formatCurrency } from "../voucher/utils"

/* ═══════════════════════════════════════════════════════════
   TABLE COLUMNS DEFINITION
═══════════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════
   TABLE COLUMNS DEFINITION
   ═══════════════════════════════════════════════════════════ */
const columns = [
    {
        accessorKey: "id",
        header: "Request ID",
        cell: ({ row }: { row: Row<TradeInRequest> }) => (
            <span className="font-mono text-[10px] font-bold text-[#4988c4] bg-blue-50/50 px-2 py-0.5 rounded-md border border-blue-100/50">
                {row.original.id}
            </span>
        ),
    },
    {
        accessorKey: "items",
        header: "Products",
        cell: ({ row }: { row: Row<TradeInRequest> }) => {
            const items = row.original.items
            return (
                <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                        {items.slice(0, 2).map((item, i) => (
                            <div
                                key={item.productId}
                                className="h-8 w-8 rounded-lg bg-slate-100 border-2 border-white shadow-sm overflow-hidden"
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
                            <div className="h-8 w-8 rounded-lg bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-500">
                                +{items.length - 2}
                            </div>
                        )}
                    </div>
                    <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-800 truncate max-w-[140px]">
                            {items[0]?.productName}
                        </div>
                        {items.length > 1 && (
                            <div className="text-[10px] text-slate-400 font-medium">+{items.length - 1} more items</div>
                        )}
                    </div>
                </div>
            )
        },
    },
    {
        id: "mediaCount",
        header: "Media",
        cell: ({ row }: { row: Row<TradeInRequest> }) => {
            const totalMedia = row.original.items.reduce((sum, item) => sum + item.mediaCount, 0)
            return (
                <div className="flex items-center gap-1.5 text-slate-500">
                    <ImageIcon className="h-3.5 w-3.5 opacity-60" />
                    <span className="text-xs font-bold">{totalMedia}</span>
                </div>
            )
        },
    },
    {
        id: "estimatedPrice",
        header: "Valuation",
        cell: ({ row }: { row: Row<TradeInRequest> }) => {
            const total = row.original.totalEstimatedPrice ??
                row.original.items.reduce((sum, item) => sum + item.estimatedPrice, 0)
            if (total === 0) {
                return <span className="text-slate-400 text-[11px] font-medium italic">Under Review</span>
            }
            return (
                <span className="text-sm font-bold text-emerald-600">
                    {formatCurrency(total)}
                </span>
            )
        },
    },
    {
        accessorKey: "createdAt",
        header: "Date",
        cell: ({ row }: { row: Row<TradeInRequest> }) => (
            <div className="flex items-center gap-2 text-slate-500">
                <Calendar className="h-3.5 w-3.5 opacity-60" />
                <span className="text-xs font-medium">
                    {new Date(row.original.createdAt).toLocaleDateString()}
                </span>
            </div>
        ),
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }: { row: Row<TradeInRequest> }) => {
            const status = row.original.status
            const config = STATUS_CONFIG[status]
            return (
                <Badge className={`${config.color} gap-1.5 px-2 py-0.5 border-none shadow-none text-[9px] font-bold uppercase tracking-wider rounded-md`}>
                    {config.icon}
                    {config.label}
                </Badge>
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
                className="h-8 w-8 p-0 hover:bg-slate-100 text-slate-400 hover:text-slate-900"
                onClick={() => toast.info(`Viewing request ${row.original.id}`)}
            >
                <Eye className="h-3.5 w-3.5" />
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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-center gap-4 p-5 rounded-2xl bg-white border border-slate-200/60 shadow-sm`}
        >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bgColor} ${color}`}>{icon}</div>
            <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
                <p className="text-xl font-bold text-slate-900 leading-none mt-1">{value}</p>
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
        toast.success("Request sent successfully!", {
            description: `Sent ${productsWithMedia.length} products for valuation. We will review and respond shortly.`,
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
    const startRow = totalRows === 0 ? 0 : pageIndex * pageSize + 1
    const endRow = Math.min((pageIndex + 1) * pageSize, totalRows)

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-[#4988c4]">
                        <RefreshCw className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Resell Service</h2>
                        <p className="text-sm text-slate-500 mt-1 font-medium">
                            Resell your unused products for store credit or cash.
                        </p>
                    </div>
                </div>
                {view === "list" && (
                    <Button
                        onClick={handleCreateNew}
                        className="gap-2 bg-slate-900 hover:bg-black font-bold h-10 px-6 rounded-xl"
                    >
                        <Plus className="h-4 w-4" />
                        New Request
                    </Button>
                )}
            </div>

            <AnimatePresence mode="wait">
                {view === "list" ? (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-8"
                    >
                        {/* Benefits Banner */}
                        <BenefitsBanner />

                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard
                                icon={<TrendingUp className="h-5 w-5" />}
                                label="Total Requests"
                                value={stats.total}
                                color="text-[#4988c4]"
                                bgColor="bg-blue-50"
                            />
                            <StatCard
                                icon={<Clock className="h-5 w-5" />}
                                label="Pending Review"
                                value={stats.pending + stats.reviewing}
                                color="text-amber-600"
                                bgColor="bg-amber-50"
                            />
                            <StatCard
                                icon={<Check className="h-5 w-5" />}
                                label="Completed"
                                value={stats.completed}
                                color="text-emerald-600"
                                bgColor="bg-emerald-50"
                            />
                            <StatCard
                                icon={<DollarSign className="h-5 w-5" />}
                                label="Total Earned"
                                value={formatCurrency(stats.totalEarned)}
                                color="text-purple-600"
                                bgColor="bg-purple-50"
                            />
                        </div>

                        {/* Table Section */}
                        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                            <div className="px-6 py-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Request History</h3>
                                <div className="relative w-full md:w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder="Search by ID or product..."
                                        value={globalFilter}
                                        onChange={(e) => setGlobalFilter(e.target.value)}
                                        className="pl-9 h-9 rounded-lg border-slate-200 text-sm"
                                    />
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-slate-50/50">
                                        {table.getHeaderGroups().map((headerGroup) => (
                                            <TableRow key={headerGroup.id} className="border-b border-slate-100">
                                                {headerGroup.headers.map((header) => (
                                                    <TableHead key={header.id} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-6 h-10">
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
                                                    className="hover:bg-slate-50/50 transition-colors border-b border-slate-100"
                                                >
                                                    {row.getVisibleCells().map((cell) => (
                                                        <TableCell key={cell.id} className="px-6 py-4">
                                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={columns.length} className="h-64 text-center">
                                                    <div className="flex flex-col items-center justify-center text-slate-400 gap-3">
                                                        <Package className="h-10 w-10 opacity-20" />
                                                        <p className="text-sm font-medium">No requests found</p>
                                                        <Button
                                                            onClick={handleCreateNew}
                                                            variant="outline"
                                                            size="sm"
                                                            className="rounded-xl border-slate-200 font-bold mt-2"
                                                        >
                                                            Start Now
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
                                <div className="px-6 py-4 bg-slate-50/30 flex items-center justify-between border-t border-slate-100">
                                    <p className="text-xs text-slate-500 font-medium font-mono">
                                        SHW <span className="font-bold text-slate-900">{startRow}-{endRow}</span> OF <span className="font-bold text-slate-900">{totalRows}</span>
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => table.previousPage()}
                                            disabled={!table.getCanPreviousPage()}
                                            className="font-bold text-xs"
                                        >
                                            PREV
                                        </Button>
                                        <div className="w-px h-3 bg-slate-200" />
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => table.nextPage()}
                                            disabled={!table.getCanNextPage()}
                                            className="font-bold text-xs"
                                        >
                                            NEXT
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="create"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
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
