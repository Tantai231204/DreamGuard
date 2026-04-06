import { useMemo, useState, useEffect } from 'react';
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
  MapPin,
  Phone,
  ShieldCheck,
  Loader2,
  AlertCircle,
  Briefcase,
  Truck,
  RefreshCw
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useStaffs } from '@/hooks/queries/useStaff';
import { useShippingTasksByOrder, useCreateShippingTask, useReassignShippingTask } from '@/hooks/queries/useShippingTask';
import { toast } from 'sonner';

interface AssignShippingStaffDialogProps {
  orderId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function AssignShippingStaffDialog({ orderId, isOpen, onClose }: AssignShippingStaffDialogProps) {
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');


  // 1. Load Data
  const { data: staffData, isLoading: isLoadingStaff } = useStaffs({
    pageSize: 100,
    Role: "DeliveryStaff"
  });
  const { data: tasks } = useShippingTasksByOrder(orderId);

  const staffs = useMemo(() => staffData?.items || [], [staffData]);

  // 2. Logic to identify active task
  const activeTask = useMemo(() => tasks?.find(t => t.status !== "Reassigned"), [tasks]);
  const isReassign = !!activeTask;

  // 3. Filter staffs strictly for DeliveryStaff (as requested)
  const deliveryStaffs = useMemo(() => {
    return staffs.filter((s) => {
      const role = (s.role || '').toLowerCase();
      const pos = (s.position || '').toLowerCase();
      return role === 'deliverystaff' || pos === 'deliverystaff';
    });
  }, [staffs]);

  // 4. Mutations
  const createTask = useCreateShippingTask();
  const reassignTask = useReassignShippingTask();
  const isPending = createTask.isPending || reassignTask.isPending;

  const selectedStaff = useMemo(() =>
    deliveryStaffs.find(s => s.staffId === selectedStaffId),
    [deliveryStaffs, selectedStaffId]
  );

  // 5. Initialize state when dialog opens or activeTask loads
  useEffect(() => {
    if (isOpen) {
      if (activeTask && selectedStaffId !== activeTask.staffId) {
        setSelectedStaffId(activeTask.staffId);
      } else if (!activeTask && selectedStaffId !== '') {
        setSelectedStaffId('');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, activeTask]);

  const handleAction = async () => {
    if (!selectedStaffId) {
      toast.error('Please select a personnel first');
      return;
    }

    try {
      if (activeTask && isReassign) {
        if (activeTask.staffId === selectedStaffId) {
          toast.error('This personnel is already performing this engagement.');
          return;
        }
        await reassignTask.mutateAsync({
          taskId: activeTask.shippingTaskId,
          data: { newStaffId: selectedStaffId },
          orderId
        });
        toast.success('Logistics agent reassigned successfully');
      } else {
        await createTask.mutateAsync({
          staffId: selectedStaffId,
          orderId
        });
        toast.success('Logistics agent deployed successfully');
      }
      onClose();
    } catch {
      toast.error('Failed to update assignment');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border border-blue-200/50 shadow-3xl rounded-[24px] gap-0">
        <DialogHeader className="p-8 pb-6 bg-[#F8FAFC] text-slate-900 border-b border-blue-50 relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Truck className="h-16 w-16" />
          </div>
          <div className="relative z-10 space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
              <UserPlus className="h-6 w-6 text-white" />
            </div>
            <DialogTitle className="text-2xl font-black tracking-tight uppercase tracking-tighter">
              {isReassign ? "Reassign Technician" : "Assign Technician"}
            </DialogTitle>
            <DialogDescription className="text-slate-500 font-bold leading-relaxed text-xs uppercase tracking-widest opacity-60">
              {isReassign
                ? "Switch personnel for this active shipping engagement."
                : "Select an verified delivery professional to handle this dispatch."}
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="px-8 py-7 space-y-7 bg-white">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                <Briefcase className="h-3.5 w-3.5" /> Personnel Hub
              </Label>
              {isLoadingStaff && <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />}
            </div>

            <Select value={selectedStaffId} onValueChange={setSelectedStaffId} disabled={isLoadingStaff || isPending}>
              <SelectTrigger className="h-14 px-5 rounded-[18px] border-2 border-slate-100 bg-slate-50/30 hover:border-blue-500/30 transition-all focus:ring-blue-500/10 font-bold">
                <SelectValue placeholder={isLoadingStaff ? "Syncing qualified agents..." : "Locate available personnel"} />
              </SelectTrigger>
              <SelectContent className="max-h-[300px] p-1.5 rounded-2xl shadow-3xl border-slate-100">
                {deliveryStaffs.length > 0 ? (
                  deliveryStaffs.map((staff) => (
                    <SelectItem
                      key={staff.staffId}
                      value={staff.staffId}
                      className="rounded-xl mb-1 last:mb-0 focus:bg-blue-50 cursor-pointer py-3"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 border border-slate-100 shadow-sm shrink-0">
                          <AvatarImage src={staff.avatarUrl} />
                          <AvatarFallback className="bg-slate-200 text-slate-500 text-[10px] font-black uppercase">
                            {staff.fullName ? staff.fullName.charAt(0) : 'A'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-slate-800 text-[11px] truncate tracking-tight">{staff.fullName}</span>
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest truncate">{staff.position || 'Logistics Pro'}</span>
                        </div>
                        {staff.status?.toLowerCase() === 'active' && (
                          <div className="ml-auto h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        )}
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-400">
                    <AlertCircle className="h-8 w-8 mx-auto mb-3 opacity-20" />
                    <p className="text-[10px] font-black uppercase tracking-widest leading-loose">No active delivery personnel found</p>
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          {selectedStaff && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-[24px] bg-slate-50/50 border border-slate-100 space-y-5 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-white shadow-lg ring-1 ring-slate-100 overflow-hidden">
                  <AvatarImage src={selectedStaff.avatarUrl} className="object-cover h-full w-full" />
                  <AvatarFallback className="bg-blue-600 text-white font-black text-xl">{selectedStaff.fullName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-black text-slate-900 tracking-tight text-lg">
                      {selectedStaff.fullName}
                    </h4>
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5 leading-none">
                    <MapPin className="h-3 w-3" /> {selectedStaff.address || 'Operation Verified'}
                  </p>
                </div>
              </div>
              <Separator className="bg-slate-200/60" />
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="h-3.5 w-3.5 text-blue-500" />
                  <span className="text-[10px] font-black tracking-[0.1em]">{selectedStaff.phoneNumber || 'PRIVATE'}</span>
                </div>
                <Badge variant="outline" className="bg-white border-slate-200 text-slate-900 font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-[10px] shadow-sm">
                  {selectedStaff.position || 'Operational'}
                </Badge>
              </div>
            </motion.div>
          )}
        </div>

        <DialogFooter className="p-8 bg-[#F8FAFC] border-t border-blue-50 flex sm:justify-between items-center gap-4">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isPending}
            className="text-slate-400 font-black uppercase text-[10px] tracking-[0.2em] hover:bg-slate-200/50 hover:text-slate-900 rounded-[15px] px-8 h-12 transition-all"
          >
            Abort
          </Button>
          <Button
            onClick={handleAction}
            disabled={!selectedStaffId || isPending || (isReassign && selectedStaffId === activeTask?.staffId)}
            className="flex-1 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold uppercase text-[11px] tracking-[0.1em] transition-all h-[42px] rounded-full shadow-md shadow-blue-500/20 active:scale-95 gap-2 border-[1.5px] border-white/10"
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : isReassign ? (
              <RefreshCw className="h-3.5 w-3.5" />
            ) : (
              <Truck className="h-3.5 w-3.5" />
            )}
            {isPending ? "Syncing..." : isReassign ? "Confirm Reassign" : "Confirm Dispatch"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
