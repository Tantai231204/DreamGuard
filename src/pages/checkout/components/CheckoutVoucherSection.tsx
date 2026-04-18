import { useEffect, useMemo } from "react"
import type { UseFormReturn } from "react-hook-form"
import { RefreshCcw, Tag, TicketPercent, WalletCards } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useUserVouchers } from "@/hooks/queries"
import { formatPrice } from "@/lib/utils"
import { useAuthStore } from "@/store/authStore"
import {
  calculateVoucherDiscount,
  getVoucherDiscountRatio,
  isUserVoucherUsable,
} from "@/utils/user-voucher"
import type { CheckoutFormData } from "../schema"

interface CheckoutVoucherSectionProps {
  form: UseFormReturn<CheckoutFormData>
  subtotal: number
  onPricingChange?: (pricing: {
    voucherDiscount: number
    payableTotal: number
    selectedVoucherId: string | null
    selectedVoucherCode: string | null
  }) => void
}

const EMPTY_VALUE = "__none__"

export function CheckoutVoucherSection({ form, subtotal, onPricingChange }: CheckoutVoucherSectionProps) {
  const { watch, setValue } = form
  const selectedVoucherId = watch("userVoucherId") ?? null

  const { isAuthenticated } = useAuthStore()
  const {
    data: voucherPage,
    isLoading,
    isError,
    refetch,
  } = useUserVouchers(isAuthenticated)

  const allVouchers = voucherPage?.items ?? []

  const availableVouchers = useMemo(
    () => allVouchers.filter((voucher) => isUserVoucherUsable(voucher, "order")),
    [allVouchers]
  )

  const selectedVoucher = useMemo(
    () => availableVouchers.find((voucher) => voucher.userVoucherId === selectedVoucherId) ?? null,
    [availableVouchers, selectedVoucherId]
  )

  useEffect(() => {
    if (!selectedVoucherId || isLoading || isError) return

    const stillAvailable = availableVouchers.some(
      (voucher) => voucher.userVoucherId === selectedVoucherId
    )

    if (!stillAvailable) {
      setValue("userVoucherId", null, { shouldDirty: true, shouldValidate: true })
    }
  }, [availableVouchers, isError, isLoading, selectedVoucherId, setValue])

  useEffect(() => {
    if (isAuthenticated) return
    if (!selectedVoucherId) return

    setValue("userVoucherId", null, { shouldDirty: true, shouldValidate: true })
  }, [isAuthenticated, selectedVoucherId, setValue])

  const estimatedDiscount = selectedVoucher
    ? calculateVoucherDiscount(subtotal, selectedVoucher)
    : 0

  const estimatedTotal = Math.max(0, subtotal - estimatedDiscount)

  useEffect(() => {
    onPricingChange?.({
      voucherDiscount: estimatedDiscount,
      payableTotal: estimatedTotal,
      selectedVoucherId: selectedVoucher?.userVoucherId ?? null,
      selectedVoucherCode: selectedVoucher?.code ?? null,
    })
  }, [estimatedDiscount, estimatedTotal, onPricingChange, selectedVoucher])

  return (
    <section className="rounded-[2rem] border border-slate-100 bg-white p-8 shadow-xl shadow-slate-200/20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 pb-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary-500/20 bg-primary-500/10 px-3 py-1 text-primary-500">
            <TicketPercent className="h-3.5 w-3.5" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em]">Voucher</span>
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">Voucher & Discounts</h3>
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
            Apply voucher and sync totals instantly
          </p>
        </div>

        {!isAuthenticated && (
          <div className="inline-flex items-center gap-2 rounded-xl border border-amber-100 bg-amber-50/70 px-3 py-2 text-amber-700">
            <WalletCards className="h-3.5 w-3.5" />
            <span className="text-[10px] font-black uppercase tracking-widest">Login to use vouchers</span>
          </div>
        )}
      </div>

      {!isAuthenticated && (
        <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/50 px-4 py-3 text-sm font-medium text-slate-500">
          Sign in to view your claimed vouchers and apply them to this order.
        </div>
      )}

      {isAuthenticated && (
        <div className="mt-6 space-y-4">
          {isLoading && (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-20 w-full rounded-2xl" />
            </div>
          )}

          {!isLoading && isError && (
            <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-4">
              <p className="text-sm font-bold text-rose-600">Unable to load vouchers right now.</p>
              <Button
                type="button"
                variant="outline"
                onClick={() => refetch()}
                className="mt-3 h-9 rounded-xl border-rose-200 bg-white text-rose-600 hover:bg-rose-50"
              >
                <RefreshCcw className="mr-2 h-3.5 w-3.5" />
                Retry
              </Button>
            </div>
          )}

          {!isLoading && !isError && (
            <>
              <div className="space-y-2" id="userVoucherId">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                  Available Vouchers
                </p>
                <Select
                  value={selectedVoucherId ?? EMPTY_VALUE}
                  onValueChange={(value) => {
                    setValue("userVoucherId", value === EMPTY_VALUE ? null : value, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }}
                  disabled={availableVouchers.length === 0}
                >
                  <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-white text-left font-bold">
                    <SelectValue placeholder="Choose a voucher" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100">
                    <SelectItem value={EMPTY_VALUE} className="rounded-lg">
                      No voucher
                    </SelectItem>
                    {availableVouchers.map((voucher) => {
                      const percent = Math.round(getVoucherDiscountRatio(voucher) * 100)
                      const capText =
                        voucher.maxDiscountAmount > 0
                          ? ` - cap ${formatPrice(voucher.maxDiscountAmount)}`
                          : ""

                      return (
                        <SelectItem key={voucher.userVoucherId} value={voucher.userVoucherId} className="rounded-lg">
                          {voucher.code} - {percent}% OFF{capText}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              {availableVouchers.length === 0 && (
                <div className="rounded-2xl border border-slate-100 bg-slate-50/50 px-4 py-3 text-sm font-medium text-slate-500">
                  You do not have an active order voucher at the moment.
                </div>
              )}

              {selectedVoucher && (
                <div className="rounded-2xl border border-primary-500/15 bg-primary-500/5 p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-500/10">
                        <Tag className="h-4 w-4 text-primary-500" />
                      </span>
                      <div>
                        <p className="text-sm font-black tracking-tight text-slate-900">{selectedVoucher.code}</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                          {selectedVoucher.name}
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-primary-500 border border-primary-500/20">
                      {Math.round(getVoucherDiscountRatio(selectedVoucher) * 100)}% OFF
                    </span>
                  </div>

                  <div className="grid gap-2 rounded-xl border border-white/80 bg-white/80 p-3 text-sm font-bold text-slate-600 sm:grid-cols-2">
                    <div className="flex items-center justify-between sm:block">
                      <p className="text-[10px] uppercase tracking-widest text-slate-400">Estimated Discount</p>
                      <p className="text-emerald-600">-{formatPrice(estimatedDiscount)}</p>
                    </div>
                    <div className="flex items-center justify-between sm:block sm:text-right">
                      <p className="text-[10px] uppercase tracking-widest text-slate-400">Estimated Total</p>
                      <p className="text-primary-500">{formatPrice(estimatedTotal)}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3">
                  Checkout Pricing
                </p>
                <div className="space-y-2 text-sm font-bold text-slate-600">
                  <div className="flex items-center justify-between">
                    <span>Subtotal</span>
                    <span className="text-slate-900">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Voucher Discount</span>
                    <span className={estimatedDiscount > 0 ? "text-emerald-600" : "text-slate-400"}>
                      -{formatPrice(estimatedDiscount)}
                    </span>
                  </div>
                  <div className="h-px bg-slate-200" />
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] uppercase tracking-wider text-slate-500">Payable</span>
                    <span className="text-base text-primary-500">{formatPrice(estimatedTotal)}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </section>
  )
}
