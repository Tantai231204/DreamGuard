import { memo } from "react";
import { CheckCircle2, Navigation2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Address } from "@/api/types/address";

interface AddressCardListProps {
    addresses: Address[];
    selectedId: string | null;
    onSelectAddress: (addr: Address) => void;
    onAddCustomAddress: () => void;
    variant?: "checkout" | "tradein";
}

function AddressCardListInner({
    addresses,
    selectedId,
    onSelectAddress,
    onAddCustomAddress,
    variant = "checkout",
}: AddressCardListProps) {
    const isTradeIn = variant === "tradein";

    return (
        <>
            {addresses.map((addr) => (
                <button
                    key={addr.addressId}
                    type="button"
                    onClick={() => onSelectAddress(addr)}
                    className={cn(
                        "flex flex-col text-left transition-all duration-500 relative overflow-hidden group/card",
                        isTradeIn ? "p-4 rounded-[1.25rem] border" : "p-6 rounded-[1.5rem] border-2",
                        selectedId === addr.addressId
                            ? isTradeIn
                                ? "border-[#3D5140] bg-[#3D5140] text-white shadow-lg shadow-[#3D5140]/20"
                                : "border-primary-500 bg-primary-500 text-white shadow-2xl shadow-primary-500/30"
                            : isTradeIn
                                ? "border-slate-200 bg-white hover:border-[#3D5140]/40 hover:bg-[#FDFCFA] text-slate-900"
                                : "border-slate-100 bg-slate-50/30 hover:border-primary-500/40 hover:bg-white text-slate-900"
                    )}
                >
                    <div className={cn("flex items-center justify-between", isTradeIn ? "mb-2" : "mb-4")}>
                        <div className={cn(
                            "px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-[0.2em]",
                            selectedId === addr.addressId 
                                ? "bg-white/10 text-white" 
                                : isTradeIn
                                    ? "bg-[#3D5140]/5 text-[#3D5140] border border-[#3D5140]/10"
                                    : "bg-white text-primary-500 shadow-sm border border-slate-100"
                        )}>
                            {addr.isDefault ? "Primary" : "Home"}
                        </div>
                        {selectedId === addr.addressId && (
                            <div className={cn("bg-white rounded-full p-1 shadow-lg shadow-black/5", isTradeIn ? "scale-75" : "")}>
                                <CheckCircle2 className={cn(isTradeIn ? "w-4 h-4 text-[#3D5140]" : "w-5 h-5 text-primary-500")} />
                            </div>
                        )}
                    </div>

                    <div className={cn("space-y-1", isTradeIn ? "" : "space-y-1.5")}>
                        <h4 className={cn("font-black tracking-tight leading-none", isTradeIn ? "text-sm" : "text-xl")}>{addr.receiverName}</h4>
                        <p className={cn(
                            "font-bold opacity-70",
                            isTradeIn ? "text-[10px]" : "text-sm",
                            selectedId === addr.addressId 
                                ? "text-white" 
                                : isTradeIn 
                                    ? "text-[#3D5140]" 
                                    : "text-primary-500"
                        )}>
                            {addr.phoneNumber}
                        </p>
                    </div>

                    <div className={cn("pt-3 border-t border-white/10 space-y-0.5", isTradeIn ? "mt-3" : "mt-4")}>
                        <p className={cn(
                            "leading-relaxed font-bold uppercase tracking-[0.05em]",
                            isTradeIn ? "text-[9px]" : "text-xs",
                            selectedId === addr.addressId ? "text-white/70" : "text-slate-500"
                        )}>
                            {addr.street}
                        </p>
                        <p className={cn(
                            "leading-relaxed font-bold uppercase tracking-[0.05em]",
                            isTradeIn ? "text-[8px]" : "text-xs",
                            selectedId === addr.addressId ? "text-white/50" : "text-slate-400"
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
                className={cn(
                    "flex flex-col items-center justify-center transition-all duration-500 text-slate-400 gap-2 group",
                    isTradeIn ? "p-4 rounded-[1.25rem] border border-dashed border-slate-200 hover:border-[#3D5140] hover:text-[#3D5140]" : "p-6 rounded-[1.5rem] border-2 border-dashed border-slate-200 bg-slate-50/20 hover:bg-white hover:border-primary-500 hover:text-primary-500"
                )}
            >
                <div className={cn(
                    "transition-all duration-500 shadow-sm",
                    isTradeIn ? "p-3 rounded-lg bg-slate-50 group-hover:bg-[#3D5140] group-hover:text-white" : "p-4 rounded-xl bg-slate-100 group-hover:bg-primary-500 group-hover:text-white"
                )}>
                    <Plus className={cn(isTradeIn ? "w-4 h-4" : "w-5 h-5")} />
                </div>
                <div className="text-center">
                    <span className={cn("block font-black uppercase tracking-[0.2em]", isTradeIn ? "text-[8px]" : "text-[10px]")}>Add Custom</span>
                    {!isTradeIn && <span className="block text-xs font-bold mt-1 opacity-60">New delivery location</span>}
                </div>
            </button>
        </>
    );
}

export const AddressCardList = memo(AddressCardListInner);
AddressCardList.displayName = "AddressCardList";
