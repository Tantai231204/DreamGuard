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
                <DialogHeader className="pb-4 border-b">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-md">
                            <CheckCircle2 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-bold text-gray-900">
                                Product Created!
                            </DialogTitle>
                            <DialogDescription className="text-sm text-gray-500">
                                "{productName}" has been added
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="py-5">
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-100">
                        <ImagePlus className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-gray-900 mb-1">
                                Add product images?
                            </p>
                            <p className="text-xs text-gray-600">
                                Upload photos to help customers see your product. You can always add images later.
                            </p>
                        </div>
                    </div>
                </div>

                <DialogFooter className="pt-4 border-t gap-3">
                    <Button
                        variant="outline"
                        onClick={onSkip}
                        className="flex-1 h-10 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 font-medium"
                    >
                        Skip for now
                    </Button>
                    <Button
                        onClick={onAddImages}
                        className="flex-1 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30 font-medium"
                    >
                        <ImagePlus className="w-4 h-4 mr-2" />
                        Add Images
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
