import React from "react"
import { Package, Clock, Truck, CheckCircle2, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface OrderStepFlowProps {
    step: number
    color: string
    isCancelled?: boolean
}

export function OrderStepFlow({ step, color, isCancelled = false }: OrderStepFlowProps) {
    const steps = [
        { s: 0, label: "Ordered", icon: <Clock className="w-5 h-5" /> },
        { s: 1, label: "Confirmed", icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" /> },
        { s: 2, label: "Packed", icon: <Package className="w-5 h-5" /> },
        { s: 3, label: "Transit", icon: <Truck className="w-5 h-5" /> },
        { s: 5, label: "Arrived", icon: <CheckCircle2 className="w-5 h-5" /> }
    ];

    // If cancelled, the whole visual becomes red/grayed out
    const activeColor = isCancelled ? "#ef4444" : color;

    return (
        <div className="bg-white p-8 border-b border-gray-100">
            <div className="flex items-center relative max-w-xl mx-auto px-6">
                {steps.map((s, idx, arr) => {
                    const isActive = step >= s.s;
                    const isCurrent = step === s.s && !isCancelled;

                    return (
                        <React.Fragment key={s.label}>
                            <div className="flex flex-col items-center gap-3 relative z-10 transition-all">
                                <div className={cn(
                                    "w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all duration-700 bg-white",
                                    isActive ? "shadow-sm" : "bg-white border-gray-100 text-gray-200"
                                )}
                                    style={{
                                        borderColor: isActive ? activeColor : undefined,
                                        color: isActive ? activeColor : undefined,
                                        boxShadow: isCurrent ? `0 0 0 4px ${activeColor}20` : undefined
                                    }}>
                                    {isCancelled && isActive && step <= s.s ? (
                                        <XCircle className="w-6 h-6 animate-pulse" />
                                    ) : (
                                        <div className={cn("transition-transform duration-500", isCurrent && "scale-110")}>
                                            {s.icon}
                                        </div>
                                    )}

                                    {/* Label below - absolutely positioned to not affect line layout */}
                                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-center">
                                        <span className={cn(
                                            "text-[10px] font-bold uppercase tracking-wider",
                                            isCancelled && isActive && step <= s.s ? "text-rose-600" :
                                                isActive ? "text-gray-900" : "text-gray-400"
                                        )}>
                                            {isCancelled && isActive && step <= s.s ? "Terminated" : s.label}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {idx < arr.length - 1 && (
                                <div className="flex-1 h-[2px] bg-gray-100 mx-2 relative">
                                    <div
                                        className="absolute inset-y-0 left-0 transition-all duration-1000 ease-out"
                                        style={{
                                            width: step > s.s ? "100%" : "0%",
                                            backgroundColor: activeColor
                                        }}
                                    />
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
            <div className="h-4" /> {/* Spacer for labels */}
        </div>
    );
}
