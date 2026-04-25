import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { ServiceOrderDetailContent } from './service-detail/ServiceOrderDetailContent';

interface ServiceOrderDetailDialogProps {
    serviceOrderId: string;
    orderCode?: string;
    trigger: React.ReactNode;
}

export function ServiceOrderDetailDialog({ serviceOrderId, orderCode, trigger }: ServiceOrderDetailDialogProps) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[92vh] overflow-hidden flex flex-col p-0 rounded-xl border-none shadow-2xl bg-gray-50 [&>button:last-child]:top-6 [&>button:last-child]:right-6">
                <ServiceOrderDetailContent
                    key={serviceOrderId}
                    serviceOrderId={serviceOrderId}
                    orderCode={orderCode}
                    open={open}
                    setOpen={setOpen}
                />
            </DialogContent>
        </Dialog>
    );
}
