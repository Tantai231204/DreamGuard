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
import { AlignLeft, Box, Tag, Layers, Calculator } from 'lucide-react';
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
            <DialogContent className="max-w-[500px] p-0 border-0 rounded-[2rem] overflow-hidden shadow-2xl bg-white">
        <DialogHeader className="p-8 pb-5 border-b border-gray-100 bg-slate-50/30 flex-row gap-4 items-center space-y-0">
          <div className="w-12 h-12 rounded-2xl bg-[#4988c4] flex items-center justify-center shadow-sm shrink-0">
            <Box className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <DialogTitle className="text-xl font-bold text-gray-900 leading-none mb-1">
              Detailed Overview
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-400 font-medium">
               Configuration and metadata for this classification
            </DialogDescription>
          </div>
        </DialogHeader>

                <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {/* Primary Info Card */}
                    <div className="grid grid-cols-2 gap-x-10 gap-y-8">
                        <div className="col-span-2">
                            <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                                <Tag className="h-3 w-3" />
                                Type Identity
                            </h4>
                            <div className="text-lg font-bold text-slate-900 mb-2">
                                {data.name}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono bg-slate-100 text-slate-500 px-2.5 py-1 rounded-lg border border-slate-200 uppercase tracking-tighter">
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
                            <div className="text-sm font-medium text-slate-600 leading-relaxed bg-slate-50/50 p-5 rounded-2xl border border-slate-100 shadow-inner-sm">
                                {data.summary || <span className="text-slate-300 italic">No summary provided for this classification.</span>}
                            </div>
                        </div>

                        <div>
                            <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                                <Calculator className="h-3 w-3" />
                                Pricing Logic
                            </h4>
                            <div className="space-y-2">
                                <div className="text-base font-black text-blue-600 tabular-nums">
                                    {data.calculationMode === 'Multiplier' 
                                        ? `Factor: x${data.defaultMultiplier?.toFixed(2)}` 
                                        : formatPrice(data.defaultPrice)}
                                </div>
                                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200">
                                     <div className="w-1 h-1 rounded-full bg-slate-400" />
                                     <span className="text-[9px] font-black uppercase text-slate-500 tracking-tight">
                                        {data.calculationMode} MODE
                                     </span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                                <Layers className="h-3 w-3" />
                                Target Scope
                            </h4>
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-2">
                                     <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                                     <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">Category:</span>
                                     <span className="text-[11px] font-black text-[#4988c4] uppercase">{data.category}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                     <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                                     <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">Assigned:</span>
                                     <span className="text-[11px] font-black text-slate-600 uppercase">{data.applicableProductType}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="px-8 py-5 border-t border-gray-100 flex sm:justify-between items-center bg-slate-50/20">
                    <div className="text-[10px] font-bold text-slate-400 tracking-tight hidden sm:block uppercase">
                        Core Classification Engine v1.0
                    </div>
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="h-10 rounded-xl px-6 font-bold text-slate-500 hover:bg-slate-100 transition-all active:scale-95"
                    >
                        Close Details
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
});

export default CustomizeTypeDetails;
