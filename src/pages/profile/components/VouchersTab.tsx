import { useMemo, useRef, useState } from "react"
import {
    ChevronLeft,
    ChevronRight,
    Clock3,
    Coins,
    Flame,
    Gift,
    Search,
    SortAsc,
    Sparkles,
    Tag,
    Ticket,
    X,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import type { UserVoucherResponse } from "@/api"
import { useClaimVoucher, useUserVouchers, useVoucherDetail } from "@/hooks/queries"
import { useToast } from "@/hooks/useToast"
import { AppRoute } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VoucherCard, VoucherDetailModal } from "./voucher"
import type { ProfileVoucher, VoucherStatus } from "./voucher/types"

type VoucherFilterStatus = "all" | VoucherStatus
type VoucherTypeFilter = "all" | ProfileVoucher["voucherType"]
type VoucherSortBy = "expiry-asc" | "expiry-desc" | "discount-asc" | "discount-desc"

const getExpiryDate = (voucher: Pick<UserVoucherResponse, "endDate" | "expiredAt">): string | undefined => {
    return voucher.expiredAt || voucher.endDate || undefined
}

const toTimestamp = (value?: string): number => {
    if (!value) return 0
    const date = new Date(value)
    const time = date.getTime()
    return Number.isFinite(time) ? time : 0
}

const formatExpiryDate = (value?: string): string => {
    if (!value) return "No expiry"
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return "No expiry"
    return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
}

const deriveStatus = (voucher: UserVoucherResponse): VoucherStatus => {
    if (voucher.isUsed === true || !!voucher.usedAt) {
        return "used"
    }

    const endTime = toTimestamp(getExpiryDate(voucher))
    const now = Date.now()
    const isExpired = endTime !== 0 && endTime < now

    // If backend explicitly says inactive, or time is past expiry, it's expired
    if (voucher.isActive === false || isExpired) {
        return "expired"
    }

    // Default to active if it's claimed and not used/expired
    return "active"
}

const toProfileVoucher = (voucher: UserVoucherResponse): ProfileVoucher => {
    return {
        userVoucherId: voucher.userVoucherId,
        voucherId: voucher.voucherId,
        code: voucher.code,
        name: voucher.name,
        description: voucher.description,
        discountValue: voucher.discountValue,
        maxDiscountAmount: voucher.maxDiscountAmount,
        requiredCoin: voucher.requiredCoin,
        voucherType: voucher.voucherType,
        startDate: voucher.startDate || undefined,
        endDate: getExpiryDate(voucher),
        isActive: voucher.isActive,
        status: deriveStatus(voucher),
        isClaimed: voucher.isClaimed,
        claimedAt: voucher.claimedAt,
        usedAt: voucher.usedAt,
    }
}

