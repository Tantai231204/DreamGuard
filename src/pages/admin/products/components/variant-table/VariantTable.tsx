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
  Package2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
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
  // If it's a 6-digit hex without #
  if (/^[0-9A-Fa-f]{6}$/.test(colorValue)) return `#${colorValue}`;
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
  const colorHex = getColorHex(group.hexColor || group.color);

  return (
    <div className="group/grouprow">
      {/* Color Group Header - Clickable to expand/collapse */}
      <button
        onClick={onToggle}
        className={cn(
          "w-full flex items-center gap-3 px-4 sm:px-6 py-4 transition-all duration-300 border-y border-transparent cursor-pointer",
          isExpanded
            ? "bg-slate-50/80 border-slate-200 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
            : "bg-white hover:bg-slate-50"
        )}
      >
        <div className={cn(
          "w-6 h-6 rounded-full flex items-center justify-center transition-transform",
          isExpanded ? "rotate-180" : ""
        )}>
          <ChevronDown className={cn("h-4 w-4 transition-colors", isExpanded ? "text-indigo-600" : "text-slate-400")} />
        </div>

        <div className="relative">
          <span
            className="w-5 h-5 rounded-full border border-slate-200 shadow-sm block ring-4 ring-transparent group-hover/grouprow:ring-slate-100 transition-all"
            style={{ backgroundColor: colorHex }}
            title={group.color}
          />
          {isExpanded && (
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-gradient-to-b from-indigo-200 to-transparent" />
          )}
        </div>

        <span className="text-[15px] font-black text-slate-800 tracking-tight">{group.color}</span>

        <Badge variant="secondary" className="bg-slate-100 text-slate-500 font-bold hover:bg-slate-100">
          {group.variants.length} SKU{group.variants.length !== 1 ? 's' : ''}
        </Badge>

        <div className="ml-auto flex items-center gap-4">
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold uppercase tracking-widest">
              <Package2 className="h-3 w-3" />
              Inventory
            </div>
            <div className="text-sm font-black text-slate-900">
              {group.variants.reduce((sum, v) => sum + v.stockQuantity, 0)} <span className="text-[10px] text-slate-400 font-medium">units</span>
            </div>
          </div>
        </div>
      </button>

      {/* Variants in this color - Animated collapse */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="overflow-hidden"
          >
            <div className="divide-y divide-slate-50 bg-white">
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

  return (
    <div className="grid grid-cols-[80px_100px_1fr_120px_140px_120px_60px] gap-4 items-center px-10 py-3.5 hover:bg-slate-50/50 transition-all group/vrow relative">
      {/* Visual Connector for nesting */}
      <div className="absolute left-6 top-0 bottom-0 w-px bg-slate-100" />
      <div className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-px bg-slate-100" />

      {/* Size badge */}
      <div>
        <span className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-black text-slate-700 shadow-sm leading-none group-hover/vrow:border-indigo-200 group-hover/vrow:bg-indigo-50/30 transition-colors">
          {variant.size || 'N/A'}
        </span>
      </div>

      {/* SKU */}
      <div className="min-w-0">
        <span className="font-mono text-[11px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100 truncate block uppercase tracking-tighter">
          {variant.sku}
        </span>
      </div>

      {/* Price */}
      <div className="text-right">
        <div className="text-[14px] font-black text-slate-900">
          {variant.salePrice.toLocaleString('en-US')} <span className="text-[10px] text-slate-400">₫</span>
        </div>
        {hasSale && (
          <div className="text-[11px] text-slate-300 line-through">
            {variant.basePrice.toLocaleString('en-US')}₫
          </div>
        )}
      </div>

      {/* Stock Quantity - High Frequency Action Area */}
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-1.5 bg-slate-50 rounded-xl p-1 border border-slate-100 group-hover/vrow:border-slate-200 group-hover/vrow:bg-white transition-all shadow-inner">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => { e.stopPropagation(); onReduceStock(); }}
            disabled={variant.stockQuantity <= 0}
            className="h-7 w-7 p-0 rounded-lg hover:bg-red-50 hover:text-red-600 disabled:opacity-30 opacity-0 group-hover/vrow:opacity-100 transition-all scale-90"
          >
            <Minus className="h-3.5 w-3.5" />
          </Button>

          <div className="min-w-[40px] flex items-center justify-center gap-1 px-1">
            {isLowStock && <AlertTriangle className="h-3 w-3 text-amber-500 animate-pulse" />}
            <span className={cn(
              "text-sm font-black tracking-tight",
              isLowStock ? "text-amber-500" : isOutOfStock ? "text-red-500" : "text-slate-900"
            )}>
              {variant.stockQuantity}
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => { e.stopPropagation(); onAddStock(); }}
            className="h-7 w-7 p-0 rounded-lg hover:bg-emerald-50 hover:text-emerald-600 opacity-0 group-hover/vrow:opacity-100 transition-all scale-90"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Stock Status Badge */}
      <div className="text-center">
        <Badge
          variant="outline"
          className={cn(
            "text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border shadow-none",
            statusConfig.className
          )}
        >
          {statusConfig.label}
        </Badge>
      </div>

      {/* Contextual Actions */}
      <div className="flex justify-end gap-1 opacity-0 group-hover/vrow:opacity-100 transition-opacity">

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-100 transition-all"
            >
              <MoreVertical className="h-4 w-4 text-slate-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 shadow-xl border border-slate-200/60 rounded-xl p-1 animate-in fade-in zoom-in-95 duration-100">
            <DropdownMenuItem
              className="rounded-lg cursor-pointer py-2 px-3 font-medium text-slate-600 hover:text-blue-600 focus:bg-blue-50 focus:text-blue-700 transition-colors gap-2.5"
              onClick={onEdit}
            >
              <Edit className="h-4 w-4 opacity-70" />
              <span className="text-[13px]">Edit Variant</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="my-1 bg-slate-100" />

            <DropdownMenuItem
              className="rounded-lg cursor-pointer py-2 px-3 font-medium text-red-500 focus:bg-red-50 focus:text-red-600 transition-colors gap-2.5"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4 opacity-70" />
              <span className="text-[13px]">Delete Item</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
