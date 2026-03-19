import { CalendarDays, Check, Clock } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import { useWatch } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { timeSlots } from "../../../data";
import type { BookingFormValues } from "../schema";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface StepScheduleProps {
  form: UseFormReturn<BookingFormValues>;
}

export default function StepSchedule({ form }: StepScheduleProps) {
  const { setValue, trigger, formState: { errors }, control } = form;
  const scheduledDate = useWatch({ control, name: "scheduledDate" }) ?? "";
  const scheduledTime = useWatch({ control, name: "scheduledTime" }) ?? "";

  const selectedDateObject = scheduledDate ? new Date(scheduledDate) : undefined;

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const formatted = format(date, "yyyy-MM-dd"); // Consistent string storage formats
      setValue("scheduledDate", formatted, { shouldValidate: true });
    } else {
      setValue("scheduledDate", "", { shouldValidate: true });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#4988c4]/10 text-[#4988c4] border border-[#4988c4]/20 text-[10px] font-black uppercase tracking-widest">
          Step 03
        </div>
        <h3 className="text-3xl font-black text-slate-900 tracking-tight">Pick a Date & Time</h3>
        <p className="text-sm text-slate-500 font-medium tracking-wide">Schedule your appointment with us.</p>
      </div>

      <div className="space-y-6">
        {/* Date Selection triggering popover */}
        <div className="space-y-3">
          <Label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.1em] ml-1 flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-[#4988c4]" />
            Select Date <span className="text-rose-500 ml-0.5">*</span>
          </Label>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "h-14 w-full justify-start text-left font-bold rounded-2xl border-slate-200 bg-white hover:bg-slate-50 shadow-sm px-4 flex items-center gap-3 focus:ring-[#4988c4]/5 focus:border-[#4988c4] transition-all text-sm",
                  !scheduledDate && "text-slate-500 font-medium",
                  errors.scheduledDate && "border-rose-400 hover:border-rose-400 focus:ring-rose-300/20"
                )}
              >
                <div className="p-2 rounded-xl bg-[#4988c4]/10 text-[#4988c4]">
                  <CalendarDays className="h-4 w-4" />
                </div>
                <span>
                  {selectedDateObject ? format(selectedDateObject, "MMMM d, yyyy") : "Choose a Date"}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 rounded-3xl border-slate-100 shadow-2xl" align="start">
              <Calendar
                mode="single"
                selected={selectedDateObject}
                onSelect={handleDateSelect}
                disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          {errors.scheduledDate && (
            <p className="text-[10px] text-rose-500 font-black ml-1 uppercase tracking-wider">{errors.scheduledDate.message}</p>
          )}
        </div>

        {/* Time Slot Selection */}
        <div className="space-y-3 pt-2">
          <Label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.1em] ml-1 flex items-center gap-2">
            <Clock className="h-4 w-4 text-[#4988c4]" />
            Time Slot <span className="text-rose-500 ml-0.5">*</span>
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl">
            {timeSlots.map((ts) => {
              const isSelected = scheduledTime === ts;
              // Mock availability logic for presentation
              const isFull = selectedDateObject && ts === "10:00 - 12:00" && selectedDateObject.getDate() % 2 === 0;
              const isAlmostFull = selectedDateObject && ts === "16:00 - 18:00";

              return (
                <button
                  key={ts}
                  type="button"
                  disabled={isFull}
                  onClick={() => {
                    setValue("scheduledTime", ts, { shouldValidate: true });
                    trigger("scheduledTime");
                  }}
                  className={`relative py-5 px-3 rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center gap-1.5
                    ${isFull
                      ? "border-slate-100 bg-slate-50 opacity-40 cursor-not-allowed grayscale"
                      : isSelected
                        ? "border-[#4988c4] bg-[#4988c4] text-white shadow-xl shadow-[#4988c4]/20 scale-[1.03]"
                        : "border-slate-100 bg-white hover:border-[#4988c4]/40 hover:bg-[#4988c4]/5 shadow-sm shadow-slate-100/30"
                    }
                  `}
                >
                  {isSelected && (
                    <span className="absolute -top-1.5 -right-1.5 h-4 w-4 bg-[#4988c4] border-2 border-white rounded-full flex items-center justify-center shadow-md">
                      <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                    </span>
                  )}
                  <span className={`text-xs font-black uppercase tracking-widest ${isSelected ? "text-white" : "text-slate-600"}`}>
                    {ts}
                  </span>

                  {/* Availability indicator */}
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`h-1.5 w-1.5 rounded-full ${isFull ? "bg-rose-400" : isAlmostFull ? "bg-amber-400" : isSelected ? "bg-white/50" : "bg-emerald-400"}`} />
                    <span className={`text-[8px] font-bold uppercase tracking-widest ${isFull ? "text-rose-400" : isAlmostFull ? "text-amber-500" : isSelected ? "text-white/70" : "text-emerald-500"}`}>
                      {isFull ? "Full" : isAlmostFull ? "Few Left" : "Available"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
          {errors.scheduledTime && (
            <p className="text-[10px] text-rose-500 font-black ml-1 uppercase tracking-wider pt-2">{errors.scheduledTime.message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
