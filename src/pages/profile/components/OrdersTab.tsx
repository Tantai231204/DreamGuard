import { useState, useMemo } from "react"
import { Search, Calendar as CalendarIcon, X, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../../components/ui/tabs"
import { Popover, PopoverContent, PopoverTrigger } from "../../../components/ui/popover"
import { Calendar } from "../../../components/ui/calendar"
import { cn } from "@/lib/utils"
import { format, isWithinInterval, startOfDay, endOfDay } from "date-fns"
import type { DateRange } from "react-day-picker"
import { useOrders } from "@/hooks/queries"
import { OrderList, OrderSkeleton } from "./orders"

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
                            {Array(3).fill(0).map((_, i) => (
                                <OrderSkeleton key={i} />
                            ))}
                        </div>
                    ) : (
                        <div className="min-h-[400px]">
                            <TabsContent value="all" className="m-0 focus-visible:ring-0">
                                <OrderList orders={paginatedOrders} isFilterActive={!!(search || date)} />
                            </TabsContent>
                            <TabsContent value="processing" className="m-0 focus-visible:ring-0">
                                <OrderList
                                    orders={paginatedOrders.filter(o => ["Pending", "Confirmed", "Processing", 0, 1, 2].includes(o.status))}
                                    isFilterActive={!!(search || date)}
                                />
                            </TabsContent>
                            <TabsContent value="shipping" className="m-0 focus-visible:ring-0">
                                <OrderList
                                    orders={paginatedOrders.filter(o => ["Shipping", 3].includes(o.status))}
                                    isFilterActive={!!(search || date)}
                                />
                            </TabsContent>
                            <TabsContent value="completed" className="m-0 focus-visible:ring-0">
                                <OrderList
                                    orders={paginatedOrders.filter(o => ["Delivered", "Completed", 4, 5].includes(o.status))}
                                    isFilterActive={!!(search || date)}
                                />
                            </TabsContent>
                            <TabsContent value="cancelled" className="m-0 focus-visible:ring-0">
                                <OrderList
                                    orders={paginatedOrders.filter(o => ["Cancelled", 6].includes(o.status))}
                                    isFilterActive={!!(search || date)}
                                />
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