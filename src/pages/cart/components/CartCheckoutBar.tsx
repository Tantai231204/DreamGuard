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
        <div className="fixed bottom-0 left-0 w-full z-30 bg-white border-t border-dashed border-slate-200 px-6 py-5 flex items-center justify-between">
            <div className="container mx-auto max-w-[1300px] flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="hidden md:flex items-center gap-12">
                    <div className="flex flex-col relative">
                        <div className="absolute -left-4 top-1 w-1 h-8 bg-[#4988c4] rounded-full" />
                        <span className="text-[8px] font-black text-[#4988c4] uppercase tracking-[0.3em] mb-1">Final Calculation</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-black text-slate-900 tracking-tighter tabular-nums">${(total ?? 0).toFixed(2)}</span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">USD</span>
                        </div>
                    </div>
                    
                    <div className="h-10 w-px border-r border-dashed border-slate-200" />
                    
                    <div className="flex flex-col">
                        <span className="text-[8px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-1">Shipment Status</span>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Free Shipping Applicable</p>
                    </div>
                </div>

                <div className="flex items-center gap-8 w-full md:w-auto">
                    <div className="md:hidden flex flex-col flex-1">
                        <span className="text-[8px] font-black text-[#4988c4] uppercase tracking-widest mb-1">Total Amount</span>
                        <span className="text-3xl font-black text-slate-900 tracking-tighter">${(total ?? 0).toFixed(2)}</span>
                    </div>
                    
                    <Button
                        className="h-14 rounded-[1.25rem] px-12 text-[11px] font-black uppercase tracking-[0.25em] bg-[#4988c4] hover:bg-slate-900 text-white transition-all shadow-xl shadow-[#4988c4]/20 active:scale-[0.98] disabled:opacity-50 disabled:shadow-none"
                        disabled={disabled}
                        onClick={handleCheckout}
                    >
                        Checkout Order
                    </Button>
                </div>
            </div>
        </div>
    );
}