export default function VouchersTab() {
    const navigate = useNavigate()
    const toast = useToast()
    const { data: userVoucherData, isLoading, isError, refetch } = useUserVouchers()
    const claimVoucherMutation = useClaimVoucher()

    const [filterStatus, setFilterStatus] = useState<VoucherFilterStatus>("all")
    const [searchQuery, setSearchQuery] = useState("")
    const [voucherTypeFilter, setVoucherTypeFilter] = useState<VoucherTypeFilter>("all")
    const [sortBy, setSortBy] = useState<VoucherSortBy>("expiry-asc")
    const [claimingCode, setClaimingCode] = useState<string | null>(null)
    const [claimedFlowCode, setClaimedFlowCode] = useState<string | null>(null)
    const [selectedVoucherId, setSelectedVoucherId] = useState<string | null>(null)
    const [modalOpen, setModalOpen] = useState(false)
    const usableSectionRef = useRef<HTMLDivElement | null>(null)

    const vouchers = useMemo<ProfileVoucher[]>(() => {
        return (userVoucherData?.items ?? []).map(toProfileVoucher)
    }, [userVoucherData?.items])

    const selectedVoucherBase = useMemo<ProfileVoucher | null>(() => {
        if (!selectedVoucherId) return null
        return vouchers.find((voucher: ProfileVoucher) => voucher.userVoucherId === selectedVoucherId) ?? null
    }, [selectedVoucherId, vouchers])

    const selectedVoucherTemplateId = selectedVoucherBase?.voucherId ?? ""
    const { data: selectedVoucherDetail } = useVoucherDetail(
        selectedVoucherTemplateId,
        modalOpen && !!selectedVoucherTemplateId,
    )

    const voucherTypes = useMemo<VoucherTypeFilter[]>(() => {
        const types = Array.from(new Set(vouchers.map((voucher: ProfileVoucher) => voucher.voucherType)))
        return ["all", ...types]
    }, [vouchers])

    const ITEMS_PER_PAGE = 4
    const [currentPage, setCurrentPage] = useState(1)

    // Filter and sort vouchers
    const filteredVouchers = useMemo<ProfileVoucher[]>(() => {
        const result = vouchers.filter((voucher: ProfileVoucher) => {
            // Status filter
            if (filterStatus !== "all" && voucher.status !== filterStatus) return false

            // Search filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase()
                const matchesSearch =
                    voucher.name.toLowerCase().includes(query) ||
                    voucher.code.toLowerCase().includes(query) ||
                    voucher.description.toLowerCase().includes(query)
                if (!matchesSearch) return false
            }

            // Voucher type filter
            if (voucherTypeFilter !== "all" && voucher.voucherType !== voucherTypeFilter) return false

            return true
        })

        // Sort
        result.sort((a: ProfileVoucher, b: ProfileVoucher) => {
            switch (sortBy) {
                case "expiry-asc":
                    return toTimestamp(a.endDate) - toTimestamp(b.endDate)
                case "expiry-desc":
                    return toTimestamp(b.endDate) - toTimestamp(a.endDate)
                case "discount-asc":
                    return a.discountValue - b.discountValue
                case "discount-desc":
                    return b.discountValue - a.discountValue
                default:
                    return 0
            }
        })

        return result
    }, [vouchers, filterStatus, searchQuery, voucherTypeFilter, sortBy])

    // Pagination logic
    const totalPages = Math.ceil(filteredVouchers.length / ITEMS_PER_PAGE)

    // Always work with a "safe" page number derived from state but capped by current totals
    const safePage = useMemo(() => {
        if (totalPages === 0) return 1
        return Math.min(Math.max(1, currentPage), totalPages)
    }, [currentPage, totalPages])

    const paginatedVouchers = useMemo<ProfileVoucher[]>(() => {
        const start = (safePage - 1) * ITEMS_PER_PAGE
        return filteredVouchers.slice(start, start + ITEMS_PER_PAGE)
    }, [filteredVouchers, safePage])

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    const claimableVouchers = useMemo<ProfileVoucher[]>(() => {
        return vouchers.filter((voucher: ProfileVoucher) => voucher.status === "claimable")
    }, [vouchers])

    const voucherCounts = {
        all: vouchers.length,
        claimable: claimableVouchers.length,
        active: vouchers.filter((v: ProfileVoucher) => v.status === "active").length,
        used: vouchers.filter((v: ProfileVoucher) => v.status === "used").length,
        expired: vouchers.filter((v: ProfileVoucher) => v.status === "expired").length,
    }

    const selectedVoucher = useMemo<ProfileVoucher | null>(() => {
        if (!selectedVoucherBase) {
            return null
        }

        if (!selectedVoucherDetail) {
            return selectedVoucherBase
        }

        return {
            ...selectedVoucherBase,
            voucherId: selectedVoucherDetail.voucherId || selectedVoucherBase.voucherId,
            code: selectedVoucherDetail.code || selectedVoucherBase.code,
            name: selectedVoucherDetail.name || selectedVoucherBase.name,
            description: selectedVoucherDetail.description || selectedVoucherBase.description,
            discountValue:
                typeof selectedVoucherDetail.discountValue === "number"
                    ? selectedVoucherDetail.discountValue
                    : selectedVoucherBase.discountValue,
            maxDiscountAmount:
                typeof selectedVoucherDetail.maxDiscountAmount === "number"
                    ? selectedVoucherDetail.maxDiscountAmount
                    : selectedVoucherBase.maxDiscountAmount,
            requiredCoin:
                typeof selectedVoucherDetail.requiredCoin === "number"
                    ? selectedVoucherDetail.requiredCoin
                    : selectedVoucherBase.requiredCoin,
            voucherType: selectedVoucherDetail.voucherType || selectedVoucherBase.voucherType,
            startDate: selectedVoucherBase.startDate || selectedVoucherDetail.startDate,
            endDate: selectedVoucherBase.endDate || selectedVoucherDetail.endDate,
            isActive:
                typeof selectedVoucherDetail.isActive === "boolean"
                    ? selectedVoucherDetail.isActive
                    : selectedVoucherBase.isActive,
        }
    }, [selectedVoucherBase, selectedVoucherDetail])

    const handleVoucherClick = (voucher: ProfileVoucher) => {
        setSelectedVoucherId(voucher.userVoucherId)
        setModalOpen(true)
    }

    const scrollToUsableSection = () => {
        requestAnimationFrame(() => {
            usableSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
        })
    }

    const handleClaimVoucher = (voucher: ProfileVoucher) => {
        const code = voucher.code.trim().toUpperCase()

        if (!code) {
            toast.warning("Voucher code is missing")
            return
        }

        setClaimingCode(code)

        claimVoucherMutation.mutate(
            { code },
            {
                onSuccess: () => {
                    setFilterStatus("active")
                    setSearchQuery(code)
                    setVoucherTypeFilter("all")
                    setSortBy("expiry-asc")
                    setCurrentPage(1)
                    setClaimedFlowCode(code)
                    window.setTimeout(() => setClaimedFlowCode(null), 3500)
                    scrollToUsableSection()
                    toast.success("Voucher claimed", "Your voucher is ready in the Ready tab.")
                },
                onError: () => {
                    toast.error("Unable to claim this voucher right now. Please try again.")
                },
                onSettled: () => {
                    setClaimingCode(null)
                },
            }
        )
    }

    const handleApplyVoucherToCheckout = (voucher: ProfileVoucher) => {
        if (!voucher.userVoucherId) {
            toast.warning("Voucher is not ready to apply")
            return
        }

        if (voucher.status !== "active") {
            toast.warning("This voucher is no longer valid")
            return
        }

        navigate(AppRoute.CHECKOUT, {
            state: {
                preselectedVoucherId: voucher.userVoucherId,
                preselectedVoucherCode: voucher.code,
            },
        })
    }

    const pageNumbers = useMemo<number[]>(() => {
        if (totalPages <= 5) {
            return Array.from({ length: totalPages }, (_, index) => index + 1)
        }

        if (safePage <= 3) {
            return [1, 2, 3, 4, 5]
        }

        if (safePage >= totalPages - 2) {
            return [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
        }

        return [safePage - 2, safePage - 1, safePage, safePage + 1, safePage + 2]
    }, [safePage, totalPages])

    const tabStyles: Array<{
        id: VoucherFilterStatus
        label: string
        count: number
        activeClass: string
        badgeClass: string
    }> = [
            {
                id: "all",
                label: "All",
                count: voucherCounts.all,
                activeClass: "data-[state=active]:bg-slate-900 data-[state=active]:text-white",
                badgeClass: "group-data-[state=active]:bg-white/20 group-data-[state=active]:text-white",
            },
            {
                id: "claimable",
                label: "Claim",
                count: voucherCounts.claimable,
                activeClass: "data-[state=active]:bg-primary-500 data-[state=active]:text-white",
                badgeClass: "group-data-[state=active]:bg-white/20 group-data-[state=active]:text-white",
            },
            {
                id: "active",
                label: "Ready",
                count: voucherCounts.active,
                activeClass: "data-[state=active]:bg-emerald-600 data-[state=active]:text-white",
                badgeClass: "group-data-[state=active]:bg-white/20 group-data-[state=active]:text-white",
            },
            {
                id: "used",
                label: "Used",
                count: voucherCounts.used,
                activeClass: "data-[state=active]:bg-slate-600 data-[state=active]:text-white",
                badgeClass: "group-data-[state=active]:bg-white/20 group-data-[state=active]:text-white",
            },
            {
                id: "expired",
                label: "Expired",
                count: voucherCounts.expired,
                activeClass: "data-[state=active]:bg-rose-600 data-[state=active]:text-white",
                badgeClass: "group-data-[state=active]:bg-white/20 group-data-[state=active]:text-white",
            },
        ]

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="relative overflow-hidden rounded-[28px] border border-primary-200/70 bg-gradient-to-r from-primary-700 via-primary-600 to-primary-500 p-6 text-white shadow-[0_18px_45px_rgba(73,136,196,0.26)] sm:p-7">
                <div className="pointer-events-none absolute -top-16 -right-10 h-44 w-44 rounded-full bg-white/18 blur-2xl" />
                <div className="pointer-events-none absolute -bottom-12 left-16 h-36 w-36 rounded-full bg-primary-200/35 blur-2xl" />

                <div className="relative z-10 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                    <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-primary-100/90">Voucher Wallet</p>
                        <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-[1.8rem]">Claim Fast, Save More</h2>
                        <p className="mt-2 max-w-2xl text-sm font-semibold text-primary-100/90">
                            Claim available vouchers and apply them instantly at checkout.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl border border-white/20 bg-white/15 px-4 py-3 backdrop-blur-sm">
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary-100/80">Ready</p>
                            <p className="mt-1 text-2xl font-black leading-none">{voucherCounts.active}</p>
                        </div>
                        <div className="rounded-2xl border border-white/20 bg-white/15 px-4 py-3 backdrop-blur-sm">
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary-100/80">Claim</p>
                            <p className="mt-1 text-2xl font-black leading-none">{voucherCounts.claimable}</p>
                        </div>
                        <div className="rounded-2xl border border-white/20 bg-white/15 px-4 py-3 backdrop-blur-sm">
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary-100/80">Used</p>
                            <p className="mt-1 text-2xl font-black leading-none">{voucherCounts.used}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-primary-100 bg-white shadow-sm">
                <div className="flex flex-col gap-3 border-b border-primary-100 bg-gradient-to-r from-primary-50 via-sky-100/60 to-primary-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-primary-700">Claim Center</p>
                        <p className="mt-1 text-sm font-semibold text-slate-700">Find available vouchers and claim them in one tap.</p>
                    </div>

                    <Badge className="w-fit rounded-xl border border-primary-200 bg-white px-3 py-1 text-[10px] font-black uppercase tracking-wider text-primary-700">
                        {voucherCounts.claimable} available to claim
                    </Badge>
                </div>

                <div className="p-4 sm:p-6">
                    {claimableVouchers.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-primary-200 bg-primary-50/40 px-4 py-5 text-sm font-semibold text-slate-600">
                            No vouchers are available to claim right now.
                        </div>
                    ) : (
                        <div className="grid gap-3 lg:grid-cols-2">
                            {claimableVouchers.map((voucher) => {
                                const normalizedCode = voucher.code.trim().toUpperCase()
                                const isClaiming = claimVoucherMutation.isPending && claimingCode === normalizedCode
                                return (
                                    <div
                                        key={voucher.userVoucherId}
                                        className="group relative overflow-hidden rounded-2xl border border-primary-100 bg-gradient-to-r from-white via-primary-50/50 to-sky-100/50 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_28px_rgba(73,136,196,0.18)]"
                                    >
                                        <div className="absolute -right-7 top-1/2 h-14 w-14 -translate-y-1/2 rounded-full border border-primary-200 bg-white" />

                                        <div className="relative z-10 flex items-start justify-between gap-4">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="rounded-lg bg-slate-900 px-2.5 py-1 font-mono text-[11px] font-black uppercase tracking-[0.16em] text-white">
                                                        {voucher.code}
                                                    </span>
                                                    <Badge className="border border-primary-200 bg-white text-[10px] font-bold uppercase tracking-wider text-primary-700">
                                                        {voucher.voucherType}
                                                    </Badge>
                                                </div>

                                                <p className="mt-2 truncate text-sm font-bold text-slate-800">{voucher.name}</p>

                                                <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-600">
                                                    <span className="inline-flex items-center gap-1 rounded-md bg-primary-100 px-2 py-1 text-primary-700">
                                                        <Flame className="h-3.5 w-3.5" />
                                                        {(voucher.discountValue * 100).toFixed(0)}%
                                                    </span>
                                                    <span className="inline-flex items-center gap-1 rounded-md bg-primary-100 px-2 py-1 text-primary-700">
                                                        <Coins className="h-3.5 w-3.5" />
                                                        {voucher.requiredCoin ?? 0} coin
                                                    </span>
                                                    <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-slate-600">
                                                        <Clock3 className="h-3.5 w-3.5" />
                                                        {formatExpiryDate(voucher.endDate)}
                                                    </span>
                                                </div>
                                            </div>

                                            <Button
                                                size="sm"
                                                onClick={() => handleClaimVoucher(voucher)}
                                                disabled={claimVoucherMutation.isPending}
                                                className="h-9 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 px-4 text-[10px] font-black uppercase tracking-[0.16em] text-white shadow-sm hover:from-primary-600 hover:to-primary-700"
                                            >
                                                {isClaiming ? "Claiming" : "Claim"}
                                            </Button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>

            <div ref={usableSectionRef}>
                <Tabs
                    value={filterStatus}
                    onValueChange={(value) => {
                        setFilterStatus(value as VoucherFilterStatus)
                        setCurrentPage(1)
                    }}
                    className="w-full space-y-4"
                >
                    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                            <div className="relative group flex-1">
                                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-primary-500" />
                                <Input
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value)
                                        setCurrentPage(1)
                                    }}
                                    placeholder="Search voucher by code, name, description..."
                                    className="h-11 rounded-xl border-slate-200 bg-slate-50/60 pl-10 pr-10 text-sm font-medium focus:border-primary-300 focus:ring-primary-100"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => {
                                            setSearchQuery("")
                                            setCurrentPage(1)
                                        }}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-700"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                <Select
                                    value={voucherTypeFilter}
                                    onValueChange={(v) => {
                                        setVoucherTypeFilter(v as VoucherTypeFilter)
                                        setCurrentPage(1)
                                    }}
                                >
                                    <SelectTrigger className="h-11 w-[164px] rounded-xl border-slate-200 bg-white font-bold text-[11px] uppercase tracking-wider hover:bg-slate-50">
                                        <div className="flex items-center gap-2">
                                            <Tag className="h-3.5 w-3.5 text-slate-400" />
                                            <SelectValue placeholder="Type" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-slate-200 shadow-lg">
                                        <SelectItem value="all">
                                            <span className="font-bold text-[11px] uppercase tracking-wider">All Types</span>
                                        </SelectItem>
                                        {voucherTypes
                                            .filter((type): type is ProfileVoucher["voucherType"] => type !== "all")
                                            .map((type) => (
                                                <SelectItem key={type} value={type}>
                                                    <span className="font-bold text-[11px] uppercase tracking-wider">{type}</span>
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={sortBy}
                                    onValueChange={(v) => {
                                        setSortBy(v as VoucherSortBy)
                                        setCurrentPage(1)
                                    }}
                                >
                                    <SelectTrigger className="h-11 w-[190px] rounded-xl border-slate-200 bg-white font-bold text-[11px] uppercase tracking-wider hover:bg-slate-50">
                                        <div className="flex items-center gap-2">
                                            <SortAsc className="h-3.5 w-3.5 text-slate-400" />
                                            <SelectValue placeholder="Sort" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-slate-200 shadow-lg">
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

                                {(searchQuery || voucherTypeFilter !== "all" || sortBy !== "expiry-asc") && (
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setSearchQuery("")
                                            setVoucherTypeFilter("all")
                                            setSortBy("expiry-asc")
                                            setCurrentPage(1)
                                        }}
                                        className="h-11 rounded-xl border-primary-200 px-4 text-[11px] font-bold uppercase tracking-wider text-primary-700 hover:bg-primary-50"
                                    >
                                        Reset
                                    </Button>
                                )}
                            </div>
                        </div>

                        <TabsList className="mt-4 flex h-auto w-full overflow-x-auto rounded-2xl border border-slate-200 bg-slate-50 p-1.5 no-scrollbar">
                            {tabStyles.map((tab) => (
                                <TabsTrigger
                                    key={tab.id}
                                    value={tab.id}
                                    className={cn(
                                        "group min-w-[120px] flex-1 rounded-xl px-3 py-2.5 text-[11px] font-black uppercase tracking-wider transition-all data-[state=active]:shadow-sm",
                                        tab.activeClass,
                                    )}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <span>{tab.label}</span>
                                        <Badge
                                            className={cn(
                                                "h-5 min-w-[22px] rounded-md border-none bg-slate-200 text-[9px] font-bold text-slate-600",
                                                tab.badgeClass,
                                            )}
                                        >
                                            {tab.count}
                                        </Badge>
                                    </div>
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        {claimedFlowCode && (
                            <div className="mt-4 flex flex-col gap-2 rounded-xl border border-primary-200 bg-primary-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-xs font-semibold text-primary-700">
                                    Voucher {claimedFlowCode} is now ready to use in the Ready tab.
                                </p>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={scrollToUsableSection}
                                    className="h-8 rounded-lg border-primary-300 bg-white px-3 text-[10px] font-bold uppercase tracking-widest text-primary-700 hover:bg-primary-100"
                                >
                                    View Ready Vouchers
                                </Button>
                            </div>
                        )}
                    </div>

                    <TabsContent value={filterStatus} className="mt-0 space-y-6 focus-visible:ring-0">
                        {isLoading && (
                            <Card className="rounded-2xl border border-slate-200 bg-white">
                                <CardContent className="flex flex-col items-center justify-center py-16">
                                    <div className="mb-4 h-10 w-10 animate-spin rounded-full border-2 border-primary-200 border-t-primary-500" />
                                    <p className="text-sm font-semibold text-slate-500">Loading voucher wallet...</p>
                                </CardContent>
                            </Card>
                        )}

                        {!isLoading && isError && (
                            <Card className="rounded-2xl border border-rose-200 bg-rose-50/30">
                                <CardContent className="flex flex-col items-center justify-center gap-3 py-16">
                                    <h3 className="text-base font-bold text-rose-700">Unable to load vouchers</h3>
                                    <p className="text-sm text-rose-600">Please try again in a moment.</p>
                                    <Button
                                        variant="outline"
                                        onClick={() => refetch()}
                                        className="rounded-xl border-rose-300 text-rose-700 hover:bg-rose-100"
                                    >
                                        Retry
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                        {!isLoading && !isError && (
                            <>
                                {filteredVouchers.length === 0 ? (
                                    <Card className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
                                        <CardContent className="flex flex-col items-center justify-center py-20">
                                            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-white shadow-sm">
                                                <Ticket className="h-8 w-8 text-slate-300" />
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-900">No vouchers found</h3>
                                            <p className="mt-2 max-w-sm text-center text-sm font-medium text-slate-500">
                                                {searchQuery || voucherTypeFilter !== "all"
                                                    ? "Try adjusting your filters to find what you're looking for."
                                                    : "Your voucher collection is currently empty."}
                                            </p>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <div className="grid gap-4 lg:grid-cols-2">
                                        {paginatedVouchers.map((voucher: ProfileVoucher) => (
                                            <VoucherCard
                                                key={voucher.userVoucherId}
                                                voucher={voucher}
                                                onClick={() => handleVoucherClick(voucher)}
                                            />
                                        ))}
                                    </div>
                                )}

                                {totalPages > 1 && (
                                    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                            Page {safePage} of {totalPages}
                                        </p>

                                        <div className="flex items-center gap-1.5">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={safePage === 1}
                                                onClick={() => handlePageChange(safePage - 1)}
                                                className="h-9 rounded-lg border-slate-200 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-600"
                                            >
                                                <ChevronLeft className="mr-1 h-4 w-4" />
                                                Prev
                                            </Button>

                                            {pageNumbers.map((page) => (
                                                <Button
                                                    key={page}
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handlePageChange(page)}
                                                    className={cn(
                                                        "h-9 min-w-[38px] rounded-lg border-slate-200 px-3 text-[11px] font-bold",
                                                        safePage === page
                                                            ? "border-primary-500 bg-primary-500 text-white hover:bg-primary-500"
                                                            : "text-slate-600",
                                                    )}
                                                >
                                                    {page}
                                                </Button>
                                            ))}

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={safePage === totalPages}
                                                onClick={() => handlePageChange(safePage + 1)}
                                                className="h-9 rounded-lg border-slate-200 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-600"
                                            >
                                                Next
                                                <ChevronRight className="ml-1 h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </TabsContent>
                </Tabs>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
                <Card className="overflow-hidden rounded-2xl border border-primary-100 bg-gradient-to-br from-primary-50 via-white to-sky-100/50 shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-primary-100 bg-white shadow-sm">
                                <Gift className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-sm font-bold text-slate-900">Quick Tips</h4>
                                <ul className="mt-3 space-y-2 text-[11px] font-semibold text-slate-600">
                                    {[
                                        "Claim from Claim Center before opening checkout.",
                                        "Use only vouchers in Ready tab for payment discount.",
                                        "Check expiry and max cap before applying voucher.",
                                    ].map((text, idx) => (
                                        <li key={idx} className="flex items-start gap-2">
                                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-300" />
                                            <span>{text}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="overflow-hidden rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-primary-50/60 shadow-sm">
                    <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-sky-100 bg-white shadow-sm">
                                <Sparkles className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-sm font-bold text-slate-900">Voucher Rules</h4>
                                <ul className="mt-3 space-y-2 text-[11px] font-semibold text-slate-600">
                                    {[
                                        "Voucher cannot be converted to cash.",
                                        "A voucher cannot be combined with another voucher.",
                                        "Expired vouchers are hidden automatically by system.",
                                    ].map((text, idx) => (
                                        <li key={idx} className="flex items-start gap-2">
                                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-300" />
                                            <span>{text}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <VoucherDetailModal
                voucher={selectedVoucher}
                open={modalOpen}
                onOpenChange={(open) => {
                    setModalOpen(open)
                    if (!open) {
                        setSelectedVoucherId(null)
                    }
                }}
                onApplyToCheckout={handleApplyVoucherToCheckout}
            />
        </div>
    )
}