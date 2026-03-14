import { useMemo, useState } from "react"
import {
    Search,
    Truck,
    Store,
    Package,
    Calendar as CalendarIcon,
    X,
    ShoppingBag,
    ChevronLeft,
    ChevronRight
} from "lucide-react"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Card } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../../components/ui/tabs"
import { Popover, PopoverContent, PopoverTrigger } from "../../../components/ui/popover"
import { Calendar } from "../../../components/ui/calendar"
import { cn } from "@/lib/utils"
import { format, isWithinInterval, startOfDay, endOfDay } from "date-fns"
import type { DateRange } from "react-day-picker"
import { formatPrice, formatDate } from "../utils"
import { useOrders } from "@/hooks/queries"
import type { OrderResponse } from "@/api/types/order"
import { Skeleton } from "@/components/ui/skeleton"
import { STATUS_THEME } from "../constants"
import { OrderDetailDialog } from "./order-detail/OrderDetailDialog"

const ITEMS_PER_PAGE = 4

export default function OrdersTab() {
    const { data, isPending } = useOrders()
    const [search, setSearch] = useState("")
    const [date, setDate] = useState<DateRange | undefined>(undefined)
    const [currentPage, setCurrentPage] = useState(1)

    const filteredOrders = useMemo(() => {
        const orders = data?.items ?? []
        return orders.filter(order => {
            const matchesSearch = order.orderCode.toLowerCase().includes(search.toLowerCase())
            let matchesDate = true
            if (date?.from) {
                const orderDate = new Date(order.createdAt)
                const start = startOfDay(date.from)
                const end = date.to ? endOfDay(date.to) : endOfDay(date.from)
                matchesDate = isWithinInterval(orderDate, { start, end })
            }
            return matchesSearch && matchesDate
        })
    }, [data?.items, search, date])

    // Pagination logic
    const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE)
    const paginatedOrders = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE
        return filteredOrders.slice(start, start + ITEMS_PER_PAGE)
    }, [filteredOrders, currentPage])

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
        // Scroll to top of tab content if needed, though with h-850 it might not be necessary
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Order History</h2>
                    <p className="text-sm text-slate-500 mt-1 font-medium">Manage and track your recent orders.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative group flex-1 min-w-[200px] md:w-64">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#4988c4] transition-colors" />
                        <Input
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                            placeholder="Search Order ID..."
                            className="pl-10 h-10 border-slate-200 bg-slate-50/50 rounded-xl focus:bg-white transition-all font-medium text-sm"
                        />
                    </div>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    "h-10 justify-start text-left font-bold text-xs uppercase tracking-wider rounded-xl border-slate-200 px-4 min-w-[170px] hover:bg-slate-50 transition-all",
                                    !date && "text-slate-500"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4 text-slate-400" />
                                {date?.from ? (
                                    date.to ? <>{format(date.from, "LLL dd")} - {format(date.to, "LLL dd")}</> : format(date.from, "LLL dd, y")
                                ) : "Date Range"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 rounded-xl border-slate-200 shadow-xl" align="end">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={date?.from}
                                selected={date}
                                onSelect={(d) => { setDate(d); setCurrentPage(1); }}
                                numberOfMonths={2}
                                className="p-3"
                            />
                        </PopoverContent>
                    </Popover>

                    {(search || date) && (
                        <Button
                            variant="outline"
                            className="h-10 px-6 rounded-xl text-rose-500 font-black text-[10px] uppercase tracking-wider hover:bg-rose-500 hover:text-white transition-all duration-300 border-rose-100 bg-white hover:border-transparent shadow-sm hover:shadow-rose-200"
                            onClick={() => { setSearch(""); setDate(undefined); setCurrentPage(1); }}
                        >
                            Clear Filters
                            <X className="h-4 w-4 ml-2" />
                        </Button>
                    )}
                </div>
            </div>

            <Tabs defaultValue="all" className="w-full space-y-6" onValueChange={() => setCurrentPage(1)}>
                <TabsList className="w-full bg-slate-100/50 p-1 rounded-xl h-12 border border-slate-200/60 flex overflow-x-auto no-scrollbar">
                    {[
                        { id: "all", label: "All Orders" },
                        { id: "processing", label: "Processing" },
                        { id: "shipping", label: "Shipping" },
                        { id: "completed", label: "Completed" },
                        { id: "cancelled", label: "Cancelled" }
                    ].map((tab) => (
                        <TabsTrigger
                            key={tab.id}
                            value={tab.id}
                            className="flex-1 rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm font-bold text-[11px] uppercase tracking-wider h-full transition-all px-4"
                        >
                            {tab.label}
                        </TabsTrigger>
                    ))}
                </TabsList>

                <div className="w-full">
                    {isPending ? (
                        <div className="space-y-4">
                            {Array(2).fill(0).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-2xl" />)}
                        </div>
                    ) : (
                        <div className="min-h-[400px]">
                            <TabsContent value="all" className="m-0 focus-visible:ring-0">
                                <OrderList orders={paginatedOrders} />
                            </TabsContent>
                            <TabsContent value="processing" className="m-0 focus-visible:ring-0">
                                <OrderList orders={paginatedOrders.filter(o => ["Pending", "Confirmed", "Processing", 0, 1, 2].includes(o.status))} />
                            </TabsContent>
                            <TabsContent value="shipping" className="m-0 focus-visible:ring-0">
                                <OrderList orders={paginatedOrders.filter(o => ["Shipping", 3].includes(o.status))} />
                            </TabsContent>
                            <TabsContent value="completed" className="m-0 focus-visible:ring-0">
                                <OrderList orders={paginatedOrders.filter(o => ["Delivered", "Completed", 4, 5].includes(o.status))} />
                            </TabsContent>
                            <TabsContent value="cancelled" className="m-0 focus-visible:ring-0">
                                <OrderList orders={paginatedOrders.filter(o => ["Cancelled", 6].includes(o.status))} />
                            </TabsContent>
                        </div>
                    )}
                </div>
            </Tabs>

            {/* Simple Pagination Footer */}
            {!isPending && totalPages > 1 && (
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
        </div>
    )
}

function OrderList({ orders }: { orders: OrderResponse[] }) {
    if (orders.length === 0) return <EmptyState />
    return (
        <div className="space-y-4">
            {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
            ))}
        </div>
    )
}

