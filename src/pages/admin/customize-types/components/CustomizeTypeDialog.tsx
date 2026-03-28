// src/pages/admin/customize-types/components/CustomizeTypeDialog.tsx
import { useEffect } from 'react';
import { useForm, type Resolver, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Tag, FileText, Banknote, Power, Sparkles } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { formatNumber, unformatNumber } from '@/lib/utils';
import type { CustomizeType } from '../types';

const customizeTypeSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').trim(),
  summary: z.string().min(10, 'Summary must be at least 10 characters').trim(),
  defaultPrice: z.number().min(0, 'Price must be at least 0'),
  status: z.string().default('Active'),
});

export type CustomizeTypeFormValues = z.infer<typeof customizeTypeSchema>;

interface CustomizeTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customizeType: CustomizeType | null;
  onSubmit: (data: CustomizeTypeFormValues) => void;
  isLoading?: boolean;
}

export default function CustomizeTypeDialog({
  open,
  onOpenChange,
  customizeType,
  onSubmit,
  isLoading = false,
}: CustomizeTypeDialogProps) {
  const isEdit = !!customizeType;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors }
  } = useForm<CustomizeTypeFormValues>({
    resolver: zodResolver(customizeTypeSchema) as Resolver<CustomizeTypeFormValues>,
    defaultValues: {
      name: '',
      summary: '',
      defaultPrice: 0,
      status: 'Active',
    },
  });

  const status = watch('status');

  useEffect(() => {
    if (customizeType && open) {
      reset({
        name: customizeType.name,
        summary: customizeType.summary,
        defaultPrice: customizeType.defaultPrice,
        status: customizeType.status,
      });
    } else if (!open) {
      reset({
        name: '',
        summary: '',
        defaultPrice: 0,
        status: 'Active',
      });
    }
  }, [customizeType, open, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 border-0 rounded-[1.75rem] overflow-hidden shadow-2xl bg-white sm:rounded-[2rem]">
        <DialogHeader className="p-8 pb-4 border-b border-gray-100 bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#4988c4] flex items-center justify-center shadow-lg shadow-blue-500/10">
              <Tag className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">
                {isEdit ? 'Update Classification' : 'New Classification'}
              </DialogTitle>
              <DialogDescription className="text-sm font-medium text-gray-500 mt-1">
                {isEdit
                  ? 'Refine the parameters of this customize option'
                  : 'Define a new standardized customization type'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="px-8 py-6 space-y-6">
          <div className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Tag className="w-4 h-4 text-slate-400" />
                Classification Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g. Master Embossing"
                {...register('name')}
                disabled={isLoading}
                className="h-12 rounded-xl bg-gray-50/50 border-gray-100 focus:bg-white focus:border-[#4988c4] focus:ring-4 focus:ring-[#4988c4]/10 transition-all font-semibold"
                autoFocus
              />
              {errors.name && (
                <p className="text-[11px] text-rose-500 font-bold ml-1">{errors.name.message}</p>
              )}
            </div>

            {/* Summary */}
            <div className="space-y-2">
              <Label htmlFor="summary" className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400" />
                Descriptive Summary <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="summary"
                placeholder="Briefly explain the purpose and constraints..."
                {...register('summary')}
                disabled={isLoading}
                className="rounded-xl bg-gray-50/50 border-gray-100 focus:bg-white focus:border-[#4988c4] focus:ring-4 focus:ring-[#4988c4]/10 min-h-[100px] resize-none transition-all font-medium py-3"
              />
              {errors.summary && (
                <p className="text-[11px] text-rose-500 font-bold ml-1">{errors.summary.message}</p>
              )}
            </div>

            {/* Price (Formatted) */}
            <div className="space-y-2">
              <Label htmlFor="defaultPrice" className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Banknote className="w-4 h-4 text-slate-400" />
                Base Amount <span className="text-red-500">*</span>
              </Label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-[10px] text-slate-400 uppercase tracking-widest border-r pr-3 border-slate-200 group-focus-within:text-blue-500 group-focus-within:border-blue-200 transition-colors">
                  VNĐ
                </div>
                <Controller
                  name="defaultPrice"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="defaultPrice"
                      type="text"
                      inputMode="numeric"
                      value={formatNumber(field.value)}
                      onChange={(e) => {
                        const raw = unformatNumber(e.target.value);
                        field.onChange(raw);
                      }}
                      disabled={isLoading}
                      className="pl-16 h-12 rounded-xl bg-gray-50/50 border-gray-100 focus:bg-white focus:border-[#4988c4] focus:ring-4 focus:ring-[#4988c4]/10 transition-all font-bold text-slate-800"
                    />
                  )}
                />
              </div>
              {errors.defaultPrice && (
                <p className="text-[11px] text-rose-500 font-bold ml-1">{errors.defaultPrice.message}</p>
              )}
            </div>

            {/* Status Switch */}
            <div className="rounded-[1.25rem] border-2 border-slate-50 bg-slate-50/30 p-5 transition-all hover:bg-white hover:border-slate-100 shadow-inner-sm">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-bold text-slate-800 flex items-center gap-2 cursor-pointer">
                    <Power className={`w-4 h-4 ${status === 'Active' ? 'text-emerald-500' : 'text-slate-400'}`} />
                    Active Classification
                  </Label>
                  <p className="text-[11px] font-medium text-slate-400">
                    {status === 'Active' ? 'Currently visible and selectable' : 'Hidden from project use'}
                  </p>
                </div>
                <Switch
                  checked={status === 'Active'}
                  onCheckedChange={(checked) => setValue('status', checked ? 'Active' : 'Inactive')}
                  disabled={isLoading}
                  className="data-[state=checked]:bg-emerald-500"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-6 border-t border-gray-100 flex sm:justify-between items-center gap-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="px-6 h-12 rounded-xl font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all"
            >
              Discard
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 h-12 rounded-xl bg-[#4988c4] hover:bg-[#3a6fa0] text-white font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all text-xs uppercase tracking-widest"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              {isEdit ? 'Commit Update' : 'Initialize Type'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
