import { memo } from 'react';
import { Package } from 'lucide-react';
import { DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { PRODUCT_STATUS_COLORS, type ProductStatus } from '../../types';

interface DialogHeaderProps {
    isEdit: boolean;
    status?: ProductStatus;
    completionScore: number;
}

const DialogHeader = memo(function DialogHeader({ isEdit, status, completionScore }: DialogHeaderProps) {
    return (
        <div className="flex items-center gap-4 pb-5 border-b border-gray-100 shrink-0">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/25 shrink-0">
                <Package className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
                <DialogTitle className="text-xl font-bold text-gray-900 leading-none mb-1">
                    {isEdit ? 'Edit Product' : 'New Product'}
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-400 font-medium">
                    {isEdit ? 'Update the details for this product' : 'Define basic attributes and specifications'}
                </DialogDescription>
            </div>

            <div className="flex flex-col items-end gap-2 shrink-0">
                <div className="flex items-center gap-2 bg-indigo-50/50 px-3 py-1.5 rounded-full border border-indigo-100 shadow-sm">
                    <span className="text-[11px] font-black text-indigo-700 uppercase tracking-tighter">
                        Product Health: {completionScore}%
                    </span>
                </div>
                {isEdit && status && (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200">
                        <span className={cn('h-2 w-2 rounded-full', PRODUCT_STATUS_COLORS[status])} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{status}</span>
                    </div>
                )}
            </div>
        </div>
    );
});

export default DialogHeader;
