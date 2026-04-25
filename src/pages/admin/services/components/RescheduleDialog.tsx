import { useMemo, memo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar as CalendarIcon, 
  UserPlus, 
  Loader2, 
  History,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { useServiceActions } from '../hooks/useServiceActions';
import { useStaffs } from '@/hooks/queries/useStaff';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { Staff } from '../types';

const TIME_SLOTS = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
];

interface RescheduleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string | null;
  currentDate?: string;
  currentStaffId?: string;
}

const rescheduleSchema = z.object({
  date: z.date({ required_error: 'Please pick a new date' }),
  timeStr: z.string().min(1, 'Please select a valid time slot'),
  staffId: z.string().min(1, 'Please choose specialized staff')
});

type RescheduleFormValues = z.infer<typeof rescheduleSchema>;

export const RescheduleDialog = memo(function RescheduleDialog({ isOpen, onClose, orderId, currentDate, currentStaffId }: RescheduleDialogProps) {
  const { rescheduleBooking, isRescheduling } = useServiceActions();

  const form = useForm<RescheduleFormValues>({
    resolver: zodResolver(rescheduleSchema),
    defaultValues: { timeStr: '', staffId: '' }
  });

  const { watch, setValue, handleSubmit, reset } = form;

  const date = watch('date');
  const selectedTime = watch('timeStr');
  const selectedStaffId = watch('staffId');

  // Streamlined Form State Hydration via React Hook Form Reset
  useEffect(() => {
    if (isOpen) {
      let d: Date | undefined;
      let tStr = '';
      if (currentDate) {
        d = parseISO(currentDate);
        const parsedT = format(d, "HH:mm");
        if (TIME_SLOTS.includes(parsedT)) {
          tStr = parsedT;
        }
      }
      reset({
        date: d,
        timeStr: tStr,
        staffId: currentStaffId || ''
      });
    } else {
      setTimeout(() => reset({ timeStr: '', staffId: '' }), 300);
    }
  }, [isOpen, currentDate, currentStaffId, reset]);

  const currentHour = new Date().getHours();
  const allSlotsPastToday = TIME_SLOTS.every((ts) => parseInt(ts.split(":")[0], 10) <= currentHour);

  const { data: staffData, isLoading: isLoadingStaff } = useStaffs({ 
    pageSize: 100, 
    Role: "CleaningStaff" 
  });
  
  const cleaningStaffs = useMemo(() => {
    const staffs = (staffData?.items || []) as unknown as Staff[];
    return staffs.filter((s) => {
      const role = (s.role || '').toLowerCase();
      const pos = (s.position || '').toLowerCase();
      return (role.includes('clean') || pos.includes('clean') || role.includes('tech')) && !role.includes('delivery');
    });
  }, [staffData]);

  // Compute if there are any changes
  const hasChanges = useMemo(() => {
    if (!currentDate) return true; // If somehow no old date, assume changes
    if (!date || !selectedTime || !selectedStaffId) return false;
    
    const oldParsed = parseISO(currentDate);
    const oldDateStr = format(oldParsed, 'yyyy-MM-dd');
    const oldTimeStr = format(oldParsed, 'HH:mm');
    const newDateStr = format(date, 'yyyy-MM-dd');
    
    const isSameTime = (newDateStr === oldDateStr) && (selectedTime === oldTimeStr);
    const isSameStaff = selectedStaffId === (currentStaffId || '');

    return !(isSameTime && isSameStaff);
  }, [date, selectedTime, selectedStaffId, currentDate, currentStaffId]);

  const onSubmit = handleSubmit((data) => {
    if (!orderId) return;
    
    const formattedDate = format(data.date, 'yyyy-MM-dd');
    const dateOb = new Date(`${formattedDate}T${data.timeStr}:00Z`);

    rescheduleBooking({
      serviceOrderId: orderId,
      newStaffId: data.staffId,
      newAppointmentDate: dateOb.toISOString(),
    }, {
      onSuccess: () => {
        onClose();
        reset();
      }
    });
  });

  const selectedStaff = cleaningStaffs.find(s => s.staffId === selectedStaffId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border border-slate-200 shadow-2xl rounded-2xl gap-0">
        <DialogHeader className="p-8 pb-6 bg-slate-50 text-slate-900 border-b border-slate-100 relative">
          <div className="relative z-10 space-y-2">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-4 shadow-sm">
              <History className="h-6 w-6 text-white" />
            </div>
            <DialogTitle className="text-2xl font-black tracking-tight">Reschedule Service</DialogTitle>
            <DialogDescription className="text-slate-500 font-medium leading-relaxed">
               Reorganize appointment scheduling and technical assignment.
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="px-8 py-6 space-y-8 bg-white max-h-[60vh] overflow-y-auto custom-scrollbar">
          {/* Section: New Date Selection */}
          <div className="space-y-4">
            <Label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <CalendarIcon className="h-3.5 w-3.5" /> Shift New Appointment Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full h-14 justify-start text-left font-bold rounded-xl border-2 transition-all",
                    !date ? "text-slate-400 border-slate-100" : "text-slate-800 border-slate-100 bg-slate-50/50 hover:border-primary focus:ring-primary/10"
                  )}
                >
                  <CalendarIcon className="mr-3 h-5 w-5 text-primary" />
                  {date ? format(date, "dd/MM/yyyy") : <span>Pick a new date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-2xl overflow-hidden border-slate-200 shadow-xl" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => {
                    setValue('date', d as Date, { shouldValidate: true });
                    if (d) {
                      const isTodayTemp = format(d, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
                      if (selectedTime) {
                        const slotHour = parseInt(selectedTime.split(":")[0], 10);
                        if (isTodayTemp && slotHour <= new Date().getHours()) {
                          setValue('timeStr', '', { shouldValidate: true });
                        }
                      }
                    } else {
                      setValue('timeStr', '', { shouldValidate: true });
                    }
                  }}
                  disabled={(d) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const currentDateVal = new Date(d);
                    currentDateVal.setHours(0, 0, 0, 0);
                    if (currentDateVal.getTime() < today.getTime()) return true;
                    if (currentDateVal.getTime() === today.getTime() && allSlotsPastToday) return true;
                    return false;
                  }}
                  initialFocus
                  className="p-4"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Section: Pick an Arrival Time */}
          <div className="space-y-4">
            <Label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5" /> Arrival Time Selection
              </span>
              {selectedTime && (
                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-lg">
                  {selectedTime}
                </span>
              )}
            </Label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {TIME_SLOTS.map((ts) => {
                const isSelected = selectedTime === ts;
                let isPast = false;
                if (date) {
                  const isToday = format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
                  const slotHour = parseInt(ts.split(":")[0], 10);
                  isPast = isToday && slotHour <= currentHour;
                }

                return (
                  <button
                    key={ts}
                    type="button"
                    disabled={isPast || !date}
                    onClick={() => setValue('timeStr', ts, { shouldValidate: true })}
                    className={cn(
                      "relative py-3 rounded-xl border text-center transition-all duration-300",
                      !date || isPast
                        ? "border-slate-100 bg-slate-50 text-slate-300 opacity-50 cursor-not-allowed"
                        : isSelected
                        ? "border-primary bg-primary/5 text-primary shadow-sm font-black"
                        : "border-slate-100 bg-white hover:border-primary/40 hover:bg-primary/5 text-slate-600 font-bold active:scale-95"
                    )}
                  >
                    <span className="text-[11px] uppercase tracking-wider">{ts}</span>
                  </button>
                );
              })}
            </div>
            {!selectedTime && date && (
              <p className="text-[10px] text-rose-500 font-bold uppercase mt-1 pl-1">
                Please select a valid time slot
              </p>
            )}
          </div>

          {/* Section: New Staff Assignment */}
          <div className="space-y-4">
            <Label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <UserPlus className="h-3.5 w-3.5" /> Reassign Dedicated Personnel
            </Label>
            <Select value={selectedStaffId} onValueChange={(val) => setValue('staffId', val, { shouldValidate: true })}>
              <SelectTrigger className="h-14 px-4 rounded-xl border-2 border-slate-100 bg-white hover:border-primary transition-all focus:ring-primary/10">
                <SelectValue placeholder={isLoadingStaff ? "Syncing qualified staff..." : "Choose specialized staff"} />
              </SelectTrigger>
              <SelectContent className="max-h-[280px] rounded-xl p-1.5">
                {cleaningStaffs.map((staff) => (
                  <SelectItem 
                    key={staff.staffId} 
                    value={staff.staffId || ''}
                    className="rounded-lg mb-1 last:mb-0 focus:bg-slate-50 cursor-pointer py-3"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 border border-slate-100 shadow-sm shrink-0">
                        <AvatarImage src={staff.avatarUrl} />
                        <AvatarFallback className="bg-slate-200 text-slate-500 text-[10px] font-black uppercase">{staff.fullName?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="text-left">
                        <p className="text-sm font-bold text-slate-800">{staff.fullName}</p>
                        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tighter">{staff.position || 'Technician'}</p>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <AnimatePresence>
            {selectedStaff && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-4 shadow-sm">
                  <div className="h-14 w-14 rounded-full bg-white shadow-sm flex items-center justify-center border-2 border-white ring-1 ring-slate-200 mb-0 px-0 relative overflow-hidden">
                    <Avatar className="h-full w-full">
                      <AvatarImage src={selectedStaff.avatarUrl} className="object-cover" />
                      <AvatarFallback className="bg-slate-300 text-white font-black">{selectedStaff.fullName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-slate-800 truncate">{selectedStaff.fullName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-[10px] font-bold px-2 rounded-md bg-emerald-50 border-emerald-200 text-emerald-700">
                        {selectedStaff.position || 'Ready to Assign'}
                      </Badge>
                      <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Shift Available
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Selection Review */}
        {(date || selectedTime) && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-t border-slate-100 bg-slate-50/30 px-8 py-4 flex items-center justify-between"
          >
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Selected Arrival</span>
            <div className="flex items-center gap-2">
              {date && (
                <span className="text-xs font-black text-slate-700 bg-slate-100 px-2 py-1 rounded-lg shadow-sm">
                  {format(date, "dd/MM/yyyy")}
                </span>
              )}
              {selectedTime && (
                <span className="text-xs font-black text-white bg-primary px-2.5 py-1 rounded-lg shadow-md">
                  {selectedTime}
                </span>
              )}
            </div>
          </motion.div>
        )}

        {!hasChanges && date && selectedTime && selectedStaffId && (
          <p className="text-[10px] font-bold text-amber-500 uppercase text-center mt-[-10px] mb-2 px-8">
            Please select a new time slot or a different staff to reschedule
          </p>
        )}

        <DialogFooter className="p-8 bg-slate-50 border-t border-slate-100 flex sm:justify-between items-center gap-4">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-slate-400 font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 hover:text-slate-800 rounded-xl px-6 h-12"
          >
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={!date || !selectedTime || !selectedStaffId || !hasChanges || isRescheduling}
            className="flex-1 bg-primary hover:bg-primary-hover text-white font-black uppercase text-[10px] tracking-widest transition-all h-12 rounded-xl shadow-md active:scale-95 border-0"
          >
            {isRescheduling ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Finalizing...
              </span>
            ) : (
              'Confirm Reschedule'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});
