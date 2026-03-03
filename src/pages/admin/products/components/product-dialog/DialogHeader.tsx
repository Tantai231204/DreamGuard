import { memo } from 'react';
import { Package } from 'lucide-react';
import { DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface DialogHeaderProps {
    isEdit: boolean;
}

const DialogHeader = memo(function DialogHeader({ isEdit }: DialogHeaderProps) {
    return (
        <div className="flex items-center gap-4 pb-5 border-b border-gray-100">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
                <Package className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
                <DialogTitle className="text-xl font-bold text-gray-900">
                    {isEdit ? 'Edit Product' : 'New Product'}
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-500 mt-0.5">
                    {isEdit ? 'Update the product details below' : 'Fill in the details to add a new product'}
                </DialogDescription>
            </div>
        </div>
    );
});

export default DialogHeader;
