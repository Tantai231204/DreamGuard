import React from "react"
import { Package, Clock, Truck, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface OrderStepFlowProps {
  step: number
  color: string
  isCancelled?: boolean
}

export function OrderStepFlow({ step, color, isCancelled = false }: OrderStepFlowProps) {
    const steps = [
        { s: 0, label: "Ordered", icon: <Clock className="w-5 h-5" /> },
        { s: 2, label: "Packed", icon: <Package className="w-5 h-5" /> },
        { s: 3, label: "Transit", icon: <Truck className="w-5 h-5" /> },
        { s: 5, label: "Arrived", icon: <CheckCircle2 className="w-5 h-5" /> }
    ];

    // If cancelled, the whole visual becomes red/grayed out
    const activeColor = isCancelled ? "#ef4444" : color;

    return (
        <div className="bg-white p-8 border-b border-gray-100">
            <div className="flex items-center justify-between relative max-w-xl mx-auto px-6">
                {steps.map((s, idx, arr) => {
                    const isActive = step >= s.s;
                    return (
                        <React.Fragment key={s.label}>
                            <div className="flex flex-col items-center gap-2 relative z-10 transition-all">
                                <div className={cn(
                                    "w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all duration-500",
                                    isActive ? "bg-white shadow-sm" : "bg-white border-gray-100 text-gray-300"
                                )}
                                style={{ 
                                    borderColor: isActive ? activeColor : undefined,
                                    color: isActive ? activeColor : undefined 
                                }}>
                                    {s.icon}
                                </div>
                                <span className={cn(
                                    "text-[10px] font-bold uppercase tracking-wider",
                                    isActive ? "text-gray-900" : "text-gray-400"
                                )}>{s.label}</span>
                            </div>
                            {idx < arr.length - 1 && (
                                <div className="flex-1 h-[2px] bg-gray-100 mt-[-28px] mx-[-15px] relative">
                                    <div 
                                        className="absolute inset-0 transition-all duration-1000 ease-out" 
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
        </div>
    );
}
