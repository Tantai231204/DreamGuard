import { memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, Zap, RefreshCcw } from 'lucide-react';
import * as Separator from '@radix-ui/react-separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ColorSelector } from './ColorSelector';
import { SizeSelector } from './SizeSelector';
import { QuantitySelector } from './QuantitySelector';
import { ProductBenefits } from './ProductBenefits';
import type { ColorOption, SizeOption, ProductBenefit } from '../types';

interface Product {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    category: string;
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
    colorOptions: ColorOption[];
    sizeOptions: SizeOption[];
    benefits: ProductBenefit[];
    onColorChange: (color: string) => void;
    onSizeChange: (size: string) => void;
    onQuantityChange: (quantity: number) => void;
    onAddToCart: () => void;
    onBuyNow: () => void;
    tradeInValue?: number;
}

export const ProductInfo = memo(({
    product,
    averageRating,
    reviewCount,
    soldCount = 150,
    selectedColor,
    selectedSize,
    quantity,
    stockLeft = 50,
    colorOptions,
    sizeOptions,
    benefits,
    onColorChange,
    onSizeChange,
    onQuantityChange,
    onAddToCart,
    onBuyNow,
    tradeInValue = 0
}: ProductInfoProps) => {
    const formatPrice = useCallback((price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(price);
    }, []);

    const savings = product.originalPrice 
        ? product.originalPrice - product.price 
        : 0;

    const finalPrice = product.price - tradeInValue;

    return (
        <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
        >
            {/* Category Badge */}
            <Badge variant="secondary" className="bg-gradient-to-r from-[var(--color-primary)]/10 to-[var(--color-primary)]/5 text-[var(--color-primary)] border-0">
                {product.category}
            </Badge>

            {/* Title */}
            <h1 className="text-3xl font-bold leading-tight text-gray-900 lg:text-4xl">
                {product.name}
            </h1>

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

            {/* Price */}
            <div className="rounded-xl bg-gradient-to-r from-gray-50 to-gray-100/50 p-4">
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
                
                {/* Badges row */}
                <div className="flex flex-wrap gap-2 mt-3">
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
                </div>
                
                {tradeInValue > 0 && (
                    <div className="mt-3 p-2.5 bg-emerald-50 rounded-lg border border-emerald-200">
                        <p className="text-sm text-emerald-700 font-medium flex items-center gap-2">
                            <RefreshCcw className="w-4 h-4" />
                            You're saving {formatPrice(tradeInValue)} with the Trade-in Program!
                        </p>
                    </div>
                )}
            </div>

            {/* Short Description */}
            <p className="text-base text-gray-600 leading-relaxed">
                Premium baby bedding set made from 100% organic cotton, incredibly soft and absolutely safe for your baby's sensitive skin. Certified by international child product safety standards.
            </p>

            {/* Divider */}
            <Separator.Root className="bg-gray-200" />

            {/* Color Selection */}
            <ColorSelector
                options={colorOptions}
                selected={selectedColor}
                onChange={onColorChange}
            />

            {/* Size Selection */}
            <SizeSelector
                options={sizeOptions}
                selected={selectedSize}
                onChange={onSizeChange}
            />

            {/* Quantity */}
            <QuantitySelector
                value={quantity}
                onChange={onQuantityChange}
                stockLeft={stockLeft}
            />

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
                <div className="flex gap-3">
                    <Button
                        size="lg"
                        onClick={onAddToCart}
                        className="flex-1 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-hover)] py-6 text-base font-semibold text-white shadow-lg shadow-[var(--color-primary)]/30 transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        Add to Cart
                    </Button>
                    <Button
                        size="lg"
                        variant="outline"
                        onClick={onBuyNow}
                        className="flex-1 rounded-xl border-2 border-[var(--color-primary)] py-6 text-base font-semibold text-[var(--color-primary)] transition-all hover:bg-gradient-to-r hover:from-[var(--color-primary)] hover:to-[var(--color-primary-hover)] hover:text-white hover:border-transparent hover:scale-[1.02] active:scale-[0.98]"
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
