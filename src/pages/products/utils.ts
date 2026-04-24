import type { ProductResponse } from '@/api/types/product.types';
import type { Product } from './types';

export interface ProductExtended extends Product {
    colors: string[];
    sizes: string[];
    createdAt: string;
}

export function mapToProduct(p: ProductResponse): ProductExtended {
    const variants = p.variants || [];

    // Sort variants by price to find the absolute minimum
    const variantPrices = variants.map(v => v.salePrice || v.basePrice).filter(price => price > 0);
    const price = variantPrices.length > 0 ? Math.min(...variantPrices) : (p.minPrice || 0);

    const firstVariant = variants[0];
    const originalPrice = firstVariant?.basePrice || p.maxPrice || undefined;
    const discount =
        originalPrice && originalPrice > price
            ? Math.round(((originalPrice - price) / originalPrice) * 100)
            : undefined;

    const firstImage = p.imageUrls?.[0] || p.assets?.[0]?.url;
    const isOutOfStock = p.status === 'OutOfStock';
    const isPublished = p.status === 'Published';

    // Aggregate colors and sizes from all variants
    const colors = Array.from(new Set(
        variants
            .map(v => (v.attributes?.color as string) || (v.attributes?.colorName as string))
            .filter(Boolean)
    ));
    const sizes = Array.from(new Set(
        variants
            .map(v => v.size)
            .filter(Boolean)
    ));

    // A product is "New" if ANY of its variants are marked as new
    const isNew = variants.some(v => v.isNew);

    return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        summary: p.summary || '',
        price,
        originalPrice: discount ? originalPrice : undefined,
        discount,
        rating: p.averageRating ?? 0,
        reviewCount: 0,
        image: firstImage || 'https://images.unsplash.com/photo-1632345031435-07ca6834a362?q=80&w=800&auto=format&fit=crop',
        category: p.categoryName || '',
        material: p.material || '',
        ageRange: p.ageGroup?.toString() || '',
        inStock: isPublished && !isOutOfStock,
        isNew: isNew,
        status: p.status,
        colors,
        sizes,
        createdAt: p.createdAt || new Date().toISOString(),
    };
}
