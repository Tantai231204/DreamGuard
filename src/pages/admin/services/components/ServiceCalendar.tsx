import React, { useState, useMemo, useCallback } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  parseISO,
  isToday,
} from 'date-fns';
import {
  ChevronLeft,
  ChevronRight,
  User,
  Sparkles,
  XCircle,
  CheckCircle2,
  Search,
  MapPin,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { ServiceBooking, ServiceStatus } from '../types';

interface ServiceCalendarProps {
  bookings: ServiceBooking[];
  onViewBooking: (id: string) => void;
  onConfirmBooking: (id: string) => void;
  onCancelBooking: (id: string, status: string) => void;
  onAssignTechnician: (id: string) => void;
}

// ─── Status config ──────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  ServiceStatus,
  { dot: string; stripe: string; badge: string; label: string }
> = {
  pending: { dot: 'bg-amber-400', stripe: 'bg-amber-400', badge: 'bg-amber-100 text-amber-800', label: 'Pending' },
  confirmed: { dot: 'bg-sky-500', stripe: 'bg-sky-500', badge: 'bg-sky-100 text-sky-800', label: 'Confirmed' },
  processing: { dot: 'bg-violet-500', stripe: 'bg-violet-500', badge: 'bg-violet-100 text-violet-800', label: 'Processing' },
  completed: { dot: 'bg-emerald-500', stripe: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-800', label: 'Completed' },
  cancelled: { dot: 'bg-rose-400', stripe: 'bg-rose-400', badge: 'bg-rose-100 text-rose-800', label: 'Cancelled' },
  rejected: { dot: 'bg-gray-400', stripe: 'bg-gray-400', badge: 'bg-gray-100 text-gray-700', label: 'Rejected' },
  refunded: { dot: 'bg-purple-500', stripe: 'bg-purple-500', badge: 'bg-purple-100 text-purple-800', label: 'Refunded' },
  forcedcancelled: { dot: 'bg-rose-700', stripe: 'bg-rose-700', badge: 'bg-rose-200 text-rose-900', label: 'Forced Cancel' },
};

// ─── Booking Card ───────────────────────────────────────────────────────────
const BookingCard = React.forwardRef<
  HTMLDivElement,
  {
    booking: ServiceBooking;
    onView: () => void;
    onConfirm: () => void;
    onCancel: () => void;
    onAssign: () => void;
  }
>(({ booking, onView, onConfirm, onCancel, onAssign }, ref) => {
  const cfg = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.pending;

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      onClick={onView}
      className="group relative bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all duration-200 cursor-pointer overflow-hidden mb-2"
    >
      <div className={cn('absolute left-0 top-0 bottom-0 w-1', cfg.stripe)} />

      <div className="pl-4 pr-3 py-3">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <p className="text-[13px] font-bold text-gray-900 truncate leading-tight group-hover:text-blue-600 transition-colors">
            {booking.customerName}
          </p>
          <span className={cn('shrink-0 text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider', cfg.badge)}>
            {cfg.label}
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-gray-400 mb-2.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="truncate">{booking.address?.street || 'No Address'}</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 ml-auto font-mono text-[10px]">
            {booking.orderCode}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {booking.status === 'pending' && (
            <button
              onClick={(e) => { e.stopPropagation(); onConfirm(); }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-bold hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100/50"
            >
              <CheckCircle2 className="w-3 h-3" />
              Confirm
            </button>
          )}
          {booking.status === 'confirmed' && !booking.staff && !booking.technician && (
            <button
              onClick={(e) => { e.stopPropagation(); onAssign(); }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-[10px] font-bold hover:bg-blue-600 hover:text-white transition-all border border-blue-100/50"
            >
              <User className="w-3 h-3" />
              Assign
            </button>
          )}
          {(booking.staff || booking.technician) && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-50/50 border border-blue-100/30">
               <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[8px] font-black uppercase">
                 {(booking.staff?.fullName || booking.technician?.fullName || 'T')[0]}
               </span>
               <span className="text-[10px] font-bold text-blue-800 tracking-tight truncate max-w-[80px]">
                 {booking.staff?.fullName || booking.technician?.fullName}
               </span>
            </div>
          )}
          <div className="flex-1" />
          {!['cancelled', 'rejected', 'completed', 'refunded', 'forcedcancelled'].includes(booking.status) && (
            <button
              onClick={(e) => { 
                e.stopPropagation(); 
                onCancel(); 
              }}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:bg-rose-50 hover:text-rose-600 transition-all"
            >
              <XCircle className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
});

// ─── Timeline Panel ─────────────────────────────────────────────────────────
const TimelinePanel = ({
  bookings,
  onView,
  onConfirm,
  onCancel,
  onAssign,
}: {
  bookings: ServiceBooking[];
  onView: (id: string) => void;
  onConfirm: (id: string) => void;
  onCancel: (id: string, status: string) => void;
  onAssign: (id: string) => void;
}) => {
  const groups = useMemo(() => {
    const map: Record<string, ServiceBooking[]> = {};
    [...bookings]
      .sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime))
      .forEach((b) => {
        if (!map[b.scheduledTime]) map[b.scheduledTime] = [];
        map[b.scheduledTime].push(b);
      });
    return Object.entries(map);
  }, [bookings]);

  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Sparkles className="w-10 h-10 text-gray-100 mb-3" />
        <p className="text-[14px] font-bold text-gray-900">No Jobs Today</p>
      </div>
    );
  }

  return (
    <div className="relative py-4 pr-1">
      {/* Timeline Line */}
      <div className="absolute top-0 bottom-0 w-[1.5px] bg-gray-100 left-[55px]" />

      <AnimatePresence mode="popLayout" initial={false}>
        {groups.map(([time, group]) => {
          return (
            <motion.div
              key={time}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative mb-6 last:mb-0"
            >
              {/* Time indicator row */}
              <div className="flex items-center mb-3">
                <div className="w-[45px] shrink-0 text-right pr-2">
                  <span className="text-[13px] font-black text-gray-900 tabular-nums tracking-tighter">{time}</span>
                </div>

                {/* Dot node */}
                <div className="relative z-10 w-2.5 h-2.5 rounded-full bg-primary-500 ring-[3px] ring-white shrink-0 -ml-[5px]" />

                {/* Job count label */}
                <div className="ml-3 flex items-center gap-2 flex-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                    {group.length} {group.length === 1 ? 'Job' : 'Jobs'}
                  </span>
                  <div className="h-[1px] bg-gray-100 flex-1" />
                </div>
              </div>

              {/* Cards for this slot */}
              <div className="pl-[55px] space-y-2">
                <AnimatePresence mode="popLayout">
                  {group.map((booking) => (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      onView={() => onView(booking.id)}
                      onConfirm={() => onConfirm(booking.id)}
                      onCancel={() => onCancel(booking.id, booking.status)}
                      onAssign={() => onAssign(booking.id)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

// ─── Main Component ─────────────────────────────────────────────────────────
export const ServiceCalendar = ({
  bookings,
  onViewBooking,
  onConfirmBooking,
  onCancelBooking,
  onAssignTechnician,
}: ServiceCalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [unassignedOnly, setUnassignedOnly] = useState(false);

  const monthStart = startOfMonth(currentDate);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(endOfMonth(monthStart), { weekStartsOn: 1 });

  const calendarDays = useMemo(
    () => eachDayOfInterval({ start: startDate, end: endDate }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [startDate.toISOString(), endDate.toISOString()]
  );

  const isUnassigned = (b: ServiceBooking) => 
    b.status === 'confirmed' && !b.staff && !b.technician;

  const getDayBookings = useCallback(
    (day: Date) => {
      const dayRaw = bookings.filter((b) => {
        try {
          return isSameDay(parseISO(b.scheduledDate), day);
        } catch {
          return false;
        }
      });
      return unassignedOnly ? dayRaw.filter(isUnassigned) : dayRaw;
    },
    [bookings, unassignedOnly]
  );

  const selectedDayBookings = useMemo(() => {
    const raw = getDayBookings(selectedDay);
    if (!searchQuery.trim()) return raw;
    const q = searchQuery.toLowerCase();
    return raw.filter(
      (b) =>
        b.customerName.toLowerCase().includes(q) ||
        b.orderCode?.toLowerCase().includes(q)
    );
  }, [selectedDay, getDayBookings, searchQuery]);

  const WEEKDAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  return (
    <div className="flex h-full w-full bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-blue-900/5 overflow-hidden">
      {/* ═══ LEFT: Calendar ═══════════════════════════════════════════ */}
      <div className="flex flex-col flex-1 min-w-0 border-r border-gray-100">
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between px-8 py-7 border-b border-gray-100 bg-white/40 backdrop-blur-3xl">
          <div className="flex items-center">
            <div>
              <h2 className="text-[26px] font-black text-gray-900 leading-none tracking-tight">
                {format(currentDate, 'MMMM yyyy')}
              </h2>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest leading-none">Schedule Management</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Filter Toggle */}
            <button
              onClick={() => setUnassignedOnly(!unassignedOnly)}
              className={cn(
                "flex items-center gap-3 px-5 h-11 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all active:scale-95",
                unassignedOnly 
                  ? "bg-amber-500 text-white shadow-lg shadow-amber-200" 
                  : "bg-gray-100/80 text-gray-400 hover:bg-gray-200/80"
              )}
            >
              <div className={cn(
                "w-4 h-4 rounded-full flex items-center justify-center transition-transform duration-300",
                unassignedOnly ? "bg-white text-amber-500 scale-110 shadow-sm" : "bg-gray-300 text-gray-500"
              )}>
                <User className="w-2.5 h-2.5" />
              </div>
              Unassigned Only
            </button>

            <button
              onClick={() => {
                const t = new Date();
                setCurrentDate(t);
                setSelectedDay(t);
              }}
              className="text-[13px] font-black px-6 h-11 rounded-2xl bg-gray-50 border border-gray-100 text-gray-900 hover:bg-white hover:border-gray-300 hover:shadow-lg hover:shadow-gray-200/50 transition-all active:scale-95"
            >
              Today
            </button>
            <div className="flex bg-gray-50/50 border border-gray-100 rounded-2xl p-1 gap-1">
              <button
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:bg-white hover:text-gray-900 hover:shadow-md transition-all active:scale-90"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:bg-white hover:text-gray-900 hover:shadow-md transition-all active:scale-90"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Weekday row */}
        <div className="shrink-0 grid grid-cols-7 border-b border-gray-100 bg-gray-50/10">
          {WEEKDAYS.map((d) => (
            <div key={d} className="py-3 text-center">
              <span className="text-[11px] font-bold text-gray-300 uppercase tracking-[0.3em] leading-none">{d}</span>
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-auto grid grid-cols-7 auto-rows-[minmax(130px,1fr)] content-start scrollbar-hide">
          {calendarDays.map((day) => {
            const rawDayBookings = bookings.filter(b => {
              try { return isSameDay(parseISO(b.scheduledDate), day); } catch { return false; }
            });
            const unassignedCount = rawDayBookings.filter(isUnassigned).length;
            const dayBookings = unassignedOnly ? rawDayBookings.filter(isUnassigned) : rawDayBookings;

            const inMonth = isSameMonth(day, monthStart);
            const today = isToday(day);
            const selected = isSameDay(day, selectedDay);

            const statusDots = [
              ...new Map(
                dayBookings.map((b) => [b.status, STATUS_CONFIG[b.status]?.dot ?? 'bg-gray-300'])
              ).entries(),
            ].slice(0, 4);

            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDay(day)}
                className={cn(
                  'relative border-r border-b border-gray-100/60 text-left p-5 transition-all focus:outline-none group overflow-hidden',
                  '[&:nth-child(7n)]:border-r-0',
                  !inMonth && 'bg-gray-50/10 opacity-30',
                  inMonth && !selected && 'hover:bg-primary-50/20',
                  selected && 'bg-primary-50/40 ring-4 ring-inset ring-primary-500/10 z-10 shadow-[inset_0_0_40px_rgba(73,136,196,0.02)]',
                  unassignedCount > 0 && inMonth && 'ring-2 ring-inset ring-amber-400/30'
                )}
              >
                {/* Unassigned Warning Indicator */}
                {unassignedCount > 0 && inMonth && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute top-0 right-0 w-8 h-8 flex items-center justify-center p-1 overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-0 h-0 border-t-[32px] border-l-[32px] border-t-amber-500 border-l-transparent drop-shadow-sm" />
                    <motion.div
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <User className="relative z-10 w-2 h-2 text-white -mt-3.5 -mr-[-14px]" />
                    </motion.div>
                  </motion.div>
                )}

                <div className="flex items-start justify-between mb-4">
                  <span className={cn(
                    'relative inline-flex items-center justify-center w-9 h-9 rounded-2xl text-[15px] font-black transition-all duration-300',
                    today && 'bg-gray-900 text-white shadow-xl shadow-gray-300 scale-110 -translate-y-0.5',
                    selected && !today && 'bg-primary-600 text-white shadow-xl shadow-primary-200/50 scale-105',
                    !today && !selected && inMonth && 'text-gray-900 group-hover:bg-primary-50 group-hover:text-primary-600',
                    !inMonth && 'text-gray-100'
                  )}>
                    {format(day, 'd')}
                    {today && <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 border-2 border-white rounded-full" />}
                  </span>

                  {dayBookings.length > 0 && (
                    <div className={cn(
                      'flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-black transition-all duration-300',
                      selected ? 'bg-primary-600 text-white shadow-lg' : 'bg-gray-100 text-gray-400'
                    )}>
                      {dayBookings.length} {dayBookings.length === 1 ? 'Job' : 'Jobs'}
                    </div>
                  )}
                </div>

                {statusDots.length > 0 && (
                  <div className="flex gap-1 mb-4">
                    {statusDots.map(([status, dotClass]) => (
                      <span key={status} className={cn('w-1.5 h-1.5 rounded-full ring-2 ring-white', dotClass)} />
                    ))}
                    {dayBookings.length > 4 && (
                      <span className="text-[9px] text-gray-400 font-bold self-center ml-0.5 leading-none">
                        +{dayBookings.length - 4} More
                      </span>
                    )}
                  </div>
                )}

                {dayBookings[0] && inMonth && (
                  <div className="max-w-full">
                    <p className="text-[11px] font-bold text-gray-800 truncate leading-none">
                      {dayBookings[0].customerName}
                    </p>
                    {dayBookings.length > 1 && (
                      <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest truncate mt-1.5">
                        +{dayBookings.length - 1} additional
                      </p>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══ RIGHT: Detail Panel ══════════════════════════════════════ */}
      <div className="w-[440px] shrink-0 flex flex-col overflow-hidden bg-white shadow-[-30px_0_50px_rgba(0,0,0,0.02)]">
        {/* Fixed header */}
        <div className="shrink-0 border-b border-gray-100 px-8 pt-10 pb-8 space-y-6 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[12px] font-black text-gray-300 uppercase tracking-[0.3em] mb-2">
                {unassignedOnly ? 'NEEDS ASSIGNMENT' : format(selectedDay, 'EEEE')}
              </p>
              <h3 className="text-[28px] font-black text-gray-900 leading-none tracking-tighter">
                {format(selectedDay, 'MMM dd, yyyy')}
              </h3>
            </div>
            {unassignedCountForDay(selectedDay) > 0 && (
              <span className="text-[11px] font-black px-4 py-2 rounded-full bg-amber-500 text-white shadow-xl shadow-amber-200">
                {unassignedCountForDay(selectedDay)} PENDING ASSIGN
              </span>
            )}
          </div>

          {/* Search */}
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
            <input
              type="text"
              placeholder="Search customers or codes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 bg-gray-100 border border-gray-100/50 rounded-2xl pl-11 pr-11 text-[13px] font-bold text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-8 focus:ring-primary-500/5 focus:border-primary-400 transition-all focus:bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
                title="Clear"
              >
                <XCircle className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable area */}
        <div
          className={cn(
            'flex-1 min-h-0 overflow-y-auto overflow-x-hidden',
            'px-6 py-2 pb-10',
            // Custom scrollbar
            '[&::-webkit-scrollbar]:w-1.5',
            '[&::-webkit-scrollbar-track]:bg-transparent',
            '[&::-webkit-scrollbar-thumb]:bg-gray-100',
            '[&::-webkit-scrollbar-thumb]:rounded-full',
            'hover:[&::-webkit-scrollbar-thumb]:bg-gray-200',
          )}
        >
          {selectedDayBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-gray-200" />
              </div>
              <p className="text-[15px] font-bold text-gray-900">
                {unassignedOnly ? 'All tasks assigned for this day!' : 'No results found'}
              </p>
            </div>
          ) : (
            <TimelinePanel
              bookings={selectedDayBookings}
              onView={onViewBooking}
              onConfirm={onConfirmBooking}
              onCancel={onCancelBooking}
              onAssign={onAssignTechnician}
            />
          )}
        </div>
      </div>
    </div>
  );

  function unassignedCountForDay(day: Date) {
    return bookings.filter(b => {
      try { return isSameDay(parseISO(b.scheduledDate), day) && isUnassigned(b); } catch { return false; }
    }).length;
  }
};