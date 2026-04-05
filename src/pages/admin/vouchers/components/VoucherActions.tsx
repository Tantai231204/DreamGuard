import { AdminActions } from '@/components/admin';

interface VoucherActionsProps {
  onAdd: () => void;
  onExport: () => void;
  onImport: () => void;
  onFilter: () => void;
}

export default function VoucherActions({
  onAdd,
  onExport,
  onImport,
  onFilter,
}: VoucherActionsProps) {
  return (
    <div className="py-4 px-1">
      <AdminActions
        onFilter={onFilter}
        onExport={onExport}
        onImport={onImport}
        onAdd={onAdd}
        addLabel="Add Voucher"
      />
    </div>
  );
}
