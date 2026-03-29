import { memo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { Tabs } from '@/components/ui/tabs';
import { useComboForm } from './useComboForm';
import ComboFormFields from './ComboFormFields';
import ComboDialogFooter from './ComboDialogFooter';
import ComboDialogHeader from './ComboDialogHeader';
import type { Combo } from '../../types';
import type { CreateComboRequest } from '@/api/services/comboService';
import type { ComboDialogMode } from './index';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ComboDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  combo: Combo | null;
  initialMode?: ComboDialogMode | null;
  defaultParentId?: string;
  onSubmit: (data: CreateComboRequest) => void | Promise<void>;
  isLoading?: boolean;
}

const ComboDialog = memo(({
  open,
  onOpenChange,
  combo,
  initialMode,
  defaultParentId,
  onSubmit,
  isLoading = false
}: ComboDialogProps) => {
  const isEdit = Boolean(combo);
  const [activeTab, setActiveTab] = useState("general");
  // Resolve mode: prioritize initialMode if set, else infer from combo data
  const activeMode = (initialMode || (combo?.comboParentId ? 'variant' : 'parent')) as ComboDialogMode;

  const {
    register,
    errors,
    isValid,
    isLoadingDetail,
    isLoadingVariants,
    comboParents,
    variantOptions,
    handleNameChange,
    setField,
    handleSubmit,
    watchValues,
    completionScore,
    parentPriceRange
  } = useComboForm({
    open,
    combo,
    mode: activeMode,
    defaultParentId,
    onSubmit
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        "rounded-[1.5rem] p-7 gap-0 outline-none flex flex-col overflow-hidden transition-all duration-500 h-[800px] max-h-[90vh]",
        activeMode === 'variant' ? "max-w-[1240px] w-[95vw]" : "max-w-[680px]"
      )}>
        <VisuallyHidden.Root>
          <DialogTitle>
            {isEdit ? 'Edit Combo' : 'New Combo'}
          </DialogTitle>
        </VisuallyHidden.Root>
        {isLoadingDetail ? (
          <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-primary-100 border-t-primary-500 animate-spin" />
              <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-primary-500 animate-pulse" />
            </div>
            <p className="text-sm font-bold text-slate-400 animate-pulse">Synchronizing Data...</p>
          </div>
        ) : (
          <div className="flex flex-col min-h-0 h-full flex-1">
            <ComboDialogHeader
              mode={activeMode}
              isEdit={isEdit}
              status={watchValues.status || 'Draft'}
              completionScore={completionScore}
            />

            <form
              id="combo-form"
              onSubmit={handleSubmit}
              className="flex-1 flex flex-col min-h-0"
            >
              <Tabs
                value={activeMode === 'variant' ? 'unified' : activeTab}
                onValueChange={setActiveTab}
                className="w-full mt-4 flex-1 flex flex-col min-h-0"
              >


                <div className="flex-1 py-1 no-scrollbar min-h-0 overflow-y-auto">
                  <ComboFormFields
                    register={register}
                    errors={errors}
                    comboParents={comboParents}
                    variantOptions={variantOptions}
                    handleNameChange={handleNameChange}
                    setField={setField}
                    isEdit={isEdit}
                    mode={activeMode}
                    isLoading={isLoading}
                    isLoadingVariants={isLoadingVariants}
                    watchValues={watchValues}
                    comboId={combo?.id}
                    parentPriceRange={parentPriceRange}
                  />
                </div>
              </Tabs>
            </form>

            <ComboDialogFooter
              mode={activeMode}
              isEdit={isEdit}
              isValid={isValid}
              isLoading={isLoading}
              onCancel={() => onOpenChange(false)}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
});

ComboDialog.displayName = 'ComboDialog';

export default ComboDialog;
