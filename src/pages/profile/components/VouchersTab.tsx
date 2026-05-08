import { useMemo, useRef, useState } from "react"
import {
    ChevronLeft,
    ChevronRight,
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
import type { UserVoucherResponse, VoucherResponse } from "@/api"
import { useClaimVoucher, useUserVouchers, useVoucherDetail, useVouchers, useProfile } from "@/hooks/queries"
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
const voucherToProfileVoucher = (voucher: VoucherResponse): ProfileVoucher => {
    return {
        userVoucherId: voucher.voucherId, // Fallback to voucherId since it's not claimed yet
        voucherId: voucher.voucherId,
        code: voucher.code,
        name: voucher.name,
        description: voucher.description,
        discountValue: voucher.discountValue,
        maxDiscountAmount: voucher.maxDiscountAmount,
        requiredCoin: voucher.requiredCoin,
        voucherType: voucher.voucherType,
        startDate: voucher.startDate,
        endDate: voucher.endDate,
        isActive: voucher.isActive,
        status: "claimable",
        isClaimed: false,
    }
}

export default function VouchersTab() {
    const navigate = useNavigate()
    const toast = useToast()
    const { data: userVoucherData, isLoading: isLoadingUser, isError: isUserError } = useUserVouchers()
    const { data: publicVoucherData, isLoading: isLoadingPublic, isError: isPublicError } = useVouchers()
    const claimVoucherMutation = useClaimVoucher()

    const isLoading = isLoadingUser
    const isError = isUserError
    // We treat public voucher errors silently for the main UI to prevent blocking the user's wallet
    const marketplaceError = isPublicError

    const [filterStatus, setFilterStatus] = useState<VoucherFilterStatus>("all")
    const [searchQuery, setSearchQuery] = useState("")
    const [voucherTypeFilter, setVoucherTypeFilter] = useState<VoucherTypeFilter>("all")
    const [sortBy, setSortBy] = useState<VoucherSortBy>("expiry-asc")
    const [claimingCode, setClaimingCode] = useState<string | null>(null)
    const [claimedFlowCode, setClaimedFlowCode] = useState<string | null>(null)
    const [selectedVoucherId, setSelectedVoucherId] = useState<string | null>(null)
    const [modalOpen, setModalOpen] = useState(false)
    const usableSectionRef = useRef<HTMLDivElement | null>(null)
    const [now] = useState(() => Date.now())
    const { data: profile } = useProfile()
    const userCoins = profile?.memberCoin ?? 0

    const vouchers = useMemo<ProfileVoucher[]>(() => {
        const claimed = (userVoucherData?.items ?? []).map(toProfileVoucher)
        const publicItems = (publicVoucherData?.items ?? []).map(voucherToProfileVoucher)

        // Avoid duplicates: If a voucher is already in the user's collection, don't show it in the claimable list
        const claimedVoucherIds = new Set(claimed.map((v) => v.voucherId))
        
        // Filter public vouchers: Must be active, not expired, and not already claimed
        const claimable = publicItems.filter((v) => {
            if (claimedVoucherIds.has(v.voucherId)) return false
            if (v.isActive === false) return false
            
            const expiry = toTimestamp(v.endDate)
            if (expiry !== 0 && expiry < now) return false
            
            return true
        })

        return [...claimed, ...claimable]
    }, [userVoucherData?.items, publicVoucherData?.items, now])

    const selectedVoucherBase = useMemo<ProfileVoucher | null>(() => {
        if (!selectedVoucherId) return null
        return vouchers.find((v) => v.userVoucherId === selectedVoucherId) ?? null
    }, [vouchers, selectedVoucherId])

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

        const requiredCoin = voucher.requiredCoin ?? 0
        const actionLabel = requiredCoin > 0 ? "exchange" : "claim"

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
                    
                    if (requiredCoin > 0) {
                        toast.success("Voucher Exchanged", `${requiredCoin} coins were used to get ${code}.`)
                    } else {
                        toast.success("Voucher Claimed", `Your voucher ${code} is ready in the Ready tab.`)
                    }
                },
                onError: (error: unknown) => {
                    const axiosError = error as { response?: { data?: { message?: string } } }
                    const message = axiosError?.response?.data?.message || `Unable to ${actionLabel} this voucher. Please check your coins.`
                    toast.error(message)
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
            <div className="relative overflow-hidden rounded-[32px] border border-primary-200/40 bg-[#0f172a] p-8 text-white shadow-2xl">
                {/* Visual Orbs */}
                <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary-500/20 blur-[80px]" />
                <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-sky-500/10 blur-[80px]" />
                
                <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-500/20 text-primary-400 ring-1 ring-primary-500/30">
                                <Ticket className="h-5 w-5" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-[0.3em] text-primary-400">Voucher Wallet</span>
                        </div>
                        <h2 className="text-3xl font-black tracking-tight sm:text-4xl">Rewards & Savings</h2>
                        <p className="max-w-md text-sm font-medium text-slate-400">
                            Exchange your earned coins for exclusive discounts and premium rewards.
                        </p>
                    </div>

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <div className="group relative overflow-hidden rounded-[24px] border border-white/10 bg-white/5 px-6 py-4 backdrop-blur-md transition-all hover:bg-white/10">
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/20 text-amber-500 ring-1 ring-amber-500/30">
                                    <Coins className="h-6 w-6 animate-pulse" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Available Coins</p>
                                    <p className="text-2xl font-black tabular-nums text-amber-500">{userCoins.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:w-auto">
                            <div className="rounded-2xl bg-white/5 p-3 text-center ring-1 ring-white/10">
                                <p className="text-[10px] font-bold text-slate-500">READY</p>
                                <p className="text-xl font-black">{voucherCounts.active}</p>
                            </div>
                            <div className="rounded-2xl bg-white/5 p-3 text-center ring-1 ring-white/10">
                                <p className="text-[10px] font-bold text-slate-500">USED</p>
                                <p className="text-xl font-black">{voucherCounts.used}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2">
                        <Flame className="h-5 w-5 text-orange-500" />
                        <h3 className="text-lg font-black tracking-tight text-slate-900">Claim Center</h3>
                    </div>
                    <Badge className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold text-slate-600">
                        {voucherCounts.claimable} New Available
                    </Badge>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
                    {isLoadingPublic ? (
                        <div className="col-span-full py-12 flex flex-col items-center justify-center gap-3">
                            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" />
                            <p className="text-xs font-bold text-slate-400">Loading rewards...</p>
                        </div>
                    ) : marketplaceError || claimableVouchers.length === 0 ? (
                        <div className="col-span-full rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
                            <p className="text-sm font-bold text-slate-400 italic">No new vouchers to claim right now.</p>
                        </div>
                    ) : (
                        claimableVouchers.map((voucher) => {
                            const normalizedCode = voucher.code.trim().toUpperCase()
                            const isClaiming = claimVoucherMutation.isPending && claimingCode === normalizedCode
                            const isExchange = (voucher.requiredCoin ?? 0) > 0
                            const canAfford = userCoins >= (voucher.requiredCoin ?? 0)

                            return (
                                <div
                                    key={voucher.userVoucherId}
                                    className="group relative flex flex-col overflow-hidden rounded-[24px] border border-slate-100 bg-white p-5 transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] hover:ring-1 hover:ring-primary-100"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 space-y-3">
                                            <div className="flex items-center gap-2">
                                                <div className="rounded-lg bg-slate-900 px-2 py-1 font-mono text-[10px] font-black tracking-wider text-white">
                                                    {voucher.code}
                                                </div>
                                                <Badge variant="outline" className="rounded-md border-slate-200 bg-slate-50 text-[9px] font-bold uppercase text-slate-500">
                                                    {voucher.voucherType}
                                                </Badge>
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-slate-900">{voucher.name}</h4>
                                                <p className="mt-1 line-clamp-1 text-[11px] font-medium text-slate-500">{voucher.description}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex flex-col items-end gap-2 text-right">
                                            <div className="flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-amber-700">
                                                <Coins className="h-3.5 w-3.5" />
                                                <span className="text-xs font-black">{voucher.requiredCoin?.toLocaleString() ?? 0}</span>
                                            </div>
                                            <p className="text-[10px] font-bold text-slate-400">EXP: {formatExpiryDate(voucher.endDate)}</p>
                                        </div>
                                    </div>

                                    <div className="mt-5 flex items-center justify-between gap-4 pt-4 border-t border-slate-50">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                                                <Sparkles className="h-3.5 w-3.5" />
                                                {(voucher.discountValue * 100).toFixed(0)}% OFF
                                            </div>
                                        </div>
                                        
                                        <Button
                                            size="sm"
                                            onClick={() => handleClaimVoucher(voucher)}
                                            disabled={claimVoucherMutation.isPending || (isExchange && !canAfford)}
                                            className={cn(
                                                "h-9 rounded-xl px-6 text-[10px] font-black uppercase tracking-widest text-white shadow-md transition-all duration-300",
                                                isExchange 
                                                    ? (canAfford 
                                                        ? "bg-amber-500 hover:bg-amber-600 shadow-amber-200" 
                                                        : "bg-slate-300 cursor-not-allowed")
                                                    : "bg-primary-600 hover:bg-primary-700 shadow-primary-200"
                                            )}
                                        >
                                            {isClaiming 
                                                ? (isExchange ? "Exchanging..." : "Claiming...") 
                                                : (isExchange 
                                                    ? (canAfford ? "Exchange" : "Not Enough Coins") 
                                                    : "Claim")}
                                        </Button>
                                    </div>
                                </div>
                            )
                        })
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

                        {!isLoading && (
                            <>
                                {isError || filteredVouchers.length === 0 ? (
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