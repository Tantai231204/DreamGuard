import { motion } from "framer-motion";
import { Check, PartyPopper, CalendarDays, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice, formatDate } from "@/lib/utils";

import { type ProductType, type ServiceTier } from "../../useBookingData";

interface SuccessViewProps {
  items: Array<{ itemType: string; packageId: string; quantity: number }>;
  productTypes: ProductType[];
  total: number;
  discount: number;
  scheduledDate: string;
  scheduledTime: string;
  getProductTierPrice: (pid: string, tid: string) => number;
  onReset: () => void;
}

export default function SuccessView({
  items,
  productTypes,
  total,
  discount,
  scheduledDate,
  scheduledTime,
  getProductTierPrice,
  onReset
}: SuccessViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-lg mx-auto text-center py-12 space-y-8"
    >
      <div className="relative mx-auto w-24 h-24">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
          className="absolute inset-0 rounded-full bg-emerald-500 shadow-2xl shadow-emerald-500/30 flex items-center justify-center"
        >
          <Check className="h-12 w-12 text-white" strokeWidth={3} />
        </motion.div>
        <motion.div
          initial={{ scale: 0, opacity: 0.5 }}
          animate={{ scale: 2.5, opacity: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="absolute inset-0 rounded-full bg-emerald-400"
        />
      </div>

      <div className="space-y-2">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Booking Confirmed!</h2>
        <p className="text-sm text-slate-400 font-medium">Your appointment has been scheduled successfully.</p>
      </div>

      <div className="rounded-2xl border-2 border-slate-100 bg-white p-6 shadow-lg text-left space-y-4">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
          <PartyPopper className="h-3.5 w-3.5 text-[#4988c4]" />
          Booking Summary
        </div>

        <div className="space-y-2">
          {items.map((it, idx) => {
            const product = productTypes.find(p => p.id === it.itemType);
            const tier = product?.tiers.find((t: ServiceTier) => t.tierId === it.packageId);
            return (
              <div key={idx} className="flex justify-between text-sm">
                <span className="font-bold text-slate-700">{product?.label} — {tier?.name} (x{it.quantity})</span>
                <span className="font-black text-slate-900">{formatPrice(getProductTierPrice(it.itemType, it.packageId) * it.quantity)}</span>
              </div>
            );
          })}
        </div>

        <div className="border-t border-slate-100 pt-3 flex justify-between">
          <span className="font-black text-slate-900">Total Paid</span>
          <span className="text-xl font-black text-[#4988c4] tracking-tighter">{formatPrice(total - discount)}</span>
        </div>

        {scheduledDate && (
          <div className="flex items-center gap-3 pt-2 border-t border-slate-50">
            <CalendarDays className="h-4 w-4 text-[#4988c4]" />
            <span className="text-sm font-bold text-slate-600">
              {formatDate(scheduledDate)} at {scheduledTime}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400">
        <ShieldCheck className="h-3.5 w-3.5" /> Confirmation details sent to your contact information
      </div>

      <div className="flex justify-center gap-3">
        <Button
          type="button"
          onClick={onReset}
          className="h-11 px-6 rounded-xl bg-[#4988c4] hover:bg-[#3a73a8] text-white shadow-lg shadow-[#4988c4]/10 transition-all font-bold text-sm border-none"
        >
          Book Another Service
        </Button>
      </div>
    </motion.div>
  );
}
