import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Layers,
  Plus,
  Minus,
  MoreVertical,
  Edit,
  Trash2,
  Loader2,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Package2,
} from 'lucide-react';
import type { AdminColorGroup, AdminVariantItem } from '@/api/services/variantService';
import { useAdminProductVariants } from '@/hooks/queries/useProduct';
import { useStockAdjustment } from './useStockAdjustment';
import StockAdjustmentDialog from './StockAdjustmentDialog';

/* ─── Stock Status Config ───────────────────────────────── */
const stockStatusConfig: Record<string, { label: string; className: string }> = {
  'In Stock': { label: 'In Stock', className: 'bg-green-50 text-green-700 border-green-200' },
  'Low Stock': { label: 'Low Stock', className: 'bg-orange-50 text-orange-600 border-orange-200' },
  'Out of Stock': { label: 'Out of Stock', className: 'bg-red-50 text-red-600 border-red-200' },
};

/* ─── Color Helpers ────────────────────────────────────── */
const colorMap: Record<string, string> = {
  white: '#f5f5f5',
  pink: '#ffc0cb',
  blue: '#add8e6',
  red: '#ff6b6b',
  green: '#90ee90',
  yellow: '#ffeb3b',
  orange: '#ffa500',
  purple: '#dda0dd',
  black: '#333333',
  gray: '#9e9e9e',
  grey: '#9e9e9e',
  brown: '#a0522d',
  beige: '#f5f5dc', mint: '#98ff98', unknown: '#e5e7eb',
  default: '#e5e7eb',
};

function getColorHex(colorValue: string | undefined): string {
  if (!colorValue) return '#e5e7eb';
  if (colorValue.startsWith('#')) return colorValue;
  const normalized = colorValue.toLowerCase().trim();
  return colorMap[normalized] || '#e5e7eb';
}

/* ─── Types ────────────────────────────────────────────── */
interface VariantTableProps {
  productId: string;
  productName: string;
  onAddVariant: () => void;
  onEditVariant: (variantId: string) => void;
  onDeleteVariant: (variantId: string) => void;
}

