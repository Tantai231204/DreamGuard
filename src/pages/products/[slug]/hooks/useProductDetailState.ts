import { useState, useMemo, useCallback, useEffect } from "react";
import type { ProductVariantResponse, ProductResponse } from "@/api/types/product.types";
import { useCartStore } from "@/store/useCartStore";
import { useCartAnimation } from "@/store/useCartAnimation";
import { MATTRESS_LIMITS } from "../constants";
import type { TabType } from "../types";
import { toast } from "sonner";
import { getColorHex as resolveColorHex } from "@/utils/color-utils";

import { generateConfigHash } from "@/store/useCartStore";

interface UseProductDetailStateProps {
    product: ProductResponse | undefined;
    productImageRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * SENIOR PERFORMANCE OPTIMIZED HOOK
 * 1. Referential Stability: Stable 'state' and 'actions' objects (useMemo/useCallback)
 * 2. Optimized Processing: O(N) single-pass data extraction
 * 3. Reactive UI: Derived state calculated via selective useMemo dependency tracking
 * 4. Zero Re-renders for Children: Compatible with React.memo via stable props
 */
export function useProductDetailState({ product, productImageRef }: UseProductDetailStateProps) {
    const { addItem } = useCartStore();
    const { triggerFlyToCart } = useCartAnimation();

    // ── RAW UI STATE ──
    const [userSelectedColor, setUserSelectedColor] = useState<string | null>(null);
    const [userSelectedSize, setUserSelectedSize] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>("description");
    const [selectedTradeInProducts, setSelectedTradeInProducts] = useState<string[]>([]);
    const [isTradeInOpen, setIsTradeInOpen] = useState(false);

    // Customization flags
    const [isCustomSize, setIsCustomSize] = useState(false);
    const [isCustomColor, setIsCustomColor] = useState(false);
    const [customDimensions, setCustomDimensions] = useState({ length: 190, width: 160, thickness: 15 });
    const [customColorHex, setCustomColorHex] = useState("#FFFFFF");

    // ── CORE UTILITIES ──
    const getAttr = useCallback((v: ProductVariantResponse | undefined, keys: string[]): string | number | undefined => {
        if (!v) return undefined;
        const vRec = v as unknown as Record<string, unknown>;
        for (const k of keys) {
            const capitalizedKey = k.charAt(0).toUpperCase() + k.slice(1);
            const val = vRec[k] ?? vRec[capitalizedKey];
            if (val !== undefined && (typeof val === "string" || typeof val === "number")) return val;
        }
        if (v.attributes) {
            const attrs = v.attributes as Record<string, unknown>;
            for (const k of keys) {
                const capitalizedKey = k.charAt(0).toUpperCase() + k.slice(1);
                const val = attrs[k] ?? attrs[capitalizedKey];
                if (val !== undefined && (typeof val === "string" || typeof val === "number")) return val;
            }
        }
        return undefined;
    }, []);

    const getVariantSize = useCallback((v: ProductVariantResponse) => {
        if (!v) return "";
        const rawSize = v.size || getAttr(v, ["size"]);
        if (rawSize && typeof rawSize === "string" && rawSize.trim().length > 0) return rawSize.trim().toUpperCase();
        const width = getAttr(v, ["width"]);
        const length = getAttr(v, ["length"]);
        const thickness = getAttr(v, ["thickness"]);
        if (width && length) return `${width}X${length}${thickness ? `X${thickness}` : ""}`;
        return "";
    }, [getAttr]);

    const getVariantColor = useCallback((v: ProductVariantResponse | undefined) => {
        if (!v) return "Default";
        const val = getAttr(v, ["color", "colorName"]);
        return val ? String(val).trim() : "Default";
    }, [getAttr]);

    // ── SINGLE-PASS DATA PROCESSING (O(N)) ──
    const processedData = useMemo(() => {
        const variants = product?.variants ?? [];
        const registry = new Map<string, ProductVariantResponse>();
        const colorMeta = new Map<string, { label: string; hex?: string }>();
        const sizeSet = new Set<string>();
        const availableSizesByColor = new Map<string, Set<string>>();
        const colorsWithStock = new Set<string>();
        const customizableByColor = new Map<string, { size: boolean; color: boolean; sizeId?: string; colorId?: string; sizePrice?: number; colorPrice?: number }>();

        let firstAvailable: ProductVariantResponse | null = null;
        let firstStandard: ProductVariantResponse | null = null;

        variants.forEach(v => {
            const attrs = (v.attributes || {}) as Record<string, unknown>;
            const rawColor = (attrs.color || attrs.Color || getAttr(v, ["color", "colorName"])) ? String(attrs.color || attrs.Color || getAttr(v, ["color", "colorName"])).trim() : "Default";
            const colorKey = rawColor.toLowerCase();
            const sizeLabel = getVariantSize(v);
            const sizeKey = sizeLabel.toLowerCase();
            const hasStock = (v.stockQuantity ?? 0) > 0;
            const isCustom = !!v.isCustomizable || !!v.is_customizable || (v.customizeOptions && v.customizeOptions.length > 0) || (v.customizeOptionGroups && v.customizeOptionGroups.length > 0);

            if (sizeLabel) {
                registry.set(`${colorKey}:${sizeKey}`, v);
                sizeSet.add(sizeLabel);
            }

            const currentHex = (() => {
                const h = String(attrs.hexColor || attrs.HexColor || getAttr(v, ["hexColor", "colorHex"]) || "").trim().replace(/^#/, '');
                return /^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(h) ? `#${h}` : undefined;
            })();

            const existingMeta = colorMeta.get(colorKey);
            if (!existingMeta) {
                colorMeta.set(colorKey, {
                    label: rawColor,
                    hex: currentHex
                });
            } else if (!existingMeta.hex && currentHex) {
                // Prioritize finding a valid hex from ANY variant of this color color
                existingMeta.hex = currentHex;
                // Update label to capitalized Color if current variant has it and previous didn't
                if (attrs.Color && !existingMeta.label.includes(String(attrs.Color))) {
                    existingMeta.label = String(attrs.Color);
                }
            }

            if (isCustom) {
                const allOptions = [
                    ...(v.customizeOptions || []),
                    ...(v.customizeOptionGroups?.flatMap(g => g.options || []) || [])
                ];

                const colorOpt = allOptions.find(o =>
                    o.name.toLowerCase().includes('color') || o.name.toLowerCase().includes('màu')
                );
                const sizeOpt = allOptions.find(o =>
                    o.name.toLowerCase().includes('size') || o.name.toLowerCase().includes('kích')
                );

                const prev = customizableByColor.get(colorKey) || { size: false, color: false };

                customizableByColor.set(colorKey, {
                    size: prev.size || !!sizeOpt || (v.isCustomizable && !sizeLabel),
                    color: prev.color || !!colorOpt || (v.isCustomizable && rawColor === "Default"),
                    sizeId: sizeOpt?.customizeTypeId || prev.sizeId,
                    colorId: colorOpt?.customizeTypeId || prev.colorId,
                    sizePrice: (sizeOpt?.overridePrice ?? sizeOpt?.defaultPrice) || prev.sizePrice || 0,
                    colorPrice: (colorOpt?.overridePrice ?? colorOpt?.defaultPrice) || prev.colorPrice || 0,
                });
            }

            const allOptions = [
                ...(v.customizeOptions || []),
                ...(v.customizeOptionGroups?.flatMap(g => g.options || []) || [])
            ];

            const sizeOpt = isCustom ? allOptions.find(o =>
                o.name.toLowerCase().includes('size') || o.name.toLowerCase().includes('kích')
            ) : null;

            const isActuallyAvailable = hasStock || isCustom;

            if (isActuallyAvailable && (sizeLabel || sizeOpt)) {
                colorsWithStock.add(colorKey);
                if (sizeLabel) {
                    if (!availableSizesByColor.has(colorKey)) availableSizesByColor.set(colorKey, new Set());
                    availableSizesByColor.get(colorKey)!.add(sizeLabel);
                }
                if (!firstAvailable && !isCustom && sizeLabel) firstAvailable = v;
                if (!firstStandard && !isCustom && sizeLabel) firstStandard = v;
            }
        });

        const colorOptions = Array.from(colorMeta.entries()).map(([val, meta]) => ({
            value: val,
            label: meta.label,
            color: meta.hex || resolveColorHex(meta.label),
        })).filter(o => colorMeta.size === 1 || o.value !== "default");

        const sizeOptions = Array.from(sizeSet).map(s => ({ value: s, label: s, description: "" }));
        const fallbackVariant = firstStandard || firstAvailable || (variants.length > 0 ? variants[0] : null);

        return {
            registry, colorOptions, sizeOptions, colorsWithStock,
            availableSizesByColor, customizableByColor, fallbackVariant
        };
    }, [product, getVariantSize, getAttr]);

    // ── DYNAMIC SELECTION RESOLUTION ──
    const selectedColor = useMemo(() => {
        if (isCustomColor) return "Bespoke Palette";
        if (userSelectedColor !== null) return userSelectedColor;
        return getVariantColor(processedData.fallbackVariant || undefined).toLowerCase();
    }, [userSelectedColor, isCustomColor, processedData.fallbackVariant, getVariantColor]);

    const customizationCaps = useMemo(() => {
        // If we are in Bespoke Color mode, we need a fallback for the type IDs (since "Bespoke Palette" isn't a real variant)
        if (isCustomColor) {
            const allCaps = Array.from(processedData.customizableByColor.values());
            const bestCap = allCaps.find(c => c.size && c.color) || allCaps.find(c => c.size || c.color);
            return bestCap || { size: false, color: false };
        }

        // Standard mode: Return the specific caps for this color or empty if none
        return processedData.customizableByColor.get(selectedColor.toLowerCase()) || { size: false, color: false };
    }, [processedData.customizableByColor, selectedColor, isCustomColor]);

    const canCustomizeSize = useMemo(() => !!customizationCaps.size, [customizationCaps]);

    const canCustomizeColor = useMemo(() => {
        // Check if ANY variant supports custom color
        return Array.from(processedData.customizableByColor.values()).some(v => v.color);
    }, [processedData.customizableByColor]);

    const selectedSize = useMemo(() => {
        if (isCustomSize && canCustomizeSize) return `Bespoke (${customDimensions.length}x${customDimensions.width}x${customDimensions.thickness})`;
        if (userSelectedSize !== null) return userSelectedSize;
        return processedData.fallbackVariant ? getVariantSize(processedData.fallbackVariant) : "";
    }, [userSelectedSize, isCustomSize, canCustomizeSize, customDimensions, processedData.fallbackVariant, getVariantSize]);

    const currentVariant = useMemo(() => {
        if (isCustomColor) return processedData.fallbackVariant || undefined;

        // If Custom Size, find the customizable variant for THIS specific color
        if (isCustomSize && canCustomizeSize) {
            const colorKey = selectedColor.toLowerCase();
            const variants = product?.variants ?? [];
            const specificCustomizable = variants.find(v => {
                const color = getVariantColor(v).toLowerCase();
                const isCustom = !!v.isCustomizable || !!v.is_customizable || (v.customizeOptions && v.customizeOptions.length > 0) || (v.customizeOptionGroups && v.customizeOptionGroups.length > 0);
                return color === colorKey && isCustom;
            });
            return specificCustomizable || processedData.fallbackVariant || undefined;
        }

        return processedData.registry.get(`${selectedColor.toLowerCase()}:${selectedSize.toLowerCase()}`) || processedData.fallbackVariant || undefined;
    }, [selectedColor, selectedSize, isCustomColor, isCustomSize, canCustomizeSize, processedData, product, getVariantColor]);

    const currentPriceInfo = useMemo(() => {
        if (!product) return { price: 0, originalPrice: undefined, colorSurcharge: 0, sizeSurcharge: 0 };
        const salePrice = currentVariant?.salePrice;
        const variantBasePrice = currentVariant?.basePrice;
        const basePrice = typeof salePrice === 'number' && salePrice > 0
            ? salePrice
            : (variantBasePrice ?? product.minPrice ?? 0);

        const colorSurcharge = isCustomColor ? (customizationCaps.colorPrice || 0) : 0;
        const sizeSurcharge = (isCustomSize && canCustomizeSize) ? (customizationCaps.sizePrice || 0) : 0;
        const totalPrice = basePrice + colorSurcharge + sizeSurcharge;

        return {
            price: totalPrice,
            originalPrice: (currentVariant?.basePrice && currentVariant.basePrice > totalPrice) ? currentVariant.basePrice : undefined,
            colorSurcharge, sizeSurcharge
        };
    }, [product, currentVariant, isCustomColor, isCustomSize, canCustomizeSize, customizationCaps]);

    const currentStock = useMemo(() => {
        if (!currentVariant) return { stockLeft: undefined, stockStatusLabel: "Out of stock", isOutOfStock: true };
        const stockLeft = currentVariant.stockQuantity ?? 0;
        return {
            stockLeft,
            stockStatusLabel: stockLeft === 0 ? "Out of stock" : stockLeft < 10 ? "Low stock" : "In stock",
            isOutOfStock: stockLeft === 0
        };
    }, [currentVariant]);

    // ── QUANTITY SYNCHRONIZATION ──
    // Senior Reactive Pattern: Ensure quantity is always capped by available stock.
    // We use a micro-delay to avoid synchronous setState warnings in strict environments.
    useEffect(() => {
        const stock = currentStock.stockLeft;
        if (stock !== undefined && stock >= 0) {
            const timer = setTimeout(() => {
                setQuantity(prev => {
                    if (prev > stock) return Math.max(1, stock);
                    if (stock === 0 && prev > 1) return 1;
                    return prev;
                });
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [currentStock.stockLeft]);




    // ── STABLE ACTIONS ──
    const handleSetIsCustomColor = useCallback((val: boolean) => {
        if (val === isCustomColor) return;
        setIsCustomColor(val);
        if (val) {
            setIsCustomSize(true);
            setUserSelectedColor(null);
            setUserSelectedSize(null);
            toast.info("Bespoke Color requires Bespoke Size", { duration: 2000 });
        } else {
            setIsCustomSize(false);
        }
    }, [isCustomColor]);

    const handleSetIsCustomSize = useCallback((val: boolean) => {
        if (val === isCustomSize) return;
        if (!val && isCustomColor) {
            toast.warning("Bespoke Color requires Bespoke Size. Disable Bespoke Color first.");
            return;
        }
        setIsCustomSize(val);
        if (val) setUserSelectedSize(null);
    }, [isCustomColor, isCustomSize]);

    const handleColorChange = useCallback((color: string) => {
        const norm = color.toLowerCase().trim();
        setUserSelectedColor(norm);

        if (isCustomColor) setIsCustomColor(false);

        const sizes = processedData.availableSizesByColor.get(norm);
        const caps = processedData.customizableByColor.get(norm);

        if (sizes && sizes.size > 0) {
            setIsCustomSize(false);
            const prevSize = userSelectedSize;
            const nextSize = (prevSize && sizes.has(prevSize)) ? prevSize : Array.from(sizes)[0];

            if (nextSize !== prevSize) {
                setUserSelectedSize(nextSize);
            }
        } else if (caps?.size) {
            setIsCustomSize(true);
            setUserSelectedSize(null);
        } else {
            setIsCustomSize(false);
        }
    }, [processedData, isCustomColor, userSelectedSize]);

    const handleSizeChange = useCallback((size: string) => {
        setUserSelectedSize(size);
    }, []);

    const handleAddToCart = useCallback(() => {
        if (!product) return;
        const images = product.imageUrls?.filter(Boolean) || product.assets?.map(a => a.url).filter(Boolean) || ["/images/placeholder-product.svg"];
        if (productImageRef.current) triggerFlyToCart(images[0], productImageRef.current);

        const customizeDetails: Array<{ ProductCustomizeTypeId: string; CustomizeContent: string }> = [];

        // Resolve active color hex FIRST (needed for both payload and hash)
        const currentStandardColorOpt = processedData.colorOptions.find(o => o.value === selectedColor.toLowerCase());
        const colorLabel = isCustomColor ? "Bespoke" : (currentStandardColorOpt?.label || selectedColor);
        const activeColorHex = isCustomColor ? customColorHex : (currentStandardColorOpt?.color || "#FFFFFF");

        // For customizable variants: ALWAYS send color + size details
        const isCustomVariant = isCustomSize || isCustomColor;

        if (isCustomVariant && customizationCaps.colorId) {
            // Color content = hex value (bespoke or standard)
            customizeDetails.push({
                ProductCustomizeTypeId: customizationCaps.colorId,
                CustomizeContent: activeColorHex
            });
        }

        if (isCustomSize && canCustomizeSize && customizationCaps.sizeId) {
            const { length: L, width: W, thickness: T } = customDimensions;
            const lim = MATTRESS_LIMITS;
            if (L < lim.length.min || L > lim.length.max || W < lim.width.min || W > lim.width.max || T < lim.thickness.min || T > lim.thickness.max) {
                toast.error("Dimensions outside safety limits.");
                return;
            }
            customizeDetails.push({
                ProductCustomizeTypeId: customizationCaps.sizeId,
                CustomizeContent: `${L}x${W}x${T}`
            });
        }

        const configHash = generateConfigHash(currentVariant?.id || null, null, customizeDetails);

        addItem({
            id: (isCustomSize || isCustomColor) ? `item_${product.id}_bespoke_${configHash}` : (currentVariant?.id || product.id),
            productId: product.id,
            productVariantId: currentVariant?.id || null,
            name: product.name,
            image: images[0],
            price: currentPriceInfo.price,
            quantity,
            comboId: null,
            color: colorLabel,
            size: isCustomSize ? "Bespoke" : (selectedSize || undefined),
            isCustom: isCustomSize || isCustomColor,
            ProductCustomizeDetailRequest: customizeDetails.length > 0 ? customizeDetails : undefined,
            customAttributes: (isCustomSize || isCustomColor) || activeColorHex ? {
                ...customDimensions,
                colorHex: activeColorHex
            } : undefined,
            availableStock: currentStock.stockLeft,
            configHash: configHash,
        });
    }, [product, quantity, selectedColor, selectedSize, addItem, triggerFlyToCart, currentPriceInfo.price, productImageRef, currentVariant, isCustomSize, canCustomizeSize, isCustomColor, customDimensions, customColorHex, customizationCaps, processedData.colorOptions, currentStock]);

    // ── FINAL STABLE STATE & ACTIONS ──
    const state = useMemo(() => ({
        selectedImage, selectedColor, selectedSize, quantity, isWishlisted, activeTab, selectedTradeInProducts, isTradeInOpen,
        productImages: product?.imageUrls?.filter(Boolean) || product?.assets?.map(a => a.url).filter(Boolean) || ["/images/placeholder-product.svg"],
        dynamicColorOptions: processedData.colorOptions,
        dynamicSizeOptions: (isCustomColor || !selectedColor) ? [] : processedData.sizeOptions.filter(opt => {
            return !!processedData.availableSizesByColor.get(selectedColor.toLowerCase())?.has(opt.value);
        }),
        currentVariant, currentPriceInfo, currentStock,
        disabledColors: processedData.colorOptions.filter(c => !processedData.colorsWithStock.has(c.value.toLowerCase())).map(c => c.value),
        disabledSizes: processedData.sizeOptions.filter(s => !processedData.availableSizesByColor.get(selectedColor.toLowerCase())?.has(s.value)).map(s => s.value),
        isCustomSize: isCustomColor || isCustomSize,
        isCustomColor, customDimensions, customColorHex, canCustomizeColor, canCustomizeSize
    }), [
        selectedImage, selectedColor, selectedSize, quantity, isWishlisted, activeTab, selectedTradeInProducts, isTradeInOpen,
        product, processedData, isCustomColor, isCustomSize, canCustomizeColor, canCustomizeSize,
        currentVariant, currentPriceInfo, currentStock, customDimensions, customColorHex
    ]);

    const actions = useMemo(() => ({
        setSelectedImage, setUserSelectedColor, setUserSelectedSize, setQuantity, setIsWishlisted, setActiveTab, setSelectedTradeInProducts, setIsTradeInOpen,
        handleColorChange, handleSizeChange, handleAddToCart, setIsCustomSize: handleSetIsCustomSize,
        setIsCustomColor: handleSetIsCustomColor,
        handleCustomDimensionChange: (field: keyof typeof customDimensions, val: number) => setCustomDimensions(p => ({ ...p, [field]: val })),
        setCustomColorHex
    }), [
        handleColorChange, handleSizeChange, handleAddToCart, handleSetIsCustomSize, handleSetIsCustomColor, setCustomDimensions
    ]);

    return { state, actions, getVariantSize };
}
