import { AdminActions } from '@/components/admin';

interface StaffActionsProps {
  onAdd: () => void;
  onExport?: () => void;
  onImport?: () => void;
  onFilter?: () => void;
}

export function StaffActions({
  onAdd,
  onExport = () => console.log('Export'),
  onImport = () => console.log('Import'),
  onFilter = () => console.log('Filter'),
}: StaffActionsProps) {
  return (
    <AdminActions
      onFilter={onFilter}
      onExport={onExport}
      onImport={onImport}
      onAdd={onAdd}
      addLabel="Add Staff"
    />
  );
}