/* ─── Component ────────────────────────────────────────── */
export default function VariantTable({
  productId,
  productName,
  onAddVariant,
  onEditVariant,
  onDeleteVariant,
}: VariantTableProps) {
  const { data, isLoading } = useAdminProductVariants(productId);
  const {
    stockDialog,
    stockQuantity,
    setStockQuantity,
    openDialog,
    closeDialog,
    submitStockAdjustment,
    isSubmitting,
  } = useStockAdjustment();

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => new Set());

  const colorGroups = useMemo(() => data?.colorGroups ?? [], [data?.colorGroups]);
  const totalVariants = data?.totalVariants ?? 0;

  // Memoized stock stats
  const stockStats = useMemo(() => {
    return colorGroups.reduce(
      (acc, group) => {
        group.variants.forEach((v) => {
          acc.total += v.stockQuantity ?? 0;
          if (v.stockStatus === 'In Stock') acc.inStock++;
          else if (v.stockStatus === 'Low Stock') acc.lowStock++;
          else acc.outOfStock++;
        });
        return acc;
      },
      { total: 0, inStock: 0, lowStock: 0, outOfStock: 0 }
    );
  }, [colorGroups]);

  // Toggle expand/collapse
  const toggleGroup = useCallback((color: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(color)) {
        next.delete(color);
      } else {
        next.add(color);
      }
      return next;
    });
  }, []);

  // Groups are collapsed by default per user request

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="overflow-hidden"
      >
        <div className="bg-white border-t border-b border-gray-200 px-6 py-8 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          <span className="ml-2 text-sm text-gray-500">Loading variants...</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="overflow-hidden"
    >
      <div className="bg-white border-t border-b border-gray-200 px-4 sm:px-6 py-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Layers className="h-4 w-4 text-[var(--color-primary)]" />
            <span className="text-sm font-semibold text-gray-700">
              Variants of <span className="text-[var(--color-primary)]">{productName}</span>
            </span>
            <Badge variant="outline" className="text-xs bg-white border-gray-300 text-gray-600 rounded-full px-3">
              {totalVariants} variant{totalVariants !== 1 ? 's' : ''}
            </Badge>
          </div>
          <Button
            size="sm"
            onClick={onAddVariant}
            className="h-8 px-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg shadow-sm"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Add Variant
          </Button>
        </div>

        {/* Variant Groups Container */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {colorGroups.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-gray-500">
              No variants yet. Click "Add Variant" to create one.
            </div>
          ) : (
            <div className="overflow-x-auto">
              {/* Sticky Header */}
              <div className="sticky top-0 z-10 bg-gray-100 border-b border-gray-300">
                <div className="grid grid-cols-[50px_120px_1fr_120px_100px_100px_50px] gap-2 sm:gap-4 items-center px-4 sm:px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <div></div>
                  <div>Size</div>
                  <div>SKU</div>
                  <div className="text-center">Price</div>
                  <div className="text-center">Stock</div>
                  <div className="text-center">Status</div>
                  <div className="text-center">Actions</div>
                </div>
              </div>

              {/* Color Groups */}
              <div className="divide-y divide-gray-100">
                {colorGroups.map((group) => (
                  <ColorGroupRow
                    key={group.color}
                    group={group}
                    isExpanded={expandedGroups.has(group.color)}
                    onToggle={() => toggleGroup(group.color)}
                    onEditVariant={onEditVariant}
                    onDeleteVariant={onDeleteVariant}
                    onStockAdjust={openDialog}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Stats */}
        {totalVariants > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-gray-500">
            <span>
              Total stock: <span className="font-bold text-gray-700">{stockStats.total}</span>
            </span>
            <span className="text-gray-300">|</span>
            <span>
              In stock: <span className="font-bold text-green-600">{stockStats.inStock}</span>
            </span>
            <span className="text-gray-300">|</span>
            <span>
              Low: <span className="font-bold text-orange-500">{stockStats.lowStock}</span>
            </span>
            <span className="text-gray-300">|</span>
            <span>
              OOS: <span className="font-bold text-red-500">{stockStats.outOfStock}</span>
            </span>
          </div>
        )}
      </div>

      {/* Stock Adjustment Dialog */}
      <StockAdjustmentDialog
        stockDialog={stockDialog}
        stockQuantity={stockQuantity}
        isSubmitting={isSubmitting}
        onQuantityChange={setStockQuantity}
        onClose={closeDialog}
        onSubmit={submitStockAdjustment}
      />
    </motion.div>
  );
}

/* ─── Color Group Row ──────────────────────────────────── */
function ColorGroupRow({
  group,
  isExpanded,
  onToggle,
  onEditVariant,
  onDeleteVariant,
  onStockAdjust,
}: {
  group: AdminColorGroup;
  isExpanded: boolean;
  onToggle: () => void;
  onEditVariant: (variantId: string) => void;
  onDeleteVariant: (variantId: string) => void;
  onStockAdjust: (type: 'add' | 'reduce', variantId: string, sku: string, currentStock: number) => void;
}) {
  const colorHex = getColorHex(group.color);

  return (
    <div>
      {/* Color Group Header - Clickable to expand/collapse */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 sm:px-6 py-3 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border-y border-gray-200 transition-all group cursor-pointer"
      >
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-gray-500 group-hover:text-gray-700 transition-colors" />
        ) : (
          <ChevronRight className="h-4 w-4 text-gray-500 group-hover:text-gray-700 transition-colors" />
        )}
        <span
          className="w-5 h-5 rounded-full border-2 border-gray-300 shadow-sm group-hover:scale-110 transition-transform"
          style={{ backgroundColor: colorHex }}
        />
        <span className="text-sm font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{group.color}</span>
        <Badge variant="outline" className="text-[10px] bg-white border-gray-300 text-gray-500 rounded-full px-2">
          {group.variants.length} size{group.variants.length !== 1 ? 's' : ''}
        </Badge>
        <div className="ml-auto flex items-center gap-2 text-xs text-gray-500">
          <Package2 className="h-3.5 w-3.5" />
          <span className="font-semibold">
            {group.variants.reduce((sum, v) => sum + v.stockQuantity, 0)} units
          </span>
        </div>
      </button>

      {/* Variants in this color - Animated collapse */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="divide-y divide-gray-100">
              {group.variants.map((variant, index) => (
                <VariantRow
                  key={variant.id}
                  variant={variant}
                  isEven={index % 2 === 0}
                  onEdit={() => onEditVariant(variant.id)}
                  onDelete={() => onDeleteVariant(variant.id)}
                  onAddStock={() => onStockAdjust('add', variant.id, variant.sku, variant.stockQuantity)}
                  onReduceStock={() => onStockAdjust('reduce', variant.id, variant.sku, variant.stockQuantity)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Variant Row ──────────────────────────────────────── */
function VariantRow({
  variant,
  isEven,
  onEdit,
  onDelete,
  onAddStock,
  onReduceStock,
}: {
  variant: AdminVariantItem;
  isEven: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onAddStock: () => void;
  onReduceStock: () => void;
}) {
  const hasSale = variant.salePrice < variant.basePrice;
  const statusConfig = stockStatusConfig[variant.stockStatus] || stockStatusConfig['Out of Stock'];
  const isLowStock = variant.stockStatus === 'Low Stock';
  const isOutOfStock = variant.stockStatus === 'Out of Stock';

  const handleQuickAdd = useCallback(() => {
    onAddStock();
  }, [onAddStock]);

  const handleQuickReduce = useCallback(() => {
    onReduceStock();
  }, [onReduceStock]);

  return (
    <div
      className={`grid grid-cols-[50px_120px_1fr_120px_100px_100px_50px] gap-2 sm:gap-4 items-center px-4 sm:px-6 py-3 hover:bg-blue-50/40 transition-colors group ${isEven ? 'bg-white' : 'bg-gray-50/50'
        }`}
    >
      {/* Checkbox placeholder */}
      <div className="flex items-center justify-center">
        <div className="w-4 h-4 rounded border border-gray-300 bg-white"></div>
      </div>

      {/* Size badge */}
      <div>
        <span className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 text-xs font-bold text-blue-700 border border-blue-200 shadow-sm">
          {variant.size || 'N/A'}
        </span>
      </div>

      {/* SKU */}
      <div className="min-w-0">
        <span className="font-mono text-xs text-gray-500 truncate block">{variant.sku}</span>
      </div>

      {/* Price */}
      <div className="text-center">
        <div className="text-sm font-bold text-blue-600">
          {variant.salePrice.toLocaleString('vi-VN')}đ
        </div>
        {hasSale && (
          <div className="text-[10px] text-gray-400 line-through">
            {variant.basePrice.toLocaleString('vi-VN')}đ
          </div>
        )}
      </div>

      {/* Stock Quantity - Quick Actions */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleQuickReduce}
            disabled={variant.stockQuantity <= 0}
            className="h-6 w-6 p-0 rounded hover:bg-red-100 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Reduce stock"
          >
            <Minus className="h-3 w-3" />
          </Button>
          <div className="flex items-center gap-1 min-w-[48px] justify-center">
            {isLowStock && <AlertTriangle className="h-3.5 w-3.5 text-orange-500" />}
            <span
              className={`text-sm font-bold ${isLowStock ? 'text-orange-500' : isOutOfStock ? 'text-red-500' : 'text-gray-900'
                }`}
            >
              {variant.stockQuantity}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleQuickAdd}
            className="h-6 w-6 p-0 rounded hover:bg-green-100 hover:text-green-600 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Add stock"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Stock Status */}
      <div className="text-center">
        <Badge
          variant="outline"
          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${statusConfig.className
            }`}
        >
          {statusConfig.label}
        </Badge>
      </div>

      {/* Actions */}
      <div className="text-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 rounded-md hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 shadow-xl border rounded-xl">
            <DropdownMenuItem
              className="cursor-pointer py-2.5 font-medium text-green-600 focus:bg-green-50 focus:text-green-700"
              onClick={onAddStock}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Stock
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer py-2.5 font-medium text-orange-600 focus:bg-orange-50 focus:text-orange-700"
              onClick={onReduceStock}
              disabled={variant.stockQuantity <= 0}
            >
              <Minus className="h-4 w-4 mr-2" />
              Reduce Stock
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1" />
            <DropdownMenuItem className="cursor-pointer py-2.5 font-medium" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2 text-gray-600" />
              Edit Variant
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1" />
            <DropdownMenuItem
              className="cursor-pointer py-2.5 text-red-600 font-semibold focus:bg-red-50 focus:text-red-700"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
