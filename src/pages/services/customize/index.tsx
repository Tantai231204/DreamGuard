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

  const embroideryAddOnFee = useMemo(() => {
    const group = customSchema?.customizeOptionGroups?.find(g => g.category === 'Embroidery');
    if (group && group.options.length > 0) {
      const opt = group.options[0];
      return opt.overridePrice ?? opt.defaultPrice ?? 0;
    }
    return 80000; // Final Fallback
  }, [customSchema]);



  const [designState, setDesignState] = useState<Partial<DesignConfig>>({
    baseColor: "#B0D4F1", pattern: "solid", embroideryText: "", embroideryPosition: "center", size: ""
  });

  const [sizeMode, setSizeMode] = useState<'mock' | 'input'>('mock');
  const [customDims, setCustomDims] = useState<{ width: string; height: string }>({ width: "", height: "" });

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

  const pricingResults = useMemo(() => {
    if (!selectedProduct) return { current: 0 };
    const baseSale = selectedProduct.salePrice && selectedProduct.salePrice > 0 ? selectedProduct.salePrice : selectedProduct.basePrice;

    // TRUY XUẤT PHÍ SIZE CHÍNH XÁC (NẾU CHỌN SIZE SẼ CỘNG PHÍ TỪ CATEGORY)
    const sizeFee = (activeDesign.size || currentSize) ? sizeAddOnFee : 0;

    const colorAdd = activeDesign.baseColor ? colorAddOnFee : 0;


    // HỖ TRỢ CẢ HAI: CÔNG THỨC PHÉP CỘNG VÀ HỆ SỐ NHÂN (DỰA TRÊN JSON API)
    const matAdd = currentMaterial?.priceAdd ?? 0;
    const mult = currentMaterial?.priceMultiplier ?? 1.0;
    const embAdd = activeDesign.embroideryText.trim().length > 0 ? embroideryAddOnFee : 0;

    // Logic chuẩn Backend: (Base * Hệ số chất liệu) + Phí Size + Phí Màu + Phí Thêu + MaterialAddon
    // Giải thích: Tiền vật liệu = Base * (Multiplier - 1)
    const currentTotal = Math.round(baseSale * mult + matAdd) + sizeFee + colorAdd + embAdd;

    return { current: currentTotal };
  }, [selectedProduct, currentSize, currentMaterial, activeDesign, colorAddOnFee, embroideryAddOnFee, sizeAddOnFee]);

  const totalPrice = pricingResults.current;

  const updateDesign = useCallback((updates: Partial<DesignConfig>) => {
    setDesignState(prev => ({ ...prev, ...updates }));
  }, []);

  const handleAddToCart = () => {
    if (!selectedProduct || !customSchema) return;

    // Build the Bespoke Detail List
    const customizeDetails = [];

    const isGuid = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

    // 1. Size (Luôn lấy, nếu không có ID cụ thể thì dùng ID mặc định của nhóm Size)
    const activeSizeId = (currentSize && isGuid(currentSize.id)) ? currentSize.id : sizeOptionId;
    if (activeSizeId && isGuid(activeSizeId)) {
      customizeDetails.push({
        ProductCustomizeTypeId: activeSizeId,
        CustomizeContent: activeDesign.size === 'custom' ? `${customDims.width}x${customDims.height}cm` : (currentSize?.label || "Standard Size")
      });
    }

    // 2. Color (Luôn lấy)
    if (colorOptionId && isGuid(colorOptionId)) {
      customizeDetails.push({
        ProductCustomizeTypeId: colorOptionId,
        CustomizeContent: activeDesign.baseColor || "#B0D4F1"
      });
    }

    // 3. Material
    if (currentMaterial && isGuid(currentMaterial.id)) {
      customizeDetails.push({
        ProductCustomizeTypeId: currentMaterial.id,
        CustomizeContent: currentMaterial.name
      });
    }

    const configHash = generateConfigHash(customSchema.id, null, customizeDetails);

    setIsAdding(true);
    addItem({
      productVariantId: customSchema.id,
      comboId: null,
      quantity: 1,
      ProductCustomizeDetailRequest: customizeDetails,
      id: `item_${customSchema.id}_bespoke_${configHash}`,
      productId: selectedProduct.id,
      name: selectedProduct.name,
      image: selectedProduct.image,
      price: totalPrice,
      color: activeDesign.baseColor,
      size: activeDesign.size === 'custom' ? `${customDims.width}x${customDims.height}x15 cm` : (currentSize?.label || ""),
      customAttributes: {
        colorHex: activeDesign.baseColor,
        material: currentMaterial?.name || "",
        embroidery: activeDesign.embroideryText || "",
        // Keep dimensions ONLY as numbers for the specialized chip to detect but avoid the redundant loop display
        length: parseInt(customDims.height) || undefined,
        width: parseInt(customDims.width) || undefined,
        thickness: 15, // Standard thickness for now or parse from customDims
      },
      configHash: configHash,
      isCustom: true,
    }).then(() => {
      toast.success("Design saved to sanctuary.");
      // Small delay to allow store to settle before navigation
      setTimeout(() => navigate("/cart"), 50);
    }).catch(() => {
      toast.error("Failed to add bespoke design.");
    }).finally(() => {
      // Keep isAdding true for a bit longer to prevent double clicks during navigation
      setTimeout(() => setIsAdding(false), 500);
    });
  };

  if (productsLoading) {
    return <PageLoader />;
  }

  return (
    <div className="fixed inset-0 bg-slate-50 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900 overflow-hidden">
      <header className="sticky top-0 z-[60] h-20 w-full bg-white/70 backdrop-blur-2xl border-b border-slate-200/50 flex items-center justify-between px-10 transition-all duration-700">
        <div className="flex items-center gap-8">
          <button
            onClick={() => navigate(-1)}
            className="h-10 w-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center hover:bg-slate-50 hover:shadow-xl hover:-translate-x-1 active:scale-90 transition-all duration-500 group"
          >
            <ArrowLeft className="h-4 w-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
          </button>

          <div className="flex flex-col gap-1">
            <h1 className="text-[14px] font-black text-slate-900 leading-none tracking-tight flex items-center gap-2.5 uppercase">
              DreamGuard <span className="text-[#4988c4]">Studio</span>
              <div className="flex gap-0.5">
                <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse delay-75" />
                <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse delay-150" />
              </div>
            </h1>
            <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.3em] font-mono">Bespoke System v4.5</p>
          </div>
        </div>

        <div className="flex items-center gap-10">
          <div className="text-right flex flex-col items-end">
            <span className="text-[8px] font-black text-slate-300 uppercase tracking-[0.25em] mb-1.5 font-mono">Estimated total</span>
            <div className="flex items-center gap-2.5">
              <span className="text-3xl font-black font-mono tracking-tighter text-slate-900 transition-all duration-500 hover:scale-105">
                {new Intl.NumberFormat("vi-VN").format(totalPrice)}
              </span>
              <span className="text-[10px] font-black text-[#4988c4] font-mono uppercase tracking-widest bg-blue-50/50 px-2.5 py-1 rounded-lg border border-[#4988c4]/20">Vnd</span>
            </div>
          </div>

          <Button
            onClick={handleAddToCart}
            disabled={isAdding}
            className="relative h-14 px-10 rounded-3xl bg-[#4988c4] hover:bg-[#3a71a3] text-white shadow-2xl shadow-[#4988c4]/30 border-0 overflow-hidden group transition-all duration-500 active:scale-95"
          >
             <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
             <div className="relative z-10 flex items-center gap-3">
                <ShoppingCart className="w-5 h-5 transition-transform duration-500 group-hover:-rotate-12 group-hover:scale-110" />
                <span className="text-[13px] font-black uppercase tracking-[0.15em] shrink-0">
                  {isAdding ? "Finalizing..." : "Confirm Creation"}
                </span>
             </div>
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-hidden relative bg-[#f8fafc]">
        <div className="h-full flex overflow-hidden">
          {/* LEFT SIDEBAR */}
          <aside className="w-[480px] bg-white border-r border-slate-100 flex flex-col h-full relative z-20 shadow-4xl shadow-slate-200/40">
            <div className="flex-1 overflow-y-auto px-12 py-16 space-y-16 scroll-smooth no-scrollbar select-none will-change-transform">
              {/* FOUNDATION SECTION */}
              <div className="space-y-8">
                <div className="flex items-center justify-between px-1">
                  <div className="space-y-1.5 flex-1">
                    <p className="text-[11px] font-black text-slate-900 uppercase tracking-[0.25em]">Foundation</p>
                    <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest leading-none">Base Template Selection</p>
                  </div>
                  <div className="h-px bg-slate-100 flex-1 ml-4" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {derivedProducts.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedId(p.id)}
                      className={cn(
                        "flex flex-col items-start p-6 rounded-[2.5rem] border-2 transition-all duration-500 relative overflow-hidden group",
                        selectedProduct?.id === p.id
                          ? "border-[#4988c4] bg-blue-50/20 shadow-xl shadow-blue-100/40"
                          : "border-slate-50 bg-slate-50/30 hover:border-slate-100 hover:bg-white hover:shadow-2xl hover:shadow-slate-100"
                      )}
                    >
                      <div className={cn(
                        "h-12 w-12 rounded-2xl flex items-center justify-center text-2xl transition-all duration-700 group-hover:rotate-12",
                        selectedProduct?.id === p.id ? "bg-white shadow-md scale-110" : "bg-slate-100 grayscale opacity-40"
                      )}>
                        {p.icon}
                      </div>

                      <div className="mt-6 space-y-1.5 flex-1">
                        <span className={cn(
                          "text-[10px] font-black uppercase tracking-widest transition-colors block leading-tight",
                          selectedProduct?.id === p.id ? "text-slate-900" : "text-slate-400 group-hover:text-slate-600"
                        )}>{p.name}</span>

                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "text-[13px] font-black font-mono tracking-tighter",
                            selectedProduct?.id === p.id ? "text-[#4988c4]" : "text-slate-300"
                          )}>
                            {new Intl.NumberFormat("vi-VN").format(p.salePrice || p.basePrice)}
                          </span>
                          <span className="text-[8px] font-black text-slate-300 uppercase tracking-tighter">Vnd</span>
                        </div>
                      </div>

                      {selectedProduct?.id === p.id && (
                        <div className="absolute -top-6 -right-6 h-12 w-12 bg-[#4988c4] rotate-45 flex items-end justify-center pb-1">
                          <div className="h-1.5 w-1.5 rounded-full bg-white mb-1.5" />
                        </div>
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
              />
              <ChromaProfile
                variants={variantPresets}
                selectedColor={activeDesign.baseColor}
                addOnFee={colorAddOnFee}
                onSelect={(hex) => updateDesign({ baseColor: hex })}
              />
              <TextureLab
                selectedPattern={activeDesign.pattern}
                selectedMaterial={activeDesign.material}
                materials={derivedMaterials}
                basePrice={(selectedProduct?.salePrice || selectedProduct?.basePrice || 0) + (activeDesign.size === "custom" ? 50000 : (currentSize?.priceAdd || 0))}
                onPatternSelect={(p) => updateDesign({ pattern: p })}
                onMaterialSelect={(m) => updateDesign({ material: m })}
                onImageUpload={(f) => {
                  if (f) {
                    const url = URL.createObjectURL(f);
                    updateDesign({ customImage: url, imageMode: "wrap" });
                  } else {
                    updateDesign({ customImage: undefined });
                  }
                }}
              />
            </div>

            {/* STICKY BOTTOM ACTION RAIL */}
            <div className="p-10 pt-8 border-t border-slate-50 bg-gradient-to-b from-white/0 via-white to-white relative z-30">
               <div className="flex items-center justify-between mb-8 px-2">
                  <div className="flex flex-col">
                     <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1">Total Valuation</span>
                     <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-slate-900 font-mono tracking-tighter">
                           {new Intl.NumberFormat("vi-VN").format(totalPrice)}
                        </span>
                        <span className="text-[9px] font-black text-slate-400">VND</span>
                     </div>
                  </div>
                  <div className="h-12 w-px bg-slate-100" />
                  <div className="flex flex-col items-end">
                     <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-1">Status</span>
                     <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-1.5">
                        Ready <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                     </span>
                  </div>
               </div>

               <Button
                  onClick={handleAddToCart}
                  disabled={isAdding}
                  className="w-full h-16 rounded-[2rem] bg-slate-900 text-white shadow-2xl shadow-slate-200/50 hover:bg-[#4988c4] transition-all duration-500 flex items-center justify-center gap-4 group"
               >
                  <span className="text-[13px] font-black uppercase tracking-[0.25em]">Add to Sanctuary</span>
                  <div className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-all">
                     <ShoppingCart className="w-3.5 h-3.5" />
                  </div>
               </Button>
               
               <p className="text-center mt-6 text-[8px] font-black text-slate-300 uppercase tracking-[0.3em] font-mono leading-none">
                  Finalized in Sanctuary by DreamGuard
               </p>
            </div>
          </aside>

          {/* MAIN PREVIEW AREA */}
          <div className="flex-1 relative overflow-hidden bg-white">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(73,136,196,0.03)_0%,rgba(255,255,255,1)_100%)] pointer-events-none" />
            <ProductPreview3D product={selectedProduct} design={activeDesign} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default CustomizeStudio;
