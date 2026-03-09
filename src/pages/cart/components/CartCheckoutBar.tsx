import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { AppRoute } from "@/lib/constants";

interface CartCheckoutBarProps {
    total: number;
    disabled?: boolean;
}

export function CartCheckoutBar({ total, disabled }: CartCheckoutBarProps) {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuthStore();

    const handleCheckout = () => {
        if (isAuthenticated) {
            navigate(AppRoute.CHECKOUT);
        } else {
            navigate(`${AppRoute.LOGIN}?redirect=${AppRoute.CHECKOUT}`);
        }
    };

    return (
        <div className="fixed bottom-0 left-0 w-full z-30 bg-[var(--color-bg-primary)]/95 backdrop-blur border-t border-[var(--color-border)] shadow-[0_-2px_16px_rgba(0,0,0,0.06)] px-2 sm:px-4 py-3 flex items-center justify-between md:justify-end gap-4">
            <div className="hidden md:flex flex-1 items-center gap-2 text-base font-medium text-[var(--color-text-secondary)]">
                <span>Total:</span>
                <span className="text-xl font-bold text-[var(--color-primary-dark)]">${(total ?? 0).toFixed(2)}</span>
            </div>
            <Button
                className="rounded-lg px-8 py-3 text-base font-semibold bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white shadow-md transition-colors"
                style={{ boxShadow: "0 2px 8px var(--color-primary-light)" }}
                disabled={disabled}
                onClick={handleCheckout}
            >
                Proceed to checkout
            </Button>
        </div>
    );
}
