import { useMemo } from 'react';
import { motion } from 'framer-motion';
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
  MoreVertical,
  Edit,
  Trash2,
} from 'lucide-react';
import type { ProductVariant } from '../types';

/* ─── Stock Status Helpers ─────────────────────────────── */
const LOW_STOCK_THRESHOLD = 10;

function getStockStatus(quantity: number | undefined): 'in_stock' | 'low_stock' | 'out_of_stock' {
  if (quantity === undefined || quantity === null) return 'in_stock';
  if (quantity <= 0) return 'out_of_stock';
  if (quantity < LOW_STOCK_THRESHOLD) return 'low_stock';
  return 'in_stock';
}

const stockStatusConfig = {
  in_stock: { label: 'In Stock', className: 'bg-green-50 text-green-700 border-green-200' },
  low_stock: { label: 'Low Stock', className: 'bg-orange-50 text-orange-600 border-orange-200' },
  out_of_stock: { label: 'Out of Stock', className: 'bg-red-50 text-red-600 border-red-200' },
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
  brown: '#a0522d',
  beige: '#f5f5dc',
};

function getColorHex(colorName: string | undefined, colorCode: string | undefined): string {
  if (colorCode) return colorCode;
  if (colorName) {
    const normalized = colorName.toLowerCase().trim();
    return colorMap[normalized] || '#e5e7eb';
  }
  return '#e5e7eb';
}

/* ─── Types ────────────────────────────────────────────── */
interface VariantTableProps {
  variants: ProductVariant[];
  productName: string;
  onAddVariant: () => void;
  onEditVariant: (variant: ProductVariant) => void;
  onDeleteVariant: (variant: ProductVariant) => void;
}

interface ColorGroup {
  color: string;
  colorHex: string;
  variants: ProductVariant[];
}

/* ─── Component ────────────────────────────────────────── */
export default function VariantTable({
  variants,
  productName,
  onAddVariant,
  onEditVariant,
  onDeleteVariant,
}: VariantTableProps) {
  // Group variants by color
  const colorGroups = useMemo<ColorGroup[]>(() => {
    const groups: Record<string, ProductVariant[]> = {};

    variants.forEach((v) => {
      const colorName = v.attributes?.color || 'Default';
      if (!groups[colorName]) groups[colorName] = [];
      groups[colorName].push(v);
    });

    return Object.entries(groups).map(([color, vars]) => ({
      color,
      colorHex: getColorHex(color, vars[0]?.attributes?.colorCode),
      variants: vars.sort((a, b) => a.size.localeCompare(b.size)),
    }));
  }, [variants]);

  // Calculate stock stats
  const stockStats = useMemo(() => {
    let total = 0;
    let inStock = 0;
    let lowStock = 0;
    let outOfStock = 0;

    variants.forEach((v) => {
      const qty = v.stockQuantity ?? 0;
      total += qty;
      const status = getStockStatus(v.stockQuantity);
      if (status === 'in_stock') inStock++;
      else if (status === 'low_stock') lowStock++;
      else outOfStock++;
    });

    return { total, inStock, lowStock, outOfStock };
  }, [variants]);

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="overflow-hidden"
    >
      <div className="bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50/30 border-t border-b border-gray-200 px-6 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-[var(--color-primary)]" />
            <span className="text-sm font-semibold text-gray-700">
              Variants of <span className="text-[var(--color-primary)]">{productName}</span>
            </span>
            <Badge variant="outline" className="text-xs bg-white border-gray-200">
              {variants.length} variant{variants.length !== 1 ? 's' : ''}
            </Badge>
          </div>
          <Button
            size="sm"
            onClick={onAddVariant}
            className="h-8 px-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg shadow-sm"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Add Variant
          </Button>
        </div>

        {/* Variant Groups */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden divide-y divide-gray-100">
          {colorGroups.map((group) => (
            <div key={group.color}>
              {/* Color Group Header */}
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50/50">
                <span
                  className="w-4 h-4 rounded-full border border-gray-300 shadow-sm"
                  style={{ backgroundColor: group.colorHex }}
                />
                <span className="text-sm font-semibold text-gray-800">{group.color}</span>
                <span className="text-xs text-gray-500">
                  ({group.variants.length} size{group.variants.length !== 1 ? 's' : ''})
                </span>
              </div>

              {/* Variants in this color */}
              <div className="divide-y divide-gray-50">
                {group.variants.map((variant) => {
                  const hasSale = variant.salePrice < variant.basePrice;
                  const stockStatus = getStockStatus(variant.stockQuantity);
                  const statusConfig = stockStatusConfig[stockStatus];

                  return (
                    <div
                      key={variant.id}
                      className="grid grid-cols-[100px_1fr_120px_80px_100px_40px] gap-3 items-center px-4 py-3 pl-8 hover:bg-blue-50/30 transition-colors group"
                    >
                      {/* Size */}
                      <div>
                        <span className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-gray-100 text-xs font-bold text-gray-700 border border-gray-200">
                          {variant.size}
                        </span>
                      </div>

                      {/* SKU */}
                      <div>
                        <span className="font-mono text-xs text-gray-500">
                          {variant.sku}
                        </span>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <div className="text-sm font-bold text-blue-600">
                          {variant.salePrice.toLocaleString('vi-VN')}đ
                        </div>
                        {hasSale && (
                          <div className="text-xs text-gray-400 line-through">
                            {variant.basePrice.toLocaleString('vi-VN')}đ
                          </div>
                        )}
                      </div>

                      {/* Stock Quantity */}
                      <div className="text-center">
                        <span className="text-sm font-bold text-gray-900">
                          {variant.stockQuantity ?? 0}
                        </span>
                      </div>

                      {/* Stock Status */}
                      <div className="text-center">
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-semibold ${statusConfig.className}`}
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
                              className="cursor-pointer py-2 font-medium"
                              onClick={() => onEditVariant(variant)}
                            >
                              <Edit className="h-4 w-4 mr-2 text-gray-600" />
                              Edit Variant
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="my-1" />
                            <DropdownMenuItem
                              className="cursor-pointer py-2 text-red-600 font-semibold focus:bg-red-50 focus:text-red-700"
                              onClick={() => onDeleteVariant(variant)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Stats */}
        <div className="mt-3 px-1 flex items-center gap-4 text-xs text-gray-500">
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
      </div>
    </motion.div>
  );
}
