import { memo } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface DialogFooterProps {
    isEdit: boolean;
    isLoading: boolean;
    isValid: boolean;
    onCancel: () => void;
}

const DialogFooter = memo(function DialogFooter({ isEdit, isLoading, isValid, onCancel }: DialogFooterProps) {
    return (
        <div className="flex items-center gap-3 pt-5 border-t border-gray-100">
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
                type="submit"
                form="product-form"
                disabled={isLoading || !isValid}
                className={cn(
                    'flex-1 h-11 rounded-xl font-medium transition-all text-white',
                    'bg-[#4988c4]',
                    'hover:bg-[#3a6fa0]',
                    'shadow-sm',
                    'disabled:opacity-50 disabled:shadow-none',
                )}
            >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? 'Save Changes' : 'Create Product'}
            </Button>
        </div>
    );
});

export default DialogFooter;
