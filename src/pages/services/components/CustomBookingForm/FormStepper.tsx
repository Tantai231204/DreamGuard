import { Check } from "lucide-react";
import type { FormStepperProps } from "./types";

export default function FormStepper({ steps, currentStep }: FormStepperProps) {
    return (
        <div className="flex items-center justify-between mb-16 px-4 md:px-8 relative">
            {steps.map((step, i) => {
                const done = i < currentStep;
                const active = i === currentStep;

                return (
                    <div key={step.label} className="flex-1 flex items-center relative gap-3">
                        {i > 0 && (
                            <div
                                className={`absolute top-1/2 -translate-y-1/2 -left-3 w-[calc(100%-1.5rem)] h-[1.5px] ${
                                    done ? "bg-[#4988c4]" : "bg-slate-100"
                                } -z-0`}
                            />
                        )}
                        <div className="flex items-center gap-3 relative z-10 bg-white pr-2">
                            <div
                                className={`relative z-10 flex items-center justify-center h-8 w-8 rounded-full border-2 text-[10px] font-black tracking-widest transition-all duration-300 ${
                                    done
                                        ? "bg-[#4988c4] border-[#4988c4] text-white shadow-lg shadow-[#4988c4]/20"
                                        : active
                                            ? "border-[#4988c4] text-[#4988c4] bg-white shadow-md shadow-[#4988c4]/10"
                                            : "border-slate-100 text-slate-300 bg-white"
                                }`}
                            >
                                {done ? <Check className="h-3.5 w-3.5" /> : <span>0{i + 1}</span>}
                            </div>
                            <span
                                className={`text-[9px] font-black uppercase tracking-[0.15em] hidden md:block ${
                                    done || active ? "text-slate-900" : "text-slate-300"
                                }`}
                            >
                                {step.label}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
