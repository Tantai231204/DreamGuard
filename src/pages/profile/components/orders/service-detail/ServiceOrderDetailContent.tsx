import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShieldCheck, ChevronRight } from 'lucide-react';
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useServiceOrderDetailLogic } from './useServiceOrderDetailLogic';
import type { ServiceOrderDetailContentProps } from './types';

// Components
import { LoadingView, AccessRestrictedView } from './components/UtilityViews';
import { AppointmentSection } from './components/AppointmentSection';
import { ServiceSummarySection } from './components/ServiceSummarySection';
import { ConsolidatedManifest } from './components/ConsolidatedManifest';
import { ExecutionStaffSection } from './components/ExecutionStaffSection';
import { PaymentDetailsCard } from '../components/PaymentDetailsCard';
import { InteractionModule } from './components/InteractionModule';

export function ServiceOrderDetailContent({
    serviceOrderId,
    orderCode,
    open,
    setOpen
}: ServiceOrderDetailContentProps) {
    const {
        data,
        isPending,
        canView,
        theme,
        detailItems,
        taskStatus,
        hasAssignedStaff,
        ratedStaffName,
        assignedStaffPhone,
        displayAverage,
        resolvedRating,
        handleRetryPayment,
        handleCancelService,
        handleConfirmCancel,
        handleSubmitRating,
        canRetryPayment,
        canCancelService,
        confirmOpen,
        setConfirmOpen,
        isCancelling,
        score,
        setDraftScore,
        comment,
        setDraftComment,
        isSubmitting,
        isAlreadyRated,
        isCompletedOrder,
        reOrderFailedServiceMutation
    } = useServiceOrderDetailLogic(serviceOrderId, open, setOpen);

    return (
        <>
            {/* Header */}
            <div className="bg-white border-b border-gray-100 pl-6 pr-12 py-4 flex items-center justify-between shrink-0 relative">
                <DialogHeader className="flex flex-row items-center gap-4 space-y-0">
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-gray-100" onClick={() => setOpen(false)}>
                        <ChevronRight className="w-5 h-5 rotate-180 text-gray-500" />
                    </Button>
                    <div className="text-left w-full">
                        <DialogTitle className="text-[16px] font-black text-gray-900 uppercase tracking-tight">
                            Service Journey
                        </DialogTitle>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">
                            Order ID: {orderCode || data?.orderCode || serviceOrderId.slice(0, 8)}
                        </p>
                    </div>
                </DialogHeader>
                <div
                    className="px-4 py-1.5 rounded-full text-[11px] font-bold text-white uppercase tracking-widest shadow-sm"
                    style={{ backgroundColor: theme.color }}
                >
                    {theme.label}
                </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto no-scrollbar bg-gray-50">
                {isPending ? (
                    <LoadingView />
                ) : !canView ? (
                    <AccessRestrictedView />
                ) : (
                    <div className="space-y-3">
                        <ServiceSummarySection 
                            createdAt={data?.createdAt} 
                            totalPrice={data?.totalPrice} 
                        />
                        
                        <AppointmentSection 
                            appointmentDate={data?.appointmentDate}
                            receiverName={data?.receiverName}
                            address={data?.address}
                        />

                        <ConsolidatedManifest items={detailItems} />

                        <ExecutionStaffSection 
                            hasAssignedStaff={hasAssignedStaff}
                            taskStatus={taskStatus}
                            ratedStaffName={ratedStaffName}
                            assignedStaffPhone={assignedStaffPhone}
                            displayAverage={displayAverage}
                            resolvedRating={resolvedRating}
                        />

                        <PaymentDetailsCard
                            orderCode={orderCode}
                            fallbackPayment={{
                                id: orderCode,
                                orderCode: orderCode,
                                paymentMethod: data?.paymentMethod || 'COD',
                                paymentType: "Service",
                                status: data?.paymentStatus || 'Pending',
                                amount: data?.totalPrice || 0,
                                description: data?.paymentDescription,
                                evidenceUrl: data?.paymentEvidenceUrl,
                                createdAt: data?.createdAt,
                            }}
                            className="mx-6 my-2"
                        />

                        {isCompletedOrder && (
                            <InteractionModule 
                                score={score}
                                comment={comment}
                                isSubmitting={isSubmitting}
                                isAlreadyRated={isAlreadyRated}
                                setDraftScore={setDraftScore}
                                setDraftComment={setDraftComment}
                                onSubmit={handleSubmitRating}
                            />
                        )}
                    </div>
                )}
            </div>

            {/* Sticky Action Footer */}
            <div className="px-10 py-6 border-t border-gray-100 bg-white flex items-center justify-between gap-8 shrink-0 relative z-20">
                <div className="flex flex-col gap-0.5">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-tight leading-none">Concierge Support</p>
                    <button
                        onClick={() => window.alert("Initiating secure channel to support...")}
                        className="text-[10px] font-black text-[#4988c4] uppercase tracking-widest hover:underline flex items-center gap-1.5"
                    >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Priority Chat
                    </button>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    {canRetryPayment && (
                        <Button
                            onClick={handleRetryPayment}
                            disabled={reOrderFailedServiceMutation.isPending}
                            className="h-11 px-10 rounded text-[11px] font-black uppercase tracking-widest bg-[#4988c4] hover:bg-[#3b6fa3] text-white shadow-md shadow-blue-500/10 border-0 transition-all active:scale-95 disabled:opacity-70"
                        >
                            {reOrderFailedServiceMutation.isPending ? 'Redirecting...' : 'Retry Payment'}
                        </Button>
                    )}
                    {canCancelService && !isPending && (
                        <Button
                            variant="ghost"
                            onClick={handleCancelService}
                            disabled={isCancelling}
                            className="h-11 px-6 text-[11px] font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-50 uppercase tracking-widest transition-all border-0"
                        >
                            {isCancelling ? "Processing..." : "Cancel Service"}
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        onClick={() => setOpen(false)}
                        className="h-11 px-10 rounded text-[11px] font-black text-[#4988c4] border border-[#4988c4] hover:bg-[#4988c4] hover:text-white uppercase tracking-widest transition-all active:scale-95 shadow-sm"
                    >
                        Close
                    </Button>
                </div>
            </div>
            
            <ConfirmDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                title="Cancel Service Order"
                description={`Are you sure you want to cancel service order #${orderCode || serviceOrderId.slice(0, 8)}? This action cannot be undone.`}
                confirmText="Yes, Cancel Service"
                cancelText="No, Keep It"
                onConfirm={handleConfirmCancel}
                variant="danger"
                isLoading={isCancelling}
            />
        </>
    );
}
