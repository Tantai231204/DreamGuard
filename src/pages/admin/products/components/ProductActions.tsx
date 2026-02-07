import { Button } from '@/components/ui/button';
import { Plus, Download, Upload, Filter } from 'lucide-react';
import AdminActionToolbar from '@/components/admin/AdminActionToolbar';

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
    <AdminActionToolbar>
      <Button
        variant="outline"
        size="sm"
        onClick={onFilter}
        className="gap-2 rounded-xl border-2 font-medium shadow-sm hover:shadow-md border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all"
      >
        <Filter className="h-4 w-4" />
        Filters
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onExport}
        className="gap-2 rounded-xl border-2 font-medium shadow-sm hover:shadow-md border-green-200 text-green-700 hover:border-green-500 hover:bg-green-500 hover:text-white transition-all"
      >
        <Download className="h-4 w-4" />
        Export
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onImport}
        className="gap-2 rounded-xl border-2 font-medium shadow-sm hover:shadow-md border-orange-200 text-orange-700 hover:border-orange-500 hover:bg-orange-500 hover:text-white transition-all"
      >
        <Upload className="h-4 w-4" />
        Import
      </Button>
      <Button
        size="sm"
        onClick={onAdd}
        className="gap-2 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-blue-600 hover:from-[var(--color-primary-hover)] hover:to-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
      >
        <Plus className="h-4 w-4" />
        {productType === 'single' ? 'Add Product' : 'Create Combo'}
      </Button>
    </AdminActionToolbar>
  );
}
