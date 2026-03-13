import { useMemo, useState } from "react"
import {
    Search,
    ShoppingBag,
    Truck,
    Store,
    Package,
    Calendar as CalendarIcon,
    X
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
import { Separator } from "@/components/ui/separator"

export default function OrdersTab() {
    const { data, isPending } = useOrders()
    const [search, setSearch] = useState("")
    const [date, setDate] = useState<DateRange | undefined>(undefined)

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

    return (
        <div className="max-w-5xl mx-auto space-y-6 px-2">
            {/* Header with improved aesthetics */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Order Journey</h2>
                    <p className="text-sm text-slate-500 font-medium">Manage and track your premium collections.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative group flex-1 min-w-[200px] md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Track Order ID..."
                            className="pl-9 h-11 border-slate-200 bg-white shadow-sm rounded-xl focus:ring-4 focus:ring-blue-50 transition-all font-medium"
                        />
                    </div>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    "h-11 justify-start text-left font-semibold text-xs uppercase tracking-wider rounded-xl border-slate-200 shadow-sm px-4 min-w-[180px]",
                                    !date && "text-slate-500"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4 text-blue-500" />
                                {date?.from ? (
                                    date.to ? <>{format(date.from, "LLL dd")} - {format(date.to, "LLL dd")}</> : format(date.from, "LLL dd, y")
                                ) : "Filter by Date"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 rounded-2xl border-slate-200 shadow-xl" align="end">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={date?.from}
                                selected={date}
                                onSelect={setDate}
                                numberOfMonths={2}
                                className="p-3"
                            />
                        </PopoverContent>
                    </Popover>

                    {(search || date) && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => { setSearch(""); setDate(undefined); }}
                            className="h-11 w-11 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    )}
                </div>
            </div>

            <Tabs defaultValue="all" className="w-full space-y-6">
                <TabsList className="w-full bg-slate-100/50 p-1 rounded-2xl h-14 border border-slate-200/60 shadow-inner flex overflow-x-auto no-scrollbar">
                    {[
                        { id: "all", label: "All Items" },
                        { id: "processing", label: "Processing" },
                        { id: "shipping", label: "Shipping" },
                        { id: "completed", label: "Completed" },
                        { id: "cancelled", label: "Cancelled" }
                    ].map((tab) => (
                        <TabsTrigger
                            key={tab.id}
                            value={tab.id}
                            className="flex-1 rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-100 font-bold text-[11px] uppercase tracking-wider h-full transition-all px-4"
                        >
                            {tab.label}
                        </TabsTrigger>
                    ))}
                </TabsList>

                <div className="w-full">
                    {isPending ? (
                        <div className="space-y-4">
                            {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-44 w-full rounded-2xl" />)}
                        </div>
                    ) : (
                        <div className="min-h-[400px]">
                            <TabsContent value="all" className="m-0"><OrderList orders={filteredOrders} /></TabsContent>
                            <TabsContent value="processing" className="m-0"><OrderList orders={filteredOrders.filter(o => ["Pending", "Confirmed", "Processing", 0, 1, 2].includes(o.status))} /></TabsContent>
                            <TabsContent value="shipping" className="m-0"><OrderList orders={filteredOrders.filter(o => ["Shipping", 3].includes(o.status))} /></TabsContent>
                            <TabsContent value="completed" className="m-0"><OrderList orders={filteredOrders.filter(o => ["Delivered", "Completed", 4, 5].includes(o.status))} /></TabsContent>
                            <TabsContent value="cancelled" className="m-0"><OrderList orders={filteredOrders.filter(o => ["Cancelled", 6].includes(o.status))} /></TabsContent>
                        </div>
                    )}
                </div>
            </Tabs>
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
        <Card className="rounded-2xl border-slate-100 shadow-sm overflow-hidden bg-white hover:shadow-md transition-all duration-300 group ring-1 ring-slate-100">
            {/* Header: Store Identity & Status */}
            <div className="px-5 py-4 border-b bg-slate-50/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                        <Store className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                        <span className="text-sm font-black text-slate-800 tracking-tight">DreamGuard Official</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Partner</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Badge
                        variant="secondary"
                        className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border-none shadow-sm"
                        style={{ backgroundColor: `${theme.color}15`, color: theme.color }}
                    >
                        {theme.label}
                    </Badge>
                </div>
            </div>

            {/* Content: Item Preview */}
            <div className="p-5 flex gap-5">
                <div className="w-24 h-24 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-300 overflow-hidden">
                    <Package className="w-10 h-10 text-slate-200" />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex items-center justify-between gap-4">
                        <h4 className="text-base font-black text-slate-900 truncate tracking-tight">Order #{order.orderCode}</h4>
                        <p className="text-sm font-black text-slate-900">{formatPrice(order.totalAmount)}</p>
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-tight">
                            <ShoppingBag className="w-3.5 h-3.5 text-slate-300" />
                            {order.itemCount} Items
                        </div>
                        <Separator orientation="vertical" className="h-3 bg-slate-200" />
                        <div className="text-xs font-bold text-slate-400">
                            {formatDate(order.createdAt)}
                        </div>
                    </div>
                    {["Shipping", "Delivered", 3, 4].includes(order.status) && (
                        <div className="mt-3 flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 w-fit px-2 py-1 rounded-md">
                            <Truck className="w-3.5 h-3.5" />
                            Package in Transit
                        </div>
                    )}
                </div>
            </div>

            {/* Footer: Summary & Details Trigger */}
            <div className="px-5 py-4 bg-slate-50/50 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="text-left">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">Final Settlement</p>
                        <p className="text-xl font-black text-rose-600 tracking-tighter">{formatPrice(order.totalAmount)}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <OrderDetailDialog
                        orderId={order.id}
                        orderCode={order.orderCode}
                        trigger={
                            <Button variant="outline" className="h-11 px-8 rounded-xl text-xs font-bold border-slate-200 hover:border-blue-200 hover:bg-blue-50 transition-all shadow-sm">
                                ORDER DETAILS
                            </Button>
                        }
                    />
                    {["Delivered", "Completed", 4, 5].includes(order.status) && (
                        <Button className="h-11 px-8 rounded-xl text-xs font-bold bg-[#4988c4] hover:bg-[#3b6fa3] shadow-lg shadow-blue-100 transition-all active:scale-95 text-white">
                            BUY AGAIN
                        </Button>
                    )}
                </div>
            </div>
        </Card>
    )
}

function EmptyState() {
    return (
        <Card className="py-24 text-center bg-slate-50/50 border-dashed border-2 rounded-[2rem] flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-white shadow-sm flex items-center justify-center mb-6">
                <ShoppingBag className="h-10 w-10 text-slate-200" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Your cart is quiet</h3>
            <p className="text-sm text-slate-500 font-medium max-w-xs mx-auto mt-2">Explore our premium collections to start your journey.</p>
            <Button className="mt-8 h-12 px-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold uppercase tracking-widest transition-all">
                Start Shopping
            </Button>
        </Card>
    )
}
