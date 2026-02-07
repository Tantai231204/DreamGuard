import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Trash2, Edit, Copy, X, Package } from 'lucide-react';
import type { Table } from '@tanstack/react-table';

interface BulkActionsToolbarProps<T> {
  table: Table<T>;
  productType: 'single' | 'combo';
}

export default function BulkActionsToolbar<T>({ 
  table,
  productType 
}: BulkActionsToolbarProps<T>) {
  const selectedCount = table.getFilteredSelectedRowModel().rows.length;
  const isVisible = selectedCount > 0;

  const handleClearSelection = () => {
    table.resetRowSelection();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className={`px-6 py-5 border-b-2 shadow-sm ${
            productType === 'single' 
              ? 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200' 
              : 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-3 px-5 py-2.5 rounded-xl border-2 shadow-md ${
                productType === 'single'
                  ? 'bg-white border-[var(--color-primary)] text-[var(--color-primary)]'
                  : 'bg-white border-purple-500 text-purple-600'
              }`}>
                <Package className="h-5 w-5" />
                <span className="font-black text-xl">{selectedCount}</span>
                <div className="h-6 w-px bg-gray-300"></div>
                <span className="text-sm font-semibold">
                  {productType === 'single' ? 'product' : 'combo'}{selectedCount !== 1 ? 's' : ''} selected
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <Button
                  size="sm"
                  variant="outline"
                  className={`gap-2 rounded-xl border-2 font-semibold shadow-sm transition-all ${
                    productType === 'single'
                      ? 'hover:bg-blue-500 hover:border-blue-500 hover:text-white hover:shadow-md'
                      : 'hover:bg-purple-500 hover:border-purple-500 hover:text-white hover:shadow-md'
                  }`}
                  onClick={() => console.log('Edit selected')}
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2 rounded-xl border-2 font-semibold shadow-sm hover:bg-gray-700 hover:border-gray-700 hover:text-white hover:shadow-md transition-all"
                  onClick={() => console.log('Duplicate selected')}
                >
                  <Copy className="h-4 w-4" />
                  Duplicate
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2 rounded-xl border-2 border-red-200 text-red-600 font-semibold shadow-sm hover:bg-red-600 hover:border-red-600 hover:text-white hover:shadow-md transition-all"
                  onClick={() => console.log('Delete selected')}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
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
