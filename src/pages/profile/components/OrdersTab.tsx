import { useState, useMemo } from "react"
import { Search, Calendar as CalendarIcon, X, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "../../../components/ui/tabs"
import { Popover, PopoverContent, PopoverTrigger } from "../../../components/ui/popover"
import { Calendar } from "../../../components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select"
import { cn } from "@/lib/utils"
import { format, isWithinInterval, startOfDay, endOfDay } from "date-fns"
import type { DateRange } from "react-day-picker"
import { useOrders, useProfile, useServiceOrders, useServiceOrdersByCustomer } from "@/hooks/queries"
import type { OrderResponse } from "@/api/types/order"
import type { ServiceOrderResponse } from "@/api/types/serviceOrder"
import { OrderList, OrderSkeleton, ServiceOrderList } from "./orders"

const ITEMS_PER_PAGE = 4

type OrderType = "product" | "service"
type StatusTab = "all" | "processing" | "shipping" | "completed" | "cancelled"
type ServiceSort = "newest" | "oldest"

const PRODUCT_TABS: { id: StatusTab; label: string }[] = [
    { id: "all", label: "All Orders" },
    { id: "processing", label: "Processing" },
    { id: "shipping", label: "Shipping" },
    { id: "completed", label: "Completed" },
    { id: "cancelled", label: "Cancelled" }
]

const SERVICE_TABS: { id: StatusTab; label: string }[] = [
    { id: "all", label: "All Services" },
    { id: "processing", label: "In Progress" },
    { id: "completed", label: "Completed" },
    { id: "cancelled", label: "Cancelled" }
]

function matchProductStatus(status: unknown, tab: StatusTab) {
    if (tab === "all") return true
    if (tab === "processing") return ["Pending", "Confirmed", "Processing", 0, 1, 2].includes(status as never)
    if (tab === "shipping") return ["Shipping", 3].includes(status as never)
    if (tab === "completed") return ["Delivered", "Completed", 4, 5].includes(status as never)
    return ["Cancelled", 6].includes(status as never)
}

function normalizeServiceStatus(status: unknown) {
    if (status === null || status === undefined) return ""

    const codeMap: Record<number, string> = {
        0: "pending",
        1: "confirmed",
        2: "processing",
        3: "assigned",
        4: "completed",
        5: "cancelled",
        6: "forcedcancelled",
    }

    if (typeof status === "number") {
        return codeMap[status] || String(status)
    }

    return String(status).trim().toLowerCase().replace(/[\s_-]/g, "")
}

function matchServiceStatusV2(status: unknown, tab: StatusTab) {
    if (tab === "all") return true

    const normalized = normalizeServiceStatus(status)

    if (tab === "processing") {
        return ["pending", "confirmed", "processing", "inprogress", "inprocess", "assigned", "onroute", "shipping"].includes(normalized)
    }

    if (tab === "completed") {
        return ["completed", "done", "finished"].includes(normalized)
    }

    return ["cancelled", "canceled", "forcedcancelled", "managercancel", "managerforcecancel", "rejected", "refund", "refunded"].includes(normalized)
}

function getOrderTimestamp(order: OrderResponse | ServiceOrderResponse, type: OrderType) {
    if (type === "service") {
        const serviceOrder = order as ServiceOrderResponse
        const source = serviceOrder.createdAt || serviceOrder.appointmentDate || serviceOrder.updatedAt
        const value = source ? new Date(source).getTime() : 0
        return Number.isFinite(value) ? value : 0
    }

    const productOrder = order as OrderResponse
    const source = productOrder.createdAt || productOrder.updatedAt
    const value = source ? new Date(source).getTime() : 0
    return Number.isFinite(value) ? value : 0
}

function normalizePhone(phone?: string) {
    return (phone || "").replace(/\D/g, "")
}

export default function OrdersTab() {
    const [orderType, setOrderType] = useState<OrderType>("product")
    const [activeStatusTab, setActiveStatusTab] = useState<StatusTab>("all")
    const [serviceSort, setServiceSort] = useState<ServiceSort>("newest")

    const { data: profile } = useProfile()
    const rawProfile = profile as Record<string, unknown> | undefined
    const currentCustomerId = String(
        rawProfile?.customerId || rawProfile?.id || rawProfile?.userId || ""
    ).trim()
    const currentPhone = normalizePhone(String(rawProfile?.phoneNumber || ""))

    const { data: productData, isPending: isProductPending } = useOrders()
    const { data: serviceByCustomerData, isPending: isServiceByCustomerPending } = useServiceOrdersByCustomer(
        currentCustomerId,
        { pageNumber: 1, pageSize: 50 },
        orderType === "service" && !!currentCustomerId
    )
    const { data: serviceFallbackData, isPending: isServiceFallbackPending } = useServiceOrders(
        { pageNumber: 1, pageSize: 50 },
        orderType === "service" && !currentCustomerId
    )

    const [search, setSearch] = useState("")
    const [date, setDate] = useState<DateRange | undefined>(undefined)
    const [currentPage, setCurrentPage] = useState(1)

    const ownedServiceOrders = useMemo(() => {
        const serviceItems = currentCustomerId
            ? (serviceByCustomerData?.items ?? [])
            : (serviceFallbackData?.items ?? [])

        return serviceItems.filter((order) => {
            const orderCustomerId = (order.customerId || "").trim()
            const orderPhone = normalizePhone(order.phoneNumber)

            if (currentCustomerId) {
                if (!orderCustomerId) return false
                return orderCustomerId === currentCustomerId
            }

            if (currentPhone) return orderPhone === currentPhone
            return false
        })
    }, [currentCustomerId, currentPhone, serviceByCustomerData?.items, serviceFallbackData?.items])

    const filteredOrders = useMemo(() => {
        const orders = orderType === "product" ? (productData?.items ?? []) : ownedServiceOrders
        return orders.filter(order => {
            const orderCode = (order.orderCode || "").toLowerCase()
            const matchesSearch = orderCode.includes(search.toLowerCase())
            let matchesDate = true
            if (date?.from) {
                const orderDate = new Date(order.createdAt || 0)
                const start = startOfDay(date.from)
                const end = date.to ? endOfDay(date.to) : endOfDay(date.from)
                matchesDate = isWithinInterval(orderDate, { start, end })
            }
            return matchesSearch && matchesDate
        })
    }, [orderType, productData?.items, ownedServiceOrders, search, date])

    const statusFilteredOrders = useMemo(() => {
        if (orderType === "product") {
            return (filteredOrders as OrderResponse[]).filter(order => matchProductStatus(order.status, activeStatusTab))
        }

        return (filteredOrders as ServiceOrderResponse[]).filter(order => {
            const taskStatus = order.serviceTask?.status || order.task?.status || order.orderTask?.status || order.serviceOrderTask?.status
            return matchServiceStatusV2(order.status || taskStatus, activeStatusTab)
        })
    }, [filteredOrders, orderType, activeStatusTab])

    const sortedOrders = useMemo(() => {
        if (orderType !== "service") return statusFilteredOrders

        const serviceOrders = [...(statusFilteredOrders as ServiceOrderResponse[])]
        serviceOrders.sort((a, b) => {
            const aTime = getOrderTimestamp(a, "service")
            const bTime = getOrderTimestamp(b, "service")
            return serviceSort === "newest" ? bTime - aTime : aTime - bTime
        })

        return serviceOrders
    }, [statusFilteredOrders, orderType, serviceSort])

    const totalPages = Math.max(1, Math.ceil(sortedOrders.length / ITEMS_PER_PAGE))
    const paginatedOrders = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE
        return sortedOrders.slice(start, start + ITEMS_PER_PAGE)
    }, [sortedOrders, currentPage])

    const isPending = orderType === "product"
        ? isProductPending
        : (currentCustomerId ? isServiceByCustomerPending : isServiceFallbackPending)
    const tabs = orderType === "product" ? PRODUCT_TABS : SERVICE_TABS

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Order History</h2>
                    <p className="text-sm text-slate-500 mt-1 font-medium">Track product and service order history in one place.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 h-10">
                        <button
                            onClick={() => { setOrderType("product"); setActiveStatusTab("all"); setCurrentPage(1) }}
                            className={cn(
                                "px-3 sm:px-4 text-[11px] font-black uppercase tracking-wider rounded-lg transition-all",
                                orderType === "product" ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-800"
                            )}
                        >
                            Product
                        </button>
                        <button
                            onClick={() => { setOrderType("service"); setActiveStatusTab("all"); setCurrentPage(1) }}
                            className={cn(
                                "px-3 sm:px-4 text-[11px] font-black uppercase tracking-wider rounded-lg transition-all",
                                orderType === "service" ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-800"
                            )}
                        >
                            Service
                        </button>
                    </div>

                    <div className="relative group flex-1 min-w-[200px] md:w-64">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#4988c4] transition-colors" />
                        <Input
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                            placeholder={orderType === "service" ? "Search Service Order ID..." : "Search Order ID..."}
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

                    {orderType === "service" && (
                        <Select
                            value={serviceSort}
                            onValueChange={(value) => {
                                setServiceSort(value as ServiceSort)
                                setCurrentPage(1)
                            }}
                        >
                            <SelectTrigger className="h-10 min-w-[190px] rounded-xl border-slate-200 bg-white text-xs font-bold uppercase tracking-wider text-slate-700">
                                <div className="flex items-center gap-2">
                                    <ArrowUpDown className="h-4 w-4 text-slate-400" />
                                    <SelectValue placeholder="Sort by date" />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="newest">Date: Nearest first</SelectItem>
                                <SelectItem value="oldest">Date: Oldest first</SelectItem>
                            </SelectContent>
                        </Select>
                    )}

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

            <Tabs value={activeStatusTab} className="w-full space-y-6" onValueChange={(value) => { setActiveStatusTab(value as StatusTab); setCurrentPage(1) }}>
                <TabsList className="w-full bg-slate-100/50 p-1 rounded-xl h-12 border border-slate-200/60 flex overflow-x-auto no-scrollbar">
                    {tabs.map((tab) => (
                        <TabsTrigger
                            key={tab.id}
                            value={tab.id}
                            className="flex-1 rounded-lg data-[state=active]:bg-[#4988c4] data-[state=active]:text-white data-[state=active]:shadow-md font-bold text-[11px] uppercase tracking-widest h-full transition-all duration-300 px-4 group"
                        >
                            <span className="relative z-10 transition-transform group-active:scale-95">{tab.label}</span>
                        </TabsTrigger>
                    ))}
                </TabsList>

                <div className="w-full">
                    {isPending ? (
                        <div className="space-y-4">
                            {Array(3).fill(0).map((_, i) => (
                                <OrderSkeleton key={i} />
                            ))}
                        </div>
                    ) : (
                        <div className="min-h-[400px]">
                            {orderType === "product" ? (
                                <OrderList orders={paginatedOrders as OrderResponse[]} isFilterActive={!!(search || date)} />
                            ) : (
                                <ServiceOrderList orders={paginatedOrders as ServiceOrderResponse[]} isFilterActive={!!(search || date)} />
                            )}
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