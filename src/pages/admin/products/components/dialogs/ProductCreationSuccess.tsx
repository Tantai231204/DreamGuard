import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ImagePlus } from 'lucide-react';

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
            <DialogContent className="sm:max-w-[440px]">
                <DialogHeader className="pb-6 border-b border-slate-100 bg-slate-50/30 -mx-6 px-6 -mt-6 pt-6 rounded-t-2xl">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary-600 flex items-center justify-center shadow-lg shadow-primary-100 shrink-0">
                            <CheckCircle2 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-black text-slate-900 tracking-tight">
                                Product Verified
                            </DialogTitle>
                            <DialogDescription className="text-xs text-slate-500 font-medium">
                                "{productName}" is now active in your catalog.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="py-8">
                    <div className="flex items-start gap-4 p-5 rounded-2xl bg-primary-50/50 border border-primary-100 transition-all hover:bg-primary-50">
                        <div className="w-10 h-10 rounded-xl bg-white border border-primary-100 flex items-center justify-center shrink-0 shadow-sm">
                            <ImagePlus className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                            <p className="text-[13px] font-bold text-slate-900 mb-1">
                                Enhance with Media?
                            </p>
                            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                                High-quality images significantly increase conversion. Add photos now or manage them later.
                            </p>
                        </div>
                    </div>
                </div>

                <DialogFooter className="pt-6 border-t border-slate-100 gap-3">
                    <Button
                        variant="outline"
                        onClick={onSkip}
                        className="flex-1 h-11 border-slate-200 text-slate-500 hover:bg-slate-50 font-bold text-xs uppercase tracking-widest rounded-xl transition-all"
                    >
                        Skip
                    </Button>
                    <Button
                        onClick={onAddImages}
                        className="flex-1 h-11 bg-primary-600 hover:bg-primary-700 text-white shadow-md shadow-primary-200 font-bold text-xs uppercase tracking-widest rounded-xl transition-all active:scale-95"
                    >
                        <ImagePlus className="w-4 h-4 mr-2" />
                        Add Images
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
