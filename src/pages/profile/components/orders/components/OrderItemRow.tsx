import { useMemo } from "react"
import { useVariant } from "@/hooks/queries/useVariant"
import { useComboDetail } from "@/hooks/queries/useCombo"
import { Package } from "lucide-react"
import { formatPrice } from "../../../utils"
import type { OrderItem, OrderStatus } from "@/api/types/order"
import { useProductFeedbacks } from "@/hooks/queries/useProductFeedback"
import { FeedbackDialog } from "./FeedbackDialog"
import { useProductDetail } from "@/hooks/queries"

interface OrderItemRowProps {
    item: OrderItem;
    orderStatus?: OrderStatus;
    orderId?: string;
}

export function OrderItemRow({ item, orderStatus, orderId }: OrderItemRowProps) {
    const isCombo = !!item.comboId;
    const { data: variant, isLoading: isVariantLoading } = useVariant(isCombo ? "" : (item.productVariantId || ""));
    const { data: comboDetail, isLoading: isComboLoading } = useComboDetail(item.comboId || "", isCombo);
    const { data: parentCombo } = useComboDetail(comboDetail?.comboParentId || "", !!comboDetail?.comboParentId && isCombo);
    const { data: product } = useProductDetail(variant?.productId || "", !!variant?.productId);

    const effectiveProductId = isCombo ? item.comboId : variant?.productId;

    const { data: apiFeedbacks } = useProductFeedbacks(effectiveProductId || "", {
        enabled: (orderStatus === 5 || orderStatus === "Completed") && !!effectiveProductId
    });

    const feedback = useMemo(() => {
        if (!apiFeedbacks?.items || !orderId) return null;
        return apiFeedbacks.items.find(f => f.orderId === orderId && f.productId === effectiveProductId) || null;
    }, [apiFeedbacks, orderId, effectiveProductId]);

    const isLoading = isCombo ? (isComboLoading) : isVariantLoading;
    const attributes = (variant?.attributes || {}) as Record<string, unknown>;

    const wrapDetail = item.productCustomizeDetails?.find(d =>
        d.customizeTypeName.toLowerCase().includes('wrap') ||
        d.customizeTypeName.toLowerCase().includes('ảnh bọc')
    );

    const isBespoke = item.productCustomizeDetails && item.productCustomizeDetails.length > 0;

    const variantImage = (attributes?.imageUrls as string[])?.[0] ||
        (attributes?.imageUrl as string) ||
        product?.imageUrls?.[0] ||
        product?.assets?.[0]?.url;

    const displayImage = useMemo(() => {
        // 1. Bespoke/Customization image always takes precedence
        if (wrapDetail?.customizeContent && wrapDetail.customizeContent.includes('http')) {
            return wrapDetail.customizeContent;
        }

        if (isCombo) {
            // 2. Combo-specific primary image (Child level)
            if (comboDetail?.imageUrl && comboDetail.imageUrl.length > 5) return comboDetail.imageUrl;

            // 2.1 Parent Combo Fallback (Explicitly requested by user)
            if (parentCombo?.imageUrl && parentCombo.imageUrl.length > 5) return parentCombo.imageUrl;

            // 3. Fallback to order item's image if provided by backend
            if (item.image && item.image.length > 5 && !item.image.includes('placeholder')) return item.image;

            // 4. Fallback to first item's image in the bundle
            const firstItemImg = comboDetail?.productItems?.[0]?.imageUrl || parentCombo?.productItems?.[0]?.imageUrl;
            if (firstItemImg && firstItemImg.length > 5) return firstItemImg;
        } else {
            // 5. Standard variant/product logic
            if (item.image && item.image.length > 5 && !item.image.includes('placeholder')) return item.image;
            if (variantImage) return variantImage;
        }

        // 6. Absolute fallbacks
        return isBespoke ? '/images/logo_no_name.svg' : '/images/placeholder-product.svg';
    }, [isCombo, comboDetail, parentCombo, item.image, variantImage, wrapDetail, isBespoke]);

    return (
        <div className="p-6 flex flex-col bg-white border-b border-gray-100 last:border-0 hover:bg-gray-50/20 transition-all">
            <div className="flex gap-5">
                <div className="w-20 h-20 rounded-2xl border border-gray-200 overflow-hidden bg-white shadow-sm flex items-center justify-center shrink-0 p-1 text-left">
                    {displayImage ? (
                        <img src={displayImage} alt={item.itemName} className="w-full h-full object-contain rounded-xl" />
                    ) : (
                        <Package className="w-8 h-8 text-gray-200" />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1 text-left">
                            {isCombo && (
                                <span className="inline-flex px-2 py-0.5 rounded-full bg-blue-50 text-[#4988c4] text-[9px] font-black uppercase tracking-widest border border-blue-100 mb-1">
                                    Bundle
                                </span>
                            )}
                            <h4 className="text-[15px] font-black text-gray-900 leading-tight">{item.itemName.replace(/\s*-\s*$/, '')}</h4>
                        </div>
                        <span className="text-[15px] font-black text-[#4988c4] tabular-nums whitespace-nowrap">
                            {formatPrice(item.unitPrice)}
                        </span>
                    </div>

                    {isLoading ? (
                        <div className="flex gap-2 mt-3 text-left">
                            <div className="h-4 w-16 bg-gray-50 animate-pulse rounded" />
                            <div className="h-4 w-20 bg-gray-50 animate-pulse rounded" />
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-2 mt-2 text-left">
                            {isCombo ? (
                                <span className="px-2 py-0.5 bg-gray-50 border border-gray-100 text-[10px] text-gray-500 rounded font-black uppercase tracking-tighter">
                                    SKU: {comboDetail?.sku || 'N/A'}
                                </span>
                            ) : (
                                <>
                                    {variant?.size && (
                                        <span className="px-2 py-0.5 bg-gray-50 border border-gray-100 text-[10px] text-gray-500 rounded font-black uppercase tracking-tight">
                                            {variant.size}
                                        </span>
                                    )}
                                    {variant?.attributes?.color && (
                                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-gray-50 border border-gray-100 rounded">
                                            <div
                                                className="w-2.5 h-2.5 rounded-full ring-1 ring-white shadow-sm border border-black/5"
                                                style={{ backgroundColor: String(variant.attributes.color) }}
                                            />
                                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-tighter">
                                                {String(variant.attributes.color)}
                                            </span>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {/* Bespoke Manufacturing Section */}
                    {item.productCustomizeDetails && item.productCustomizeDetails.length > 0 && (
                        <div className="flex flex-wrap gap-3 mt-4">
                            {item.productCustomizeDetails.map((detail, idx) => {
                                const isUrl = detail.customizeContent.includes('http');
                                const displayContent = isUrl
                                    ? (detail.customizeContent.split('/').pop()?.split('?')[0] || 'Image Asset')
                                    : detail.customizeContent;
                                const displayLabel = detail.customizeTypeName.toLowerCase().includes('wrap') || detail.customizeTypeName.toLowerCase().includes('ảnh bọc')
                                    ? 'Design'
                                    : detail.customizeTypeName;

                                return (
                                    <div key={idx} className="group relative flex items-center bg-white rounded-xl border-2 border-slate-100/80 hover:border-[#4988c4]/40 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 overflow-hidden">
                                        <div className="flex flex-col px-4 py-2 bg-gradient-to-br from-white to-slate-50/50">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.25em] leading-none mb-1.5 peer-hover:text-[#4988c4] transition-colors">{displayLabel}</span>
                                            <div className="flex items-center gap-2">
                                                {detail.customizeTypeName.toLowerCase().includes('color') && (
                                                    <div
                                                        className="w-3 h-3 rounded-full border border-black/10 shadow-sm shrink-0"
                                                        style={{ backgroundColor: detail.customizeContent }}
                                                    />
                                                )}
                                                <span className="text-sm font-bold text-slate-900 tracking-tight max-w-[120px] truncate">{displayContent}</span>
                                            </div>
                                        </div>
                                        {detail.addOnPrice > 0 && (
                                            <div className="h-full px-3.5 py-2 bg-[#4988c4] flex flex-col justify-center border-l-2 border-[#4988c4]">
                                                <span className="text-[8px] font-black text-white/60 uppercase tracking-[0.1em] leading-none mb-1">Premium</span>
                                                <span className="text-[12px] font-black text-white leading-none tabular-nums">+{formatPrice(detail.addOnPrice)}</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <div className="flex items-center justify-between mt-4">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-black text-gray-300 uppercase tracking-widest">Qty</span>
                                    <span className="text-[13px] font-black text-gray-900">x{item.quantity}</span>
                                </div>

                                {/* Rating Section */}
                                {(orderStatus === 5 || orderStatus === "Completed") && (
                                    <div className="pl-4 border-l border-gray-100">
                                        <FeedbackDialog
                                            orderItemId={item.id}
                                            itemName={item.itemName}
                                            itemImage={displayImage}
                                            existingFeedback={feedback}
                                        />
                                    </div>
                                )}
                            </div>
                            
                            {item.exchangeRequestedQuantity && item.exchangeRequestedQuantity > 0 && (
                                <div className="flex items-center gap-3 bg-blue-50/50 border border-blue-100/50 px-3 py-1.5 rounded-lg w-fit">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1 h-1 rounded-full bg-emerald-500" />
                                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                                            {item.quantity - item.exchangeRequestedQuantity} Delivered
                                        </span>
                                    </div>
                                    <div className="w-px h-2 bg-blue-200" />
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
                                        <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">
                                            {item.exchangeRequestedQuantity} Reshipping
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Line Total</span>
                            <span className="text-[16px] font-black text-gray-900 tabular-nums tracking-tighter">
                                {formatPrice(
                                    (item.unitPrice * item.quantity) +
                                    (item.productCustomizeDetails?.reduce((acc, curr) => acc + curr.addOnPrice, 0) || 0)
                                )}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bundle Expansion */}
            {isCombo && comboDetail?.productItems && comboDetail.productItems.length > 0 && (
                <div className="mt-6 pt-6 border-t border-dashed border-gray-100">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#4988c4]" />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Included in your bundle</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {comboDetail.productItems.map((p, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-2 rounded-xl border border-gray-50 bg-gray-50/30">
                                <div className="w-10 h-10 rounded-lg overflow-hidden bg-white shrink-0 border border-gray-100">
                                    <img src={p.imageUrl || '/images/placeholder-product.svg'} alt={p.productName} className="w-full h-full object-cover" />
                                </div>
                                <div className="min-w-0 text-left">
                                    <p className="text-[11px] font-bold text-gray-700 truncate">{p.productName}</p>
                                    <p className="text-[9px] font-black text-[#4988c4] uppercase tracking-tighter">Qty: {p.quantity * item.quantity}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
