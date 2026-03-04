import { memo } from 'react';
import { Package } from 'lucide-react';
import { DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { PRODUCT_STATUS_COLORS, type ProductStatus } from '../../types';

interface DialogHeaderProps {
    isEdit: boolean;
    status?: ProductStatus;
}

const DialogHeader = memo(function DialogHeader({ isEdit, status }: DialogHeaderProps) {
    return (
        <div className="flex items-center gap-4 pb-5 border-b border-gray-100">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
                <Package className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                    <DialogTitle className="text-xl font-bold text-gray-900">
                        {isEdit ? 'Edit Product' : 'New Product'}
                    </DialogTitle>
                    {isEdit && status && (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gray-100 border border-gray-200">
                            <span className={cn('h-2 w-2 rounded-full', PRODUCT_STATUS_COLORS[status])} />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600">{status}</span>
                        </div>
                    )}
                </div>
                <DialogDescription className="text-sm text-gray-500 mt-0.5">
                    {isEdit ? 'Update the product details below' : 'Fill in the details to add a new product'}
                </DialogDescription>
            </div>
        </div>
    );
});

export default DialogHeader;
