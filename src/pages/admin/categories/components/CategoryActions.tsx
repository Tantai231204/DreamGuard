import { AdminActions } from '@/components/admin';

interface CategoryActionsProps {
  onAdd: () => void;
  onExport: () => void;
  onImport: () => void;
  onFilter: () => void;
}

export default function CategoryActions({
  onAdd,
  onExport,
  onImport,
  onFilter,
}: CategoryActionsProps) {
  return (
    <AdminActions
      onFilter={onFilter}
      onExport={onExport}
      onImport={onImport}
      onAdd={onAdd}
      addLabel="Add Category"
    />
  );
}
