import { memo } from "react";
import { CheckCircle2, Navigation2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Address } from "@/api/types/address";

interface AddressCardListProps {
    addresses: Address[];
    selectedId: string | null;
    onSelectAddress: (addr: Address) => void;
    onAddCustomAddress: () => void;
}

function AddressCardListInner({
    addresses,
    selectedId,
    onSelectAddress,
    onAddCustomAddress,
}: AddressCardListProps) {
    return (
        <>
            {addresses.map((addr) => (
                <button
                    key={addr.addressId}
                    type="button"
                    onClick={() => onSelectAddress(addr)}
                    className={cn(
                        "flex flex-col text-left p-6 rounded-[1.5rem] border-2 transition-all duration-500 relative overflow-hidden group/card",
                        selectedId === addr.addressId
                            ? "border-primary-500 bg-primary-500 text-white shadow-2xl shadow-primary-500/30"
                            : "border-slate-100 bg-slate-50/30 hover:border-primary-500/40 hover:bg-white text-slate-900"
                    )}
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className={cn(
                            "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.2em]",
                            selectedId === addr.addressId ? "bg-white/10 text-white" : "bg-white text-primary-500 shadow-sm border border-slate-100"
                        )}>
                            {addr.isDefault ? "Primary Shipping" : "Home Address"}
                        </div>
                        {selectedId === addr.addressId && (
                            <div className="bg-white rounded-full p-1.5 shadow-lg shadow-black/5">
                                <CheckCircle2 className="w-5 h-5 text-primary-500" />
                            </div>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <h4 className="font-black text-xl tracking-tight leading-none">{addr.receiverName}</h4>
                        <p className={cn(
                            "text-sm font-bold opacity-70",
                            selectedId === addr.addressId ? "text-white" : "text-primary-500"
                        )}>
                            {addr.phoneNumber}
                        </p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/10 space-y-1">
                        <p className={cn(
                            "text-xs leading-relaxed font-bold uppercase tracking-[0.1em]",
                            selectedId === addr.addressId ? "text-white/60" : "text-slate-400"
                        )}>
                            {addr.street}
                        </p>
                        <p className={cn(
                            "text-xs leading-relaxed font-bold uppercase tracking-[0.1em]",
                            selectedId === addr.addressId ? "text-white/40" : "text-slate-300"
                        )}>
                            {addr.ward}, {addr.district} <br />
                            {addr.province}
                        </p>
                    </div>

                    {selectedId === addr.addressId && (
                        <div className="absolute -bottom-4 -right-4 opacity-5 group-hover/card:scale-110 transition-transform duration-700">
                            <Navigation2 className="w-32 h-32 rotate-45" />
                        </div>
                    )}
                </button>
            ))}

            <button
                type="button"
                onClick={onAddCustomAddress}
                className="flex flex-col items-center justify-center p-6 rounded-[1.5rem] border-2 border-dashed border-slate-200 bg-slate-50/20 hover:bg-white hover:border-primary-500 hover:text-primary-500 transition-all duration-500 text-slate-400 gap-3 group"
            >
                <div className="p-4 rounded-xl bg-slate-100 group-hover:bg-primary-500 group-hover:text-white transition-all duration-500 shadow-sm">
                    <Plus className="w-5 h-5" />
                </div>
                <div className="text-center">
                    <span className="block text-[10px] font-black uppercase tracking-[0.2em]">Add Custom</span>
                    <span className="block text-xs font-bold mt-1 opacity-60">New delivery location</span>
                </div>
            </button>
        </>
    );
}

export const AddressCardList = memo(AddressCardListInner);
AddressCardList.displayName = "AddressCardList";
