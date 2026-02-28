import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CartActionsProps {
    coupon: string;
    setCoupon: (v: string) => void;
}

export function CartActions({ coupon, setCoupon }: CartActionsProps) {
    return (
        <form className="flex flex-wrap gap-2">
            <Input
                type="text"
                placeholder="Coupon code"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                className="max-w-[180px] rounded-lg border-[var(--color-border)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
            />
            <Button type="submit" className="rounded-lg px-6 bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] transition-colors shadow-sm">Apply</Button>
            <Button type="button" variant="outline" className="rounded-lg px-6 text-[var(--color-text-muted)] border-[var(--color-border)] hover:border-[var(--color-primary)]">Continue Shopping</Button>
            <Button type="button" className="rounded-lg px-6 bg-[var(--color-primary-light)] text-[var(--color-primary-dark)] hover:bg-[var(--color-primary)] hover:text-white transition-colors shadow-sm">Update Cart</Button>
        </form>
    );
}
