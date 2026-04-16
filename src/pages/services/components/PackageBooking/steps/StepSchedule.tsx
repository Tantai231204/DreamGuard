import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Clock, CalendarDays, CheckCircle2 } from "lucide-react";
import { useWatch, type UseFormReturn } from "react-hook-form";
import type { BookingFormValues } from "../schema";
import { timeSlots } from "../../../data";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { formatDate } from "@/lib/utils";

interface StepScheduleProps {
  form: UseFormReturn<BookingFormValues>;
}

export default function StepSchedule({ form }: StepScheduleProps) {
  const { setValue, trigger, control, formState: { errors } } = form;

  const scheduledDate = useWatch({ control, name: "scheduledDate" }) ?? "";
  const scheduledTime = useWatch({ control, name: "scheduledTime" }) ?? "";
  const selectedDateObject = scheduledDate ? new Date(scheduledDate) : undefined;

  const [isEditingDate, setIsEditingDate] = useState(false);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const formatted = format(date, "yyyy-MM-dd");
      setValue("scheduledDate", formatted, { shouldValidate: true });
      // Clear time slot if it's now invalid for the new date
      if (scheduledTime) {
        const isTodayTemp = formatted === format(new Date(), "yyyy-MM-dd");
        const slotHour = parseInt(scheduledTime.split(":")[0], 10);
        if (isTodayTemp && slotHour <= new Date().getHours()) {
          setValue("scheduledTime", "", { shouldValidate: false });
        }
      }
    } else {
      setValue("scheduledDate", "", { shouldValidate: true });
      setValue("scheduledTime", "", { shouldValidate: false });
    }
    setIsEditingDate(false);
  };

  const currentHour = new Date().getHours();
  const allSlotsPastToday = timeSlots.every(ts => parseInt(ts.split(":")[0], 10) <= currentHour);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#4988c4]/10 text-[#4988c4] border border-[#4988c4]/20 text-[10px] font-black uppercase tracking-widest">
          Step 04
        </div>
        <h3 className="text-3xl font-black text-slate-900 tracking-tight">Select Date & Time</h3>
        <p className="text-sm font-medium tracking-wide">
          {scheduledDate ? (
            <span className="text-[#4988c4] font-black">
              Selected: {formatDate(scheduledDate)} {scheduledTime && `at ${scheduledTime}`}
            </span>
          ) : (
            <span className="text-slate-500">Pick when you would fit expert staff scheduling.</span>
          )}
        </p>
      </div>

      {/* Info Banner for Reassurance */}
      <div className="rounded-2xl bg-[#4988c4]/5 border border-[#4988c4]/15 p-4 flex gap-3 items-start animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="h-9 w-9 rounded-xl bg-[#4988c4] flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#4988c4]/20">
          <Clock className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-black text-slate-800 leading-tight">Flexible Arrival Window</p>
          <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
            Our experts usually arrive within 15 minutes of your selected slot start time to begin inspection and coordinate entry.
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-100/80 rounded-3xl shadow-xl shadow-slate-100/20 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Top: Calendar Wrapper */}
        <div className="p-6 bg-slate-50/40 border-b border-slate-100/80">
          <AnimatePresence mode="wait">
            {!scheduledDate || isEditingDate ? (
              <motion.div
                key="picker"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="max-w-md mx-auto space-y-3"
              >
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.12em] flex items-center justify-center gap-2 mb-2">
                  <CalendarDays className="h-4 w-4 text-[#4988c4]" /> 1. Select a Date
                </Label>
                <div className="bg-white border border-slate-100 rounded-2xl p-3 shadow-sm flex justify-center">
                  <Calendar
                    mode="single"
                    selected={selectedDateObject}
                    onSelect={handleDateSelect}
                    disabled={(date) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const currentDate = new Date(date);
                      currentDate.setHours(0, 0, 0, 0);
                      if (currentDate.getTime() < today.getTime()) return true;
                      if (currentDate.getTime() === today.getTime() && allSlotsPastToday) return true;
                      return false;
                    }}
                    className="rounded-xl border-0 p-3 w-full max-w-[280px]"
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="summary"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="max-w-md mx-auto bg-white border border-[#4988c4]/30 border-dashed rounded-2xl p-5 flex items-center justify-between shadow-md shadow-[#4988c4]/5"
              >
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-[#4988c4]/10 flex items-center justify-center flex-shrink-0 animate-pulse">
                    <CalendarDays className="h-6 w-6 text-[#4988c4]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">Arrival Date</p>
                    <p className="text-base font-black text-slate-800 mt-0.5">{formatDate(scheduledDate)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingDate(true)}
                  className="text-xs font-black text-[#4988c4] bg-[#4988c4]/10 px-3 py-2 rounded-lg hover:bg-[#4988c4]/20 transition-all shadow-sm"
                >
                  Change
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          {errors.scheduledDate && <p className="text-center text-[10px] text-rose-500 font-bold uppercase mt-3">{errors.scheduledDate.message}</p>}
        </div>

        {/* Bottom: Available Slots Wrapper */}
        <div className="p-6 space-y-4">
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.12em] flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#4988c4]" /> 2. Pick an Arrival Time
              </Label>
              {scheduledTime && (
                <span className="text-[10px] font-black text-[#4988c4] bg-[#4988c4]/10 px-2 py-0.5 rounded-lg">
                  Selected: {scheduledTime}
                </span>
              )}
            </div>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.03 } },
                hidden: {}
              }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2"
            >
              {timeSlots.map((ts) => {
                const isSelected = scheduledTime === ts;
                const isToday = scheduledDate === format(new Date(), "yyyy-MM-dd");
                const slotHour = parseInt(ts.split(":")[0], 10);
                const isPast = isToday && slotHour <= currentHour;
                
                return (
                  <motion.button
                    key={ts}
                    type="button"
                    disabled={isPast || !scheduledDate}
                    variants={{
                      hidden: { opacity: 0, y: 8 },
                      visible: { opacity: 1, y: 0 }
                    }}
                    whileHover={(!isPast && scheduledDate) ? { scale: 1.02, y: -1 } : {}}
                    whileTap={(!isPast && scheduledDate) ? { scale: 0.98 } : {}}
                    onClick={() => { setValue("scheduledTime", ts, { shouldValidate: true }); trigger("scheduledTime"); }}
                    className={`relative py-3 px-3 rounded-xl border text-center transition-all duration-300
                      ${!scheduledDate 
                        ? "border-slate-100 bg-slate-50 text-slate-300 opacity-50 cursor-not-allowed"
                        : isPast 
                          ? "border-slate-100 bg-slate-50 text-slate-300 opacity-50 cursor-not-allowed" 
                          : isSelected
                            ? "border-[#4988c4] bg-[#4988c4]/[0.04] shadow-md shadow-[#4988c4]/5 text-[#4988c4] font-black"
                            : "border-slate-100 bg-white hover:border-[#4988c4]/40 hover:bg-[#4988c4]/5 text-slate-600 font-bold"
                      }
                    `}
                  >
                    <span className="text-xs uppercase tracking-wider">{ts}</span>
                  </motion.button>
                );
              })}
            </motion.div>
            {errors.scheduledTime && <p className="text-[10px] text-rose-500 font-bold uppercase mt-1">{errors.scheduledTime.message}</p>}
          </div>
        </div>

        {/* Footer Selection Review */}
        {(scheduledDate || scheduledTime) && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-t border-slate-100 bg-slate-50/30 px-6 py-4 flex items-center justify-between"
          >
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Selected Arrival</span>
            <div className="flex items-center gap-2">
              {scheduledDate && (
                <span className="text-xs font-black text-slate-700 bg-slate-100 px-2 py-1 rounded-lg">
                  {formatDate(scheduledDate)}
                </span>
              )}
              {scheduledTime && (
                <span className="text-xs font-black text-[#4988c4] bg-[#4988c4]/10 px-2.5 py-1 rounded-lg">
                  {scheduledTime}
                </span>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
