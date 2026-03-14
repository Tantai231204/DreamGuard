import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Trash2, Edit, Copy, X, Package } from 'lucide-react';
import type { Table } from '@tanstack/react-table';

interface AdminBulkActionsProps<T> {
  table: Table<T>;
  itemLabel?: string;
  accentColor?: 'blue' | 'black';
  onEdit?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
}

export function AdminBulkActions<T>({
  table,
  itemLabel = 'item',
  accentColor = 'blue',
  onEdit,
  onDuplicate,
  onDelete,
}: AdminBulkActionsProps<T>) {
  const selectedCount = table.getFilteredSelectedRowModel().rows.length;
  const isVisible = selectedCount > 0;

  const handleClearSelection = () => {
    table.resetRowSelection();
  };

  const isBlue = accentColor === 'blue';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className={`px-6 py-5 border-b-2 shadow-sm ${isBlue
            ? 'bg-gradient-to-r from-primary-50 to-white border-primary-100'
            : 'bg-gradient-to-r from-slate-50 to-white border-slate-200'
            }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`flex items-center gap-3 px-5 py-2.5 rounded-xl border-2 shadow-sm ${isBlue
                  ? 'bg-white border-primary-500 text-primary-600'
                  : 'bg-white border-slate-900 text-slate-900'
                  }`}
              >
                <Package className="h-5 w-5" />
                <span className="font-black text-xl">{selectedCount}</span>
                <div className="h-6 w-px bg-gray-200"></div>
                <span className="text-sm font-semibold">
                  {itemLabel}{selectedCount !== 1 ? 's' : ''} selected
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                {onEdit && (
                  <Button
                    size="sm"
                    variant="outline"
                    className={`gap-2 rounded-xl border-2 font-semibold shadow-sm transition-all ${isBlue
                      ? 'hover:bg-primary-600 hover:border-primary-600 hover:text-white hover:shadow-md'
                      : 'hover:bg-slate-900 hover:border-slate-900 hover:text-white hover:shadow-md'
                      }`}
                    onClick={onEdit}
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                )}

                {onDuplicate && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2 rounded-xl border-2 font-semibold shadow-sm hover:bg-gray-700 hover:border-gray-700 hover:text-white hover:shadow-md transition-all"
                    onClick={onDuplicate}
                  >
                    <Copy className="h-4 w-4" />
                    Duplicate
                  </Button>
                )}

                {onDelete && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2 rounded-xl border-2 border-red-200 text-red-600 font-semibold shadow-sm hover:bg-red-600 hover:border-red-600 hover:text-white hover:shadow-md transition-all"
                    onClick={onDelete}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                )}
              </div>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={handleClearSelection}
              className="gap-2 rounded-xl border-2 border-gray-300 font-medium hover:bg-gray-100 hover:border-gray-400 transition-all"
            >
              <X className="h-4 w-4" />
              Clear
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
