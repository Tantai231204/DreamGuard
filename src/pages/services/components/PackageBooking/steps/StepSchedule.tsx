import { CalendarDays, Check, Clock } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import { useWatch } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { timeSlots } from "../../../data";
import type { BookingFormValues } from "../schema";

interface StepScheduleProps {
  form: UseFormReturn<BookingFormValues>;
}

export default function StepSchedule({ form }: StepScheduleProps) {
  const { setValue, trigger, formState: { errors }, control } = form;
  const scheduledDate = useWatch({ control, name: "scheduledDate" }) ?? "";
  const scheduledTime = useWatch({ control, name: "scheduledTime" }) ?? "";

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900">Pick a Date & Time</h3>

      <div className="space-y-1.5">
        <Label className="flex items-center gap-1.5 text-gray-700">
          <CalendarDays className="h-4 w-4" />
          Date <span className="text-red-500 ml-0.5">*</span>
        </Label>
        <Input
          type="date"
          value={scheduledDate}
          onChange={(e) => setValue("scheduledDate", e.target.value, { shouldValidate: true })}
          min={new Date().toISOString().split("T")[0]}
          className={errors.scheduledDate ? "border-red-400 focus:border-red-400 focus:ring-red-300/20" : ""}
        />
        {errors.scheduledDate && (
          <p className="text-xs text-red-500 mt-1">{errors.scheduledDate.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label className="flex items-center gap-1.5 text-gray-700">
          <Clock className="h-4 w-4" />
          Time Slot <span className="text-red-500 ml-0.5">*</span>
        </Label>
        <div className="grid grid-cols-3 gap-2">
          {timeSlots.map((ts) => {
            const isSelected = scheduledTime === ts;
            return (
              <button
                key={ts}
                type="button"
                onClick={() => {
                  setValue("scheduledTime", ts, { shouldValidate: true });
                  trigger("scheduledTime");
                }}
                className={`relative py-3 rounded-xl border-2 text-sm font-semibold transition-all duration-150
                  ${isSelected
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white shadow-md shadow-blue-200 ring-2 ring-blue-100"
                    : "border-gray-200 text-gray-600 bg-white hover:border-blue-300 hover:text-[var(--color-primary)] hover:bg-blue-50/40"
                  }
                `}
              >
                {isSelected && (
                  <span className="absolute -top-1.5 -right-1.5 h-4 w-4 bg-[var(--color-primary)] border-2 border-white rounded-full flex items-center justify-center">
                    <Check className="h-2.5 w-2.5 text-white" />
                  </span>
                )}
                {ts}
              </button>
            );
          })}
        </div>
        {errors.scheduledTime && (
          <p className="text-xs text-red-500 mt-1">{errors.scheduledTime.message}</p>
        )}
      </div>
    </div>
  );
}
