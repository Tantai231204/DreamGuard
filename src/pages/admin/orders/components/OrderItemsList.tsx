import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { OrderItem } from '@/api/types/order';
import { formatPrice } from '@/pages/profile/utils';
import { getColorHex } from '@/utils/color-utils';
import { useVariant } from '@/hooks/queries/useVariant';
import { useComboDetail } from '@/hooks/queries/useCombo';
import { ShoppingBag, Box, Layers, ListTree, ChevronDown } from 'lucide-react';

const MAX_VISIBLE = 3;

interface OrderItemsListProps {
  items: OrderItem[];
}

interface OrderItemRowProps {
  item: OrderItem;
  index: number;
}

export function OrderItemsList({ items }: OrderItemsListProps) {
  const [expanded, setExpanded] = useState(false);
  const needsCollapse = items.length > MAX_VISIBLE;
  const visibleItems = needsCollapse && !expanded ? items.slice(0, MAX_VISIBLE) : items;
  const hiddenCount = items.length - MAX_VISIBLE;

  return (
    <Card className="border border-blue-100/50 rounded-2xl bg-white shadow-sm overflow-hidden translate-z-0">
      <div className="px-6 py-4 border-b border-blue-50 bg-gradient-to-r from-blue-50/20 to-transparent flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <ShoppingBag className="w-4 h-4 text-primary" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-xs font-black text-slate-800 uppercase tracking-widest leading-none">
              Order Items
            </h2>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1">Manifest Breakdown</span>
          </div>
        </div>
        <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[9px] font-black uppercase tracking-widest h-6 px-3 rounded-md">
          {items.length} LINE {items.length === 1 ? 'ITEM' : 'ITEMS'}
        </Badge>
      </div>

      {/* Table Header */}
      <div className="hidden md:grid grid-cols-12 gap-4 px-8 py-3 bg-slate-50/40 border-b border-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">
        <div className="col-span-6 flex items-center gap-2">
          <Box className="w-3 h-3" />
          Product / Bundle Manifest
        </div>
        <div className="col-span-2 text-center">Unit Price</div>
        <div className="col-span-2 text-center">Qty</div>
        <div className="col-span-2 text-right">Total</div>
      </div>

      <div className="divide-y divide-slate-50">
        {visibleItems.map((item, index) => (
          <OrderItemRow key={item.id} item={item} index={index} />
        ))}
      </div>

      {needsCollapse && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center gap-1.5 py-3 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50/50 border-t border-slate-50 transition-colors"
        >
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
          {expanded ? 'Show less' : `Show ${hiddenCount} more item${hiddenCount > 1 ? 's' : ''}`}
        </button>
      )}
    </Card>
  );
}

