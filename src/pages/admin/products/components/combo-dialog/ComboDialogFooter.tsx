/**
 * ComboDialogFooter — Footer bar with action buttons
 */

import { memo } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    Loader2
} from "lucide-react";
import type { ComboDialogMode } from "./index";

// ── Props ────────────────────────────────────────────────
interface ComboDialogFooterProps {
    mode: ComboDialogMode;
    isEdit: boolean;
    isLoading: boolean;
    isValid: boolean;
    onCancel: () => void;
}

// ── Component ────────────────────────────────────────────
const ComboDialogFooter = memo(function ComboDialogFooter({
    mode,
    isEdit,
    isLoading,
    isValid,
    onCancel,
}: ComboDialogFooterProps) {
    const modeLabel = mode === 'parent' ? 'Parent' : 'Variant';

    return (
        <div className="flex items-center gap-3 pt-5 border-t border-gray-100 shrink-0 mt-2">
            <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
                className="flex-1 h-11 rounded-xl border-gray-200 hover:border-gray-300 hover:bg-gray-50 font-medium transition-all"
            >
                Cancel
            </Button>
            <Button
                id="combo-submit"
                type="submit"
                form="combo-form"
                disabled={isLoading || !isValid}
                className={cn(
                    "flex-1 h-11 rounded-xl font-medium transition-all text-white",
                    "bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/10",
                    "disabled:opacity-50 disabled:shadow-none"
                )}
            >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? "Save Changes" : `Create ${modeLabel}`}
            </Button>
        </div>
    );
});

export default ComboDialogFooter;
