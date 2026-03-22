import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
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
  const [newRole, setNewRole] = useState<string>(currentRole);
  const { mutate: updateRole, isPending } = useUpdateStaffRole();
  const { success } = useToast();

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
      <DialogContent className="sm:max-w-md rounded-2xl border-2 border-slate-100 shadow-xl">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-blue-600" />
            Change Staff Role
          </DialogTitle>
        </DialogHeader>

        <div className="py-6 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">
              Select New System Role
            </Label>
            <Select onValueChange={setNewRole} value={newRole || currentRole}>
              <SelectTrigger className="h-11 rounded-xl bg-white border-slate-200 focus:bg-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium shadow-sm">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent className="rounded-xl shadow-xl border-slate-100">
                <SelectItem value="Manager" className="rounded-lg font-medium cursor-pointer">Manager</SelectItem>
                <SelectItem value="Seller" className="rounded-lg font-medium cursor-pointer">Seller</SelectItem>
                <SelectItem value="CleaningStaff" className="rounded-lg font-medium cursor-pointer">Cleaning Staff</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-end gap-2 border-t pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className="rounded-xl border-slate-200 font-semibold shadow-sm text-slate-700 hover:bg-slate-50 transition-all text-xs"
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdate}
            disabled={isPending || newRole === currentRole}
            className="rounded-xl bg-blue-600 hover:bg-blue-700 font-semibold shadow-sm text-white transition-all text-xs gap-1.5"
          >
            {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Confirm Change
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
