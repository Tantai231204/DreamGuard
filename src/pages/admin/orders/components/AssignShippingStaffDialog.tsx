import { useMemo, useState } from 'react';
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
import {
  UserPlus,
  Loader2,
  AlertCircle,
  Briefcase,
  Truck,
  RefreshCw,
} from 'lucide-react';
import { useDeliveryStaffsForAssignment } from '@/hooks/queries/useStaff';
import { useShippingTasksByOrder, useShippingTasksByTradeInOrder, useCreateShippingTask, useReassignShippingTask } from '@/hooks/queries/useShippingTask';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { isAdminOrManager as checkIsAdminOrManager } from '@/lib/role';

interface AssignShippingStaffDialogProps {
  orderId?: string;
  tradeInOrderId?: string;
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



function AssignShippingStaffContent({ orderId, tradeInOrderId, onClose }: { orderId?: string; tradeInOrderId?: string; onClose: () => void }) {
  const role = useAuthStore((s) => s.role);
  const isAdminOrManager = checkIsAdminOrManager(role);
  // Only fetch all delivery staff if admin/manager
  // Use dedicated assignment API
  const { data: staffData, isLoading: isLoadingStaff, isError: isStaffError } = useDeliveryStaffsForAssignment(
    { enabled: isAdminOrManager }
  );
  const { data: orderTasks } = useShippingTasksByOrder(orderId || '');
  const { data: tradeInTasks } = useShippingTasksByTradeInOrder(tradeInOrderId || '');
  const isTradeInMode = !orderId && !!tradeInOrderId;
  const tasks = isTradeInMode ? tradeInTasks : orderTasks;

  type CustomStaffInfo = {
    staffId: string;
    fullName: string;
    avatarUrl?: string;
    phoneNumber?: string;
    position?: string;
    role?: string;
    status?: string;
    address?: string;
    taskCount?: number;
  };

  const staffs = useMemo(() => {
    if (isAdminOrManager) return (staffData || []) as CustomStaffInfo[];
    // For sellers, collect unique staff from tasks (reconstruct minimal staff object)
    const allTasks = tasks || [];
    const uniqueStaff: Record<string, CustomStaffInfo> = {};
    allTasks.forEach((t) => {
      if (t.staffId) {
        uniqueStaff[t.staffId] = {
          staffId: t.staffId,
          fullName: t.staffName,
        };
      }
    });
    return Object.values(uniqueStaff);
  }, [isAdminOrManager, staffData, tasks]);
  const activeTask = useMemo(() => {
    const sortedTasks = [...(tasks || [])].sort((a, b) => {
      const aTime = new Date(a.completionDate || a.shippingDate || 0).getTime();
      const bTime = new Date(b.completionDate || b.shippingDate || 0).getTime();
      return bTime - aTime;
    });
    return sortedTasks.find((t) => t.status !== 'Reassigned');
  }, [tasks]);
  const isReassign = !!activeTask;

  const [userSelectedStaffId, setUserSelectedStaffId] = useState<string>('');
  const selectedStaffId = userSelectedStaffId || activeTask?.staffId || '';

  const deliveryStaffs = useMemo(() => {
    // Staffs are already filtered by the API
    return staffs;
  }, [staffs]);

  const selectedStaff = useMemo(() =>
    deliveryStaffs.find((s) => s.staffId === selectedStaffId),
    [deliveryStaffs, selectedStaffId]
  );

  const createTask = useCreateShippingTask();
  const reassignTask = useReassignShippingTask();
  const isPending = createTask.isPending || reassignTask.isPending;
  const isStatusBlocked = !!activeTask && activeTask.status?.toLowerCase() !== 'pending';


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
          orderId,
          tradeInOrderId,
        });
        toast.success('Shipping staff reassigned successfully');
      } else {
        await createTask.mutateAsync({
          staffId: selectedStaffId,
          orderId,
          tradeInOrderId,
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
      <DialogHeader className="p-6 pb-4 bg-slate-50 text-slate-900 border-b border-slate-100 relative">
        <div className="relative z-10 space-y-1">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center mb-2 shadow-sm">
            <UserPlus className="h-5 w-5 text-white" />
          </div>
          <DialogTitle className="text-xl font-black tracking-tight">
            {!isAdminOrManager ? 'Shipping Staff Details' : isReassign ? 'Reassign Shipping Staff' : 'Assign Shipping Staff'}
          </DialogTitle>
          <DialogDescription className="text-slate-500 text-xs font-medium leading-relaxed">
            {!isAdminOrManager ? 'View assigned delivery specialist.' : 'Select a delivery specialist to handle this shipment.'}
          </DialogDescription>
        </div>
      </DialogHeader>

      <div className="px-6 py-4 space-y-4 bg-white">
        {isAdminOrManager && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Briefcase className="h-3.5 w-3.5" /> Select Team Member
              </Label>
              {isLoadingStaff && <Loader2 className="h-3 w-3 animate-spin text-primary" />}
              {isStaffError && (
                <span className="text-xs text-red-500 ml-2">Failed to load staff</span>
              )}
            </div>

            <Select value={selectedStaffId} onValueChange={setUserSelectedStaffId} disabled={isLoadingStaff || isPending || isStatusBlocked}>
              <SelectTrigger className="h-12 px-4 rounded-xl border-2 border-slate-100 bg-white hover:border-primary transition-all focus:ring-primary/10">
                <SelectValue placeholder={isLoadingStaff ? 'Syncing staff...' : 'Browse shipping staff'} />
              </SelectTrigger>
              <SelectContent className="max-h-[300px] p-1.5 rounded-xl">
                {deliveryStaffs.length > 0 ? (
                  deliveryStaffs.map((staff) => (
                    <SelectItem
                      key={staff.staffId}
                      value={staff.staffId}
                      className="rounded-lg mb-1 last:mb-0 focus:bg-slate-50 cursor-pointer py-3"
                    >
                      <div className="flex items-center justify-between gap-4 w-full">
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar className="h-9 w-9 border border-slate-200 shadow-sm shrink-0 bg-white overflow-hidden">
                            <AvatarImage
                              src={staff.avatarUrl || '/images/logo_no_name.svg'}
                              className={cn("object-cover", !staff.avatarUrl && "scale-75")}
                            />
                            <AvatarFallback className="bg-slate-200 text-slate-500 text-[10px] font-black uppercase">
                              {staff.fullName ? staff.fullName.charAt(0) : 'D'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-slate-900 text-sm truncate">{staff.fullName}</p>
                              {isActiveStatus(staff.status) && (
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                              <span className="truncate">{formatLabel(staff.position || staff.role, 'Staff')}</span>
                              {typeof staff.taskCount === 'number' && (
                                <>
                                  <span className="text-slate-300">•</span>
                                  <span className="font-bold text-primary">{staff.taskCount} tasks</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={cn(
                            "font-bold px-2 py-0.5 rounded-md text-[9px] shrink-0 border-0 uppercase tracking-wider shadow-sm",
                            isActiveStatus(staff.status)
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-slate-100 text-slate-500"
                          )}
                        >
                          {isActiveStatus(staff.status) ? 'Active' : (staff.status || 'Offline')}
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
        )}

        {!isAdminOrManager && !selectedStaff ? (
          <div className="p-8 text-center bg-slate-50 border border-slate-100 rounded-2xl border-dashed">
            <Truck className="h-8 w-8 mx-auto mb-3 text-slate-300" />
            <p className="text-sm font-bold text-slate-600">No Shipping Staff Assigned</p>
            <p className="text-xs text-slate-400 mt-1">This order does not have a delivery staff assigned yet.</p>
          </div>
        ) : selectedStaff && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-white shadow-sm ring-1 ring-slate-200 overflow-hidden bg-white">
                <AvatarImage
                  src={selectedStaff.avatarUrl || '/images/logo_no_name.svg'}
                  className={cn("object-cover", !selectedStaff.avatarUrl && "scale-75")}
                />
                <AvatarFallback className="bg-slate-300 text-white font-black">{selectedStaff.fullName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-black text-slate-800 text-sm truncate">{selectedStaff.fullName}</h4>
                  {isAdminOrManager && typeof selectedStaff.taskCount === 'number' && (
                    <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-200 font-black text-[9px] uppercase px-1.5 py-0.5 h-fit shrink-0">
                      {selectedStaff.taskCount} Tasks
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <p className="text-[10px] text-slate-500 font-medium truncate">
                    {formatLabel(selectedStaff.position || selectedStaff.role, 'Delivery Staff')} • {selectedStaff.phoneNumber || 'Private'}
                  </p>
                  <Badge variant="outline" className="bg-white border-slate-200 text-slate-500 font-bold px-1.5 py-0 rounded-md text-[9px] shrink-0">
                    {!isAdminOrManager ? 'Assigned' : isReassign ? 'Reassignment' : 'Ready'}
                  </Badge>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <DialogFooter className="p-6 bg-slate-50 border-t border-slate-100 flex sm:justify-end items-center gap-4">
        <Button
          variant={isAdminOrManager ? "ghost" : "default"}
          onClick={onClose}
          disabled={isPending}
          className={cn(
            "font-black uppercase text-[10px] tracking-widest rounded-xl px-6 h-10",
            isAdminOrManager ? "text-slate-400 hover:bg-slate-200 hover:text-slate-800" : "bg-primary hover:bg-primary-hover text-white shadow-md active:scale-95 border-0 w-full sm:w-auto"
          )}
        >
          {isAdminOrManager ? 'Cancel' : 'Close'}
        </Button>
        {isAdminOrManager && (
          <Button
            onClick={handleAction}
            disabled={!selectedStaffId || isPending || (isReassign && selectedStaffId === activeTask?.staffId) || isStatusBlocked}
            className="flex-1 bg-primary hover:bg-primary-hover text-white font-black uppercase text-[10px] tracking-widest transition-all h-10 rounded-xl shadow-md active:scale-95 border-0"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Syncing...
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
        )}
      </DialogFooter>
    </>
  );
}

export function AssignShippingStaffDialog({ orderId, tradeInOrderId, isOpen, onClose }: AssignShippingStaffDialogProps) {
  const entityId = orderId || tradeInOrderId || '';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border border-slate-200 shadow-2xl rounded-2xl gap-0">
        {isOpen && (
          <AssignShippingStaffContent
            key={`assign-${entityId}-${isOpen}`}
            orderId={orderId}
            tradeInOrderId={tradeInOrderId}
            onClose={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
