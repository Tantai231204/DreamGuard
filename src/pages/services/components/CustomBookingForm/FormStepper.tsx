import { Check } from "lucide-react";
import type { FormStepperProps } from "./types";

export default function FormStepper({ steps, currentStep }: FormStepperProps) {
    return (
        <div className="flex items-center justify-between mb-10">
            {steps.map((step, i) => {
                const Icon = step.icon;
                const done = i < currentStep;
                const active = i === currentStep;

                return (
                    <div key={step.label} className="flex-1 flex flex-col items-center relative">
                        {i > 0 && (
                            <div
                                className={`absolute top-5 -left-1/2 w-full h-0.5 ${
                                    done ? "bg-[var(--color-primary)]" : "bg-gray-200"
                                }`}
                            />
                        )}
                        <div
                            className={`relative z-10 flex items-center justify-center h-10 w-10 rounded-full border-2 text-sm font-bold transition-all ${
                                done
                                    ? "bg-[var(--color-primary)] border-[var(--color-primary)] text-white"
                                    : active
                                        ? "border-[var(--color-primary)] text-[var(--color-primary)] bg-white"
                                        : "border-gray-200 text-gray-400 bg-white"
                            }`}
                        >
                            {done ? <Check className="h-5 w-5" /> : <Icon className="h-4 w-4" />}
                        </div>
                        <span
                            className={`mt-2 text-xs font-medium ${
                                done || active ? "text-[var(--color-primary)]" : "text-gray-400"
                            }`}
                        >
                            {step.label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}
