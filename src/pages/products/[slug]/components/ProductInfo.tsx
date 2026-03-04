import { memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, Zap, RefreshCcw, Package, CheckCircle2, AlertTriangle, Tag } from 'lucide-react';
import * as Separator from '@radix-ui/react-separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
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
    soldCount?: number;
    selectedColor: string;
    selectedSize: string;
    quantity: number;
    stockLeft?: number;
    disabledColors?: string[];
    disabledSizes?: string[];
    colorOptions: ColorOption[];
    sizeOptions: SizeOption[];
    benefits: ProductBenefit[];
    // Variant meta
    sku?: string;
    variantLabel?: string;
    isNewVariant?: boolean;
    onColorChange: (color: string) => void;
    onSizeChange: (size: string) => void;
    onQuantityChange: (quantity: number) => void;
    onAddToCart: () => void;
    onBuyNow: () => void;
    tradeInValue?: number;
    stockStatusLabel?: string;
    isOutOfStock?: boolean;
}

export const ProductInfo = memo(({
    product,
    averageRating,
    reviewCount,
    soldCount = 150,
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
    onBuyNow,
    tradeInValue = 0,
    sku,
    variantLabel,
    isNewVariant,
    stockStatusLabel,
    isOutOfStock = false,
}: ProductInfoProps) => {
    const formatPrice = useCallback((price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(price);
    }, []);


    const finalPrice = Math.max(0, product.price - tradeInValue);

    return (
        <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
        >
            {/* Meta badges */}
            <div className="flex flex-wrap items-center gap-2">
                {product.category && (
                    <Badge
                        variant="secondary"
                        className="bg-gradient-to-r from-[var(--color-primary)]/10 to-[var(--color-primary)]/5 text-[var(--color-primary)] border-0"
                    >
                        {product.category}
                    </Badge>
                )}
                {isNewVariant && (
                    <Badge className="gap-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-sm">
                        <Tag className="h-3.5 w-3.5" />
                        New variant
                    </Badge>
                )}
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold leading-tight text-gray-900 lg:text-4xl">
                {product.name}
            </h1>

            {/* Variant / SKU line */}
            {(variantLabel || sku) && (
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                    {variantLabel && (
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                            {variantLabel}
                        </span>
                    )}
                    {sku && (
                        <span className="text-xs font-mono text-gray-500">
                            SKU: <span className="font-semibold text-gray-700">{sku}</span>
                        </span>
                    )}
                </div>
            )}

            {/* Rating */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                        <Star
                            key={i}
                            className={cn(
                                "h-5 w-5 transition-colors",
                                i < Math.floor(averageRating)
                                    ? "fill-amber-400 text-amber-400"
                                    : "fill-gray-200 text-gray-200"
                            )}
                        />
                    ))}
                </div>
                <span className="text-base font-semibold text-gray-900">{averageRating.toFixed(1)}</span>
                <span className="text-sm text-gray-500">({reviewCount} reviews)</span>
                <Separator.Root className="h-4 w-px bg-gray-300" decorative orientation="vertical" />
                <span className="text-sm font-medium text-green-600">{soldCount}+ sold</span>
            </div>

            {/* Price & stock panel */}
            <div className="rounded-xl bg-gradient-to-r from-gray-50 to-gray-100/60 p-4 space-y-3">
                <div className="flex flex-wrap items-baseline gap-3">
                    <span className="text-4xl font-bold text-[var(--color-primary)]">
                        {formatPrice(tradeInValue > 0 ? finalPrice : product.price)}
                    </span>
                    {tradeInValue > 0 && (
                        <span className="text-lg text-gray-400 line-through">
                            {formatPrice(product.price)}
                        </span>
                    )}
                    {product.originalPrice && tradeInValue === 0 && (
                        <span className="text-lg text-gray-400 line-through">
                            {formatPrice(product.originalPrice)}
                        </span>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {product.originalPrice && tradeInValue === 0 && (
                        <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-sm">
                            Sale -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                        </Badge>
                    )}
                    {tradeInValue > 0 && (
                        <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white border-0 shadow-sm px-3 py-1">
                            <RefreshCcw className="w-3.5 h-3.5 mr-1.5" />
                            Trade-in saves {formatPrice(tradeInValue)}
                        </Badge>
                    )}

                    {typeof stockLeft === 'number' && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            "inline-flex items-center gap-1.5 border-0 px-3 py-1 text-xs font-medium shadow-sm transition-all hover:bg-white/50 cursor-help",
                                            isOutOfStock
                                                ? "bg-red-50 text-red-700"
                                                : stockLeft < 10
                                                    ? "bg-amber-50 text-amber-700 animate-pulse"
                                                    : "bg-emerald-50 text-emerald-700",
                                        )}
                                    >
                                        <Package className="w-3.5 h-3.5" />
                                        <span>
                                            {isOutOfStock
                                                ? "Out of stock"
                                                : stockLeft < 10
                                                    ? `Hurry! Only ${stockLeft} left`
                                                    : `${stockLeft} in stock`}
                                        </span>
                                    </Badge>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="bg-gray-900 border-gray-800 text-white max-w-[200px] text-xs">
                                    {isOutOfStock
                                        ? "This variant is currently unavailable. Please choose another or check back later."
                                        : stockLeft < 10
                                            ? `Low stock! We only have ${stockLeft} items remaining in this configuration.`
                                            : "High availability! This item is currently in stock and ready to ship."}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>

                {!isOutOfStock && typeof stockLeft === 'number' && stockLeft < 20 && (
                    <div className="space-y-1.5 pt-1">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            <span>Stock Level</span>
                            <span className={cn(stockLeft < 5 ? "text-red-500" : "text-amber-500")}>
                                {stockLeft < 5 ? "Extremely Low" : "Running Low"}
                            </span>
                        </div>
                        <Progress
                            value={(stockLeft / 20) * 100}
                            className="h-1.5 bg-gray-200"
                        />
                    </div>
                )}

                {tradeInValue > 0 && (
                    <div className="mt-1.5 p-2.5 bg-emerald-50 rounded-lg border border-emerald-200">
                        <p className="text-sm text-emerald-700 font-medium flex items-center gap-2">
                            <RefreshCcw className="w-4 h-4" />
                            You're saving {formatPrice(tradeInValue)} with the Trade-in Program!
                        </p>
                    </div>
                )}
            </div>

            {/* Variant selection */}
            <div className="space-y-4 rounded-xl border border-gray-100 bg-white/80 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm text-gray-600">
                        <span className="font-semibold text-gray-900">Selected:</span>{" "}
                        <span className="font-medium text-[var(--color-primary)]">
                            {selectedColor && selectedSize
                                ? `${selectedColor.toUpperCase()} • ${selectedSize}`
                                : selectedColor || selectedSize || "Choose variant"}
                        </span>
                    </p>
                    {typeof stockLeft === 'number' && (
                        <div className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
                            isOutOfStock
                                ? "bg-red-50 text-red-700"
                                : stockLeft < 5
                                    ? "bg-amber-50 text-amber-700"
                                    : "bg-emerald-50 text-emerald-700",
                        )}>
                            {isOutOfStock ? (
                                <AlertTriangle className="w-3.5 h-3.5" />
                            ) : (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                            )}
                            <span>{stockStatusLabel || `${stockLeft} in stock`}</span>
                        </div>
                    )}
                </div>

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
                    max={stockLeft && stockLeft > 0 ? stockLeft : undefined}
                />
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
                <div className="flex gap-3">
                    <Button
                        size="lg"
                        onClick={onAddToCart}
                        disabled={isOutOfStock}
                        className={cn(
                            "flex-1 rounded-xl py-6 text-base font-semibold shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]",
                            isOutOfStock
                                ? "bg-gray-200 text-gray-500 cursor-not-allowed shadow-none hover:scale-100"
                                : "bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-hover)] text-white shadow-[var(--color-primary)]/30",
                        )}
                    >
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        Add to Cart
                    </Button>
                    <Button
                        size="lg"
                        variant="outline"
                        onClick={onBuyNow}
                        disabled={isOutOfStock}
                        className={cn(
                            "flex-1 rounded-xl border-2 py-6 text-base font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]",
                            isOutOfStock
                                ? "border-gray-200 text-gray-400 cursor-not-allowed hover:scale-100"
                                : "border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-gradient-to-r hover:from-[var(--color-primary)] hover:to-[var(--color-primary-hover)] hover:text-white hover:border-transparent",
                        )}
                    >
                        <Zap className="mr-2 h-5 w-5" />
                        Buy Now
                    </Button>
                </div>

                {/* Trade-in summary in buttons area */}
                {tradeInValue > 0 && (
                    <div className="flex items-center justify-center gap-2 text-sm text-emerald-600 bg-emerald-50 py-2 rounded-lg">
                        <RefreshCcw className="w-4 h-4" />
                        <span>Trade-in discount applied: <strong>-{formatPrice(tradeInValue)}</strong></span>
                    </div>
                )}
            </div>

            {/* Benefits */}
            <ProductBenefits benefits={benefits} />
        </motion.div>
    );
});

ProductInfo.displayName = 'ProductInfo';
