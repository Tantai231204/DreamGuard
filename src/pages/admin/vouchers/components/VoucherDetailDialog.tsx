import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AdminStatusBadge } from '@/components/admin';
import { CalendarRange, Coins, Tag, TicketPercent } from 'lucide-react';
import type { Voucher } from '../types';
import { formatDate, formatPrice } from '@/lib/utils';

interface VoucherDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  voucher: Voucher | null;
  onEdit?: (voucher: Voucher) => void;
}

export default function VoucherDetailDialog({
  open,
  onOpenChange,
  voucher,
  onEdit,
}: VoucherDetailDialogProps) {
  if (!voucher) return null;

  const discountPercent = Math.max(0, voucher.discountValue || 0) * 100;
  const discountDisplay = Number.isInteger(discountPercent)
    ? discountPercent.toFixed(0)
    : discountPercent.toFixed(2);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden border-none rounded-3xl shadow-2xl">
        <DialogHeader className="px-8 pt-8 pb-6 border-b bg-white">
          <div className="flex items-center justify-between gap-4">
            <div>
              <DialogTitle className="text-xl font-black tracking-tight text-slate-900">
                Voucher Detail
              </DialogTitle>
              <p className="text-xs font-semibold text-slate-500 mt-1">
                Review voucher configuration before editing.
              </p>
            </div>
            <Badge className="bg-blue-50 text-blue-700 border border-blue-100 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider">
              {voucher.voucherType}
            </Badge>
          </div>
        </DialogHeader>

        <div className="px-8 py-7 space-y-6 bg-slate-50/50">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoCard icon={Tag} label="Code" value={voucher.code} />
            <InfoCard icon={Tag} label="Name" value={voucher.name} />
            <InfoCard icon={TicketPercent} label="Discount" value={`${discountDisplay}%`} />
            <InfoCard icon={Coins} label="Required Coin" value={voucher.requiredCoin.toString()} />
            <InfoCard icon={TicketPercent} label="Max Discount Amount" value={formatPrice(voucher.maxDiscountAmount)} />
            <div className="rounded-2xl bg-white border border-slate-200 p-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Status</p>
              <AdminStatusBadge status={voucher.isActive ? 'Active' : 'Inactive'} />
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
              <CalendarRange className="h-4 w-4 text-slate-500" />
              Valid Period
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Start Date</p>
                <p className="font-semibold text-slate-700">{formatDate(voucher.startDate)}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">End Date</p>
                <p className="font-semibold text-slate-700">{formatDate(voucher.endDate)}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 p-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Description</p>
            <p className="text-sm text-slate-700 leading-relaxed">
              {voucher.description || 'No description provided.'}
            </p>
          </div>
        </div>

        <div className="px-8 py-5 border-t bg-white flex items-center justify-end gap-3">
          <Button variant="outline" className="h-11 rounded-xl border-gray-200 hover:border-gray-300 hover:bg-gray-50 font-medium transition-all" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button
            className="h-11 rounded-xl font-medium transition-all text-white bg-[#4988c4] hover:bg-[#3a6fa0] shadow-sm disabled:opacity-50 disabled:shadow-none"
            onClick={() => onEdit?.(voucher)}
          >
            Edit Voucher
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface InfoCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}

function InfoCard({ icon: Icon, label, value }: InfoCardProps) {
  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-4">
      <div className="flex items-center gap-2 mb-2 text-slate-500">
        <Icon className="h-4 w-4" />
        <p className="text-[10px] font-bold uppercase tracking-wider">{label}</p>
      </div>
      <p className="text-sm font-semibold text-slate-800 break-words">{value}</p>
    </div>
  );
}
