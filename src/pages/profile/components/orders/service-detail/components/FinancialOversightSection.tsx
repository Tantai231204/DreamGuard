import React, { useState } from 'react';
import { CreditCard, ArrowRight, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { AdminStatusBadge } from '@/components/admin';
import { Button } from '@/components/ui/button';
import type { PaymentResponse } from '@/api/types/payment';

export const FinancialOversightSection = React.memo(({
    displayMethod,
    paymentStatus: legacyStatus,
    totalPrice: legacyPrice,
    paymentDescription: legacyDesc,
    paymentEvidenceUrl: legacyEvidence,
    payments = []
}: {
    displayMethod: string;
    paymentStatus: string;
    totalPrice?: number;
    paymentDescription?: string;
    paymentEvidenceUrl?: string;
    payments?: PaymentResponse[];
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Determine the source of truth for payment items
    // If no payments list is provided, construct a standard PaymentResponse from props
    const displayItems: PaymentResponse[] = payments.length > 0 ? payments : [{
        id: 'initial',
        orderCode: 'N/A',
        paymentMethod: displayMethod,
        status: legacyStatus,
        amount: legacyPrice || 0,
        description: legacyDesc || 'Regular Service Settlement',
        evidenceUrl: legacyEvidence,
        paymentType: 'Purchase',
        createdAt: new Date().toISOString()
    }];

    const activePayment = displayItems[currentIndex];
    const hasMultiple = displayItems.length > 1;

    const next = () => setCurrentIndex((prev) => (prev + 1) % displayItems.length);
    const prev = () => setCurrentIndex((prev) => (prev - 1 + displayItems.length) % displayItems.length);

    // Contextual coloring and labeling based on payment state
    const isRefundKind = ['refunding', 'refunded'].includes(activePayment.status?.toLowerCase());

    return (
        <div className="bg-white p-5 border-y border-gray-50">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-[#4988c4]">
                    <CreditCard className="w-4 h-4" />
                    <h4 className="text-[11px] font-black uppercase tracking-widest">Financial Ledger</h4>
                </div>

                {hasMultiple && (
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest tabular-nums">
                            Record {currentIndex + 1} of {displayItems.length}
                        </span>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-6 w-6 rounded-md hover:bg-slate-100 border-slate-200"
                                onClick={prev}
                            >
                                <ChevronLeft className="w-3 h-3" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-6 w-6 rounded-md hover:bg-slate-100 border-slate-200"
                                onClick={next}
                            >
                                <ChevronRight className="w-3 h-3" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-slate-50/80 rounded-xl border border-slate-100/80 p-5 space-y-4 relative transition-all duration-300">
                <div className="flex items-end justify-between gap-6">
                    <div className="flex gap-6">
                        <div className="space-y-1.5">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Method</p>
                            <AdminStatusBadge
                                status={activePayment.paymentMethod}
                                mode="method"
                                className="scale-90 origin-left"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Payment</p>
                            <AdminStatusBadge
                                status={activePayment.status || "Pending"}
                                mode="payment"
                                className="scale-90 origin-left"
                            />
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">
                            {isRefundKind ? 'Refund Amount' : 'Net Payable'}
                        </p>
                        <p className={`text-[20px] font-black tracking-tighter tabular-nums leading-none ${isRefundKind ? 'text-rose-600' : 'text-slate-900'
                            }`}>
                            {formatPrice(activePayment.amount || 0)}
                        </p>
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <FileText className="h-3 w-3 text-slate-300" />
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ledger Entry Description</span>
                            <div className="h-px bg-slate-100 flex-1" />
                        </div>
                        <p className="text-[10px] font-bold text-slate-500 leading-relaxed italic">
                            {activePayment.description || 'N/A: Regular Service Settlement'}
                        </p>
                    </div>

                    {activePayment.evidenceUrl && (
                        <div className="space-y-2.5">
                            <div className="flex items-center justify-between">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Digital Evidence Binder</span>
                                <a
                                    href={activePayment.evidenceUrl}
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
                                    src={activePayment.evidenceUrl}
                                    alt="Payment Evidence"
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover/evidence:scale-110"
                                />
                                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover/evidence:opacity-100 transition-opacity" />

                                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-white/90 backdrop-blur-sm border border-slate-200 text-[8px] font-black uppercase tracking-widest text-slate-500 opacity-0 group-hover/evidence:opacity-100 transition-opacity">
                                    Encrypted Record
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});
FinancialOversightSection.displayName = 'FinancialOversightSection';
