

import { CartTable } from "./components/CartTable";
import { CartActions } from "./components/CartActions";
import { CartCheckoutBar } from "./components/CartCheckoutBar";
import { useState } from "react";
import { useEffect } from 'react';
import { useBreadcrumb } from '@/components/common/breadcrumb/useBreadcrumb';

interface CartItem {
    id: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
    subtotal: number;
}

const mockCart: CartItem[] = [
    {
        id: "1",
        name: "Blocks shape-sorting Toy",
        image: "https://i.pinimg.com/1200x/cd/d0/43/cdd0437a6347c2a4c1913d51c3d4cb33.jpg",
        price: 39,
        quantity: 2,
        subtotal: 78,
    },
    {
        id: "2",
        name: "Carrot harvest wooden Toy",
        image: "https://i.pinimg.com/1200x/cd/d0/43/cdd0437a6347c2a4c1913d51c3d4cb33.jpg",
        price: 29,
        quantity: 1,
        subtotal: 29,
    },
    {
        id: "3",
        name: "Talking flash cards learning Toys",
        image: "https://i.pinimg.com/1200x/cd/d0/43/cdd0437a6347c2a4c1913d51c3d4cb33.jpg",
        price: 39,
        quantity: 2,
        subtotal: 78,
    },
];

export default function CartPage() {
    const [cart, setCart] = useState<CartItem[]>(mockCart);
    const [coupon, setCoupon] = useState("");

    const handleQuantity = (id: string, delta: number) => {
        setCart((prev) =>
            prev.map((item) =>
                item.id === id
                    ? {
                        ...item,
                        quantity: Math.max(1, item.quantity + delta),
                        subtotal: item.price * Math.max(1, item.quantity + delta),
                    }
                    : item
            )
        );
    };

    const handleRemove = (id: string) => {
        setCart((prev) => prev.filter((item) => item.id !== id));
    };

    const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    const total = subtotal + 20; // Example shipping

    const { setItems: setBreadcrumb } = useBreadcrumb();
    useEffect(() => {
        setBreadcrumb([
            { label: 'Home', href: '/' },
            { label: 'Your shopping cart', active: true },
        ]);
        return () => setBreadcrumb([]);
    }, [setBreadcrumb]);
    return (
        <div className="relative min-h-screen bg-gradient-to-b from-[var(--color-bg-secondary)] to-white/80 pb-28">
            <div className="container mx-auto px-2 sm:px-4 py-6 sm:py-8">
                <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-[var(--color-primary-dark)] drop-shadow-sm">Your Cart</h1>
                <div className="rounded-2xl bg-white/90 shadow-card ring-1 ring-[var(--color-border)] mb-8 p-2 sm:p-0">
                    <CartTable cart={cart} onQuantity={handleQuantity} onRemove={handleRemove} />
                </div>
                <div className="flex flex-col md:flex-row gap-8">
                    <div className="flex-1 space-y-4">
                        <CartActions coupon={coupon} setCoupon={setCoupon} />
                    </div>
                </div>
            </div>
            <CartCheckoutBar total={total} disabled={cart.length === 0} />
        </div>
    );
}
