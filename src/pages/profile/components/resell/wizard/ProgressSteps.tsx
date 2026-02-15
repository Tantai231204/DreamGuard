import { Check } from "lucide-react"
import { WIZARD_STEPS } from "../constants"

interface ProgressStepsProps {
    currentStep: number
}

export default function ProgressSteps({ currentStep }: ProgressStepsProps) {
    return (
        <div className="bg-gray-50 border-b px-6 py-4">
            <div className="flex items-center justify-between max-w-md mx-auto">
                {WIZARD_STEPS.map((item, idx) => (
                    <div key={item.step} className="flex items-center">
                        <div className="flex flex-col items-center">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                                    currentStep >= item.step
                                        ? "bg-[#4988c4] text-white"
                                        : "bg-gray-200 text-gray-500"
                                }`}
                            >
                                {currentStep > item.step ? <Check className="h-4 w-4" /> : item.step}
                            </div>
                            <span className={`text-xs mt-1 ${currentStep >= item.step ? "text-[#4988c4] font-medium" : "text-gray-500"}`}>
                                {item.label}
                            </span>
                        </div>
                        {idx < WIZARD_STEPS.length - 1 && (
                            <div className={`w-16 h-0.5 mx-2 mb-5 ${currentStep > item.step ? "bg-[#4988c4]" : "bg-gray-200"}`} />
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
