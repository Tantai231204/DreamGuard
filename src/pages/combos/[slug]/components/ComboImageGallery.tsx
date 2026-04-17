import { useState, memo } from "react";
import { motion } from "framer-motion";
import { Heart, Share2, Sparkles } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import type { Combo, RichComboItem } from "../../types";
import { useProductDetail } from "@/hooks/queries/useProduct";
import { useVariant } from "@/hooks/queries/useVariant";
import type { VariantResponse, VariantAttributes } from "@/api/services/variantService";

interface Props {
    combo: Combo;
    activeCombo: Combo | null;
    isWishlisted: boolean;
    onToggleWishlist: () => void;
    displayImage?: string | null;
    enrichedItems?: RichComboItem[];
}

const SubItemImage = memo(({ variantId, fallbackImage, alt }: { variantId: string; fallbackImage?: string; alt: string }) => {
    const { data: variantData, isLoading: isVarLoading } = useVariant(variantId || "");
    const variant = variantData as VariantResponse;
    const vImg = (variant?.attributes as VariantAttributes)?.imageUrl || (variant as { imageUrl?: string })?.imageUrl;
    
    // Recovery: Fetch root product if variant has no image
    const productId = variant?.productId || (variant as { product?: { id: string } })?.product?.id || "";
    const { data: productData } = useProductDetail(productId, !!productId && (!vImg || (vImg as string).length < 5) && (!fallbackImage || fallbackImage.length < 5));
    
    const pData = productData as { imageUrls?: string[]; imageUrl?: string; assets?: { url: string }[] };
    const pImg = pData?.imageUrls?.[0] || pData?.imageUrl || pData?.assets?.[0]?.url || (variant as { product?: { imageUrl?: string } })?.product?.imageUrl;

    const imageUrl = ((vImg as string)?.length > 5) ? (vImg as string) : ((fallbackImage as string)?.length > 5) ? (fallbackImage as string) : (pImg as string);
    const isLoading = isVarLoading;

    if (isLoading && !imageUrl) {
        return <div className="w-full h-full bg-slate-50 animate-pulse" />;
    }

    return (
        <img 
            src={imageUrl || "/placeholder.png"} 
            alt={alt} 
            className={cn("w-full h-full object-contain transition-all duration-700 group-hover:scale-110", !imageUrl && "opacity-0", imageUrl && "opacity-100")} 
            onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (!target.src.includes('placeholder.png')) {
                    target.src = "/placeholder.png";
                }
            }}
        />
    );
});

