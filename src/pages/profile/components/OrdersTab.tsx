import React, { useMemo, useState } from "react"
import { Package, Search, ShoppingBag, Truck, CheckCircle2, AlertCircle, Clock3, ChevronRight, Calendar as CalendarIcon, X } from "lucide-react"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Badge } from "../../../components/ui/badge"
import { Card, CardContent, CardTitle, CardDescription } from "../../../components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../../components/ui/tabs"
import { Separator } from "../../../components/ui/separator"
import { Popover, PopoverContent, PopoverTrigger } from "../../../components/ui/popover"
import { Calendar } from "../../../components/ui/calendar"
import { cn } from "@/lib/utils"
import { format, isWithinInterval, startOfDay, endOfDay } from "date-fns"
import type { DateRange } from "react-day-picker"
import { formatPrice, formatDate } from "../utils"
import { useOrders } from "@/hooks/queries"
import { OrderStatusValue } from "@/api/types/order"
import type { OrderResponse } from "@/api/types/order"
import { Skeleton } from "@/components/ui/skeleton"
import { motion, AnimatePresence } from "framer-motion"

type BadgeVariant = "default" | "secondary" | "success" | "warning" | "danger" | "outline"

const STATUS_THEME: Record<string | number, { label: string, variant: BadgeVariant, icon: React.ReactNode }> = {
    [OrderStatusValue.Pending]: { label: "Pending", variant: "warning", icon: <Clock3 className="h-3.5 w-3.5" /> },
    [OrderStatusValue.Confirmed]: { label: "Confirmed", variant: "default", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
    [OrderStatusValue.Processing]: { label: "Processing", variant: "secondary", icon: <Package className="h-3.5 w-3.5" /> },
    [OrderStatusValue.Shipping]: { label: "Shipping", variant: "secondary", icon: <Truck className="h-3.5 w-3.5" /> },
    [OrderStatusValue.Delivered]: { label: "Delivered", variant: "success", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
    [OrderStatusValue.Completed]: { label: "Completed", variant: "success", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
    [OrderStatusValue.Cancelled]: { label: "Cancelled", variant: "danger", icon: <AlertCircle className="h-3.5 w-3.5" /> },
    "Pending": { label: "Pending", variant: "warning", icon: <Clock3 className="h-3.5 w-3.5" /> },
    "Confirmed": { label: "Confirmed", variant: "default", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
    "Processing": { label: "Processing", variant: "secondary", icon: <Package className="h-3.5 w-3.5" /> },
    "Shipping": { label: "Shipping", variant: "secondary", icon: <Truck className="h-3.5 w-3.5" /> },
    "Delivered": { label: "Delivered", variant: "success", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
    "Completed": { label: "Completed", variant: "success", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
    "Cancelled": { label: "Cancelled", variant: "danger", icon: <AlertCircle className="h-3.5 w-3.5" /> },
}

export default function OrdersTab() {
    const { data, isPending } = useOrders()
    const [search, setSearch] = useState("")
    const [date, setDate] = useState<DateRange | undefined>(undefined)

    // Advanced Filtering Logic
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

    const countStatus = (statuses: (string | number)[]) =>
        filteredOrders.filter(o => statuses.includes(o.status)).length

    const activeCount = countStatus(["Pending", "Confirmed", "Processing", "Shipping", 0, 1, 2, 3])
    const pastCount = countStatus(["Delivered", "Completed", 4, 5])
    const cancelledCount = countStatus(["Cancelled", 6])

    return (
        <div className="mx-auto space-y-8">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
                <div className="space-y-1.5">
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Order History</h2>
                    <p className="text-slate-500 font-medium">Manage and track your little one's dream collection</p>
                </div>
                {(search || date) && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setSearch(""); setDate(undefined); }}
                        className="text-slate-400 hover:text-rose-500 px-2 h-8 gap-1.5 font-bold uppercase tracking-widest transition-colors"
                    >
                        <X className="h-3.5 w-3.5" />
                        Clear Filters
                    </Button>
                )}
            </div>

            <Tabs defaultValue="all" className="w-full">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
                    <TabsList className="bg-slate-100/50 p-1.5 h-12 rounded-xl backdrop-blur-sm border border-slate-200/50 shadow-sm w-fit">
                        <TabsTrigger value="all" className="rounded-lg px-6 font-semibold data-[state=active]:bg-white data-[state=active]:text-[#4988c4] data-[state=active]:shadow-sm">
                            All <span className="ml-2 text-[10px] bg-slate-200 px-1.5 rounded-full text-slate-600">{filteredOrders.length}</span>
                        </TabsTrigger>
                        <TabsTrigger value="active" className="rounded-lg px-6 font-semibold data-[state=active]:bg-white data-[state=active]:text-amber-600 data-[state=active]:shadow-sm">
                            Active <span className="ml-2 text-[10px] bg-amber-100 px-1.5 rounded-full text-amber-600">{activeCount}</span>
                        </TabsTrigger>
                        <TabsTrigger value="completed" className="rounded-lg px-6 font-semibold data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm">
                            Completed <span className="ml-2 text-[10px] bg-emerald-100 px-1.5 rounded-full text-emerald-600">{pastCount}</span>
                        </TabsTrigger>
                        <TabsTrigger value="cancelled" className="rounded-lg px-6 font-semibold data-[state=active]:bg-white data-[state=active]:text-rose-600 data-[state=active]:shadow-sm">
                            Cancelled <span className="ml-2 text-[10px] bg-rose-100 px-1.5 rounded-full text-rose-600">{cancelledCount}</span>
                        </TabsTrigger>
                    </TabsList>

                    <div className="flex flex-col sm:flex-row items-center gap-3">
                        <div className="relative group w-full sm:w-[260px]">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#4988c4] transition-colors" />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Order ID..."
                                className="pl-10 h-11 bg-white border-slate-200 rounded-xl focus:ring-[#4988c4]/20 focus:border-[#4988c4] transition-all"
                            />
                        </div>

                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "h-11 w-full sm:w-[260px] justify-start text-left font-semibold rounded-xl border-slate-200 hover:bg-slate-50 transition-all",
                                        !date && "text-slate-500"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4 text-[#4988c4]" />
                                    {date?.from ? (
                                        date.to ? (
                                            <>
                                                {format(date.from, "LLL dd")} - {format(date.to, "LLL dd, y")}
                                            </>
                                        ) : (
                                            format(date.from, "LLL dd, y")
                                        )
                                    ) : (
                                        <span>Pick a date range</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 rounded-2xl border-slate-200 shadow-2xl" align="end">
                                <Calendar
                                    initialFocus
                                    mode="range"
                                    defaultMonth={date?.from}
                                    selected={date}
                                    onSelect={setDate}
                                    numberOfMonths={2}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {isPending ? (
                        <div className="space-y-6">
                            {Array(3).fill(0).map((_, i) => (
                                <Skeleton key={i} className="h-48 w-full rounded-[2rem]" />
                            ))}
                        </div>
                    ) : (
                        <>
                            <TabsContent value="all" className="m-0 focus-visible:ring-0">
                                <OrderList orders={filteredOrders} />
                            </TabsContent>
                            <TabsContent value="active" className="m-0 focus-visible:ring-0">
                                <OrderList orders={filteredOrders.filter(o => ["Pending", "Confirmed", "Processing", "Shipping", 0, 1, 2, 3].includes(o.status))} active />
                            </TabsContent>
                            <TabsContent value="completed" className="m-0 focus-visible:ring-0">
                                <OrderList orders={filteredOrders.filter(o => ["Delivered", "Completed", 4, 5].includes(o.status))} />
                            </TabsContent>
                            <TabsContent value="cancelled" className="m-0 focus-visible:ring-0">
                                <OrderList orders={filteredOrders.filter(o => ["Cancelled", 6].includes(o.status))} />
                            </TabsContent>
                        </>
                    )}
                </AnimatePresence>
            </Tabs>
        </div>
    )
}

function OrderList({ orders, active }: { orders: OrderResponse[], active?: boolean }) {
    if (orders.length === 0) return <EmptyState />

    return (
        <div className="space-y-6">
            {orders.map((order, i) => (
                <OrderCard key={order.id} order={order} delay={i * 0.05} active={active} />
            ))}
        </div>
    )
}

function OrderCard({ order, delay, active }: { order: OrderResponse, delay: number, active?: boolean }) {
    const theme = STATUS_THEME[order.status] || STATUS_THEME["Pending"]

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.3 }}
        >
            <Card className={`group overflow-hidden rounded-[1.5rem] border-slate-200 hover:border-[#4988c4]/50 transition-all duration-300 shadow-sm hover:shadow-md bg-white ${active ? 'ring-1 ring-blue-50/50' : ''}`}>
                <div className="p-0">
                    <div className="flex flex-col lg:flex-row">
                        {/* Header Info - Side column on Desktop, top on Mobile */}
                        <div className={`p-6 bg-slate-50/50 lg:w-72 border-b lg:border-b-0 lg:border-r border-slate-100 flex flex-col justify-between ${active ? 'bg-blue-50/20' : ''}`}>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Reference</p>
                                    <p className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                                        #{order.orderCode}
                                        <ChevronRight className="h-3 w-3 text-slate-300" />
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Status</p>
                                    <Badge variant={theme.variant} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm">
                                        {theme.icon}
                                        {theme.label}
                                    </Badge>
                                </div>
                            </div>
                            <div className="hidden lg:block pt-4">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Created on</p>
                                <p className="text-xs font-semibold text-slate-700">{formatDate(order.createdAt)}</p>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 p-6 flex flex-col md:flex-row items-center justify-between gap-8 bg-white">
                            <div className="flex items-center gap-6">
                                <div className="relative">
                                    <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center border border-slate-200 group-hover:border-[#4988c4]/30 shadow-subtle group-hover:scale-105 transition-all duration-300">
                                        <Package className="w-7 h-7 text-slate-300 group-hover:text-[#4988c4]/40" />
                                    </div>
                                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold border-2 border-white shadow-sm font-black">
                                        {order.itemCount}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-base font-bold text-slate-900 tracking-tight leading-none mb-1.5 group-hover:text-[#4988c4] transition-colors">{order.itemCount === 1 ? 'Individual Essential' : 'Essential Selection Group'}</h4>
                                    <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                                        Standard Packaging Included
                                    </p>
                                </div>
                            </div>

                            <Separator orientation="vertical" className="hidden md:block h-12 bg-slate-100" />

                            <div className="flex flex-col sm:flex-row items-center gap-8 w-full md:w-auto">
                                <div className="md:text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Valuation</p>
                                    <p className="text-2xl font-black text-[#4988c4] tracking-tight">{formatPrice(order.totalAmount)}</p>
                                </div>
                                <div className="flex gap-2 w-full sm:w-auto">
                                    <Button
                                        variant="outline"
                                        className="flex-1 sm:flex-none h-10 px-5 rounded-xl border-slate-200 font-bold text-[10px] uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all gap-2"
                                    >
                                        Details
                                    </Button>
                                    {["Delivered", "Completed", 4, 5].includes(order.status) && (
                                        <Button
                                            className="flex-1 sm:flex-none h-10 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-black/10 active:scale-95 transition-all"
                                        >
                                            Buy Again
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </motion.div>
    )
}

function EmptyState() {
    return (
        <Card className="border-dashed border-2 bg-slate-50/30">
            <CardContent className="py-20 text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-3xl bg-white border border-slate-100 shadow-sm flex items-center justify-center mb-6">
                    <ShoppingBag className="h-8 w-8 text-slate-200" />
                </div>
                <CardTitle className="text-xl font-bold text-slate-900 mb-2">Your collection is empty</CardTitle>
                <CardDescription className="max-w-xs mx-auto text-slate-500 font-medium leading-relaxed">
                    Start exploring our premium baby essentials and create your first memory today.
                </CardDescription>
                <Button className="mt-8 rounded-full px-8 bg-[#4988c4] hover:bg-[#3b6fa3] font-bold tracking-widest text-[10px] uppercase h-11 shadow-lg shadow-[#4988c4]/20 transition-all active:scale-95">
                    Discover Collection
                </Button>
            </CardContent>
        </Card>
    )
}
