import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../../components/ui/alert-dialog";
import { Button } from "../../../../components/ui/button";
import { Trash2 } from "lucide-react";

interface AddressDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export function AddressDeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  isDeleting = false,
}: AddressDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-3xl border-0 shadow-2xl max-w-sm p-0 overflow-hidden">
        <div className="p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
            <Trash2 className="h-6 w-6 text-red-500" />
          </div>
          <AlertDialogHeader className="space-y-2">
            <AlertDialogTitle className="text-xl font-bold text-gray-900">
              Delete Address?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-500 max-w-xs mx-auto leading-relaxed">
              Are you sure you want to remove this shipping address? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>

        <AlertDialogFooter className="bg-gray-50/50 px-6 py-4 flex items-center gap-3 sm:gap-3">
          <AlertDialogCancel asChild>
            <Button
              variant="ghost"
              disabled={isDeleting}
              className="flex-1 h-12 rounded-2xl font-bold text-gray-500 hover:bg-gray-100/80 transition-all border-none focus-visible:ring-0 focus-visible:ring-offset-0"
            >
              Cancel
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              onClick={(e) => {
                e.preventDefault();
                onConfirm();
              }}
              disabled={isDeleting}
              className="flex-1 h-12 rounded-2xl bg-[#ff4d4d] hover:bg-[#ff3333] text-white font-black transition-all shadow-lg shadow-red-500/20 gap-2 border-none ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 outline-none"
            >
              {isDeleting ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : null}
              <span>Delete</span>
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
