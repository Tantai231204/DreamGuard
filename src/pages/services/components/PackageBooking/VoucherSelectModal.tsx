import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
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
            setError("Mã không hợp lệ hoặc chưa có trong danh sách");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md w-full p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-2 border-b border-gray-100">
                    <DialogTitle className="text-lg font-bold">Khuyến mại</DialogTitle>
                </DialogHeader>
                <div className="p-6 pt-4 space-y-4">
                    <div className="flex gap-2">
                        <Input
                            placeholder="Nhập mã ưu đãi"
                            value={input}
                            onChange={e => { setInput(e.target.value.toUpperCase()); setError(""); }}
                            onKeyDown={e => e.key === "Enter" && handleManualApply()}
                            className="font-mono tracking-wider uppercase"
                        />
                        <Button type="button" onClick={handleManualApply} disabled={!input.trim()}>
                            Sử dụng
                        </Button>
                    </div>
                    {error && <div className="text-xs text-red-500 -mt-2">{error}</div>}
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {MOCK_VOUCHERS.map(v => (
                            <button
                                key={v.code}
                                type="button"
                                className={`w-full flex items-center justify-between rounded-lg border px-4 py-3 transition-all text-left focus:outline-none focus:ring-2 focus:ring-violet-300 ${appliedCode === v.code ? "border-[var(--color-primary)] bg-blue-50" : "border-gray-200 hover:border-blue-300"}`}
                                onClick={() => onSelect(v)}
                            >
                                <div className="flex items-center gap-3">
                                    <Ticket className="h-6 w-6 text-violet-500 flex-shrink-0" />
                                    <div>
                                        <div className="font-bold text-[var(--color-primary)] text-base">{v.code}</div>
                                        <div className="text-xs text-gray-500">{v.label} — <span className="font-semibold text-violet-700">{v.discountPct}%</span></div>
                                    </div>
                                </div>
                                {appliedCode === v.code && <Check className="h-5 w-5 text-[var(--color-primary)]" />}
                            </button>
                        ))}
                        {MOCK_VOUCHERS.length === 0 && (
                            <div className="text-center text-gray-400 py-8">Không có mã ưu đãi khả dụng</div>
                        )}
                    </div>
                    <Button variant="ghost" className="w-full mt-2" onClick={onSkip}>
                        Bỏ qua mã ưu đãi và tiếp tục
                    </Button>
                </div>
                <DialogClose asChild>
                    <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-700" aria-label="Đóng">
                        <span className="text-2xl">×</span>
                    </button>
                </DialogClose>
            </DialogContent>
        </Dialog>
    );
}
