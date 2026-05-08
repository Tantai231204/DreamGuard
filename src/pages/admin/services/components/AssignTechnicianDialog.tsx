import { memo } from 'react';
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
import { useAssignTechnicianDialog } from '../hooks/useAssignTechnicianDialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  UserPlus,
  Loader2,
  AlertCircle,
  Briefcase
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import type { Staff } from '../types';
import { cn } from '@/lib/utils';

interface AssignTechnicianDialogProps {
  orderId: string | null;
  isOpen: boolean;
  isRescheduled?: boolean;
  onClose: () => void;
}

const formatLabel = (value?: string, fallback = 'Technician') => {
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

export const AssignTechnicianDialog = memo(function AssignTechnicianDialog({ orderId, isOpen, isRescheduled, onClose }: AssignTechnicianDialogProps) {
  const {
    selectedStaffId,
    setSelectedStaffId,
    staffs: rawStaffs,
    isLoadingStaff,
    handleAssign,
    assignMutation,
  } = useAssignTechnicianDialog({ orderId, isRescheduled, onClose });

  const staffs = rawStaffs as unknown as Staff[];
  const cleaningStaffs = staffs;
  const selectedStaff = cleaningStaffs.find(s => s.staffId === selectedStaffId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border border-slate-200 shadow-2xl rounded-2xl gap-0">
        <DialogHeader className="p-8 pb-6 bg-slate-50 text-slate-900 border-b border-slate-100 relative">
          <div className="relative z-10 space-y-2">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-4 shadow-sm">
              <UserPlus className="h-6 w-6 text-white" />
            </div>
            <DialogTitle className="text-2xl font-black tracking-tight">Dispatch New Task</DialogTitle>
            <DialogDescription className="text-slate-500 font-medium leading-relaxed">
              Initialize a fresh execution record and assign personnel to begin service.
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

            <Select value={selectedStaffId} onValueChange={setSelectedStaffId} disabled={isLoadingStaff || assignMutation.isPending}>
              <SelectTrigger className="h-14 px-4 rounded-xl border-2 border-slate-100 bg-white hover:border-primary transition-all focus:ring-primary/10">
                <SelectValue placeholder={isLoadingStaff ? "Syncing qualified staff..." : "Browse technicians"} />
              </SelectTrigger>
              <SelectContent className="max-h-[300px] p-1.5 rounded-xl">
                {cleaningStaffs.length > 0 ? (
                  cleaningStaffs.map((staff: Staff) => (
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
                              {staff.fullName ? staff.fullName.charAt(0) : 'T'}
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
                              <span className="truncate">{formatLabel(staff.position || staff.role, 'Technician')}</span>
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
                    <p className="text-xs font-bold font-sans">No technicians available</p>
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
                <Avatar className="h-14 w-14 border-2 border-white shadow-sm ring-1 ring-slate-200 overflow-hidden bg-white">
                  <AvatarImage 
                    src={selectedStaff.avatarUrl || '/images/logo_no_name.svg'} 
                    className={cn("object-cover", !selectedStaff.avatarUrl && "scale-75")}
                  />
                  <AvatarFallback className="bg-slate-300 text-white font-black">{selectedStaff.fullName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4 className="font-black text-slate-800 truncate">{selectedStaff.fullName}</h4>
                  <p className="text-xs text-slate-500 font-medium">
                    {formatLabel(selectedStaff.position || selectedStaff.role, 'Technician')}
                  </p>
                  <p className="text-xs text-slate-500 font-medium truncate">{selectedStaff.address || 'Location Verified'}</p>
                </div>
              </div>
              <Separator className="bg-slate-200" />
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600 font-medium truncate">
                  {selectedStaff.phoneNumber || 'Contact Private'}
                </span>
                <Badge variant="outline" className="bg-white border-slate-200 text-slate-600 font-bold px-2 rounded-md">
                  {selectedStaff.position || 'Ready to Assign'}
                </Badge>
              </div>
            </motion.div>
          )}
        </div>

        <DialogFooter className="p-8 bg-slate-50 border-t border-slate-100 flex sm:justify-between items-center gap-4">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={assignMutation.isPending}
            className="text-slate-400 font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 hover:text-slate-800 rounded-xl px-6 h-12"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!selectedStaffId || assignMutation.isPending}
            className="flex-1 bg-primary hover:bg-primary-hover text-white font-black uppercase text-[10px] tracking-widest transition-all h-12 rounded-xl shadow-md active:scale-95 border-0"
          >
            {assignMutation.isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Finalizing...
              </span>
            ) : (
              'Confirm Assignment'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});
