import { memo } from 'react';
import { ShoppingCart, ShieldCheck, RotateCcw, Star, Leaf, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { cn, formatPrice } from '@/lib/utils';
import { ColorSelector } from './ColorSelector';
import { SizeSelector } from './SizeSelector';
import { QuantitySelector } from './QuantitySelector';
import { CustomizationForm } from './CustomizationForm';
import type { ColorOption, SizeOption } from '../types';

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
    isCustomSize?: boolean;
    isCustomColor?: boolean;
    onIsCustomSizeChange?: (val: boolean) => void;
    onIsCustomColorChange?: (val: boolean) => void;
    canCustomizeColor?: boolean;
    canCustomizeSize?: boolean;
    customDimensions?: { length: number; width: number; thickness: number };
    onCustomDimensionChange?: (field: 'length' | 'width' | 'thickness', value: number) => void;
    customColorHex?: string;
    onCustomColorHexChange?: (hex: string) => void;
    colorSurchargePrice?: number;
    sizeSurchargePrice?: number;
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
    isCustomSize = false,
    isCustomColor = false,
    onIsCustomSizeChange,
    onIsCustomColorChange,
    customDimensions = { length: 0, width: 0, thickness: 0 },
    onCustomDimensionChange,
    customColorHex = "#FFFFFF",
    onCustomColorHexChange,
    colorSurchargePrice = 0,
    sizeSurchargePrice = 0,
    canCustomizeColor = false,
    canCustomizeSize = false,
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
                    <Badge className="bg-amber-50/80 text-amber-700 border border-amber-200/50 px-2.5 py-1 text-[10px] font-black tracking-wider rounded-lg flex items-center gap-1.5 shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                        AGE: {product.ageLabel} MONTHS+
                    </Badge>
                )}
                {(canCustomizeColor || canCustomizeSize) && (
                    <Badge className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-1 text-[10px] font-black tracking-wider rounded-lg flex items-center gap-1.5 shadow-sm">
                        <Sparkles className="w-3 h-3 text-indigo-500 animate-pulse" />
                        BESPOKE / MADE-TO-MEASURE
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
                        {stockStatusLabel || (isActuallyOutOfStock ? "Out of stock" : "In Stock")}
                    </span>
                </div>
            </div>

            {/* ── Row 4: Price Block ── */}
            <div className="bg-slate-50/80 rounded-2xl px-6 py-5 border border-slate-100 shadow-sm space-y-3">
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

                {/* Surcharge Breakdown */}
                {(isCustomSize || isCustomColor) && (colorSurchargePrice > 0 || sizeSurchargePrice > 0) && (
                    <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-200/50">
                        {isCustomSize && sizeSurchargePrice > 0 && (
                            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                                <span className="w-1 h-1 rounded-full bg-[#4988c4]" />
                                <span>Includes {formatPrice(sizeSurchargePrice)} surcharge for custom dimensions</span>
                            </div>
                        )}
                        {isCustomColor && colorSurchargePrice > 0 && (
                            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                                <span className="w-1 h-1 rounded-full bg-[#4988c4]" />
                                <span>Includes {formatPrice(colorSurchargePrice)} surcharge for custom color</span>
                            </div>
                        )}
                    </div>
                )}

                <p className="text-[11px] text-slate-400 font-medium">
                    Tax included · Free shipping on orders over {formatPrice(1000000)}
                </p>
            </div>
            {/* ── Row 6: Selectors ── */}
            <div className="space-y-6">
                {(colorOptions.length > 1 || (colorOptions.length === 1 && colorOptions[0].value !== 'default') || canCustomizeColor) && (
                    <ColorSelector
                        options={colorOptions}
                        selected={selectedColor}
                        onChange={(val) => {
                            onColorChange(val);
                            if (onIsCustomColorChange) onIsCustomColorChange(false);
                        }}
                        disabledValues={disabledColors}
                        isCustomizable={canCustomizeColor}
                        isCustomMode={isCustomColor}
                        onCustomClick={() => onIsCustomColorChange?.(!isCustomColor)}
                    />
                )}

                <CustomizationForm
                    type="color"
                    isVisible={isCustomColor}
                    colorHex={customColorHex}
                    onColorChange={onCustomColorHexChange}
                    surchargePrice={colorSurchargePrice}
                />

                {(sizeOptions.length > 1 || (sizeOptions.length === 1 && sizeOptions[0].value.toLowerCase() !== 'default') || canCustomizeSize) && (
                    <div className="flex items-center justify-between">
                        <SizeSelector
                            options={sizeOptions}
                            selected={selectedSize}
                            onChange={(val) => {
                                onSizeChange(val);
                                if (onIsCustomSizeChange) onIsCustomSizeChange(false);
                            }}
                            disabledValues={disabledSizes}
                            isCustomizable={canCustomizeSize}
                            isCustomMode={isCustomSize}
                            onCustomClick={() => onIsCustomSizeChange?.(!isCustomSize)}
                        />
                    </div>
                )}

                <CustomizationForm
                    type="dimensions"
                    isVisible={isCustomSize}
                    length={customDimensions.length}
                    width={customDimensions.width}
                    thickness={customDimensions.thickness}
                    onDimensionChange={onCustomDimensionChange}
                    surchargePrice={sizeSurchargePrice}
                />

                <QuantitySelector
                    value={quantity}
                    onChange={onQuantityChange}
                    stockLeft={stockLeft}
                />
            </div>

            {/* ── Row 7: Add to Cart (Clean CTA) ── */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
                <Button
                    variant={isActuallyOutOfStock ? "secondary" : "premium"}
                    className={cn(
                        "w-full h-14 font-black text-sm uppercase tracking-[0.2em] rounded-2xl shadow-xl transition-all duration-300 relative group overflow-hidden",
                        isActuallyOutOfStock ? "bg-slate-100 text-slate-400" : "shadow-blue-500/10 hover:shadow-blue-500/20"
                    )}
                    onClick={onAddToCart}
                    disabled={isActuallyOutOfStock}
                >
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <span className="relative z-10 flex items-center justify-center gap-3">
                        <ShoppingCart className="w-5 h-5 transition-transform group-hover:-rotate-12" />
                        {isActuallyOutOfStock ? 'Sold Out' : 'Add to Cart'}
                    </span>
                </Button>
            </div>

            {/* ── Row 8: Dynamic Policies (Sleek Grid) ── */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100/80">
                {[
                    { icon: RotateCcw, label: 'Returns policy', value: `${product.returnPolicyDay || 30}-Days`, sub: 'Easy exchanges' },
                    { icon: ShieldCheck, label: 'Warranty coverage', value: product.warrantyPolicyDay ? `${product.warrantyPolicyDay} days` : 'Included', sub: 'Against defects' },
                ].map((item, i) => (
                    <div key={i} className="flex flex-col gap-1 p-3.5 bg-slate-50/50 rounded-xl border border-slate-100/60 transition-colors hover:bg-white hover:shadow-sm cursor-default">
                        <div className="flex items-center gap-1.5">
                            <item.icon className="w-3.5 h-3.5 text-[#4988c4]" />
                            <span className="text-[10px] font-black uppercase tracking-wider text-[#4988c4]">{item.label}</span>
                        </div>
                        <span className="text-[14px] font-black text-slate-900 tracking-tight mt-0.5">
                            {item.value}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium tracking-wide">{item.sub}</span>
                    </div>
                ))}
            </div>
        </motion.div>
    );
});

ProductInfo.displayName = 'ProductInfo';
