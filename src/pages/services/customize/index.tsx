import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft,
  ShoppingCart
} from "lucide-react";

import { useCartStore } from "@/store/useCartStore";
import { useFullyCustomizedProducts, useProductVariants } from "@/hooks/queries/useProduct";
import { PageLoader } from "@/components/common/PageLoader";
import ProductPreview3D from "./components/ProductPreview3D";
import { SizeSelector } from "./components/SizeSelector";
import { Button } from "@/components/ui/button";
import { ChromaProfile } from "./components/ChromaProfile";
import { TextureLab } from "./components/TextureLab";
import { cn } from "@/lib/utils";
import { ArtisticRefinement } from "./components/ArtisticRefinement";
import { StudioAIAdvisor } from "./components/StudioAIAdvisor";
import { uploadToCloudinary } from "@/lib/uploadCloudinary";

import {
  generateConfigHash
} from "@/store/useCartStore";

import {
  customizableProducts
} from "./data";

import type {
  DesignConfig,
  MaterialOption,
  CustomizableProduct,
  ProductVariant
} from "./types";

import type { CustomizeOptionGroupResponse, CustomizeOptionResponse } from "@/api/types/product.types";

const CustomizeStudio = () => {
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  const [isAdding, setIsAdding] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  // 1. Fetch Dynamic Data from API
  const { data: apiProducts, isLoading: productsLoading } = useFullyCustomizedProducts();

  // 🔥 Reactive Selection Logic
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const derivedProducts = useMemo(() => {
    if (!apiProducts) return [];
    return apiProducts.map((p) => {
      const lowerName = p.name.toLowerCase();
      let icon = "✨";
      let localSlug = "";
      if (lowerName.includes('pillow')) { icon = "☁️"; localSlug = "pillow"; }
      else if (lowerName.includes('crib')) { icon = "🛏️"; localSlug = "crib_bedding_set"; }
      else if (lowerName.includes('mattress')) { icon = "🛏️"; localSlug = "mattress"; }

      const localRef = customizableProducts.find(lp => lp.id === localSlug);
      const sizes = localRef ? [...localRef.availableSizes] : [];
      if (sizes.length === 0) sizes.push({ id: "std", label: "Standard", priceAdd: 0 });

      return {
        id: p.id,
        name: p.name,
        description: p.summary,
        icon,
        basePrice: p.basePrice,
        salePrice: p.salePrice || 0,
        availableSizes: sizes,
        type: localSlug,
        image: p.imageUrls?.[0] || ""
      } as CustomizableProduct;
    });
  }, [apiProducts]);

  const selectedProduct = useMemo(() => {
    if (selectedId) return derivedProducts.find(p => p.id === selectedId) || derivedProducts[0];
    return derivedProducts[0];
  }, [selectedId, derivedProducts]);

  const { data: variantsData } = useProductVariants(selectedProduct?.id || "");

  const customSchema = useMemo(() => {
    if (!selectedProduct || !variantsData || !Array.isArray(variantsData) || variantsData.length === 0) return null;
    const custom = variantsData.find((v) => v.isCustomizable || v.is_customizable);
    if (custom) return custom;
    const withGroups = variantsData.find(v => v.customizeOptionGroups && v.customizeOptionGroups.length > 0);
    return withGroups || variantsData[0];
  }, [selectedProduct, variantsData]);

  const variantPresets = useMemo(() => {
    if (!variantsData || !Array.isArray(variantsData)) return [];
    return variantsData.map(v => ({
      id: v.id,
      sku: v.sku,
      color: (v.attributes?.color as string) || "Standard",
      colorCode: (v.attributes?.colorCode as string) || "#FFFFFF",
      salePrice: v.salePrice,
      basePrice: v.basePrice
    })) as ProductVariant[];
  }, [variantsData]);

  const derivedMaterials = useMemo(() => {
    const materialGroup = customSchema?.customizeOptionGroups?.find((g: CustomizeOptionGroupResponse) => g.category === 'Material');
    if (!materialGroup) return [];

    return materialGroup.options.map((o: CustomizeOptionResponse) => ({
      id: o.customizeTypeId,
      name: o.name,
      description: o.summary,
      priceMultiplier: o.calculationMode === 'Multiplier' ? (o.overrideMultiplier ?? o.defaultMultiplier ?? 1.0) : 1.0,
      priceAdd: o.calculationMode === 'FixedAmount' ? (o.overridePrice ?? o.defaultPrice ?? 0) : 0,
      badge: 'Custom'
    })) as MaterialOption[];
  }, [customSchema]);

  const availableSizes = useMemo(() => {
    if (!selectedProduct) return [];

    // API Options
    const apiOptions = customSchema?.customizeOptionGroups?.find((g: CustomizeOptionGroupResponse) => g.category === 'Size')?.options || [];
    const localSizes = selectedProduct.availableSizes || [];

    const combined = [...(apiOptions.length > 0 ? apiOptions.map((o: CustomizeOptionResponse) => ({
      id: o.customizeTypeId,
      label: o.name,
      priceAdd: o.overridePrice ?? o.defaultPrice ?? 0
    })) : []), ...localSizes];

    // Robust merging logic: Only use labels to avoid duplicate UI entries, but keep API IDs if they exist
    const uniqueMap = new Map();
    combined.forEach(item => {
      const labelKey = item.label.toLowerCase().trim().replace(/ /g, '');
      if (!uniqueMap.has(labelKey)) {
        uniqueMap.set(labelKey, item);
      }
    });

    return Array.from(uniqueMap.values()).filter(s => s.label.toLowerCase() !== 'size');
  }, [selectedProduct, customSchema]);

  const colorAddOnFee = useMemo(() => {
    const colorGroup = customSchema?.customizeOptionGroups?.find((g: CustomizeOptionGroupResponse) => g.category === 'Color');
    if (colorGroup && colorGroup.options.length > 0) {
      const opt = colorGroup.options[0];
      return opt.overridePrice ?? opt.defaultPrice ?? 0;
    }
    return 0;
  }, [customSchema]);

  const sizeAddOnFee = useMemo(() => {
    const group = customSchema?.customizeOptionGroups?.find(g => g.category === 'Size');
    if (group && group.options.length > 0) {
      const opt = group.options[0];
      return opt.overridePrice ?? opt.defaultPrice ?? 0;
    }
    return 0;
  }, [customSchema]);

  const sizeOptionId = useMemo(() => {
    const group = customSchema?.customizeOptionGroups?.find(g => g.category === 'Size');
    return group?.options[0]?.customizeTypeId;
  }, [customSchema]);

  const colorOptionId = useMemo(() => {
    const group = customSchema?.customizeOptionGroups?.find(g => g.category === 'Color');
    return group?.options[0]?.customizeTypeId;
  }, [customSchema]);

  const embroideryGroup = useMemo(() =>
    customSchema?.customizeOptionGroups?.find((g: CustomizeOptionGroupResponse) => g.category === 'Embroidery'),
    [customSchema]
  );

  const embroideryTextOptionId = embroideryGroup?.options?.[0]?.customizeTypeId;
  const embroideryImageOptionId = embroideryGroup?.options?.[1]?.customizeTypeId || embroideryTextOptionId;

  const embroideryTextFee = useMemo(() => {
    if (embroideryGroup && embroideryGroup.options.length > 0) {
      const opt = embroideryGroup.options[0];
      return opt.overridePrice ?? opt.defaultPrice ?? 80000;
    }
    return 80000;
  }, [embroideryGroup]);

  const embroideryImageFee = useMemo(() => {
    if (embroideryGroup && embroideryGroup.options.length > 1) {
      const opt = embroideryGroup.options[1];
      return opt.overridePrice ?? opt.defaultPrice ?? embroideryTextFee;
    }
    return embroideryTextFee;
  }, [embroideryGroup, embroideryTextFee]);



  const [designState, setDesignState] = useState<Partial<DesignConfig>>({
    baseColor: "#B0D4F1", pattern: "solid", embroideryText: "", embroideryPosition: "center", size: ""
  });

  const [sizeMode, setSizeMode] = useState<'mock' | 'input'>('mock');
  const [customDims, setCustomDims] = useState<{ width: string; height: string }>({ width: "", height: "" });
  const [activeRecommendation, setActiveRecommendation] = useState<{ width: number; length: number; colorHex: string } | null>(null);

  const activeDesign = useMemo(() => {
    if (!selectedProduct) return { ...designState, size: "", material: "", imageMode: "wrap" } as DesignConfig;
    return {
      ...designState,
      size: designState.size || availableSizes[0]?.id || "",
      material: designState.material || derivedMaterials[0]?.id || "",
      embroideryPosition: designState.embroideryPosition || (selectedProduct.id.includes('crib') ? "front-rail" : "center"),
      imageMode: designState.imageMode || "wrap"
    } as DesignConfig;
  }, [selectedProduct, designState, derivedMaterials, availableSizes]);

  const currentMaterial = useMemo(() => derivedMaterials.find(m => m.id === activeDesign.material) || derivedMaterials[0], [activeDesign.material, derivedMaterials]);
  const currentSize = useMemo(() => availableSizes.find((s: { id: string }) => s.id === activeDesign.size), [availableSizes, activeDesign.size]);

  // 🔥 Visual Scaling Logic
  const sizeDims = useMemo(() => {
    if (activeDesign.size === 'custom') {
      return {
        width: parseFloat(customDims.width) || (selectedProduct?.id.includes('crib') ? 60 : 25),
        length: parseFloat(customDims.height) || (selectedProduct?.id.includes('crib') ? 120 : 35)
      };
    }
    if (!currentSize) return { width: 60, length: 120 };

    // Extract digits from labels like "60 × 120 cm"
    const match = currentSize.label.match(/(\d+)\s*[×x]\s*(\d+)/);
    if (match) {
      return { width: parseFloat(match[1]), length: parseFloat(match[2]) };
    }
    return { width: 60, length: 120 };
  }, [activeDesign.size, currentSize, customDims, selectedProduct]);

  const pricingResults = useMemo(() => {
    if (!selectedProduct) return { current: 0 };
    const baseSale = selectedProduct.salePrice && selectedProduct.salePrice > 0 ? selectedProduct.salePrice : selectedProduct.basePrice;

    // TRUY XUẤT PHÍ SIZE CHÍNH XÁC (NẾU CHỌN SIZE SẼ CỘNG PHÍ TỪ CATEGORY)
    const sizeFee = (activeDesign.size || currentSize) ? sizeAddOnFee : 0;

    const isWrapped = !!activeDesign.customImage;
    // Nếu bọc ảnh thì phí màu = 0 (theo yêu cầu user: color tính là không có)
    const colorAdd = isWrapped ? 0 : (activeDesign.baseColor ? colorAddOnFee : 0);
    const wrapAdd = isWrapped ? embroideryImageFee : 0;

    // HỖ TRỢ CẢ HAI: CÔNG THỨC PHÉP CỘNG VÀ HỆ SỐ NHÂN (DỰA TRÊN JSON API)
    const matAdd = currentMaterial?.priceAdd ?? 0;
    const mult = currentMaterial?.priceMultiplier ?? 1.0;
    const embTextAdd = activeDesign.embroideryText.trim().length > 0 ? embroideryTextFee : 0;

    // Phí Size + Phí Màu + Phí Bọc Ảnh + Phí Thêu + MaterialAddon
    const currentTotal = Math.round(baseSale * mult + matAdd) + sizeFee + colorAdd + wrapAdd + embTextAdd;

    return { current: currentTotal };
  }, [selectedProduct, currentSize, currentMaterial, activeDesign, colorAddOnFee, embroideryTextFee, embroideryImageFee, sizeAddOnFee]);

  const wrapAddOnFee = embroideryImageFee;

  const totalPrice = pricingResults.current;

  const updateDesign = useCallback((updates: Partial<DesignConfig>) => {
    setDesignState(prev => {
      const newState = { ...prev, ...updates };

      // Mutual Exclusivity: Color vs Custom Image (UX Fix)
      if (updates.customImage) {
        // If image uploaded, use neutral white as foundation to avoid tinting
        newState.baseColor = "#FFFFFF";
      } else if (updates.baseColor && updates.baseColor !== prev.baseColor) {
        // If color specifically changed, clear the custom image bọc
        newState.customImage = undefined;
      }

      return newState;
    });
  }, []);

  const handleApplyAIRecommendation = useCallback((rec: { width: number; length: number; colorHex: string }) => {
    setSizeMode('input');
    setCustomDims({ width: rec.width.toString(), height: rec.length.toString() });
    updateDesign({ baseColor: rec.colorHex, size: 'custom' });
    setActiveRecommendation(rec);
    toast.success("Design Optimized", {
      description: `Sanctuary parameters synchronized with baby biometric data.`,
      icon: "✨"
    });
  }, [updateDesign]);

  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

  const handleImageUpload = async (file: File | null) => {
    if (!file) {
      setPendingFile(null);
      setUploadedImageUrl(null);
      updateDesign({ customImage: undefined });
      return;
    }

    setPendingFile(file);
    const localUrl = URL.createObjectURL(file);
    updateDesign({ customImage: localUrl, imageMode: "wrap" });

    // 🔥 Rapid Background Synchronization: Start upload immediately so it's ready when user clicks Add
    try {
      const res = await uploadToCloudinary(file);
      if (res?.secure_url) {
        setUploadedImageUrl(res.secure_url);
      }
    } catch (err) {
      console.error("[CustomizeStudio] Pre-sync failed:", err);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedProduct || !customSchema || isAdding) return;

    setIsAdding(true);
    let finalImageUrl = uploadedImageUrl;

    // 1. Asset Finalization (only wait if background sync hasn't finished)
    if (pendingFile && !finalImageUrl) {
      try {
        const res = await uploadToCloudinary(pendingFile);
        if (res?.secure_url) {
          finalImageUrl = res.secure_url;
          setUploadedImageUrl(finalImageUrl);
        }
      } catch {
        toast.error("Cloud synchronization failed.");
        setIsAdding(false);
        return;
      }
    }

    // Default image for Bespoke items without wrap is the project logo
    const cartDisplayImage = finalImageUrl || "/images/logo_no_name.svg";

    // 2. Bespoke Matrix Construction
    const isActuallyGuid = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
    const customizeDetails = [];

    // Size
    const activeSizeId = (currentSize && isActuallyGuid(currentSize.id)) ? currentSize.id : sizeOptionId;
    if (activeSizeId && isActuallyGuid(activeSizeId)) {
      customizeDetails.push({
        ProductCustomizeTypeId: activeSizeId,
        CustomizeContent: activeDesign.size === 'custom' ? `${customDims.width}x${customDims.height}cm` : (currentSize?.label || "Standard Size")
      });
    }

    // Color / Custom Wrap
    const isWrapped = !!finalImageUrl;
    if (!isWrapped && colorOptionId && isActuallyGuid(colorOptionId)) {
      customizeDetails.push({
        ProductCustomizeTypeId: colorOptionId,
        CustomizeContent: activeDesign.baseColor || "#B0D4F1"
      });
    }

    // Embroidery Image (Wrap)
    if (isWrapped && embroideryImageOptionId && isActuallyGuid(embroideryImageOptionId)) {
      customizeDetails.push({
        ProductCustomizeTypeId: embroideryImageOptionId,
        CustomizeContent: finalImageUrl
      });
    }

    // Material
    if (currentMaterial && isActuallyGuid(currentMaterial.id)) {
      customizeDetails.push({
        ProductCustomizeTypeId: currentMaterial.id,
        CustomizeContent: currentMaterial.name
      });
    }

    // Embroidery Text
    if (activeDesign.embroideryText.trim() && embroideryTextOptionId && isActuallyGuid(embroideryTextOptionId)) {
      customizeDetails.push({
        ProductCustomizeTypeId: embroideryTextOptionId,
        CustomizeContent: `${activeDesign.embroideryText.trim()} (${activeDesign.embroideryPosition})`
      });
    }

    const configHash = generateConfigHash(customSchema.id, null, customizeDetails);
    const sanitizedName = selectedProduct.name.replace(/[-\s]+$/, '').trim();

    addItem({
      productVariantId: customSchema.id,
      comboId: null,
      quantity: 1,
      ProductCustomizeDetailRequest: customizeDetails,
      id: `item_${customSchema.id}_bespoke_${configHash}`,
      productId: selectedProduct.id,
      name: sanitizedName,
      image: cartDisplayImage,
      price: totalPrice,
      color: isWrapped ? undefined : activeDesign.baseColor,
      size: activeDesign.size === 'custom' ? `${customDims.width}x${customDims.height}x15 cm` : (currentSize?.label || ""),
      customAttributes: {
        colorHex: isWrapped ? undefined : activeDesign.baseColor,
        material: currentMaterial?.name || "",
        embroidery: activeDesign.embroideryText || "",
        wrapImage: finalImageUrl || undefined,
        length: parseInt(customDims.height) || undefined,
        width: parseInt(customDims.width) || undefined,
        thickness: 15,
      },
      configHash: configHash,
      isCustom: true,
    });

    toast.success("Design saved to sanctuary.", {
      description: "Redirecting to your collection..."
    });

    setTimeout(() => {
      navigate("/cart");
      setIsAdding(false);
    }, 150);
  };

  if (productsLoading) {
    return <PageLoader />;
  }

  return (
    <div className="fixed inset-0 bg-slate-50 flex flex-col font-sans overflow-hidden">
      <header className="sticky top-0 z-[60] h-16 w-full bg-white border-b border-slate-100 flex items-center justify-between px-8">
        <div className="flex items-center gap-5">
          <button
            onClick={() => navigate(-1)}
            className="h-9 w-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center hover:bg-white hover:border-slate-200 hover:-translate-x-0.5 active:scale-95 transition-all duration-200 group"
          >
            <ArrowLeft className="h-4 w-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
          </button>

          <div>
            <h1 className="text-[13px] font-bold text-slate-900 tracking-tight flex items-center gap-2 uppercase">
              DreamGuard <span className="text-[#4988c4]">Studio</span>
              <div className="flex gap-0.5 ml-1">
                <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse delay-75" />
                <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse delay-150" />
              </div>
            </h1>
            <p className="text-[8px] font-bold text-slate-300 uppercase tracking-[0.25em] font-mono">Bespoke System v4.5</p>
          </div>
        </div>

        {/* Header: only show price — single CTA is in sidebar */}
        <div className="text-right">
          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Estimated total</p>
          <div className="flex items-baseline gap-2 justify-end">
            <span className="text-2xl font-bold font-mono tracking-tight text-slate-900">
              {new Intl.NumberFormat("vi-VN").format(totalPrice)}
            </span>
            <span className="text-[9px] font-bold text-[#4988c4] font-mono uppercase bg-blue-50 px-2 py-0.5 rounded border border-[#4988c4]/20">VND</span>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden relative bg-[#f8fafc]">
        <div className="h-full flex overflow-hidden">
          {/* LEFT SIDEBAR */}
          <aside className="w-[340px] bg-white border-r border-slate-100 flex flex-col h-full relative z-20">
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 no-scrollbar scroll-smooth" style={{ WebkitOverflowScrolling: 'touch', willChange: 'scroll-position' }}>
              
              <StudioAIAdvisor 
                onApplyRecommendation={handleApplyAIRecommendation} 
                productType={selectedProduct?.type}
              />

              {/* FOUNDATION — Product picker */}
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Foundation</p>
                <div className="grid grid-cols-2 gap-2">
                  {derivedProducts.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedId(p.id)}
                      className={cn(
                        "flex flex-col items-start p-4 rounded-xl border transition-all duration-200 relative overflow-hidden group text-left",
                        selectedProduct?.id === p.id
                          ? "border-[#4988c4] bg-blue-50 shadow-sm"
                          : "border-slate-100 bg-slate-50 hover:border-slate-200 hover:bg-white hover:shadow-sm"
                      )}
                    >
                      <div className={cn(
                        "h-10 w-10 rounded-lg flex items-center justify-center text-xl mb-3 transition-all duration-200",
                        selectedProduct?.id === p.id ? "bg-white shadow-sm" : "bg-slate-100 grayscale opacity-50"
                      )}>
                        {p.icon}
                      </div>

                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-wide leading-tight block mb-1 transition-colors",
                        selectedProduct?.id === p.id ? "text-slate-900" : "text-slate-500"
                      )}>{p.name}</span>

                      <div className="flex items-baseline gap-1">
                        <span className={cn(
                          "text-[11px] font-bold font-mono",
                          selectedProduct?.id === p.id ? "text-[#4988c4]" : "text-slate-300"
                        )}>
                          {new Intl.NumberFormat("vi-VN").format(p.salePrice || p.basePrice)}
                        </span>
                        <span className="text-[8px] font-bold text-slate-300 uppercase">₫</span>
                      </div>

                      {selectedProduct?.id === p.id && (
                        <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#4988c4]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <SizeSelector
                sizes={availableSizes}
                selectedSize={activeDesign.size}
                mode={sizeMode}
                onModeChange={setSizeMode}
                customDimensions={customDims}
                onDimensionsChange={setCustomDims}
                onSelect={(id: string) => updateDesign({ size: id })}
                recommendedDims={activeRecommendation ? { width: activeRecommendation.width, height: activeRecommendation.length } : undefined}
              />

              <ChromaProfile
                variants={variantPresets}
                selectedColor={activeDesign.baseColor}
                addOnFee={colorAddOnFee}
                onSelect={(hex) => updateDesign({ baseColor: hex })}
                recommendedColor={activeRecommendation?.colorHex}
              />

              <TextureLab
                selectedPattern={activeDesign.pattern}
                selectedMaterial={activeDesign.material}
                materials={derivedMaterials}
                basePrice={(selectedProduct?.salePrice || selectedProduct?.basePrice || 0) + (activeDesign.size === "custom" ? 50000 : (currentSize?.priceAdd || 0))}
                addOnFee={wrapAddOnFee}
                onPatternSelect={(p) => updateDesign({ pattern: p })}
                onMaterialSelect={(m) => updateDesign({ material: m })}
                onImageUpload={handleImageUpload}
              />

              <ArtisticRefinement
                design={activeDesign}
                productName={selectedProduct?.name}
                updateDesign={updateDesign}
              />

              {/* Bottom spacer */}
              <div className="h-4" />
            </div>

            {/* STICKY BOTTOM ACTION RAIL */}
            <div className="border-t border-slate-100 bg-white px-6 py-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-0.5">Total</p>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-bold text-slate-900 font-mono tracking-tight">
                      {new Intl.NumberFormat("vi-VN").format(totalPrice)}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400">VND</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider">Ready</span>
                </div>
              </div>

              <Button
                variant="premium"
                size="premiumLg"
                onClick={handleAddToCart}
                disabled={isAdding}
                className="w-full h-14 rounded-2xl shadow-xl shadow-[#4988c4]/10 hover:shadow-[#4988c4]/20"
              >
                <ShoppingCart className="w-5 h-5 transition-transform group-hover:-rotate-12" />
                {isAdding ? "Saving..." : "Add to Sanctuary"}
              </Button>
            </div>
          </aside>

          {/* MAIN PREVIEW AREA */}
          <div className="flex-1 relative overflow-hidden bg-white">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(73,136,196,0.03)_0%,rgba(255,255,255,1)_100%)] pointer-events-none" />
            <ProductPreview3D product={selectedProduct} design={activeDesign} sizeDims={sizeDims} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default CustomizeStudio;
