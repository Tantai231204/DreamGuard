import { AdminActions } from '@/components/admin';

interface ProductActionsProps {
  productType: 'single' | 'combo';
  onAdd: () => void;
  onExport: () => void;
  onImport: () => void;
  onFilter: () => void;
}

export default function ProductActions({
  productType,
  onAdd,
  onExport,
  onImport,
  onFilter,
}: ProductActionsProps) {
  return (
    <AdminActions
      onFilter={onFilter}
      onExport={onExport}
      onImport={onImport}
      onAdd={onAdd}
      addLabel={productType === 'single' ? 'Add Product' : 'Create Combo'}
    />
  );
}
