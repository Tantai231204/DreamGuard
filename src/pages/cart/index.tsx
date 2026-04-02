import { CartTable } from "./components/CartTable";
import { CartActions } from "./components/CartActions";
import { CartCheckoutBar } from "./components/CartCheckoutBar";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useBreadcrumb } from '@/components/common/BreadcrumbNav';
import { useCart } from "@/store/useCart";
import { queryClient } from "@/lib/queryClient";
import { orderKeys } from "@/hooks/queries/useOrder";
import orderService from "@/api/services/orderService";
import type { OrderItem } from "@/api/types/order";
import { toast } from "sonner";

export default function CartPage() {
    const { cart, updateQuantity, removeItem, finalTotal, loadingIds, syncingIds, isSyncing, batchAddItems } = useCart();
    const [coupon, setCoupon] = useState("");
    const [searchParams, setSearchParams] = useSearchParams();

    // 1. Handle Instant Re-order from URL
    useEffect(() => {
        const reorderId = searchParams.get("reorder");
        if (reorderId) {
            const executeReorder = async () => {
                try {
                    const detail = await queryClient.ensureQueryData({
                        queryKey: orderKeys.detail(reorderId),
                        queryFn: () => orderService.getOrderDetail(reorderId),
                    });

                    if (detail?.items) {
                        const itemsToPush = detail.items.map((item: OrderItem) => {
                            const isCombo = Boolean(item.comboId);
                            const isCustom = !!(item.productCustomizeDetails && item.productCustomizeDetails.length > 0);

                            // Map bespoke details back to the cart-friendly customAttributes object
                            const customAttributes: Record<string, string> = {};
                            if (isCustom) {
                                item.productCustomizeDetails?.forEach(d => {
                                    customAttributes[d.customizeTypeName.toLowerCase()] = d.customizeContent;
                                });
                            }

                            // Craft high-fidelity snapshot for immediate visual injection
                            const _optimisticData = {
                                id: `reorder_${Date.now()}_${Math.random()}`,
                                name: item.itemName.replace(/\s*-\s*$/, ''),
                                image: item.image || "https://placehold.co/100x100?text=Restoring",
                                price: item.unitPrice,
                                quantity: item.quantity,
                                subtotal: item.totalPrice,
                                productVariantId: item.productVariantId,
                                comboId: item.comboId,
                                availableStock: 99,
                                isAvailable: true,
                                sku: isCombo ? "COMBO-PACKAGE" : "PRODUCT-ITEM",
                                isCustom,
                                customAttributes
                            }

                            return {
                                productVariantId: item.productVariantId,
                                comboId: item.comboId,
                                quantity: item.quantity,
                                customAttributes: isCustom ? customAttributes : undefined,
                                _optimisticData
                            }
                        });
                        await batchAddItems(itemsToPush);
                        // Clean up URL after successful trigger
                        searchParams.delete("reorder");
                        setSearchParams(searchParams);
                    }
                } catch (error) {
                    console.error("Reorder failed in CartPage:", error);
                    toast.error("Could not restore order. Please try again.");
                }
            };
            executeReorder();
        }
    }, [searchParams, setSearchParams, batchAddItems]);

    const { setItems: setBreadcrumb } = useBreadcrumb();
    useEffect(() => {
        setBreadcrumb([
            { label: 'Home', href: '/' },
            { label: 'Your shopping cart', active: true },
        ]);
        return () => setBreadcrumb([]);
    }, [setBreadcrumb]);

    return (
        <div className="relative min-h-screen bg-white pb-32">
            <div className="container mx-auto max-w-[1000px] px-6 pt-3 pb-8">
                <div className="flex flex-col gap-1 mb-6">
                    <h1 className="text-5xl font-black text-slate-900 tracking-tight italic uppercase">Shopping Bag</h1>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="h-1 w-8 bg-[#4988c4] rounded-full" />
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Review your selected items</p>
                        </div>
                        {isSyncing && (
                            <div className="flex items-center gap-2 px-3 py-1 bg-[#4988c4]/10 rounded-full animate-pulse">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#4988c4]" />
                                <span className="text-[9px] font-black text-[#4988c4] uppercase tracking-widest">Neural Syncing...</span>
                            </div>
                        )}
                    </div>
                </div>

                <CartTable
                    cart={cart}
                    onQuantity={updateQuantity}
                    onRemove={removeItem}
                    loadingIds={loadingIds}
                    syncingIds={syncingIds}
                />
                <div className="flex flex-col md:flex-row gap-8">
                    <div className="flex-1 space-y-4">
                        <CartActions coupon={coupon} setCoupon={setCoupon} />
                    </div>
                </div>
            </div>
            <CartCheckoutBar total={finalTotal} disabled={cart.length === 0} />
        </div>
    );
}
