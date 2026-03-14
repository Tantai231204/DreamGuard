import { useVariant } from "@/hooks/queries/useVariant"
import { useComboDetail } from "@/hooks/queries/useCombo"
import { Package } from "lucide-react"
import { formatPrice } from "../../../utils"
import type { OrderItem } from "@/api/types/order"

interface OrderItemRowProps {
  item: OrderItem
}

export function OrderItemRow({ item }: OrderItemRowProps) {
    const isCombo = !!item.comboId;
    const { data: variant, isLoading: isVariantLoading } = useVariant(isCombo ? "" : (item.productVariantId || ""));
    const { data: comboDetail, isLoading: isComboLoading } = useComboDetail(item.comboId || "", isCombo);

    const isLoading = isCombo ? isComboLoading : isVariantLoading;
    const attributes = (variant?.attributes || {}) as Record<string, unknown>;
    const displayImage = item.image || (attributes.imageUrls as string[])?.[0] || comboDetail?.imageUrl;

    return (
        <div className="p-6 flex flex-col bg-white border-b border-gray-100 last:border-0 hover:bg-gray-50/20 transition-all">
            <div className="flex gap-5">
                <div className="w-20 h-20 rounded-2xl border border-gray-200 overflow-hidden bg-white shadow-sm flex items-center justify-center shrink-0 p-1 text-left">
                    {displayImage ? (
                        <img src={displayImage} alt={item.itemName} className="w-full h-full object-cover rounded-xl" />
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
                            <h4 className="text-[15px] font-black text-gray-900 leading-tight">{item.itemName}</h4>
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
                                        <span className="px-2 py-0.5 bg-gray-50 border border-gray-100 text-[10px] text-gray-500 rounded font-black uppercase">
                                            Size: {variant.size}
                                        </span>
                                    )}
                                    {variant?.attributes?.color && (
                                        <span className="px-2 py-0.5 bg-gray-50 border border-gray-100 text-[10px] text-gray-500 rounded font-black uppercase">
                                            Color: {variant.attributes.color}
                                        </span>
                                    )}
                                </>
                             )}
                        </div>
                    )}

                    <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-2">
                             <span className="text-[11px] font-black text-gray-300 uppercase tracking-widest">Quantity</span>
                             <span className="text-[13px] font-black text-gray-900">x{item.quantity}</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Line Total</span>
                            <span className="text-[15px] font-black text-gray-900 tabular-nums">{formatPrice(item.unitPrice * item.quantity)}</span>
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
