import { useState } from 'react';
import { useUpdateCertificateStatus } from '@/hooks/queries/useCertificate';
import { Loader2 } from 'lucide-react';
import type { Certificate } from '../../types';
import { cn } from '@/lib/utils';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

export const CertificateStatusCell = ({ cert }: { cert: Certificate }) => {
  const [open, setOpen] = useState(false);
  const { mutateAsync: updateStatus, isPending } = useUpdateCertificateStatus();

  const handleConfirm = async () => {
    try {
      await updateStatus({ id: cert.id, isActive: !cert.isActive });
    } finally {
      setOpen(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={cert.isActive ? "Archived Certificate?" : "Activate Certificate?"}
        description={
          cert.isActive
            ? `You are about to deactivate "**${cert.name}**". Products relying on this certificate may lose their compliance badges publicly.`
            : `You are about to activate "**${cert.name}**". It will become available to be assigned to your products.`
        }
        confirmText={cert.isActive ? "Deactivate" : "Activate"}
        cancelText="Cancel"
        onConfirm={handleConfirm}
        variant={cert.isActive ? "danger" : "success"}
        isLoading={isPending}
      />

      <button
        disabled={isPending}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        className={cn(
          "group flex items-center justify-center gap-1.5 min-w-[90px] px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wide uppercase transition-all outline-none",
          "border border-slate-200/60 shadow-sm focus-visible:ring-2 focus-visible:ring-primary-500/30",
          cert.isActive
            ? "bg-emerald-50/80 text-emerald-600 hover:bg-emerald-100/60 border-emerald-200/50"
            : "bg-slate-50 text-slate-500 hover:bg-slate-100 border-slate-200/60",
          isPending && "opacity-50 pointer-events-none"
        )}
      >
        {isPending ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <span className={cn(
            "w-1.5 h-1.5 rounded-full transition-colors",
            cert.isActive ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" : "bg-slate-400"
          )} />
        )}
        {cert.isActive ? 'Active' : 'Archived'}
      </button>
    </div>
  );
};
