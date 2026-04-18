import { useState } from "react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface CancelTradeInDialogProps {
    onConfirm: (reason: string) => void;
    isLoading: boolean;
}

const CANCEL_REASONS = [
    "I changed my mind",
    "Found a better deal elsewhere",
    "Incorrect item details provided",
    "Processing time is too long",
    "Technical issues during request",
    "Other"
];

export const CancelTradeInDialog = ({ onConfirm, isLoading }: CancelTradeInDialogProps) => {
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState(CANCEL_REASONS[0]);
    const [customReason, setCustomReason] = useState("");

    const handleConfirm = () => {
        const finalReason = reason === "Other" ? customReason : reason;
        if (!finalReason.trim()) {
            toast.error("Please provide a reason for cancellation.");
            return;
        }
        onConfirm(finalReason);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 px-4 rounded-lg text-[10px] font-black uppercase tracking-wider text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-all"
                >
                    Cancel Request
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[440px] p-0 rounded-2xl border-none shadow-2xl bg-white overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="bg-slate-50 px-8 py-6 border-b border-slate-100">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black text-slate-900 tracking-tight uppercase">Cancel Trade-In</DialogTitle>
                        <DialogDescription className="text-[12px] font-medium text-slate-500 pt-1 leading-relaxed">
                            We're sorry to see you go. Please let us know why you're cancelling to help us improve our service.
                        </DialogDescription>
                    </DialogHeader>
                </div>
                
                <div className="px-8 py-6 space-y-6">
                    <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Reason for cancellation</Label>
                        <Select value={reason} onValueChange={setReason}>
                            <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-white hover:border-primary/30 transition-all font-bold text-xs uppercase tracking-wider shadow-none focus:ring-primary/20">
                                <SelectValue placeholder="Select a reason" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-200 shadow-2xl overflow-hidden bg-white">
                                {CANCEL_REASONS.map((r) => (
                                    <SelectItem key={r} value={r} className="font-bold text-[10px] uppercase tracking-wider focus:bg-slate-50 transition-colors py-3 cursor-pointer">
                                        {r}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                            {reason === "Other" ? "Please specify your reason" : "Additional comments (Optional)"}
                        </Label>
                        <Textarea
                            value={customReason}
                            onChange={(e) => setCustomReason(e.target.value)}
                            placeholder="Tell us more about your decision..."
                            className="min-h-[120px] rounded-xl border-slate-200 bg-white focus:border-primary/30 transition-all resize-none text-[13px] font-medium p-4 shadow-none focus:ring-primary/20"
                        />
                    </div>
                </div>

                <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3 font-black">
                    <Button
                        variant="ghost"
                        onClick={() => setOpen(false)}
                        className="h-11 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-200/50"
                    >
                        Keep Request
                    </Button>
                    <Button
                        disabled={isLoading}
                        onClick={handleConfirm}
                        className="h-11 px-8 rounded-xl text-[11px] font-black uppercase tracking-widest bg-rose-500 text-white hover:bg-rose-600 active:scale-95 transition-all focus-visible:ring-0 focus:ring-0 outline-none border-none shadow-none"
                    >
                        {isLoading ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            "Confirm Cancel"
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