export const ComboImageGallery = ({ combo, activeCombo, isWishlisted, onToggleWishlist, displayImage, enrichedItems }: Props) => {
    const [imgError, setImgError] = useState(false);

    const discountValue = activeCombo && activeCombo.basePrice > activeCombo.salePrice
        ? Math.round(((activeCombo.basePrice - activeCombo.salePrice) / activeCombo.basePrice) * 100)
        : null;

    const mainImage = displayImage || activeCombo?.imageUrl || combo.imageUrl;
    const hasValidImage = !!mainImage && !imgError;

    const items = enrichedItems && enrichedItems.length > 0
        ? enrichedItems
        : ((activeCombo?.productItems || combo.productItems || []) as RichComboItem[]);

    const handleShare = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (navigator.share) {
            navigator.share({ title: combo.name, url: window.location.href }).catch(() => {});
        } else {
            navigator.clipboard.writeText(window.location.href);
        }
    };

    return (
        <div className="space-y-5 lg:sticky lg:top-8">
            {/* Main Visual Area */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#f0f7ff] to-[#e8f0f8] border border-[#4988c4]/10"
            >
                {hasValidImage ? (
                    <div className="aspect-square">
                        <img 
                            src={mainImage!}
                            alt={combo.name}
                            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                            onError={() => setImgError(true)}
                        />
                    </div>
                ) : (
                    /* Clean Bundle Composition Visual */
                    <div className="aspect-[4/3] flex flex-col items-center justify-center p-8 md:p-12">
                        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mb-6">
                            {items.map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.15 + i * 0.12 }}
                                    className="bg-white rounded-2xl shadow-sm border border-white p-5 md:p-6 flex flex-col items-center gap-3 w-[140px] md:w-[160px]"
                                >
                                    <div className="w-14 h-14 rounded-2xl bg-[#4988c4]/8 flex items-center justify-center overflow-hidden">
                                        <SubItemImage 
                                            variantId={item.productVariantId || ""} 
                                            fallbackImage={item.imageUrl} 
                                            alt={item.productName || ""} 
                                        />
                                    </div>
                                    <p className="text-[12px] font-bold text-slate-700 text-center leading-tight line-clamp-2">
                                        {item.productName}
                                    </p>
                                    <span className="text-[10px] font-semibold text-[#4988c4]/60 bg-[#4988c4]/5 px-2 py-0.5 rounded-full">
                                        ×{item.quantity}
                                    </span>
                                </motion.div>
                            ))}
                        </div>
                        {/* Connecting line */}
                        <div className="flex items-center gap-3 text-[#4988c4]/40">
                            <div className="h-px w-8 bg-[#4988c4]/20" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.15em]">Bundle Set</span>
                            <div className="h-px w-8 bg-[#4988c4]/20" />
                        </div>
                    </div>
                )}

                {/* Discount Badge */}
                {discountValue && (
                    <motion.div 
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="absolute top-5 left-5 z-20"
                    >
                        <div className="flex items-center gap-1.5 bg-rose-600 text-white px-3 py-1.5 rounded-xl shadow-lg">
                            <Sparkles className="h-3 w-3 fill-white text-white" />
                            <span className="text-[11px] font-bold">-{discountValue}%</span>
                        </div>
                    </motion.div>
                )}

                {/* Floating Actions */}
                <div className="absolute right-5 top-5 flex flex-col gap-2 z-30">
                    <button 
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleWishlist(); }}
                        className={cn(
                            "h-10 w-10 rounded-xl bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95",
                            isWishlisted ? "text-rose-500" : "text-slate-400 hover:text-rose-500"
                        )}
                    >
                        <Heart className={cn("w-4 h-4", isWishlisted && "fill-current")} />
                    </button>
                    <button 
                        onClick={handleShare}
                        className="h-10 w-10 rounded-xl bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center text-slate-400 hover:text-slate-700 transition-all duration-200 hover:scale-110 active:scale-95"
                    >
                        <Share2 className="h-4 w-4" />
                    </button>
                </div>
            </motion.div>

            {/* Item Cards Row */}
            {items.length > 0 && (
                <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}>
                    {items.map((item, i) => {
                        const itemPrice = item.enrichedDetail?.salePrice || item.salePrice || 0;
                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 + i * 0.08 }}
                                className="relative bg-white rounded-2xl border border-slate-200/60 p-4 flex flex-col items-center gap-2 hover:border-[#4988c4]/30 hover:shadow-md transition-all group cursor-default"
                            >
                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-[#4988c4]/5 transition-colors overflow-hidden">
                                    <SubItemImage 
                                        variantId={item.productVariantId || ""} 
                                        fallbackImage={item.imageUrl} 
                                        alt={item.productName || ""} 
                                    />
                                </div>
                                <p className="text-[11px] font-bold text-slate-700 text-center leading-tight line-clamp-1 group-hover:text-[#4988c4] transition-colors">
                                    {item.productName}
                                </p>
                                {itemPrice > 0 && (
                                    <p className="text-[10px] font-semibold text-slate-400">
                                        {formatPrice(itemPrice)}
                                    </p>
                                )}
                                {/* Quantity */}
                                <div className="absolute -top-1.5 -right-1.5 bg-slate-900 text-white text-[8px] font-bold w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white">
                                    {item.quantity}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
