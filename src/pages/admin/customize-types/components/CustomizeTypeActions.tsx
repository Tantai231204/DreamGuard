// src/pages/admin/customize-types/components/CustomizeTypeActions.tsx
import { AdminActions } from '@/components/admin';

interface CustomizeTypeActionsProps {
  onAdd: () => void;
  onExport: () => void;
  onImport: () => void;
  onFilter: () => void;
}

export default function CustomizeTypeActions({
  onAdd,
  onExport,
  onImport,
  onFilter,
}: CustomizeTypeActionsProps) {
  return (
    <AdminActions
      onFilter={onFilter}
      onExport={onExport}
      onImport={onImport}
      onAdd={onAdd}
      addLabel="Add Customize Type"
    />
  );
}
