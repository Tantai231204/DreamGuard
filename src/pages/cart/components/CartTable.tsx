import { Minus, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface CartItem {
    id: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
    subtotal: number;
}

interface CartTableProps {
    cart: CartItem[];
    onQuantity: (id: string, delta: number) => void;
    onRemove: (id: string) => void;
}

export function CartTable({ cart, onQuantity, onRemove }: CartTableProps) {
    return (


        <div className="overflow-x-auto rounded-2xl bg-[var(--color-bg-primary)] shadow-card mb-8 ring-1 ring-[var(--color-border)]">
            <table className="min-w-full text-sm">
                <thead className="bg-[var(--color-bg-secondary)]">
                    <tr>
                        <th className="px-6 py-4 text-left font-semibold text-[var(--color-text-secondary)]">Product</th>
                        <th className="px-4 py-4 text-left font-semibold text-[var(--color-text-secondary)]">Price</th>
                        <th className="px-4 py-4 text-center font-semibold text-[var(--color-text-secondary)]">Quantity</th>
                        <th className="px-4 py-4 text-right font-semibold text-[var(--color-text-secondary)]">Subtotal</th>
                        <th className="px-4 py-4 text-center font-semibold text-[var(--color-text-secondary)]">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {cart.map((item) => (
                        <tr key={item.id} className="border-b last:border-b-0 border-[var(--color-border)]">
                            <td className="flex items-center gap-4 px-6 py-6 min-w-[220px]">
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="h-16 w-16 rounded-xl object-cover border border-[var(--color-border)] bg-[var(--color-bg-secondary)]"
                                />
                                <span className="font-medium text-[var(--color-text-primary)]">{item.name}</span>
                            </td>
                            <td className="px-4 py-6 text-[var(--color-text-secondary)]">${item.price.toFixed(2)}</td>
                            <td className="px-4 py-6 text-center">
                                <div className="inline-flex items-center rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-primary)]">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-[var(--color-primary)]"
                                        onClick={() => onQuantity(item.id, -1)}
                                        aria-label="Decrease quantity"
                                    >
                                        <Minus className="h-4 w-4" />
                                    </Button>
                                    <span className="mx-2 w-6 text-center font-semibold text-[var(--color-text-primary)]">{item.quantity}</span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-[var(--color-primary)]"
                                        onClick={() => onQuantity(item.id, 1)}
                                        aria-label="Increase quantity"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </td>
                            <td className="px-4 py-6 text-right font-semibold text-[var(--color-text-primary)]">${item.subtotal.toFixed(2)}</td>
                            <td className="px-4 py-6 text-center">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-[var(--color-text-muted)] hover:text-red-500"
                                    onClick={() => onRemove(item.id)}
                                    aria-label="Remove item"
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
