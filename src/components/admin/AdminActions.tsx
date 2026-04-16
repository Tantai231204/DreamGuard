import { Button } from '@/components/ui/button';
import { Plus, Download, Upload, Filter } from 'lucide-react';
import AdminActionToolbar from './AdminActionToolbar';

interface AdminActionsProps {
  onAdd?: () => void;
  onExport?: () => void;
  onImport?: () => void;
  onFilter?: () => void;
  addLabel?: string;
  addStyle?: 'gradient' | 'flat';
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
  addStyle = 'gradient',
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
          className="gap-2 rounded-xl border-2 font-bold text-slate-500 shadow-sm hover:shadow-md border-slate-200 hover:border-[#4988c4] hover:text-[#4988c4] hover:bg-slate-50 transition-all"
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
          className="gap-2 rounded-xl border-2 font-medium shadow-sm hover:shadow-md border-slate-200 text-slate-700 hover:border-[#4988c4] hover:bg-[#4988c4] hover:text-white transition-all"
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
          className="gap-2 rounded-xl border-2 font-medium shadow-sm hover:shadow-md border-slate-200 text-slate-700 hover:border-[#4988c4] hover:bg-slate-50 transition-all"
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
          className={
            addStyle === 'flat'
              ? 'h-11 px-6 bg-[#4988c4] hover:bg-[#3a6fa0] text-white rounded-xl border-0 shadow-none transition-all active:scale-95 flex items-center gap-2'
              : 'gap-2 rounded-xl bg-[#4988c4] hover:bg-[#3a6fa0] text-white font-semibold transition-all hover:-translate-y-0.5 shadow-sm hover:shadow-md disabled:opacity-50 disabled:grayscale disabled:scale-100 disabled:cursor-not-allowed active:scale-95'
          }
        >
          <Plus className="h-4 w-4" />
          {addLabel}
        </Button>
      )}
    </AdminActionToolbar>
  );
}
