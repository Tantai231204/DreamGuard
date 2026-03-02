import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import {
  Package,
  Sparkles,
} from 'lucide-react';
import type { ProductVariant } from '../types';

const variantStatusStyles: Record<string, string> = {
  Active: 'bg-green-50 text-green-700 border-green-200',
  Inactive: 'bg-gray-50 text-gray-600 border-gray-200',
};

interface VariantTableProps {
  variants: ProductVariant[];
  productName: string;
}

export default function VariantTable({ variants, productName }: VariantTableProps) {
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
        </div>

        {/* Variant rows */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_120px_120px_120px_80px_80px_80px] gap-2 px-4 py-2.5 bg-gray-50/80 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <span>SKU</span>
            <span>Size</span>
            <span className="text-right">Base Price</span>
            <span className="text-right">Sale Price</span>
            <span className="text-center">Weight</span>
            <span className="text-center">New</span>
            <span className="text-center">Status</span>
          </div>

          {/* Variant list */}
          <div className="divide-y divide-gray-50">
            {variants.map((variant) => (
              <div
                key={variant.id}
                className="grid grid-cols-[1fr_120px_120px_120px_80px_80px_80px] gap-2 items-center px-4 py-3 hover:bg-blue-50/30 transition-colors group"
              >
                {/* SKU */}
                <div>
                  <span className="font-mono text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                    {variant.sku}
                  </span>
                </div>

                {/* Size */}
                <div>
                  <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg bg-gray-100 text-xs font-bold text-gray-700">
                    {variant.size}
                  </span>
                </div>

                {/* Base Price */}
                <div className="text-right">
                  <span className="text-sm font-bold text-gray-900">
                    {variant.basePrice.toLocaleString('vi-VN')}đ
                  </span>
                </div>

                {/* Sale Price */}
                <div className="text-right">
                  {variant.salePrice < variant.basePrice ? (
                    <span className="text-sm font-bold text-red-600">
                      {variant.salePrice.toLocaleString('vi-VN')}đ
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400">—</span>
                  )}
                </div>

                {/* Weight */}
                <div className="text-center">
                  <span className="text-xs text-gray-600">
                    {variant.weight ? `${variant.weight}kg` : '—'}
                  </span>
                </div>

                {/* isNew */}
                <div className="text-center">
                  {variant.isNew && (
                    <Sparkles className="h-4 w-4 text-orange-500 mx-auto" />
                  )}
                </div>

                {/* Status */}
                <div className="text-center">
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-semibold ${variantStatusStyles[variant.status] || ''}`}
                  >
                    {variant.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
