import { useState, useMemo, useCallback } from "react";
import type { ProductVariantResponse, ProductResponse } from "@/api/types/product.types";
import { useCart } from "@/store/useCart";
import { useCartAnimation } from "@/store/useCartAnimation";
import customizeTypeService from "@/api/services/customizeTypeService";
import variantService, { type VariantCustomizeTypeResponse } from "@/api/services/variantService";
import type { CustomizeTypeResponse } from "@/api/types/customizeType.types";
import { calculateTradeInValue } from "../utils/tradeIn";
import { mockEligibleTradeInProducts } from "../constants";
import type { TabType, TradeInProduct } from "../types";

interface UseProductDetailStateProps {
    product: ProductResponse | undefined;
    productImageRef: React.RefObject<HTMLDivElement | null>;
}

export function useProductDetailState({ product, productImageRef }: UseProductDetailStateProps) {
    const { addItem } = useCart();
    const { triggerFlyToCart } = useCartAnimation();

    // Base selections. Use null for "not user-overridden"
    const [userSelectedColor, setUserSelectedColor] = useState<string | null>(null);
    const [userSelectedSize, setUserSelectedSize] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>("description");
    const [selectedTradeInProducts, setSelectedTradeInProducts] = useState<string[]>([]);
    const [isCustomSize, setIsCustomSizeState] = useState(false);
    const [isCustomColor, setIsCustomColorState] = useState(false);
    const [customDimensions, setCustomDimensions] = useState({ length: 1, width: 1, thickness: 1 });
    const [customColorHex, setCustomColorHex] = useState("#FFFFFF");
    const [availableCustomizeTypes, setAvailableCustomizeTypes] = useState<CustomizeTypeResponse[]>([]);
    const [variantCustomizeTypes, setVariantCustomizeTypes] = useState<VariantCustomizeTypeResponse[]>([]);
    const [selectedCustomizeTypeId, setSelectedCustomizeTypeId] = useState<string | null>(null);

    // Fetch global customize types (fallback)
    const fetchGlobalCustomizeTypes = useCallback(async () => {
        try {
            const response = await customizeTypeService.getAll({ pageSize: 100 });
            setAvailableCustomizeTypes(response.items);
        } catch (error) {
            console.error("Failed to fetch global customize types:", error);
        }
    }, []);

    useMemo(() => {
        fetchGlobalCustomizeTypes();
    }, [fetchGlobalCustomizeTypes]);

    // Variants come directly from the product response (getBySlug includes them)
    const allVariants = useMemo(() => product?.variants ?? [], [product]);

    const getVariantSize = useCallback((v: ProductVariantResponse) => {
        if (!v) return "";
        if (v.size && v.size.trim().length > 0) return v.size.trim();
        const attrs = (v.attributes || {}) as { width?: number; length?: number; thickness?: number; size?: string };
        if (attrs.size) return attrs.size;
        if (attrs.width && attrs.length) {
            return `${attrs.width}x${attrs.length}${attrs.thickness ? `x${attrs.thickness}` : ""} cm`;
        }
        return "";
    }, []);

    // Optimization: Create a key-based lookup for variants
    const variantRegistry = useMemo(() => {
        const registry = new Map<string, ProductVariantResponse>();
        for (const v of allVariants) {
            const attrs = (v.attributes || {}) as { color?: string };
            const color = (attrs.color || "default").toLowerCase();
            const size = getVariantSize(v).toLowerCase();
            registry.set(`${color}:${size}`, v);
        }
        return registry;
    }, [allVariants, getVariantSize]);

    // Derived actual selections (defaults to first variant if user hasn't interacted)
    const selectedColor = useMemo(() => {
        if (isCustomColor) return "Custom";
        if (userSelectedColor !== null) return userSelectedColor;
        if (!allVariants.length) return "";
        return ((allVariants[0].attributes as { color?: string })?.color ?? "").toLowerCase();
    }, [allVariants, userSelectedColor, isCustomColor]);

    const selectedSize = useMemo(() => {
        if (isCustomSize) return `${customDimensions.length}x${customDimensions.width}x${customDimensions.thickness} cm (Custom)`;
        if (userSelectedSize !== null) return userSelectedSize;
        if (!allVariants.length) return "";
        return getVariantSize(allVariants[0]);
    }, [allVariants, userSelectedSize, getVariantSize, isCustomSize, customDimensions]);

    const dynamicColorOptions = useMemo(() => {
        const colorHexFallback: Record<string, string> = {
            cream: "#F5F5DC", pink: "#FFB6C1", blue: "#87CEEB",
            mint: "#98FB98", white: "#FFFFFF", gray: "#D1D5DB",
            peru: "#CD853F", red: "#EF4444", green: "#22C55E",
            yellow: "#EAB308", purple: "#A855F7", black: "#1E293B",
        };
        const aggregate = new Map<string, { label: string; hex?: string }>();
        for (const v of allVariants) {
            const attrs = (v.attributes || {}) as { color?: string; hexColor?: string };
            const rawColor = attrs.color?.trim();
            if (!rawColor) continue;
            const key = rawColor.toLowerCase();
            // Prefer hexColor from API attributes, then check if color itself is a hex
            const apiHex = attrs.hexColor?.trim();
            const isHex = (s: string) => /^#(?:[0-9a-fA-F]{3}){1,2}$/.test(s);
            const hex = apiHex && isHex(apiHex) ? apiHex : isHex(rawColor) ? rawColor : undefined;
            if (!aggregate.has(key)) {
                aggregate.set(key, { label: rawColor, hex });
            } else if (hex && !aggregate.get(key)!.hex) {
                aggregate.get(key)!.hex = hex;
            }
        }
        return Array.from(aggregate.entries()).map(([value, meta]) => ({
            value,
            label: meta.label,
            color: meta.hex ?? colorHexFallback[value] ?? "#F3F4F6",
        }));
    }, [allVariants]);

    const dynamicSizeOptions = useMemo(() => {
        const sizes = Array.from(new Set(allVariants.map(getVariantSize).filter(Boolean)));
        return sizes.map(value => ({ value, label: value, description: "" }));
    }, [allVariants, getVariantSize]);

    const productImages = useMemo(() => {
        if (!product) return [];
        const imagesFromUrls = product.imageUrls?.filter(Boolean) ?? [];
        if (imagesFromUrls.length > 0) return imagesFromUrls;
        const urls = product.assets?.map(a => a.url).filter(Boolean) ?? [];
        return urls.length > 0 ? urls : ["/images/placeholder-product.svg"];
    }, [product]);

    const currentVariant = useMemo(() => {
        if (!allVariants.length) return undefined;
        if (isCustomColor || isCustomSize) return allVariants[0]; 
        
        const key = `${selectedColor.toLowerCase()}:${selectedSize.toLowerCase()}`;
        return variantRegistry.get(key) || allVariants[0];
    }, [variantRegistry, allVariants, selectedColor, selectedSize, isCustomColor, isCustomSize]);

    // Fetch Variant-Specific Customize Types whenever the variant changes
    useMemo(async () => {
        if (!currentVariant?.id) return;
        try {
            const types = await variantService.getCustomizeTypes(currentVariant.id);
            setVariantCustomizeTypes(types);
            if (types.length > 0 && !selectedCustomizeTypeId) {
                setSelectedCustomizeTypeId(types[0].customizeTypeId);
            }
        } catch (e) {
            console.error("Failed to fetch variant customize types:", e);
        }
    }, [currentVariant?.id]);

    const { colorsWithStock, sizesWithStock, sizeByColor } = useMemo(() => {
        const colors = new Set<string>();
        const sizes = new Set<string>();
        const map = new Map<string, Set<string>>();
        for (const v of allVariants) {
            const attrs = (v.attributes || {}) as { color?: string };
            const color = attrs.color?.toLowerCase().trim();
            const size = getVariantSize(v);
            if (v.stockQuantity === 0) continue;
            if (color) {
                colors.add(color);
                if (!map.has(color)) map.set(color, new Set());
                if (size) { map.get(color)!.add(size); sizes.add(size); }
            } else if (size) {
                sizes.add(size);
            }
        }
        return { colorsWithStock: colors, sizesWithStock: sizes, sizeByColor: map };
    }, [allVariants, getVariantSize]);

    const currentPriceInfo = useMemo(() => {
        if (!product) return { price: 0, originalPrice: undefined, customSurcharge: 0 };
        const basePrice = currentVariant?.salePrice ?? currentVariant?.basePrice ?? product.minPrice ?? 0;
        
        // Add customization surcharge if active
        let customSurcharge = 0;
        if (isCustomSize || isCustomColor) {
            // Priority: Variant-Specific Override > Global Default
            const vType = variantCustomizeTypes.find(t => t.customizeTypeId === selectedCustomizeTypeId);
            if (vType) {
                customSurcharge = vType.finalPrice;
            } else {
                const globalType = availableCustomizeTypes.find(t => t.id === selectedCustomizeTypeId);
                customSurcharge = globalType?.defaultPrice ?? 0;
            }
        }

        const price = basePrice + customSurcharge;
        const originalPrice = (currentVariant?.basePrice && currentVariant.basePrice > price)
            ? currentVariant.basePrice
            : (product.maxPrice && product.maxPrice > price) ? product.maxPrice : undefined;
            
        return { price, originalPrice, customSurcharge };
    }, [product, currentVariant, isCustomSize, isCustomColor, availableCustomizeTypes, selectedCustomizeTypeId]);

    const currentStock = useMemo(() => {
        if (!currentVariant) return { stockLeft: undefined, stockStatusLabel: undefined, isOutOfStock: false };
        const stockLeft = currentVariant.stockQuantity;
        let label: string | undefined;
        let oos = false;
        if (typeof stockLeft === "number") {
            if (stockLeft === 0) { label = "Out of stock"; oos = true; }
            else if (stockLeft < 10) label = "Low stock";
            else label = "In stock";
        }
        return { stockLeft, stockStatusLabel: label, isOutOfStock: oos };
    }, [currentVariant]);

    const tradeInValue = useMemo(() => {
        const TRADE_IN_PERCENTAGE = 30;
        return selectedTradeInProducts.reduce((total: number, productId: string) => {
            const tradeInProduct = mockEligibleTradeInProducts.find(p => p.id === productId);
            if (tradeInProduct && tradeInProduct.canTradeIn) {
                return total + calculateTradeInValue(tradeInProduct.originalPrice, TRADE_IN_PERCENTAGE);
            }
            return total;
        }, 0);
    }, [selectedTradeInProducts]);

    const handleColorChange = useCallback((color: string) => {
        setUserSelectedColor(color);
        const sizes = sizeByColor.get(color.toLowerCase());
        if (sizes && sizes.size > 0 && !isCustomSize && !isCustomColor) {
            setUserSelectedSize(prev => (prev && sizes.has(prev)) ? prev : Array.from(sizes)[0]);
        } else if (!isCustomSize && !isCustomColor) {
            setUserSelectedSize("");
        }
    }, [sizeByColor, isCustomSize, isCustomColor]);

    const handleCustomDimensionChange = useCallback((field: 'length' | 'width' | 'thickness', value: number) => {
        setCustomDimensions(prev => prev[field] === value ? prev : ({ ...prev, [field]: value }));
    }, []);

    const setIsCustomSize = useCallback((val: boolean) => {
        setIsCustomSizeState(val);
    }, []);

    const setIsCustomColor = useCallback((val: boolean) => {
        setIsCustomColorState(val);
    }, []);

    const handleAddToCart = useCallback(() => {
        if (!product) return;
        const { price } = currentPriceInfo;
        if (productImageRef.current) {
            triggerFlyToCart(productImages[0] || "/images/placeholder-product.svg", productImageRef.current);
        }

        const tradeInInfo = selectedTradeInProducts.length > 0 ? {
            products: mockEligibleTradeInProducts
                .filter((p: TradeInProduct) => selectedTradeInProducts.includes(p.id) && p.canTradeIn)
                .map((p: TradeInProduct) => ({
                    id: p.id, name: p.name, image: p.image,
                    originalPrice: p.originalPrice,
                    tradeInValue: calculateTradeInValue(p.originalPrice, 30),
                })),
            totalValue: tradeInValue,
        } : undefined;

        // Optimization: Pre-calculate custom data to satisfy TypeScript
        const customData = (isCustomSize || isCustomColor) ? {
            isCustom: true,
            customAttributes: {
                ...(isCustomSize ? customDimensions : {}),
                ...(isCustomColor ? { colorHex: customColorHex } : {})
            },
            customizeTypeIds: selectedCustomizeTypeId ? [selectedCustomizeTypeId] : [],
            sku: (() => {
                const sizePart = isCustomSize ? `${customDimensions.length}x${customDimensions.width}` : (selectedSize || 'STD');
                const colorPart = isCustomColor ? customColorHex.replace('#', '') : (selectedColor || 'STD');
                return `VAR-CUST-${sizePart}-${colorPart}`.toUpperCase();
            })(),
        } : {};

        // Align with new backend requirements for customization
        const customizeDetails = [];
        if (isCustomSize || isCustomColor) {
            if (selectedCustomizeTypeId) {
                if (isCustomSize) {
                    customizeDetails.push({
                        ProductCustomizeTypeId: selectedCustomizeTypeId,
                        CustomizeContent: `${customDimensions.length}x${customDimensions.width}x${customDimensions.thickness}`
                    });
                }
                if (isCustomColor) {
                    customizeDetails.push({
                        ProductCustomizeTypeId: selectedCustomizeTypeId,
                        CustomizeContent: customColorHex
                    });
                }
            }
        }

        const cartItem: any = {
            id: product.id,
            productId: product.id, // backend might expect productId
            productVariantId: (isCustomSize || isCustomColor) ? null : (currentVariant?.id || null),
            comboId: null, // Default to null for single products
            name: product.name,
            image: productImages[0] || "/images/placeholder-product.svg",
            price,
            quantity,
            subtotal: price * quantity,
            color: isCustomColor ? "Custom" : (selectedColor || undefined),
            size: isCustomSize ? "Custom" : (selectedSize || undefined),
            tradeIn: tradeInInfo,
            isCustom: isCustomSize || isCustomColor,
            ProductCustomizeDetailRequest: customizeDetails.length > 0 ? customizeDetails : undefined,
            ...customData
        };

        addItem(cartItem);
        setSelectedTradeInProducts([]);
        setIsCustomSize(false);
        setIsCustomColor(false);
    }, [product, quantity, selectedColor, selectedSize, addItem, triggerFlyToCart, currentPriceInfo, productImages, productImageRef, selectedTradeInProducts, tradeInValue, currentVariant, isCustomSize, isCustomColor, customDimensions, customColorHex, selectedCustomizeTypeId]);

    const disabledColors = useMemo(() =>
        dynamicColorOptions.map(c => c.value).filter(val => !colorsWithStock.has(val.toLowerCase())),
        [dynamicColorOptions, colorsWithStock]);

    const disabledSizes = useMemo(() => {
        const allowed = selectedColor ? sizeByColor.get(selectedColor.toLowerCase()) : sizesWithStock;
        return dynamicSizeOptions.map(s => s.value).filter(val => !allowed?.has(val));
    }, [dynamicSizeOptions, selectedColor, sizeByColor, sizesWithStock]);

    // Stable actions object
    const actions = useMemo(() => ({
        setSelectedImage,
        setUserSelectedColor,
        setUserSelectedSize,
        setQuantity,
        setIsWishlisted,
        setActiveTab,
        setSelectedTradeInProducts,
        handleColorChange,
        handleAddToCart,
        setIsCustomSize,
        setIsCustomColor,
        handleCustomDimensionChange,
        setCustomColorHex
    }), [
        setUserSelectedColor,
        setUserSelectedSize,
        setQuantity,
        setIsWishlisted,
        setActiveTab,
        setSelectedTradeInProducts,
        handleColorChange,
        handleAddToCart,
        setIsCustomSize,
        setIsCustomColor,
        handleCustomDimensionChange,
        setCustomColorHex
    ]);

    return {
        state: {
            selectedImage, selectedColor, selectedSize, quantity,
            isWishlisted, activeTab, selectedTradeInProducts,
            productImages, dynamicColorOptions, dynamicSizeOptions,
            currentVariant, currentPriceInfo, currentStock, tradeInValue,
            disabledColors, disabledSizes, isCustomSize, isCustomColor, customDimensions, customColorHex, 
            availableCustomizeTypes, variantCustomizeTypes, selectedCustomizeTypeId,
            isProductCustomizable: true
        },
        actions: {
            ...actions,
            setSelectedCustomizeTypeId
        },
        getVariantSize
    };
}
