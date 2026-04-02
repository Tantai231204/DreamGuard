import { Button } from '@/components/ui/button';
import { Plus, Download, Upload, Filter } from 'lucide-react';
import AdminActionToolbar from './AdminActionToolbar';

interface AdminActionsProps {
  onAdd?: () => void;
  onExport?: () => void;
  onImport?: () => void;
  onFilter?: () => void;
  addLabel?: string;
  showFilter?: boolean;
  showExport?: boolean;
  showImport?: boolean;
  addDisabled?: boolean;
}

export function AdminActions({
  onAdd,
  onExport,
  onImport,
  onFilter,
  addLabel = 'Add New',
  showFilter = true,
  showExport = true,
  showImport = true,
  addDisabled = false,
}: AdminActionsProps) {
  return (
    <AdminActionToolbar>
      {showFilter && onFilter && (
        <Button
          variant="outline"
          size="sm"
          onClick={onFilter}
          className="gap-2 rounded-xl border-2 font-medium shadow-sm hover:shadow-md border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all"
        >
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      )}
      {showExport && onExport && (
        <Button
          variant="outline"
          size="sm"
          onClick={onExport}
          className="gap-2 rounded-xl border-2 font-medium shadow-sm hover:shadow-md border-green-200 text-green-700 hover:border-green-500 hover:bg-green-500 hover:text-white transition-all"
        >
          <Download className="h-4 w-4" />
          Export
        </Button>
      )}
      {showImport && onImport && (
        <Button
          variant="outline"
          size="sm"
          onClick={onImport}
          className="gap-2 rounded-xl border-2 font-medium shadow-sm hover:shadow-md border-orange-200 text-orange-700 hover:border-orange-500 hover:bg-orange-500 hover:text-white transition-all"
        >
          <Upload className="h-4 w-4" />
          Import
        </Button>
      )}
      {onAdd && (
        <Button
          size="sm"
          onClick={onAdd}
          disabled={addDisabled}
          className="gap-2 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-blue-600 hover:from-[var(--color-primary-hover)] hover:to-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:grayscale disabled:scale-100 disabled:cursor-not-allowed"
        >
          <Plus className="h-4 w-4" />
          {addLabel}
        </Button>
      )}
    </AdminActionToolbar>
  );
}
