import React from 'react';
import { CreditCard, ArrowRight } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { AdminStatusBadge } from '@/components/admin';

export const FinancialOversightSection = React.memo(({ 
    displayMethod, 
    paymentStatus, 
    totalPrice, 
    paymentDescription, 
    paymentEvidenceUrl 
}: {
    displayMethod: string;
    paymentStatus: string;
    totalPrice?: number;
    paymentDescription?: string;
    paymentEvidenceUrl?: string;
}) => (
    <div className="bg-white p-5 border-y border-gray-50">
        <div className="flex items-center gap-2 mb-4 text-[#4988c4]">
            <CreditCard className="w-4 h-4" />
            <h4 className="text-[11px] font-black uppercase tracking-widest">Financial Oversight</h4>
        </div>

        <div className="bg-slate-50/80 rounded-xl border border-slate-100/80 p-5 space-y-4">
            <div className="flex items-end justify-between gap-6">
                <div className="flex gap-6">
                    <div className="space-y-1.5">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Method</p>
                        <AdminStatusBadge 
                            status={displayMethod} 
                            mode="method"
                            className="scale-90 origin-left"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Payment</p>
                        <AdminStatusBadge 
                            status={paymentStatus || "Pending"} 
                            mode="payment"
                            className="scale-90 origin-left"
                        />
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">Net Payable</p>
                    <p className="text-[20px] font-black text-slate-900 tracking-tighter tabular-nums leading-none">
                        {formatPrice(totalPrice || 0)}
                    </p>
                </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Payment Ledger Note</span>
                        <div className="h-px bg-slate-100 flex-1" />
                    </div>
                    <p className="text-[10px] font-bold text-slate-500 leading-relaxed italic">
                        {paymentDescription || 'N/A: Regular Service Settlement'}
                    </p>
                </div>

                {paymentEvidenceUrl && (
                    <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Submitted Evidence</span>
                            <a 
                                href={paymentEvidenceUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-[9px] font-bold text-primary hover:underline flex items-center gap-1"
                            >
                                View Original
                                <ArrowRight className="w-2.5 h-2.5" />
                            </a>
                        </div>
                        <div className="relative aspect-[16/7] rounded-xl overflow-hidden border border-slate-200 bg-slate-50 group/evidence shadow-sm">
                            <img 
                                src={paymentEvidenceUrl} 
                                alt="Payment Evidence" 
                                className="w-full h-full object-cover transition-transform duration-500 group-hover/evidence:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover/evidence:opacity-100 transition-opacity" />
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
));
FinancialOversightSection.displayName = 'FinancialOversightSection';
