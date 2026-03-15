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

        <AlertDialogFooter className="bg-gray-50/70 px-6 py-4 flex gap-3 sm:space-x-0">
          <AlertDialogCancel asChild>
            <Button
              variant="outline"
              disabled={isDeleting}
              className="flex-1 h-11 rounded-xl font-semibold text-gray-500 bg-white hover:bg-gray-100 border-gray-200 transition-colors"
            >
              Cancel
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              onClick={(e) => {
                e.preventDefault(); // prevent closing on loading
                onConfirm();
              }}
              disabled={isDeleting}
              className="flex-1 h-11 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition-all shadow-md shadow-red-500/10 gap-2"
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
