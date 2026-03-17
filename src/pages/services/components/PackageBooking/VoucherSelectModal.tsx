import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Ticket, Check } from "lucide-react";
import { useState } from "react";
import { MOCK_VOUCHERS, type Voucher } from "./vouchers";

interface VoucherSelectModalProps {
    open: boolean;
    onClose: () => void;
    onSelect: (voucher: Voucher) => void;
    onSkip: () => void;
    appliedCode?: string;
}

export default function VoucherSelectModal({ open, onClose, onSelect, onSkip, appliedCode }: VoucherSelectModalProps) {
    const [input, setInput] = useState("");
    const [error, setError] = useState("");

    const handleManualApply = () => {
        const v = MOCK_VOUCHERS.find(v => v.code === input.trim().toUpperCase());
        if (v) {
            onSelect(v);
            setError("");
        } else {
            setError("Invalid voucher code or backlist coupon");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            {/* Shadcn Modal Content handles Close X internally by default, DO NOT DRAW CUSTOM X triggers overlapping. */}
            <DialogContent className="max-w-md w-full p-0 overflow-hidden rounded-3xl border border-slate-100 shadow-2xl">
                <DialogHeader className="p-6 pb-4 border-b border-slate-50">
                    <DialogTitle className="text-xl font-black text-slate-900 tracking-tight">Select a Voucher</DialogTitle>
                </DialogHeader>

                <div className="p-6 pt-5 space-y-5">
                    <div className="flex gap-2">
                        <Input
                            placeholder="Enter promo code"
                            value={input}
                            onChange={e => { setInput(e.target.value.toUpperCase()); setError(""); }}
                            onKeyDown={e => e.key === "Enter" && handleManualApply()}
                            className="font-black tracking-wider uppercase h-11 rounded-xl border-slate-200 focus:border-[#4988c4] focus:ring-[#4988c4]/5"
                        />
                        <Button 
                            type="button" 
                            onClick={handleManualApply} 
                            disabled={!input.trim()}
                            className="h-11 px-5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-40 font-black uppercase tracking-widest text-[10px]"
                        >
                            Apply
                        </Button>
                    </div>

                    {error && <div className="text-[10px] uppercase font-black tracking-wider text-rose-500 ml-1">{error}</div>}

                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                        {MOCK_VOUCHERS.map(v => (
                            <button
                                key={v.code}
                                type="button"
                                className={`w-full flex items-center justify-between rounded-xl border p-4 transition-all text-left focus:outline-none ${
                                    appliedCode === v.code 
                                        ? "border-[#4988c4] bg-[#4988c4]/5 shadow-sm shadow-[#4988c4]/5" 
                                        : "border-slate-100 hover:border-[#4988c4]/40 hover:bg-slate-50/50"
                                }`}
                                onClick={() => onSelect(v)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-xl ${appliedCode === v.code ? "bg-[#4988c4] text-white" : "bg-indigo-50 text-[#4988c4]"}`}>
                                        <Ticket className="h-5 w-5 flex-shrink-0" />
                                    </div>
                                    <div>
                                        <div className="font-black text-slate-900 text-sm tracking-tight">{v.code}</div>
                                        <div className="text-[10px] text-slate-400 font-medium">
                                            {v.label} — <span className="font-black text-[#4988c4]">{v.discountPct}% OFF</span>
                                        </div>
                                    </div>
                                </div>
                                {appliedCode === v.code && (
                                    <div className="h-5 w-5 rounded-full bg-[#4988c4] flex items-center justify-center">
                                        <Check className="h-3 w-3 text-white" />
                                    </div>
                                )}
                            </button>
                        ))}

                        {MOCK_VOUCHERS.length === 0 && (
                            <div className="text-center text-slate-400 py-6 text-xs font-black uppercase tracking-widest leading-loose">No vouchers available</div>
                        )}
                    </div>

                    <div className="pt-2 border-t border-slate-50">
                        <Button variant="ghost" className="w-full h-11 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50" onClick={onSkip}>
                            Continue without voucher
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
