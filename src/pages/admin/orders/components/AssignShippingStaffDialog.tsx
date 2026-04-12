import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  UserPlus,
  Loader2,
  AlertCircle,
  Briefcase,
  Truck,
  RefreshCw,
} from 'lucide-react';
import { useStaffs } from '@/hooks/queries/useStaff';
import { useShippingTasksByOrder, useCreateShippingTask, useReassignShippingTask } from '@/hooks/queries/useShippingTask';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface AssignShippingStaffDialogProps {
  orderId: string;
  isOpen: boolean;
  onClose: () => void;
}

const formatLabel = (value?: string, fallback = 'Delivery Staff') => {
  if (!value?.trim()) return fallback;
  return value
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const isActiveStatus = (status?: string) => (status || '').toLowerCase() === 'active';

function AssignShippingStaffContent({ orderId, onClose }: { orderId: string; onClose: () => void }) {
  const { data: staffData, isLoading: isLoadingStaff } = useStaffs({
    pageSize: 100,
    Role: 'DeliveryStaff'
  });
  const { data: tasks } = useShippingTasksByOrder(orderId);

  const staffs = useMemo(() => staffData?.items || [], [staffData]);
  const activeTask = useMemo(() => tasks?.find((t) => t.status !== 'Reassigned'), [tasks]);
  const isReassign = !!activeTask;

  const [selectedStaffId, setSelectedStaffId] = useState<string>(activeTask?.staffId || '');

  useEffect(() => {
    if (activeTask?.staffId) {
      setSelectedStaffId((prev) => prev || activeTask.staffId);
    }
  }, [activeTask?.staffId]);

  const deliveryStaffs = useMemo(() => {
    return staffs.filter((s) => {
      const role = (s.role || '').toLowerCase();
      const pos = (s.position || '').toLowerCase();
      return role === 'deliverystaff' || pos === 'deliverystaff';
    });
  }, [staffs]);

  const selectedStaff = useMemo(() =>
    deliveryStaffs.find((s) => s.staffId === selectedStaffId),
    [deliveryStaffs, selectedStaffId]
  );

  const createTask = useCreateShippingTask();
  const reassignTask = useReassignShippingTask();
  const isPending = createTask.isPending || reassignTask.isPending;

  const handleAction = async () => {
    if (!selectedStaffId) {
      toast.error('Please select a personnel first');
      return;
    }

    try {
      if (activeTask && isReassign) {
        if (activeTask.staffId === selectedStaffId) {
          toast.error('Personnel already assigned.');
          return;
        }
        await reassignTask.mutateAsync({
          taskId: activeTask.shippingTaskId,
          data: { newStaffId: selectedStaffId },
          orderId
        });
        toast.success('Shipping staff reassigned successfully');
      } else {
        await createTask.mutateAsync({
          staffId: selectedStaffId,
          orderId
        });
        toast.success('Shipping staff assigned successfully');
      }
      onClose();
    } catch {
      toast.error('Failed to update shipping assignment');
    }
  };

  return (
    <>
      <DialogHeader className="p-8 pb-6 bg-slate-50 text-slate-900 border-b border-slate-100 relative">
        <div className="relative z-10 space-y-2">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-4 shadow-sm">
            <UserPlus className="h-6 w-6 text-white" />
          </div>
          <DialogTitle className="text-2xl font-black tracking-tight">
            {isReassign ? 'Reassign Shipping Staff' : 'Assign Shipping Staff'}
          </DialogTitle>
          <DialogDescription className="text-slate-500 font-medium leading-relaxed">
            Select a delivery specialist to handle this shipment request.
          </DialogDescription>
        </div>
      </DialogHeader>

      <div className="px-8 py-6 space-y-6 bg-white">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Briefcase className="h-3.5 w-3.5" /> Select Team Member
            </Label>
            {isLoadingStaff && <Loader2 className="h-3 w-3 animate-spin text-primary" />}
          </div>

          <Select value={selectedStaffId} onValueChange={setSelectedStaffId} disabled={isLoadingStaff || isPending}>
            <SelectTrigger className="h-14 px-4 rounded-xl border-2 border-slate-100 bg-white hover:border-primary transition-all focus:ring-primary/10">
              <SelectValue placeholder={isLoadingStaff ? 'Syncing qualified staff...' : 'Browse shipping staff'} />
            </SelectTrigger>
            <SelectContent className="max-h-[300px] p-1.5 rounded-xl">
              {deliveryStaffs.length > 0 ? (
                deliveryStaffs.map((staff) => (
                  <SelectItem
                    key={staff.staffId}
                    value={staff.staffId}
                    className="rounded-lg mb-1 last:mb-0 focus:bg-slate-50 cursor-pointer py-3"
                  >
                    <div className="flex items-center justify-between gap-3 w-full">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="h-8 w-8 border border-slate-100 shadow-sm shrink-0">
                          <AvatarImage src={staff.avatarUrl} />
                          <AvatarFallback className="bg-slate-200 text-slate-500 text-[10px] font-black uppercase">
                            {staff.fullName ? staff.fullName.charAt(0) : 'D'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 text-sm truncate">{staff.fullName}</p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 min-w-0">
                            <span className="truncate max-w-[120px]">{staff.phoneNumber || 'No phone'}</span>
                            <span className="text-slate-300">|</span>
                            <span className="truncate">{formatLabel(staff.position || staff.role, 'Delivery Staff')}</span>
                          </div>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          'font-bold px-2 rounded-md text-[10px]',
                          isActiveStatus(staff.status)
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                            : 'bg-white border-slate-200 text-slate-500'
                        )}
                      >
                        {isActiveStatus(staff.status) ? 'Active' : (staff.status || 'Unknown')}
                      </Badge>
                    </div>
                  </SelectItem>
                ))
              ) : (
                <div className="p-4 text-center text-slate-400">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-20" />
                  <p className="text-xs font-bold font-sans">No delivery staff available</p>
                </div>
              )}
            </SelectContent>
          </Select>
        </div>

        {selectedStaff && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14 border-2 border-white shadow-sm ring-1 ring-slate-200">
                <AvatarImage src={selectedStaff.avatarUrl} />
                <AvatarFallback className="bg-slate-300 text-white font-black">{selectedStaff.fullName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h4 className="font-black text-slate-800 truncate">{selectedStaff.fullName}</h4>
                <p className="text-xs text-slate-500 font-medium">
                  {formatLabel(selectedStaff.position || selectedStaff.role, 'Delivery Staff')}
                </p>
                <p className="text-xs text-slate-500 font-medium truncate">{selectedStaff.address || 'Location Verified'}</p>
              </div>
            </div>
            <Separator className="bg-slate-200" />
            <div className="flex justify-between items-center text-xs gap-3">
              <span className="text-slate-600 font-medium truncate">
                {selectedStaff.phoneNumber || 'Contact Private'}
              </span>
              <Badge variant="outline" className="bg-white border-slate-200 text-slate-600 font-bold px-2 rounded-md">
                {isReassign ? 'Reassignment' : 'Ready to Assign'}
              </Badge>
            </div>
          </motion.div>
        )}
      </div>

      <DialogFooter className="p-8 bg-slate-50 border-t border-slate-100 flex sm:justify-between items-center gap-4">
        <Button
          variant="ghost"
          onClick={onClose}
          disabled={isPending}
          className="text-slate-400 font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 hover:text-slate-800 rounded-xl px-6 h-12"
        >
          Cancel
        </Button>
        <Button
          onClick={handleAction}
          disabled={!selectedStaffId || isPending || (isReassign && selectedStaffId === activeTask?.staffId)}
          className="flex-1 bg-primary hover:bg-primary-hover text-white font-black uppercase text-[10px] tracking-widest transition-all h-12 rounded-xl shadow-md active:scale-95 border-0"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Synchronizing...
            </span>
          ) : isReassign ? (
            <span className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" /> Confirm Reassignment
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Truck className="h-4 w-4" /> Confirm Assignment
            </span>
          )}
        </Button>
      </DialogFooter>
    </>
  );
}

export function AssignShippingStaffDialog({ orderId, isOpen, onClose }: AssignShippingStaffDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border border-slate-200 shadow-2xl rounded-2xl gap-0">
        {isOpen && (
          <AssignShippingStaffContent
            key={`assign-${orderId}-${isOpen}`}
            orderId={orderId}
            onClose={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
