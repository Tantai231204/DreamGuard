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
    <AdminActions
      onFilter={onFilter}
      onExport={onExport}
      onImport={onImport}
      onAdd={onAdd}
      addLabel="Add Voucher"
    />
  );
}
