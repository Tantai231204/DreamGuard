import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Edit,
  Trash2,
  Plus,
  Package,
  AlertTriangle,
} from 'lucide-react';
import type { ProductVariant } from '../types';

const variantStatusStyles: Record<string, string> = {
  in_stock: 'bg-green-50 text-green-700 border-green-200',
  low_stock: 'bg-orange-50 text-orange-700 border-orange-200',
  out_of_stock: 'bg-red-50 text-red-700 border-red-200',
};

const variantStatusLabels: Record<string, string> = {
  in_stock: 'In Stock',
  low_stock: 'Low Stock',
  out_of_stock: 'Out of Stock',
};

interface VariantTableProps {
  variants: ProductVariant[];
  productName: string;
}

export default function VariantTable({ variants, productName }: VariantTableProps) {
  // Group variants by color
  const colorGroups = variants.reduce<Record<string, ProductVariant[]>>((acc, variant) => {
    if (!acc[variant.color]) acc[variant.color] = [];
    acc[variant.color].push(variant);
    return acc;
  }, {});

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
            <Package className="h-4 w-4 text-[var(--color-primary)]" />
            <span className="text-sm font-semibold text-gray-700">
              Variants of <span className="text-[var(--color-primary)]">{productName}</span>
            </span>
            <Badge variant="outline" className="text-xs bg-white">
              {variants.length} variants
            </Badge>
          </div>
          <Button
            size="sm"
            className="h-8 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white text-xs gap-1.5 rounded-lg"
            onClick={() => console.log('Add variant')}
          >
            <Plus className="h-3.5 w-3.5" />
            Add Variant
          </Button>
        </div>

        {/* Variant cards grouped by color */}
        <div className="space-y-3">
          {Object.entries(colorGroups).map(([color, colorVariants]) => (
            <div key={color} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Color group header */}
              <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50/80 border-b border-gray-100">
                <div
                  className="h-5 w-5 rounded-full border-2 border-white shadow-md"
                  style={{ backgroundColor: colorVariants[0].colorHex }}
                />
                <span className="text-sm font-semibold text-gray-800">{color}</span>
                <span className="text-xs text-gray-400">
                  ({colorVariants.length} {colorVariants.length === 1 ? 'size' : 'sizes'})
                </span>
              </div>

              {/* Variant rows */}
              <div className="divide-y divide-gray-50">
                {colorVariants.map((variant) => (
                  <div
                    key={variant.id}
                    className="flex items-center gap-4 px-4 py-3 hover:bg-blue-50/30 transition-colors group"
                  >
                    {/* Size */}
                    <div className="w-24 flex-shrink-0">
                      <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg bg-gray-100 text-xs font-bold text-gray-700 min-w-[60px]">
                        {variant.size}
                      </span>
                    </div>

                    {/* SKU */}
                    <div className="w-40 flex-shrink-0">
                      <span className="font-mono text-[11px] text-gray-500 bg-gray-50 px-2 py-0.5 rounded">
                        {variant.sku}
                      </span>
                    </div>

                    {/* Price */}
                    <div className="w-36 flex-shrink-0 text-right">
                      {variant.salePrice ? (
                        <div className="space-y-0.5">
                          <div className="text-sm font-bold text-red-600">
                            {variant.salePrice.toLocaleString('vi-VN')}đ
                          </div>
                          <div className="text-[10px] text-gray-400 line-through">
                            {variant.price.toLocaleString('vi-VN')}đ
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm font-bold text-gray-900">
                          {variant.price.toLocaleString('vi-VN')}đ
                        </div>
                      )}
                    </div>

                    {/* Stock */}
                    <div className="w-20 flex-shrink-0 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {variant.stock <= 5 && variant.stock > 0 && (
                          <AlertTriangle className="h-3 w-3 text-orange-500" />
                        )}
                        <span
                          className={`text-sm font-black px-2 py-0.5 rounded ${
                            variant.stock === 0
                              ? 'text-red-600 bg-red-50'
                              : variant.stock <= 5
                              ? 'text-orange-600 bg-orange-50'
                              : 'text-green-600 bg-green-50'
                          }`}
                        >
                          {variant.stock}
                        </span>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="w-24 flex-shrink-0">
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-semibold ${variantStatusStyles[variant.status]}`}
                      >
                        {variantStatusLabels[variant.status]}
                      </Badge>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 rounded-md hover:bg-blue-100 hover:text-blue-700"
                        onClick={() => console.log('Edit variant', variant.id)}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 rounded-md hover:bg-red-100 hover:text-red-700"
                        onClick={() => console.log('Delete variant', variant.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Summary footer */}
        <div className="mt-3 flex items-center gap-4 text-xs text-gray-500 px-1">
          <span>
            Total stock:{' '}
            <span className="font-bold text-gray-700">
              {variants.reduce((sum, v) => sum + v.stock, 0)}
            </span>
          </span>
          <span className="text-gray-300">|</span>
          <span>
            In stock:{' '}
            <span className="font-bold text-green-600">
              {variants.filter(v => v.status === 'in_stock').length}
            </span>
          </span>
          <span>
            Low:{' '}
            <span className="font-bold text-orange-600">
              {variants.filter(v => v.status === 'low_stock').length}
            </span>
          </span>
          <span>
            OOS:{' '}
            <span className="font-bold text-red-600">
              {variants.filter(v => v.status === 'out_of_stock').length}
            </span>
          </span>
        </div>
      </div>
    </motion.div>
  );
}
