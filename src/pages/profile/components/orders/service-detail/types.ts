import type { ServiceOrderItem } from "@/api/types/serviceOrder";

export interface ServiceOrderDetailContentProps {
    serviceOrderId: string;
    orderCode?: string;
    open: boolean;
    setOpen: (o: boolean) => void;
}

export interface ConsolidatedManifestProps {
    items: ServiceOrderItem[];
}
