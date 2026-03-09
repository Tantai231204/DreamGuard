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
        <div className="relative min-h-screen bg-gradient-to-b from-[#bde8f5]/10 to-white/80 pb-28">
            <div className="container mx-auto px-2 sm:px-4 py-6 sm:py-8">
                <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-primary-dark drop-shadow-sm">Your Cart</h1>
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
