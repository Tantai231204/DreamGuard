import { Truck, ShieldCheck, User } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface ShipperInfoSectionProps {
    staffName?: string;
    shippingStatus?: string;
    avatarUrl?: string;
}

export function ShipperInfoSection({ staffName, shippingStatus, avatarUrl }: ShipperInfoSectionProps) {
    const isUnassigned = !staffName || staffName === "N/A" || staffName === "";

    if (isUnassigned) {
        return (
            <div className="mx-6 p-5 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center">
                        <User className="w-5 h-5 text-slate-300" />
                    </div>
                    <div>
                        <p className="text-[13px] font-bold text-slate-500 uppercase tracking-tight">Shipping Personnel</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Awaiting Assignment</p>
                    </div>
                </div>
                <div className="px-3 py-1 rounded-full bg-white border border-slate-100 text-[9px] font-black text-slate-300 uppercase tracking-widest">
                    Processing
                </div>
            </div>
        );
    }

    const isShipping = shippingStatus === "Shipping" || shippingStatus === "In Transit";
    const isDelivered = shippingStatus === "Delivered" || shippingStatus === "Completed";

    return (
        <div className="mx-6 p-5 bg-white rounded-xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-500">
                    <Truck className="w-4 h-4 opacity-70" />
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] opacity-80">Shipping Assigned</span>
                </div>

                {/* Status Badge with Icon (Screenshot Style) */}
                <div className={cn(
                    "flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border shadow-sm transition-all duration-300",
                    isDelivered ? "bg-primary-50/50 border-primary-100 text-primary-500" :
                        isShipping ? "bg-blue-50 border-blue-100 text-blue-600 animate-pulse" :
                            "bg-slate-50 border-slate-100 text-slate-400"
                )}>
                    <div className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center shadow-sm",
                        isDelivered ? "bg-primary-400" : isShipping ? "bg-blue-500" : "bg-slate-300"
                    )}>
                        {isDelivered ? <ShieldCheck className="w-3 h-3 text-white" /> :
                            isShipping ? <Truck className="w-3 h-3 text-white" /> :
                                <User className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">
                        {shippingStatus}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-4 bg-slate-50/40 p-4 rounded-xl border border-slate-100/50 group hover:border-[#4988c4]/20 transition-all duration-500">
                <Avatar className="h-14 w-14 border-2 border-white shadow-md ring-1 ring-slate-100 shrink-0">
                    <AvatarImage src={avatarUrl} alt={staffName} className="object-cover" />
                    <AvatarFallback className="bg-slate-100 text-slate-400 font-black text-lg">
                        {staffName?.charAt(0) || <User className="w-6 h-6" />}
                    </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-[15px] font-black text-slate-900 truncate tracking-tight">{staffName}</p>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                    </div>

                    <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2 text-slate-400">
                            <span className="text-[11px] font-bold uppercase tracking-tight">Professional Courier</span>
                        </div>
                        {isShipping && (
                            <p className="text-[10px] font-bold text-[#4988c4] uppercase tracking-widest animate-pulse">Out for Delivery</p>
                        )}
                    </div>
                </div>

                <div className={cn(
                    "h-10 w-10 flex items-center justify-center rounded-full border transition-all duration-500 shadow-sm",
                    isDelivered ? "bg-white border-primary-100 text-primary-300" : "bg-white border-slate-200 text-slate-200"
                )}>
                    <ShieldCheck className={cn("w-5 h-5", isDelivered && "text-primary-400")} />
                </div>
            </div>
        </div>
    );
}
