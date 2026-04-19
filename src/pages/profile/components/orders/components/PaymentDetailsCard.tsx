import React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { AlertCircle, ChevronLeft, ChevronRight, CreditCard, ShieldCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { AdminStatusBadge } from "@/components/admin"
import { cn, formatDate, formatTime } from "@/lib/utils"
import { formatPrice } from "../../../utils"

export interface PaymentDetailsCardEntry {
    id?: string
    orderCode?: string
    paymentType?: string
    status?: string
    amount?: number
    paymentMethod?: string
    createdAt?: string
    description?: string
    evidenceUrl?: string | null
}

interface PaymentDetailsCardProps {
    payments?: PaymentDetailsCardEntry[]
    fallbackPayment?: PaymentDetailsCardEntry
    className?: string
}

export const PaymentDetailsCard = React.memo(({ payments, fallbackPayment, className }: PaymentDetailsCardProps) => {
    const [currentIndex, setCurrentIndex] = React.useState(0)
    const swipeStartXRef = React.useRef<number | null>(null)
    const swipeStartYRef = React.useRef<number | null>(null)

    const entries = React.useMemo(() => {
        if (payments && payments.length > 0) return payments
        return fallbackPayment ? [fallbackPayment] : []
    }, [payments, fallbackPayment])

    React.useEffect(() => {
        if (entries.length === 0) {
            setCurrentIndex(0)
            return
        }
        if (currentIndex > entries.length - 1) {
            setCurrentIndex(entries.length - 1)
        }
    }, [entries.length, currentIndex])

    const payment = entries[currentIndex]

    const handlePrev = React.useCallback(() => setCurrentIndex((prev) => Math.max(0, prev - 1)), [])
    const handleNext = React.useCallback(() => setCurrentIndex((prev) => Math.min(entries.length - 1, prev + 1)), [entries.length])

    const handleTouchStart = React.useCallback((event: React.TouchEvent<HTMLDivElement>) => {
        if (entries.length <= 1) return
        const touch = event.touches[0]
        swipeStartXRef.current = touch.clientX
        swipeStartYRef.current = touch.clientY
    }, [entries.length])

    const handleTouchEnd = React.useCallback((event: React.TouchEvent<HTMLDivElement>) => {
        if (entries.length <= 1) return
        if (swipeStartXRef.current === null || swipeStartYRef.current === null) return

        const endX = event.changedTouches[0].clientX
        const endY = event.changedTouches[0].clientY
        const deltaX = endX - swipeStartXRef.current
        const deltaY = endY - swipeStartYRef.current

        swipeStartXRef.current = null
        swipeStartYRef.current = null

        const swipeThreshold = 48
        if (Math.abs(deltaX) < swipeThreshold || Math.abs(deltaX) <= Math.abs(deltaY)) return

        if (deltaX < 0) {
            handleNext()
            return
        }

        handlePrev()
    }, [entries.length, handleNext, handlePrev])

    const rawMethod = payment?.paymentMethod || "COD"
    const normalizedStatus = String(payment?.status || "Pending").toLowerCase()
    const displayMethod = (rawMethod.toLowerCase() === "cod" && normalizedStatus === "paid")
        ? "CODPaid"
        : rawMethod

    return (
        <div className={cn(
            "rounded-xl sm:rounded-2xl border border-blue-100/50 bg-white shadow-sm overflow-hidden relative group",
            className
        )}>
            <div className="absolute top-0 right-0 w-28 h-28 bg-primary/5 rounded-full -mr-14 -mt-14 blur-2xl group-hover:bg-primary/10 transition-colors" />

            <div className="px-4 py-3 sm:px-5 sm:py-4 border-b border-blue-50 flex items-center justify-between bg-gradient-to-r from-blue-50/30 to-transparent relative z-10">
                <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-primary/10">
                        <ShieldCheck className="w-4 h-4 text-primary" />
                    </div>
                    <h4 className="text-[9px] sm:text-[10px] font-black text-slate-800 uppercase tracking-[0.2em]">
                        Financial Vault
                    </h4>
                </div>

                {entries.length > 1 ? (
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-white border-blue-100 text-[9px] font-black text-slate-400 uppercase tracking-widest px-2 py-0.5">
                            {currentIndex + 1} / {entries.length}
                        </Badge>
                        <div className="flex gap-1">
                            <button
                                type="button"
                                onClick={handlePrev}
                                disabled={currentIndex === 0}
                                className="p-1 rounded-md bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 transition-colors shadow-sm"
                            >
                                <ChevronLeft className="w-3 h-3" />
                            </button>
                            <button
                                type="button"
                                onClick={handleNext}
                                disabled={currentIndex === entries.length - 1}
                                className="p-1 rounded-md bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 transition-colors shadow-sm"
                            >
                                <ChevronRight className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                ) : (
                    <CreditCard className="w-4 h-4 text-slate-300" />
                )}
            </div>

            {entries.length === 0 ? (
                <div className="p-5 sm:p-6 flex flex-col items-center justify-center text-slate-400 min-h-[190px] sm:min-h-[220px] relative z-10">
                    <AlertCircle className="w-8 h-8 mb-2 opacity-20" />
                    <p className="text-[10px] uppercase font-black tracking-widest">No Payment Records</p>
                </div>
            ) : (
                <div
                    className="relative min-h-[198px] sm:min-h-[220px] overflow-hidden touch-pan-y"
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`${payment?.id || payment?.orderCode || "payment"}-${currentIndex}`}
                            initial={{ opacity: 0, x: 12 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -12 }}
                            transition={{ duration: 0.2 }}
                            className="p-4 sm:p-5 h-full flex flex-col absolute inset-0 z-10"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-4 sm:mb-5 gap-3">
                                <div className="flex flex-wrap items-center gap-3 sm:gap-5">
                                    <div className="flex flex-col items-start min-w-[82px]">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Settlement</span>
                                        <AdminStatusBadge
                                            status={displayMethod}
                                            mode="method"
                                            className="scale-[0.86] sm:scale-90 origin-left"
                                        />
                                    </div>
                                    <div className="flex flex-col items-start min-w-[82px]">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Type</span>
                                        <AdminStatusBadge
                                            status={payment?.paymentType || "Purchase"}
                                            className="scale-[0.86] sm:scale-90 origin-left"
                                        />
                                    </div>
                                </div>

                                <div className="self-start sm:self-auto">
                                    <AdminStatusBadge
                                        status={payment?.status || "Pending"}
                                        mode="payment"
                                        className="scale-[0.86] sm:scale-90 origin-left sm:origin-right"
                                    />
                                </div>
                            </div>

                            {/* Payment Description - User Verification Data */}
                            <div className="mb-4 sm:mb-5 space-y-1 p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Payment Ledger Note</span>
                                <p className="text-[10px] font-bold text-slate-600 leading-relaxed italic truncate sm:whitespace-normal">
                                    {payment?.description || 'N/A: Regular Settlement'}
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-4 sm:mb-5 gap-3">
                                <div className="space-y-1 flex-1">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Transaction Ref</p>
                                    <div className="max-w-[180px] sm:max-w-none truncate font-mono text-[10px] font-bold text-slate-600 bg-slate-50 px-2 py-1 rounded border border-slate-100/60 inline-block">
                                        {(payment?.id || payment?.orderCode || "REF-PENDING").toUpperCase()}
                                    </div>
                                </div>
                                <div className="space-y-1 sm:text-right flex-1">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Timestamp</p>
                                    <p className="text-[10px] font-bold text-slate-700">
                                        {payment?.createdAt ? `${formatDate(payment.createdAt)} ${formatTime(payment.createdAt)}` : "--/--/---- --:--"}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-auto flex items-end justify-between gap-3 border-t border-slate-100/80 pt-3 sm:pt-2">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Authorized Gross</span>
                                    <span className="text-[8px] font-bold text-slate-300 uppercase italic">Immutable Ledger Record</span>
                                </div>
                                <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tighter tabular-nums">
                                    {formatPrice(payment?.amount || 0)}
                                </span>
                            </div>

                            {normalizedStatus === "failed" && (
                                <div className="mt-3 p-2.5 rounded-xl bg-rose-50 border border-rose-100 flex gap-2.5 items-start text-rose-600 animate-in fade-in slide-in-from-bottom-2">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                    <p className="text-[9px] font-black leading-normal uppercase tracking-tight">
                                        Transaction Rejection Detected. Immediate Review Recommended.
                                    </p>
                                </div>
                            )}

                            {/* Payment Evidence - Visual Confirmation */}
                            {payment?.evidenceUrl && (
                                <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-2.5">
                                    <div className="flex items-center justify-between px-1">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Submitted Evidence</span>
                                        <a 
                                            href={payment.evidenceUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-[9px] font-bold text-primary hover:underline"
                                        >
                                            View Original
                                        </a>
                                    </div>
                                    <div className="relative aspect-[16/6] rounded-xl overflow-hidden border border-slate-200 bg-slate-50 group/evidence shadow-sm">
                                        <img 
                                            src={payment.evidenceUrl} 
                                            alt="Payment Evidence" 
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover/evidence:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover/evidence:opacity-100 transition-opacity" />
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {entries.length > 1 && (
                        <div className="absolute inset-x-0 bottom-2 z-20 flex items-center justify-center gap-1 sm:hidden pointer-events-none">
                            {entries.map((entry, index) => (
                                <span
                                    key={`${entry.id || entry.orderCode || index}`}
                                    className={cn(
                                        "h-1.5 rounded-full transition-all duration-200",
                                        index === currentIndex ? "w-4 bg-primary/80" : "w-1.5 bg-slate-300"
                                    )}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
})

PaymentDetailsCard.displayName = 'PaymentDetailsCard'