function OrderItemRow({ item, index }: OrderItemRowProps) {
  const isCombo = !!item.comboId;
  const { data: variant } = useVariant(isCombo ? "" : (item.productVariantId || ""));
  const { data: comboDetail } = useComboDetail(item.comboId || "", isCombo);

  const attributes = (variant?.attributes || {}) as Record<string, unknown>;
  const displayImage = item.image || (attributes.imageUrls as string[])?.[0] || '/images/placeholder-product.svg';

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="hover:bg-blue-50/5 transition-colors group cursor-default"
    >
      <div className="md:grid md:grid-cols-12 md:items-center gap-4 p-5 md:px-8">
        <div className="col-span-6 flex items-center gap-5">
          <div className="relative">
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 shadow-sm shrink-0">
              <img
                src={displayImage}
                alt={item.itemName}
                className="w-full h-full object-cover"
              />
            </div>
            {isCombo && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                <ListTree className="w-2.5 h-2.5 text-white" />
              </div>
            )}
          </div>
          <div className="min-w-0 space-y-1">
            {isCombo && (
              <span className="inline-block px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[8px] font-black uppercase tracking-widest leading-none mb-1">
                COMBO BUNDLE
              </span>
            )}
            <h3 className="text-sm font-black text-slate-800 truncate leading-tight">
              {item.itemName.replace(/\s*-\s*$/, '')}
            </h3>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded bg-slate-50 border border-slate-100">
                  <Layers className="w-2.5 h-2.5 text-slate-400" />
                  <span className="text-[9px] font-bold text-slate-500 font-mono tracking-tighter">
                    {isCombo ? (comboDetail?.sku || 'COMBO-SKU') : (variant?.sku || '--')}
                  </span>
                </div>
                {!isCombo && (
                  <>
                    {variant?.size && (
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-100/50 px-1.5 rounded">
                        {variant.size}
                      </span>
                    )}
                    {!!attributes.color && (
                      <div className="flex items-center gap-1 bg-slate-100/50 px-1.5 py-0.5 rounded">
                        <div
                          className="w-1.5 h-1.5 rounded-full ring-1 ring-white shadow-sm"
                          style={{ backgroundColor: getColorHex(String(attributes.color)) }}
                        />
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter ml-1">
                          {String(attributes.color)}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Bespoke Manufacturing Section */}
            {item.productCustomizeDetails && item.productCustomizeDetails.length > 0 && (
              <div className="flex flex-wrap gap-2.5 pt-1.5">
                {item.productCustomizeDetails.map((detail, idx) => (
                  <div key={idx} className="flex items-center overflow-hidden rounded-lg border border-slate-100 bg-white shadow-sm hover:border-[#4988c4]/30 transition-all">
                    <div className="px-3 py-1.5 bg-slate-50/50 border-r border-slate-100 flex flex-col justify-center">
                      <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1 opacity-70">{detail.customizeTypeName}</span>
                      <span className="text-[11px] font-bold text-slate-800 leading-none">{detail.customizeContent}</span>
                    </div>
                    {detail.addOnPrice > 0 && (
                      <div className="px-3 py-1.5 bg-[#4988c4] flex flex-col justify-center">
                        <span className="text-[7px] font-black text-white/50 uppercase tracking-[0.1em] leading-none mb-0.5">Premium</span>
                        <span className="text-[10px] font-black text-white leading-none tabular-nums">+{formatPrice(detail.addOnPrice)}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="col-span-2 text-center hidden md:block">
          <span className="text-xs font-bold text-slate-600 font-mono">{formatPrice(item.unitPrice)}</span>
        </div>

        <div className="col-span-2 text-center hidden md:block">
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-50 text-[10px] font-black text-slate-900 border border-slate-100">
            {item.quantity}
          </div>
        </div>

        <div className="col-span-2 text-right hidden md:block">
          <span className="text-sm font-black text-slate-900 tracking-tighter">
            {formatPrice(
              (item.unitPrice * item.quantity) +
              (item.productCustomizeDetails?.reduce((acc, curr) => acc + curr.addOnPrice, 0) || 0)
            )}
          </span>
        </div>

        <div className="flex md:hidden items-center justify-between mt-4 pt-4 border-t border-slate-50">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Qty:</span>
            <span className="text-xs font-black text-slate-900">{item.quantity}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Total:</span>
            <span className="text-sm font-black text-primary tracking-tighter">
              {formatPrice(
                (item.unitPrice * item.quantity) +
                (item.productCustomizeDetails?.reduce((acc, curr) => acc + curr.addOnPrice, 0) || 0)
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Admin Bundle Breakdown for Fulfillment */}
      <AnimatePresence>
        {isCombo && comboDetail?.productItems && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="px-8 pb-5 overflow-hidden"
          >
            <div className="bg-slate-50/50 rounded-xl border border-blue-50/50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-4 bg-primary/20 rounded-full" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fulfillment Instructions (Pack List)</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {comboDetail.productItems.map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-slate-50 overflow-hidden border border-slate-100 shrink-0">
                        <img src={p.imageUrl || '/images/placeholder-product.svg'} alt={p.productName} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-black text-slate-800 truncate leading-tight">{p.productName}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">SKU: {p.productVariantId.substring(0, 8).toUpperCase()}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[11px] font-black text-primary">QTY: {p.quantity * item.quantity}</span>
                      <span className="text-[8px] font-bold text-slate-300 italic">Target Units</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
