import { memo } from 'react';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, AlertTriangle, Truck, RotateCcw, ShieldCheck, Leaf } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn, formatPrice } from '@/lib/utils';
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

    const isActuallyOutOfStock = isOutOfStock || (stockLeft !== undefined && (stockLeft ?? 0) === 0);

    const discount = product.originalPrice && product.originalPrice > product.price
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : null;

    return (
        <motion.div
            className="flex flex-col gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            {/* ── Row 1: Inline Badges ── */}
            <div className="flex flex-wrap items-center gap-2">
                {product.category && (
                    <Badge className="bg-slate-100 text-slate-600 border-0 px-2.5 py-0.5 text-[10px] font-bold tracking-wide rounded-md">
                        {product.category}
                    </Badge>
                )}
                {isNewVariant && (
                    <Badge className="bg-[#4988c4] text-white border-0 px-2.5 py-0.5 text-[10px] font-bold tracking-wide rounded-md">
                        New Arrival
                    </Badge>
                )}
                {discount && (
                    <Badge className="bg-rose-500 text-white border-0 px-2.5 py-0.5 text-[10px] font-bold tracking-wide rounded-md">
                        -{discount}% OFF
                    </Badge>
                )}
                {product.material && (
                    <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-0.5 text-[10px] font-bold tracking-wide rounded-md">
                        <Leaf className="w-2.5 h-2.5 mr-1 inline" />
                        {product.material}
                    </Badge>
                )}
                {product.ageLabel && (
                    <Badge className="bg-sky-50 text-sky-700 border border-sky-100 px-2.5 py-0.5 text-[10px] font-bold tracking-wide rounded-md">
                        Ages {product.ageLabel}
                    </Badge>
                )}
            </div>

            {/* ── Row 2: Product Name ── */}
            <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 leading-tight tracking-tight">
                    {product.name}
                </h1>
                {variantLabel && (
                    <p className="text-[12px] text-slate-400 font-medium mt-1">
                        Variant: {variantLabel}
                    </p>
                )}
            </div>

            {/* ── Row 3: Rating + SKU + Stock (inline compact) ── */}
            <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1.5">
                    <div className="flex">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                className={cn(
                                    "h-3.5 w-3.5",
                                    i < Math.round(averageRating) ? "fill-amber-400 text-amber-400" : "fill-slate-100 text-slate-100"
                                )}
                            />
                        ))}
                    </div>
                    <span className="text-[12px] font-bold text-slate-800">{averageRating.toFixed(1)}</span>
                    <span className="text-[11px] text-slate-400">({reviewCount})</span>
                </div>
                <div className="h-3 w-px bg-slate-200" />
                <span className="text-[10px] text-slate-400 font-mono tracking-tight">
                    SKU: {sku || product.sku || 'N/A'}
                </span>
                <div className="h-3 w-px bg-slate-200" />
                <div className={cn(
                    "flex items-center gap-1.5",
                    isActuallyOutOfStock ? "text-rose-500" : "text-emerald-600"
                )}>
                    <span className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        isActuallyOutOfStock ? "bg-rose-500" : "bg-emerald-500 animate-pulse"
                    )} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                        {stockStatusLabel || (isActuallyOutOfStock ? "Out of Stock" : "In Stock")}
                    </span>
                </div>
            </div>

            {/* ── Row 4: Price Block ── */}
            <div className="bg-slate-50 rounded-xl px-5 py-4 border border-slate-100 space-y-2">
                <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="text-3xl font-black text-slate-900 tracking-tight">
                        {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-lg text-slate-400 line-through font-medium">
                            {formatPrice(product.originalPrice)}
                        </span>
                    )}
                    {tradeInValue !== undefined && tradeInValue > 0 && (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                            Save {formatPrice(tradeInValue)} with Trade-in
                        </span>
                    )}
                </div>
                <p className="text-[11px] text-slate-400">
                    Tax included · Free shipping on orders over {formatPrice(1000000)}
                </p>
            </div>
            {/* ── Row 6: Selectors ── */}
            <div className="space-y-6">
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
            </div>

            {/* ── Row 7: Add to Cart ── */}
            <Button
                variant={isActuallyOutOfStock ? "secondary" : "premium"}
                size="lg"
                disabled={isActuallyOutOfStock}
                onClick={onAddToCart}
                className={cn(
                    "w-full h-16 rounded-2xl",
                    isActuallyOutOfStock && "bg-slate-100 text-slate-400 border border-slate-100 cursor-not-allowed"
                )}
            >
                {isActuallyOutOfStock ? (
                    <span className="flex items-center gap-3 relative z-10">
                        <AlertTriangle className="h-4 w-4 opacity-70" />
                        Inventory Empty
                    </span>
                ) : (
                    <span className="flex items-center gap-4 relative z-10">
                        <ShoppingCart className="h-5 w-5 transition-transform group-hover:-rotate-12" />
                        Add to Cart
                    </span>
                )}
            </Button>
            {/* ── Row 8: Trust Strip ── */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { icon: Truck, label: 'Free Shipping', sub: `Over ${formatPrice(1000000)}` },
                    { icon: RotateCcw, label: `${product.returnPolicyDay || 30}-Day`, sub: 'Easy Returns' },
                    { icon: ShieldCheck, label: 'Warranty', sub: product.warrantyPolicyDay ? `${product.warrantyPolicyDay} days` : 'Included' },
                ].map((item, i) => (
                    <div key={i} className="flex flex-col items-center gap-1.5 py-3 bg-slate-50 rounded-lg border border-slate-100">
                        <item.icon className="w-4 h-4 text-[#4988c4]" />
                        <span className="text-[10px] font-bold text-slate-700 leading-none">{item.label}</span>
                        <span className="text-[9px] text-slate-400 leading-none">{item.sub}</span>
                    </div>
                ))}
            </div>

            {/* ── Row 9: Benefits ── */}
            <ProductBenefits benefits={benefits} />
        </motion.div>
    );
});

ProductInfo.displayName = 'ProductInfo';
