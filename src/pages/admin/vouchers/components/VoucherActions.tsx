import { AdminActions } from '@/components/admin';

interface VoucherActionsProps {
  onAdd: () => void;
  onExport: () => void;
  onImport: () => void;
}

export default function VoucherActions({
  onAdd,
  onExport,
  onImport,
}: VoucherActionsProps) {
  return (
    <div className="border-b border-slate-100 px-6 py-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Voucher Operations</p>
        </div>
      </div>

      <AdminActions
        onExport={onExport}
        onImport={onImport}
        onAdd={onAdd}
        addLabel="Add Campaign"
        addStyle="flat"
        showFilter={false}
      />
    </div>
  );
}
