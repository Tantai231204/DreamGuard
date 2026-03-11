import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { OrderItem } from '@/api/types/order';
import { formatPrice } from '@/pages/profile/utils';
import { useVariant } from '@/hooks/queries/useVariant';
import { ShoppingBag, Box, Layers } from 'lucide-react';

interface OrderItemsListProps {
  items: OrderItem[];
}

interface OrderItemRowProps {
  item: OrderItem;
  index: number;
}

export function OrderItemsList({ items }: OrderItemsListProps) {
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
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1">Products</span>
          </div>
        </div>
        <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[9px] font-black uppercase tracking-widest h-6 px-3 rounded-md">
          {items.length} ITEMS
        </Badge>
      </div>

      {/* Table Header */}
      <div className="hidden md:grid grid-cols-12 gap-4 px-8 py-3 bg-slate-50/40 border-b border-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">
        <div className="col-span-6 flex items-center gap-2">
            <Box className="w-3 h-3" />
            Product
        </div>
        <div className="col-span-2 text-center">Unit Price</div>
        <div className="col-span-2 text-center">Qty</div>
        <div className="col-span-2 text-right">Total</div>
      </div>

      <div className="divide-y divide-slate-50">
        {items.map((item, index) => (
          <OrderItemRow key={item.id} item={item} index={index} />
        ))}
      </div>
    </Card>
  );
}

function OrderItemRow({ item, index }: OrderItemRowProps) {
  const { data: variant } = useVariant(item.productVariantId);
  const attributes = (variant?.attributes || {}) as Record<string, unknown>;

  const displayImage = item.image || (attributes.imageUrls as string[])?.[0] || 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=200';

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="md:grid md:grid-cols-12 md:items-center gap-4 p-5 md:px-8 hover:bg-blue-50/20 transition-colors group cursor-default"
    >
      <div className="col-span-6 flex items-center gap-5">
        <div className="relative group-hover:scale-105 transition-transform duration-300">
          <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 shadow-sm">
            <img
              src={displayImage}
              alt={item.itemName}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-black text-slate-800 truncate leading-tight mb-1">
            {item.itemName}
          </h3>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded bg-slate-50 border border-slate-100">
                <Layers className="w-2.5 h-2.5 text-slate-400" />
                <span className="text-[9px] font-bold text-slate-500 font-mono tracking-tighter">
                    {variant?.sku || '--'}
                </span>
            </div>
            {variant?.size && (
              <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest bg-slate-100/50 px-1.5 rounded">
                {variant.size}
              </span>
            )}
            {!!attributes.color && (
              <div className="flex items-center gap-1">
                <div 
                    className="w-1.5 h-1.5 rounded-full ring-1 ring-slate-100 shadow-sm"
                    style={{ backgroundColor: String(attributes.color) }}
                />
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                   {String(attributes.color)}
                </span>
              </div>
            )}
          </div>
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
            {formatPrice(item.unitPrice * item.quantity)}
        </span>
      </div>

      <div className="flex md:hidden items-center justify-between mt-4 pt-4 border-t border-slate-50">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Quantity:</span>
          <span className="text-xs font-black text-slate-900">{item.quantity}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Total:</span>
          <span className="text-sm font-black text-primary tracking-tighter">{formatPrice(item.unitPrice * item.quantity)}</span>
        </div>
      </div>
    </motion.div>
  );
}
