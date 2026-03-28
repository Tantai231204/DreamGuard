// src/pages/admin/customize-types/components/CustomizeTypeDetails.tsx
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AdminStatusBadge } from '@/components/admin';
import { formatPrice } from '@/lib/utils';
import { Sparkles, AlignLeft, Banknote, Calendar, Box } from 'lucide-react';
import type { CustomizeType } from '../types';
import { memo } from 'react';

interface CustomizeTypeDetailsProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    data: CustomizeType | null;
}

const CustomizeTypeDetails = memo(function CustomizeTypeDetails({ open, onOpenChange, data }: CustomizeTypeDetailsProps) {
    if (!data) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[500px] p-0 border-0 rounded-2xl overflow-hidden shadow-2xl bg-white">
                <DialogHeader className="p-8 pb-4 border-b border-gray-100 bg-slate-50/30">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#4988c4] flex items-center justify-center shadow-lg shadow-blue-500/10">
                            <Box className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-bold text-gray-900">
                                Detailed Overview
                            </DialogTitle>
                            <DialogDescription className="text-sm font-medium text-gray-500 mt-1">
                                Configuration and metadata for customization option
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {/* Primary Info Card */}
                    <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                        <div className="col-span-2">
                            <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                                <Sparkles className="h-3 w-3" />
                                Type Identity
                            </h4>
                            <div className="text-lg font-bold text-slate-900">
                                {data.name}
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-[10px] font-mono bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200 uppercase tracking-tighter">
                                    ID: {data.id}
                                </span>
                                <AdminStatusBadge status={data.status} />
                            </div>
                        </div>

                        <div className="col-span-2">
                            <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                                <AlignLeft className="h-3 w-3" />
                                Summary & Purpose
                            </h4>
                            <div className="text-sm font-medium text-slate-600 leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                                {data.summary || <span className="text-slate-300 italic">No summary provided for this classification.</span>}
                            </div>
                        </div>

                        <div>
                            <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                <Banknote className="h-3 w-3" />
                                Base Amount
                            </h4>
                            <div className="text-base font-black text-blue-600">
                                {formatPrice(data.defaultPrice)}
                            </div>
                        </div>

                        <div>
                            <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                <Calendar className="h-3 w-3" />
                                Data Lifecycle
                            </h4>
                            <div className="text-xs font-bold text-slate-800">
                                Recent Activity
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="p-6 border-t border-gray-100 flex sm:justify-between items-center bg-slate-50/20">
                    <div className="text-[10px] font-bold text-slate-400 tracking-tight hidden sm:block">
                        Customize Types Management System
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="h-10 rounded-xl px-6 border-2 border-slate-200 font-bold text-slate-600 hover:bg-slate-100 hover:border-slate-300 transition-all active:scale-95"
                    >
                        Close Details
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
});

export default CustomizeTypeDetails;
