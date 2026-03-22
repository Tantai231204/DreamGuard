import { MapPin } from "lucide-react"
import type { OrderDetailResponse } from "@/api/types/order"

interface AddressSectionProps {
  order: OrderDetailResponse
}

export function AddressSection({ order }: AddressSectionProps) {
    return (
        <div className="bg-white p-6 border-b border-gray-100 text-left">
            <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-[#4988c4]" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">Delivery Address</h3>
                    <div className="space-y-1">
                        <p className="text-[16px] font-bold text-gray-900 tracking-tight">{order.receiverName}</p>
                        <p className="text-[14px] font-medium text-gray-500">{order.phoneNumber}</p>
                        <p className="text-[14px] font-medium text-gray-600 leading-relaxed max-w-lg mt-1">
                            {order.street}, {order.ward}, {order.district}, {order.city}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
