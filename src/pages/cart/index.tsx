import { CartTable } from "./components/CartTable";
import { CartActions } from "./components/CartActions";
import { CartCheckoutBar } from "./components/CartCheckoutBar";
import { useState, useEffect } from "react";
import { useBreadcrumb } from '@/components/common/breadcrumb/useBreadcrumb';
import { useCart } from "@/store/useCart";

export default function CartPage() {
    const { cart, updateQuantity, removeItem, finalTotal, loadingIds, syncingIds } = useCart();
    const [coupon, setCoupon] = useState("");

    const { setItems: setBreadcrumb } = useBreadcrumb();
    useEffect(() => {
        setBreadcrumb([
            { label: 'Home', href: '/' },
            { label: 'Your shopping cart', active: true },
        ]);
        return () => setBreadcrumb([]);
    }, [setBreadcrumb]);

    return (
        <div className="relative min-h-screen bg-[#fafbfc] pb-32">
            <div className="container mx-auto max-w-[1000px] px-6 pt-3 pb-8">
                <div className="flex flex-col gap-1 mb-6">
                    <h1 className="text-5xl font-black text-slate-900 tracking-tight italic uppercase">Shopping Bag</h1>
                    <div className="flex items-center gap-2">
                        <div className="h-1 w-8 bg-[#4988c4] rounded-full" />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Review your selected items</p>
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
