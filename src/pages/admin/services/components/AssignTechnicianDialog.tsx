import { useMemo } from 'react';
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
  MapPin,
  Phone,
  ShieldCheck,
  Loader2,
  AlertCircle,
  Briefcase
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import type { Staff } from '../types';

interface AssignTechnicianDialogProps {
  orderId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AssignTechnicianDialog({ orderId, isOpen, onClose }: AssignTechnicianDialogProps) {
  const {
    selectedStaffId,
    setSelectedStaffId,
    staffs: rawStaffs,
    isLoadingStaff,
    handleAssign,
    assignMutation,
  } = useAssignTechnicianDialog({ orderId, onClose });

  const staffs = rawStaffs as unknown as Staff[];

  const cleaningStaffs = useMemo(() => {
    return staffs.filter((s) => {
      const role = (s.role || '').toLowerCase();
      const pos = (s.position || '').toLowerCase();
      return role === 'cleaningstaff' || 
             pos === 'cleaningstaff' || 
             role.includes('clean') || 
             pos.includes('clean') ||
             role.includes('technician') ||
             role.includes('staff');
    });
  }, [staffs]);

  const selectedStaff = cleaningStaffs.find(s => s.staffId === selectedStaffId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border border-slate-200 shadow-2xl rounded-2xl gap-0">
        <DialogHeader className="p-8 pb-6 bg-slate-50 text-slate-900 border-b border-slate-100 relative">
          <div className="relative z-10 space-y-2">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-4 shadow-sm">
              <UserPlus className="h-6 w-6 text-white" />
            </div>
            <DialogTitle className="text-2xl font-black tracking-tight">Assign Technician</DialogTitle>
            <DialogDescription className="text-slate-500 font-medium leading-relaxed">
              Select an expert technician to handle this service request professionally.
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
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 border border-slate-100 shadow-sm shrink-0">
                          <AvatarImage src={staff.avatarUrl} />
                          <AvatarFallback className="bg-slate-200 text-slate-500 text-[10px] font-black uppercase">
                            {staff.fullName ? staff.fullName.charAt(0) : 'T'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-slate-800 text-sm truncate">{staff.fullName}</span>
                          <span className="text-[10px] text-slate-400 font-medium truncate">{staff.position || 'Expert Technician'}</span>
                        </div>
                        {staff.status === 'Active' && (
                          <div className="ml-auto h-2 w-2 rounded-full bg-emerald-500" />
                        )}
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
                <Avatar className="h-14 w-14 border-2 border-white shadow-sm ring-1 ring-slate-200">
                  <AvatarImage src={selectedStaff.avatarUrl} />
                  <AvatarFallback className="bg-slate-300 text-white font-black">{selectedStaff.fullName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4 className="font-black text-slate-800 flex items-center gap-1.5">
                    {selectedStaff.fullName}
                    <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                  </h4>
                  <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-slate-400" /> {selectedStaff.address || 'Location Verified'}
                  </p>
                </div>
              </div>
              <Separator className="bg-slate-200" />
              <div className="flex justify-between items-center text-xs">
                <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <Phone className="h-3 w-3 text-slate-400" /> {selectedStaff.phoneNumber || 'Contact Private'}
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
}
