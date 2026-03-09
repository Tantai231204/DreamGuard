import { memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, AlertTriangle, Truck, RotateCcw, ShieldCheck, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { ColorSelector } from './ColorSelector';
import { SizeSelector } from './SizeSelector';
import { QuantitySelector } from './QuantitySelector';
import { ProductBenefits } from './ProductBenefits';
import type { ColorOption, SizeOption, ProductBenefit } from '../types';

interface Product {
    id: string;
    name: string;
    sku?: string;
    price: number;
    originalPrice?: number;
    category: string;
    summary?: string;
    material?: string;
    ageLabel?: string;
    warrantyPolicyDay?: number | null;
    returnPolicyDay?: number | null;
}

interface ProductInfoProps {
    product: Product;
    averageRating: number;
    reviewCount: number;
    selectedColor: string;
    selectedSize: string;
    quantity: number;
    stockLeft?: number;
    disabledColors?: string[];
    disabledSizes?: string[];
    colorOptions: ColorOption[];
    sizeOptions: SizeOption[];
    benefits: ProductBenefit[];
    onColorChange: (color: string) => void;
    onSizeChange: (size: string) => void;
    onQuantityChange: (quantity: number) => void;
    onAddToCart: () => void;
    isOutOfStock?: boolean;
    sku?: string;
    variantLabel?: string;
    isNewVariant?: boolean;
    stockStatusLabel?: string;
    tradeInValue?: number;
}

export const ProductInfo = memo(({
    product,
    averageRating,
    reviewCount,
    selectedColor,
    selectedSize,
    quantity,
    stockLeft,
    disabledColors,
    disabledSizes,
    colorOptions,
    sizeOptions,
    benefits,
    onColorChange,
    onSizeChange,
    onQuantityChange,
    onAddToCart,
    isOutOfStock = false,
    sku,
    variantLabel,
    isNewVariant,
    stockStatusLabel,
    tradeInValue,
}: ProductInfoProps) => {
    const formatPrice = useCallback((price: number) => {
        return `$${price.toLocaleString()}`;
    }, []);

    const isActuallyOutOfStock = isOutOfStock || (stockLeft !== undefined && (stockLeft ?? 0) === 0);

    return (
        <motion.div
            className="flex flex-col gap-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
        >
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    {product.category && (
                        <Badge className="bg-slate-100 text-slate-800 border-0 px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full">
                            {product.category}
                        </Badge>
                    )}
                    <div className={cn(
                        "flex items-center gap-2 px-3 py-1 rounded-full",
                        isActuallyOutOfStock ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"
                    )}>
                        <Zap className={cn("w-3 h-3", !isActuallyOutOfStock && "fill-emerald-600")} />
                        <span className="text-[9px] font-black uppercase tracking-widest">
                            {stockStatusLabel || (isActuallyOutOfStock ? "Out of Stock" : "In Stock")}
                        </span>
                    </div>
                    {isNewVariant && (
                        <Badge className="bg-slate-900 text-white border-0 px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full shadow-sm">
                            New Arrival
                        </Badge>
                    )}
                    {product.ageLabel && (
                        <Badge className="bg-sky-50 text-sky-700 border-0 px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full">
                            Age: {product.ageLabel}
                        </Badge>
                    )}
                </div>

                <div className="flex flex-col gap-1">
                    <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-slate-900 uppercase italic leading-tight">
                        {product.name}
                    </h1>
                    {variantLabel && (
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight italic">
                            {variantLabel}
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span className="text-sm font-black text-slate-900">{averageRating.toFixed(1)}</span>
                        <span className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">({reviewCount} reviews)</span>
                    </div>
                    <Separator orientation="vertical" className="h-4 bg-slate-200" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">SKU: {sku || product.sku || 'N/A'}</p>
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <div className="flex items-baseline gap-4 flex-wrap">
                    <span className="text-5xl font-black text-slate-900 tracking-tighter">
                        {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-2xl text-slate-400 line-through font-bold tracking-tighter">
                            {formatPrice(product.originalPrice)}
                        </span>
                    )}
                    {tradeInValue !== undefined && tradeInValue > 0 && (
                        <div className="px-3 py-1 bg-emerald-50 rounded-lg flex items-center gap-2 border border-emerald-100">
                            <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">
                                Save {formatPrice(tradeInValue)} with Trade-in
                            </span>
                        </div>
                    )}
                </div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed max-w-md italic">
                    Tax included. Shipping calculated at checkout.
                </p>
            </div>

            <Separator className="bg-slate-100" />

            <section className="space-y-12">
                <ColorSelector
                    options={colorOptions}
                    selected={selectedColor}
                    onChange={onColorChange}
                    disabledValues={disabledColors}
                />

                <SizeSelector
                    options={sizeOptions}
                    selected={selectedSize}
                    onChange={onSizeChange}
                    disabledValues={disabledSizes}
                />

                <QuantitySelector
                    value={quantity}
                    onChange={onQuantityChange}
                    stockLeft={stockLeft}
                />
            </section>

            <section className="space-y-10 pt-4">
                <Button
                    size="lg"
                    disabled={isActuallyOutOfStock}
                    onClick={onAddToCart}
                    className={cn(
                        "w-full h-16 rounded-2xl text-[11px] font-black uppercase tracking-[0.25em] transition-all active:scale-[0.98] shadow-lg shadow-primary/20",
                        isActuallyOutOfStock
                            ? "bg-primary-light/50 text-primary-dark/40 border-0"
                            : "bg-primary text-white hover:bg-primary-dark hover:shadow-xl hover:shadow-primary/30 border-0"
                    )}
                >
                    {isActuallyOutOfStock ? (
                        <span className="flex items-center gap-3">
                            <AlertTriangle className="h-4 w-4" />
                            Inventory Empty
                        </span>
                    ) : (
                        <span className="flex items-center gap-4">
                            <ShoppingCart className="h-5 w-5" />
                            Add to Cart
                        </span>
                    )}
                </Button>

                <div className="grid grid-cols-3 gap-8 bg-slate-50 rounded-2xl p-6 border border-slate-100">
                    {[
                        { icon: Truck, label: 'Free Shipping' },
                        { icon: RotateCcw, label: product.returnPolicyDay ? `${product.returnPolicyDay}-Day Return` : '30-Day Return' },
                        { icon: ShieldCheck, label: 'Secure Pay' }
                    ].map((item, i) => (
                        <div key={i} className="flex flex-col items-center gap-2 text-center">
                            <item.icon className="w-5 h-5 text-slate-800" />
                            <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest leading-tight">{item.label}</span>
                        </div>
                    ))}
                </div>
            </section>

            <div className="pt-8">
                <ProductBenefits benefits={benefits} />
            </div>
        </motion.div>
    );
});

ProductInfo.displayName = 'ProductInfo';
