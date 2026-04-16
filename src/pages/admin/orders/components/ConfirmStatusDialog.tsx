import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ShieldCheck, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading?: boolean;
  title: string;
  description: string;
  confirmText?: string;
  variant?: 'primary' | 'success' | 'warning';
}

export function ConfirmStatusDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
  title,
  description,
  confirmText = "Proceed",
  variant = 'primary'
}: ConfirmStatusDialogProps) {

  const variantStyles = {
    primary: {
      bg: "bg-blue-50",
      border: "border-blue-100",
      text: "text-blue-600",
      iconBg: "bg-blue-500",
      button: "bg-blue-600 hover:bg-blue-700",
      accent: "border-blue-500"
    },
    success: {
      bg: "bg-emerald-50",
      border: "border-emerald-100",
      text: "text-emerald-600",
      iconBg: "bg-emerald-600",
      button: "bg-emerald-600 hover:bg-emerald-700",
      accent: "border-emerald-500"
    },
    warning: {
      bg: "bg-amber-50",
      border: "border-amber-100",
      text: "text-amber-600",
      iconBg: "bg-amber-500",
      button: "bg-amber-500 hover:bg-amber-600",
      accent: "border-amber-500"
    }
  }[variant];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden border border-slate-200 rounded-3xl shadow-xl">
        <div className="bg-white p-6 space-y-6">
          <DialogHeader className="space-y-3 text-left">
            <div className="flex items-center gap-3">
              <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center border", variantStyles.bg, variantStyles.border)}>
                <ShieldCheck className={cn("h-5 w-5", variantStyles.text)} />
              </div>
              <div>
                <DialogTitle className="text-lg font-black text-slate-900 uppercase tracking-tight">
                  {title}
                </DialogTitle>
                <DialogDescription className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Administrative Workflow Confirmation
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-5">
            <div className={cn("bg-white border-l-4 p-4 flex items-start gap-3 shadow-sm transition-all", variantStyles.accent)}>
              <AlertCircle className={cn("h-5 w-5 shrink-0 mt-0.5", variantStyles.text)} />
              <div className="space-y-1">
                <p className={cn("text-[10px] font-black uppercase tracking-widest", variantStyles.text)}>Action Required</p>
                <p className="text-[12px] text-slate-600 font-medium leading-relaxed">
                  {description}
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="bg-slate-50/50 p-6 border-t border-slate-100 flex flex-row items-center justify-end gap-3">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 hover:bg-transparent"
          >
            Go Back
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className={cn("text-white font-black text-[10px] uppercase tracking-widest px-8 h-12 rounded-xl transition-all active:scale-95 disabled:opacity-50 !border-0", variantStyles.button)}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Processing...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> {confirmText}
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