function OrderCard({ order }: { order: OrderResponse }) {
    const theme = STATUS_THEME[order.status] || STATUS_THEME["Pending"]

    return (
        <Card className="group relative rounded-2xl border-slate-200/60 bg-white shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
            {/* Header */}
            <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 bg-slate-50/30">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                        <Store className="w-4 h-4 text-slate-500" />
                    </div>
                    <div>
                        <span className="text-sm font-bold text-slate-900">DreamGuard Store</span>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{formatDate(order.createdAt)}</p>
                    </div>
                </div>
                
                <Badge
                    variant="secondary"
                    className="w-fit px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border-none shadow-sm"
                    style={{ backgroundColor: `${theme.color}10`, color: theme.color }}
                >
                    <span className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: theme.color }} />
                    {theme.label}
                </Badge>
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col md:flex-row gap-6">
                <div className="relative shrink-0">
                    <div className="w-20 h-20 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                        <Package className="w-8 h-8 text-slate-300" />
                    </div>
                    <Badge className="absolute -top-2 -right-2 h-6 min-w-[24px] rounded-lg bg-slate-900 text-white border-2 border-white font-bold text-[10px] flex items-center justify-center shadow-sm">
                        {order.itemCount}
                    </Badge>
                </div>

                <div className="flex-1 flex flex-col justify-center space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h4 className="text-base font-bold text-slate-900 tracking-tight">Order ID: #{order.orderCode}</h4>
                            <div className="flex items-center gap-2 mt-1.5">
                                {["Shipping", "Delivered", 3, 4].includes(order.status) && (
                                    <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-emerald-50/50">
                                        <Truck className="w-3 h-3" />
                                        In Transit
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="sm:text-right">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Amount</p>
                            <p className="text-lg font-bold text-slate-900">{formatPrice(order.totalAmount)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50/30 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <p className="text-[11px] text-slate-500 font-medium">
                    View detailed manifest and billing information for this order.
                </p>
                <div className="flex items-center gap-2">
                    <OrderDetailDialog
                        orderId={order.id}
                        orderCode={order.orderCode}
                        trigger={
                            <Button variant="outline" className="h-9 px-4 rounded-lg text-xs font-bold uppercase tracking-wider border-slate-200 hover:bg-white transition-all">
                                View Details
                            </Button>
                        }
                    />
                    {["Delivered", "Completed", 4, 5].includes(order.status) && (
                        <Button className="relative h-9 px-4 rounded-lg text-[10px] font-black uppercase tracking-[0.15em] bg-primary text-white shadow-[0_4px_12px_-4px_rgba(73,136,196,0.5)] hover:shadow-[0_8px_20px_-6px_rgba(73,136,196,0.6)] hover:-translate-y-0.5 transition-all duration-300 group/btn overflow-hidden border-none">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                            <span className="relative z-10">Buy Again</span>
                        </Button>
                    )}
                </div>
            </div>
        </Card>
    )
}

function EmptyState() {
    return (
        <Card className="py-20 text-center bg-slate-50/50 border-dashed border-2 rounded-2xl flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-6">
                <ShoppingBag className="h-8 w-8 text-slate-200" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No orders found</h3>
            <p className="text-sm text-slate-500 font-medium max-w-xs mx-auto mt-2">Explore our collections to start your journey.</p>
            <Button className="group/btn relative mt-8 h-11 px-10 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] bg-primary text-white shadow-[0_10px_25px_-8px_rgba(73,136,196,0.5)] hover:shadow-[0_15px_35px_-10px_rgba(73,136,196,0.6)] hover:-translate-y-0.5 transition-all duration-300 overflow-hidden border-none">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                <span className="relative z-10">Start Shopping Now</span>
            </Button>
        </Card>
    )
}