import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tag, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface CartActionsProps {
    coupon: string;
    setCoupon: (v: string) => void;
}

export function CartActions({ coupon, setCoupon }: CartActionsProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="flex flex-col gap-3 mt-4">
            <div className="flex flex-wrap items-center gap-4">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={cn(
                        "flex items-center gap-3 px-6 h-10 rounded-xl border border-dashed transition-all duration-300 relative overflow-hidden group/promo",
                        isOpen
                            ? "bg-[#4988c4]/10 border-[#4988c4] text-[#4988c4]"
                            : "bg-white border-slate-200 text-slate-400 hover:border-slate-400"
                    )}
                >
                    <Tag className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Apply Promo Code</span>
                    {isOpen ? <ChevronUp className="w-3 h-3 ml-2" /> : <ChevronDown className="w-3 h-3 ml-2" />}
                    <div className="absolute inset-x-0 bottom-0 h-[1px] border-t border-dashed border-[#4988c4] scale-x-0 group-hover/promo:scale-x-100 transition-transform duration-500 origin-left" />
                </button>

                <div className="h-5 w-px border-r border-dashed border-slate-200 hidden sm:block opacity-50" />

                <Button
                    type="button"
                    variant="ghost"
                    className="h-10 rounded-xl px-5 text-slate-300 hover:text-[#4988c4] text-[9px] font-black uppercase tracking-widest transition-all"
                    onClick={() => window.location.href = '/'}
                >
                    Return to Shop
                </Button>
            </div>

            {/* Dropdown Section */}
            <div className={cn(
                "overflow-hidden transition-all duration-500 max-h-0",
                isOpen && "max-h-[100px] mt-2"
            )}>
                <form className="flex items-center gap-2 p-1 bg-white rounded-[1.25rem] border border-dashed border-[#4988c4]/30 shadow-sm">
                    <Input
                        type="text"
                        placeholder="SUMMER24"
                        value={coupon}
                        onChange={(e) => setCoupon(e.target.value)}
                        className="w-[180px] h-11 border-none bg-transparent text-[11px] font-black uppercase tracking-[0.2em] focus-visible:ring-0 placeholder:text-slate-200"
                    />
                    <Button
                        type="submit"
                        className="h-11 rounded-2xl px-8 bg-[#4988c4] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#3a6da3] transition-all shadow-md active:scale-95"
                    >
                        Apply
                    </Button>
                </form>
            </div>
        </div>
    );
}
