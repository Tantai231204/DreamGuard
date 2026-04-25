import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Loader2 } from "lucide-react";
import { useUpdateStaffRole } from "@/hooks/queries/useStaff";
import { useToast } from "@/hooks/useToast";

interface ChangeRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staffId: string;
  currentRole: string;
}

export function ChangeRoleDialog({ open, onOpenChange, staffId, currentRole }: ChangeRoleDialogProps) {
  const [prevOpen, setPrevOpen] = useState(open);
  const [newRole, setNewRole] = useState<string>(currentRole);
  const { mutate: updateRole, isPending } = useUpdateStaffRole();
  const { success } = useToast();

  // Modern React pattern: Adjust state during render when a key prop changes
  // This avoids the "cascading renders" error from useEffect
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setNewRole(currentRole || "");
    }
  }

  const handleUpdate = () => {
    if (!newRole) return;
    updateRole(
      { id: staffId, newRole },
      {
        onSuccess: () => {
          success("Success", "Staff role updated successfully.");
          onOpenChange(false);
        }
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md w-full p-0 gap-0 border-none shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] bg-gray-50 max-h-[85vh] flex flex-col overflow-hidden rounded-2xl">
        <div className="flex flex-col px-6 pt-6 pb-4 bg-white border-b border-gray-100/80 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 shadow-sm flex-shrink-0">
              <ShieldCheck className="h-4.5 w-4.5 text-[var(--color-primary)]" />
            </div>
            <div>
              <DialogTitle className="text-lg font-black text-gray-900 tracking-tight">
                Change Staff Role
              </DialogTitle>
              <p className="text-[10px] text-gray-500 font-bold mt-0.5">
                Update access and security privileges.
              </p>
            </div>
          </div>
        </div>

        <div className="px-8 py-6 space-y-6 bg-white">
          <div className="space-y-4">
            <Label className="text-xs font-black uppercase tracking-widest text-slate-400">
              Select New System Role
            </Label>
            <Select onValueChange={setNewRole} value={newRole || currentRole}>
              <SelectTrigger className="h-14 px-4 rounded-xl border-2 border-slate-100 bg-white hover:border-primary transition-all focus:ring-primary/10">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent className="rounded-xl shadow-xl border-slate-100 p-1.5 max-h-[400px] overflow-y-auto">
                <SelectItem value="Manager" className="rounded-lg font-medium cursor-pointer py-2.5 focus:bg-slate-50 mb-1">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary-50 shadow-sm flex-shrink-0">
                      <div className="w-4 h-4 bg-primary-600" style={{
                        maskImage: "url(/images/manager.svg)",
                        maskSize: "contain",
                        WebkitMaskImage: "url(/images/manager.svg)",
                        WebkitMaskSize: "contain"
                      }} />
                    </div>
                    <span className="font-bold text-slate-800 text-sm">Manager</span>
                  </div>
                </SelectItem>

                <SelectItem value="Seller" className="rounded-lg font-medium cursor-pointer py-2.5 focus:bg-slate-50 mb-1">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-emerald-50 shadow-sm flex-shrink-0">
                      <div className="w-4 h-4 bg-emerald-600" style={{
                        maskImage: "url(/images/seller.svg)",
                        maskSize: "contain",
                        WebkitMaskImage: "url(/images/seller.svg)",
                        WebkitMaskSize: "contain"
                      }} />
                    </div>
                    <span className="font-bold text-slate-800 text-sm">Seller</span>
                  </div>
                </SelectItem>

                <SelectItem value="CleaningStaff" className="rounded-lg font-medium cursor-pointer py-2.5 focus:bg-slate-50">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-amber-50 shadow-sm flex-shrink-0">
                      <div className="w-4 h-4 bg-amber-500" style={{
                        maskImage: "url(/images/cleanning-staff.svg)",
                        maskSize: "contain",
                        WebkitMaskImage: "url(/images/cleanning-staff.svg)",
                        WebkitMaskSize: "contain"
                      }} />
                    </div>
                    <span className="font-bold text-slate-800 text-sm">Cleaning Staff</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="p-8 bg-slate-50 border-t border-slate-100 flex sm:justify-between items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className="text-slate-400 font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 hover:text-slate-800 rounded-xl px-6 h-12"
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdate}
            disabled={isPending || newRole === currentRole}
            className="flex-1 bg-primary hover:bg-primary-hover text-white font-black uppercase text-[10px] tracking-widest transition-all h-12 rounded-xl shadow-md active:scale-95 border-0 gap-1.5"
          >
            {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Confirm Change
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
