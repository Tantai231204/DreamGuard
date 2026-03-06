import { AdminBulkActions } from '@/components/admin';
import type { Table } from '@tanstack/react-table';

interface BulkActionsToolbarProps<T> {
  table: Table<T>;
  productType: 'single' | 'combo';
}

export default function BulkActionsToolbar<T>({
  table,
  productType
}: BulkActionsToolbarProps<T>) {
  return (
    <AdminBulkActions
      table={table}
      itemLabel={productType === 'single' ? 'product' : 'combo'}
      accentColor={productType === 'single' ? 'blue' : 'purple'}
      onEdit={() => console.log('Edit selected')}
      onDuplicate={() => console.log('Duplicate selected')}
      onDelete={() => console.log('Delete selected')}
    />
  );
}
