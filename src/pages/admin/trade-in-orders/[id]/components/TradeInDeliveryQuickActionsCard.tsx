import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  Package,
  RotateCcw,
  ShieldCheck,
  Truck,
  XCircle,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface TradeInDeliveryQuickActionsCardProps {
  status: string;
  hasTask: boolean;
  canHandleUnhappyCase: boolean;
  onOpenCancelDialog: () => void;
  delay?: number;
}

const CLOSED_STATUSES = new Set([
  "COMPLETED",
  "CANCELLED",
  "FORCED_CANCELLED",
  "REFUNDED_AND_RESTOCKED",
  "REFUNDED_AND_DAMAGED",
]);

export function TradeInDeliveryQuickActionsCard({
  status,
  hasTask,
  canHandleUnhappyCase,
  onOpenCancelDialog,
  delay = 0,
}: TradeInDeliveryQuickActionsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className="border border-blue-100 bg-white rounded-xl shadow-sm overflow-hidden relative">
        <div className="px-5 py-3 border-b border-blue-50 flex items-center justify-between bg-blue-50/30">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Shipping Orchestrator
            </h2>
          </div>
          <Zap className="w-3.5 h-3.5 text-amber-400" />
        </div>

        <div className="p-6 space-y-4">
          {status === "CONFIRMED" && (
            <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl flex items-start gap-3">
              <Truck className="w-4 h-4 text-blue-500 shrink-0 mt-0.5 animate-pulse" />
              <p className="text-[9px] font-bold text-blue-600 uppercase tracking-[0.15em] leading-relaxed">
                {hasTask
                  ? "Delivery task assigned. Delivery staff updates this flow on mobile."
                  : "Awaiting logistics assignment to begin delivery workflow."}
              </p>
            </div>
          )}

          {(status === "PROCESSING" || status === "DELIVERING" || status === "ARRIVED") && (
            <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl flex items-start gap-3">
              <Clock className="w-4 h-4 text-blue-500 shrink-0 mt-0.5 animate-pulse" />
              <p className="text-[9px] font-bold text-blue-600 uppercase tracking-[0.15em] leading-relaxed">
                In transit. Delivery staff is updating tracking status in real-time from mobile app.
              </p>
            </div>
          )}

          {status === "DELIVERED" && (
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-[0.15em] leading-relaxed">
                Delivered successfully. Awaiting staff to finalize on mobile.
              </p>
            </div>
          )}

          {status === "RETURNING" && (
            <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-xl flex items-start gap-3">
              <Package className="w-4 h-4 text-amber-500 shrink-0 mt-0.5 animate-pulse" />
              <p className="text-[9px] font-bold text-amber-600 uppercase tracking-[0.15em] leading-relaxed">
                Currently in Returning phase. Delivery staff is processing the return/exchange on mobile.
              </p>
            </div>
          )}

          {status === "EXCHANGE_REQUESTED" && (
            <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-xl flex items-start gap-3">
              <RotateCcw className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-[9px] font-bold text-blue-700 uppercase tracking-[0.15em] leading-relaxed">
                Exchange request has been approved. Replacement dispatch is being prepared.
              </p>
            </div>
          )}

          {status === "SHIPPING_REPLACEMENT" && (
            <div className="p-4 bg-sky-50/70 border border-sky-100 rounded-xl flex items-start gap-3">
              <Truck className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
              <p className="text-[9px] font-bold text-sky-700 uppercase tracking-[0.15em] leading-relaxed">
                Replacement task created and awaiting next delivery cycle from mobile staff.
              </p>
            </div>
          )}

          {status === "COMPLETED" && (
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-[0.15em] leading-relaxed">
                Trade-in finalized. COD has been settled and this case is closed.
              </p>
            </div>
          )}

          {(status === "REFUNDED_AND_RESTOCKED" || status === "REFUNDED_AND_DAMAGED") && (
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.15em] leading-relaxed">
                Case closed. Refund processed and inventory handling completed.
              </p>
            </div>
          )}

          {(status === "CANCELLED" || status === "FORCED_CANCELLED") && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3">
              <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <p className="text-[9px] font-bold text-rose-600 uppercase tracking-[0.25em] leading-relaxed">
                This trade-in workflow has been terminated and archived.
              </p>
            </div>
          )}

          {canHandleUnhappyCase && !CLOSED_STATUSES.has(status) && status !== "RETURNING" && (
            <Button
              onClick={onOpenCancelDialog}
              variant="outline"
              className="w-full justify-center gap-2 rounded-xl border-slate-100 bg-slate-50/50 text-rose-400 hover:text-rose-500 hover:bg-rose-50 hover:border-rose-100 h-11 text-[10px] font-black uppercase tracking-widest transition-all px-0"
            >
              <XCircle className="h-4 w-4" />
              Cancel Dispatch
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
