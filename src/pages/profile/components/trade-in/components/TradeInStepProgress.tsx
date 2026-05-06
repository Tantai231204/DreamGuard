import React from "react";
import { cn } from "@/lib/utils";
import { 
    Box, 
    Truck, 
    ShieldCheck, 
    ArrowLeftRight, 
    XCircle,
    FileText
} from "lucide-react";
import { getTradeInStatusTheme } from "../../../constants";

interface TradeInStepProgressProps {
    status: string;
}

export const TradeInStepProgress = ({ status }: TradeInStepProgressProps) => {
    const stepTheme = getTradeInStatusTheme(status);
    const apiStep = stepTheme?.step ?? 0;
    const normalizedStatus = status.toString().toUpperCase();
    const isCancelled = normalizedStatus.includes("CANCEL");
    const isCompleted = normalizedStatus === "COMPLETED" || apiStep >= 9;

    // Map API steps to our 5-step UI (0 to 4)
    let currentStepIdx = 0;
    if (isCompleted) {
        currentStepIdx = 4;
    } else if (apiStep >= 8 || apiStep >= 11) { // Returning or Replacement
        currentStepIdx = 3;
    } else if (apiStep >= 2) { // Processing/Delivering
        currentStepIdx = 2;
    } else if (apiStep === 1) { // Negotiating/Confirmed
        currentStepIdx = 1;
    } else {
        currentStepIdx = 0;
    }

    const steps = [
        { label: 'Pending', icon: Box },
        { label: 'Negotiating', icon: FileText },
        { label: 'Logistic', icon: Truck },
        { label: 'Analyze', icon: ShieldCheck },
        { label: 'Settle', icon: ArrowLeftRight }
    ];

    return (
        <div className="bg-white px-6 py-12 border-b border-gray-100/80">
            <div className="flex items-center relative max-w-2xl mx-auto px-4">
                {steps.map((step, idx, arr) => {
                    const isActive = !isCancelled && (idx <= currentStepIdx || isCompleted);
                    const isCurrent = !isCancelled && idx === currentStepIdx && !isCompleted;
                    const isFailed = isCancelled && idx <= currentStepIdx;
                    const activeColor = isFailed ? "#e11d48" : (stepTheme?.color || "#4988c4");

                    return (
                        <React.Fragment key={idx}>
                            <div className="flex flex-col items-center relative z-10 transition-all">
                                <div 
                                    className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-700 bg-white shadow-sm",
                                        isActive || isFailed ? "" : "border-gray-100 text-gray-200"
                                    )}
                                    style={{ 
                                        borderColor: (isActive || isFailed) ? activeColor : undefined,
                                        color: (isActive || isFailed) ? activeColor : undefined,
                                        boxShadow: isCurrent ? `0 0 0 4px ${activeColor}20` : undefined,
                                        willChange: "transform, border-color"
                                    }}
                                >
                                    {isFailed && idx === currentStepIdx ? (
                                        <XCircle className="w-6 h-6 animate-pulse" />
                                    ) : (
                                        <step.icon className={cn("w-5 h-5", isCurrent && "animate-pulse")} />
                                    )}

                                    {/* Label */}
                                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-center">
                                        <span className={cn(
                                            "text-[10px] font-bold uppercase tracking-wider",
                                            isFailed ? "text-rose-600" :
                                            isActive ? "text-gray-900" :
                                            "text-gray-400"
                                        )}>
                                            {isFailed && idx === currentStepIdx ? "Terminated" : step.label}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Progress Line */}
                            {idx < arr.length - 1 && (
                                <div className="flex-1 h-[2px] bg-gray-100 mx-1 relative">
                                    <div 
                                        className="absolute inset-y-0 left-0 transition-all duration-1000 ease-out" 
                                        style={{ 
                                            width: (currentStepIdx > idx) || isCompleted ? "100%" : "0%",
                                            backgroundColor: activeColor
                                        }} 
                                    />
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
            <div className="h-4" />
        </div>
    );
};
