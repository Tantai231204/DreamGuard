import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, ImagePlus } from 'lucide-react';

interface ProductCreationSuccessProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    productName: string;
    onAddImages: () => void;
    onSkip: () => void;
}

export default function ProductCreationSuccess({
    open,
    onOpenChange,
    productName,
    onAddImages,
    onSkip,
}: ProductCreationSuccessProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] p-8 rounded-[32px] border-none shadow-2xl overflow-hidden">

                <DialogHeader className="p-0 mb-8">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-[22px] bg-[#4988c4] flex items-center justify-center shadow-xl shadow-blue-100 shrink-0 border-4 border-white">
                            <Check className="w-8 h-8 text-white stroke-[3px]" />
                        </div>
                        <div className="space-y-1">
                            <DialogTitle className="text-2xl font-bold text-slate-800 tracking-tight">
                                Product Verified
                            </DialogTitle>
                            <DialogDescription className="text-[14px] text-slate-500 font-medium">
                                "{productName.toLowerCase()}" is now active in your catalog.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="mb-8">
                    <div className="flex items-start gap-5 p-6 rounded-[28px] bg-sky-50/40 border border-sky-100/50 group transition-all">
                        <div className="w-14 h-14 rounded-2xl bg-white border border-sky-100 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                            <ImagePlus className="w-6 h-6 text-[#4988c4]" />
                        </div>
                        <div className="space-y-1.5 flex-1 pr-2">
                            <h4 className="text-[16px] font-bold text-slate-800">
                                Enhance with Media?
                            </h4>
                            <p className="text-[12px] text-slate-500 leading-relaxed font-medium">
                                High-quality images significantly increase conversion. Add photos now or manage them later.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        onClick={onSkip}
                        className="flex-1 h-14 border-2 border-[#4988c4]/30 text-[#4988c4] hover:bg-slate-50 font-black text-xs uppercase tracking-[0.2em] rounded-2xl transition-all active:scale-95"
                    >
                        SKIP
                    </Button>
                    <Button
                        onClick={onAddImages}
                        className="flex-[1.2] h-14 bg-[#4988c4] hover:bg-[#3a6fa0] text-white shadow-xl shadow-[#4988c4]/20 font-black text-xs uppercase tracking-[0.1em] rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        ADD IMAGES
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
