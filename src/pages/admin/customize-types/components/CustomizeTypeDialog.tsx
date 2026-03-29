// src/pages/admin/customize-types/components/CustomizeTypeDialog.tsx
import { useEffect, memo } from 'react';
import { useForm, type Resolver, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Tag, FileText, Sparkles, Calculator, AlertCircle, Layers, Box, Percent, Banknote } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { formatNumber, unformatNumber, cn } from '@/lib/utils';
import type { CustomizeType } from '../types';
import type { CustomizeCalculationMode, ApplicableProductType } from '@/api/types/customizeType.types';

const customizeTypeSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').trim(),
  summary: z.string().min(10, 'Summary must be at least 10 characters').trim(),
  defaultPrice: z.number().min(0, 'Price must be at least 0'),
  category: z.enum(["Other", "Size", "Color", "Pattern", "Material", "Embroidery"]),
  calculationMode: z.enum(["FixedAmount", "Multiplier"]),
  defaultMultiplier: z.number().min(0, 'Multiplier must be at least 0'),
  applicableProductType: z.enum(["None", "Mattresses", "Pillows", "Cribs"]),
  status: z.enum(["Active", "Inactive", "Archived"]).default('Active'),
});

export type CustomizeTypeFormValues = z.infer<typeof customizeTypeSchema>;

interface CustomizeTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customizeType: CustomizeType | null;
  onSubmit: (data: CustomizeTypeFormValues) => void;
  isLoading?: boolean;
}

const FieldError = ({ error }: { error?: { message?: string } }) => {
    if (!error) return null;
    return (
        <p className="text-[10px] text-rose-500 font-bold mt-1.5 animate-in fade-in slide-in-from-top-1 flex items-center gap-1 px-1">
            <AlertCircle className="h-3 w-3" />
            {error.message}
        </p>
    );
};

const CustomizeTypeDialog = memo(function CustomizeTypeDialog({
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
    control,
    formState: { errors }
  } = useForm<CustomizeTypeFormValues>({
    resolver: zodResolver(customizeTypeSchema) as Resolver<CustomizeTypeFormValues>,
    defaultValues: {
      name: '',
      summary: '',
      defaultPrice: 0,
      category: 'Other',
      calculationMode: 'FixedAmount',
      defaultMultiplier: 1.0,
      applicableProductType: 'None',
      status: 'Active',
    },
  });

  const status = useWatch({ control, name: 'status' });
  const calculationMode = useWatch({ control, name: 'calculationMode' });
  const category = useWatch({ control, name: 'category' });

  // Logic: Multiplier is ONLY allowed for Material category
  useEffect(() => {
    if (category !== 'Material' && calculationMode === 'Multiplier') {
      setValue('calculationMode', 'FixedAmount');
    }
  }, [category, calculationMode, setValue]);

  useEffect(() => {
    if (customizeType && open) {
      reset({
        name: customizeType.name,
        summary: customizeType.summary,
        defaultPrice: customizeType.defaultPrice,
        category: (customizeType.category as CustomizeTypeFormValues['category']) || 'Other',
        calculationMode: (customizeType.calculationMode as CustomizeCalculationMode) || 'FixedAmount',
        defaultMultiplier: customizeType.defaultMultiplier || 1.0,
        applicableProductType: (customizeType.applicableProductType as ApplicableProductType) || 'None',
        status: customizeType.status,
      });
    } else if (!open) {
      reset({
        name: '',
        summary: '',
        defaultPrice: 0,
        category: 'Other',
        calculationMode: 'FixedAmount',
        defaultMultiplier: 1.0,
        applicableProductType: 'None',
        status: 'Active',
      });
    }
  }, [customizeType, open, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] p-0 border-0 rounded-[2rem] overflow-hidden shadow-2xl bg-white">
        <DialogHeader className="p-8 pb-5 border-b border-gray-100 bg-slate-50/30 flex-row gap-4 items-center space-y-0 relative">
          <div className="w-12 h-12 rounded-2xl bg-[#4988c4] flex items-center justify-center shadow-sm shrink-0 z-10">
            <Tag className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0 z-10">
            <DialogTitle className="text-xl font-bold text-gray-900 leading-none mb-1">
              {isEdit ? 'Update Classification' : 'New Classification'}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-400 font-medium">
               Configure advanced customization parameters
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} id="customize-type-form">
          <div className="px-8 py-7 space-y-8 max-h-[65vh] overflow-y-auto custom-scrollbar">
            {/* --- IDENTITY SECTION --- */}
            <section className="space-y-6">
              <div>
                  <Label className="text-[10px] uppercase tracking-[0.15em] font-black text-slate-400 flex items-center gap-1.5 mb-2.5 px-1">
                      <Sparkles className="h-3.5 w-3.5 text-blue-400" /> IDENTITY & SCOPE
                  </Label>
                  <div className="h-px w-full bg-slate-100" />
              </div>

              <div className="grid grid-cols-1 gap-y-6">
                <div className="space-y-2.5">
                  <Label htmlFor="name" className="text-[10px] uppercase tracking-wider font-bold text-slate-400 flex items-center gap-2 ml-1">
                      <Tag className="h-3.5 w-3.5" /> CLASSIFICATION NAME <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="e.g. Master Embossing"
                    {...register('name')}
                    disabled={isLoading}
                    className="h-12 rounded-xl border-slate-200 bg-slate-50/30 px-4 text-[14px] font-semibold tracking-tight shadow-sm focus:bg-white focus:border-[#4988c4] transition-all"
                    autoFocus
                  />
                  <FieldError error={errors.name} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2.5">
                    <Label className="text-[10px] uppercase tracking-wider font-bold text-slate-400 flex items-center gap-2 ml-1">
                        <Layers className="h-3.5 w-3.5" /> CATEGORY
                    </Label>
                    <Controller
                      name="category"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                          <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-slate-50/30 px-3.5 text-[13px] font-bold text-slate-700 shadow-sm hover:bg-white transition-all">
                            <SelectValue placeholder="Category" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-slate-100 shadow-2xl">
                             {["Other", "Size", "Color", "Pattern", "Material", "Embroidery"].map(cat => (
                              <SelectItem key={cat} value={cat} className="rounded-lg py-2 font-bold text-[13px]">{cat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="space-y-2.5 text-right sm:text-left">
                    <Label className="text-[10px] uppercase tracking-wider font-bold text-slate-400 flex items-center gap-2 ml-1">
                        <Box className="h-3.5 w-3.5" /> TARGET TYPE
                    </Label>
                    <Controller
                      name="applicableProductType"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                          <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-slate-50/30 px-3.5 text-[13px] font-bold text-indigo-700 shadow-sm hover:bg-white transition-all">
                            <SelectValue placeholder="Target" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-slate-100 shadow-2xl">
                            {["None", "Mattresses", "Pillows", "Cribs"].map(type => (
                              <SelectItem key={type} value={type} className="rounded-lg py-2 font-bold text-[13px]">{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* --- LOGIC SECTION --- */}
            <section className="space-y-6">
              <div>
                  <Label className="text-[10px] uppercase tracking-[0.15em] font-black text-slate-400 flex items-center gap-1.5 mb-2.5 px-1">
                      <Calculator className="h-3.5 w-3.5 text-indigo-400" /> PRICING STRUCTURE
                  </Label>
                  <div className="h-px w-full bg-slate-100" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2.5">
                  <Label className="text-[10px] uppercase tracking-wider font-bold text-slate-400 flex items-center gap-2 ml-1">
                      <Calculator className="h-3 w-3" /> LOGIC MODE
                  </Label>
                  <Controller
                    name="calculationMode"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                        <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-slate-50/20 px-3.5 text-[13px] font-bold text-slate-700 shadow-sm hover:bg-white transition-all">
                          <SelectValue placeholder="Logic" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-100 shadow-2xl">
                          <SelectItem value="FixedAmount" className="rounded-lg py-2 font-bold text-[13px]">Fixed Amount</SelectItem>
                          <SelectItem 
                            value="Multiplier" 
                            className="rounded-lg py-2 font-bold text-[13px]"
                            disabled={category !== 'Material'}
                          >
                            Multiplier {category !== 'Material' && '(Materials Only)'}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                {calculationMode === 'FixedAmount' ? (
                  <div className="space-y-2.5 animate-in fade-in slide-in-from-left-2 duration-400">
                    <Label className="text-[10px] uppercase tracking-wider font-bold text-slate-400 flex items-center gap-2 ml-1">
                        <Banknote className="h-3.5 w-3.5" /> AMOUNT
                    </Label>
                    <Controller
                      name="defaultPrice"
                      control={control}
                      render={({ field }) => (
                        <div className="relative">
                           <Input
                            type="text"
                            inputMode="numeric"
                            value={formatNumber(field.value)}
                            onChange={(e) => field.onChange(unformatNumber(e.target.value))}
                            disabled={isLoading}
                            className="h-12 rounded-xl border-slate-200 bg-white pl-11 font-black text-slate-900 focus:border-[#4988c4] transition-all shadow-sm text-[15px]"
                          />
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-300 pointer-events-none">₫</span>
                        </div>
                      )}
                    />
                  </div>
                ) : (
                  <div className="space-y-2.5 animate-in fade-in slide-in-from-right-2 duration-400">
                    <Label className="text-[10px] uppercase tracking-wider font-bold text-slate-400 flex items-center gap-2 ml-1">
                        <Percent className="h-3.5 w-3.5" /> FACTOR
                    </Label>
                    <Controller
                      name="defaultMultiplier"
                      control={control}
                      render={({ field }) => (
                        <div className="relative">
                          <Input
                            type="number"
                            step="0.1"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            disabled={isLoading}
                            className="h-12 rounded-xl border-sky-100 bg-sky-50/20 pl-11 font-black text-sky-700 shadow-sm text-[15px]"
                          />
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-sky-300 pointer-events-none">x</span>
                        </div>
                      )}
                    />
                  </div>
                )}
              </div>
            </section>

            {/* --- SUMMARY SECTION --- */}
            <section className="space-y-6 pt-2">
              <div className="space-y-2.5">
                  <Label htmlFor="summary" className="text-[10px] uppercase tracking-wider font-bold text-slate-400 flex items-center gap-2 ml-1">
                      <FileText className="h-3.5 w-3.5" /> BRIEF DESCRIPTION <span className="text-rose-500">*</span>
                  </Label>
                  <Textarea
                    id="summary"
                    {...register('summary')}
                    placeholder="Briefly explain the intent..."
                    disabled={isLoading}
                    rows={3}
                    className="min-h-[100px] rounded-xl border-slate-200 bg-slate-50/30 p-4 text-[14px] leading-relaxed font-medium text-slate-600 shadow-sm focus:bg-white focus:border-[#4988c4] transition-all"
                  />
                  <FieldError error={errors.summary} />
              </div>

              {/* Status Switch */}
              <div className="flex items-center justify-between p-4.5 rounded-2xl bg-slate-50/80 border border-slate-100 shadow-sm hover:bg-white transition-all cursor-pointer">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-2 h-2 rounded-full ${status === 'Active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]' : 'bg-slate-300'}`} />
                    <span className="text-[11px] font-black text-slate-700 uppercase tracking-widest">
                      Status: <span className={status === 'Active' ? 'text-emerald-600' : 'text-slate-400'}>{status}</span>
                    </span>
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 pl-4.5 uppercase tracking-tighter leading-none">Internal visibility toggle</p>
                </div>
                <Switch
                  checked={status === 'Active'}
                  onCheckedChange={(checked) => setValue('status', checked ? 'Active' : 'Inactive')}
                  disabled={isLoading}
                  className="data-[state=checked]:bg-emerald-500"
                />
              </div>
            </section>
          </div>

          <DialogFooter className="px-8 py-5 border-t border-gray-100 flex items-center gap-3 bg-slate-50/10">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="flex-1 h-11 rounded-xl border-gray-200 hover:border-gray-300 hover:bg-gray-50 font-bold text-slate-500 transition-all text-sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className={cn(
                  'flex-1 h-11 rounded-xl font-bold transition-all text-white text-[13px] tracking-tight',
                  'bg-[#4988c4]',
                  'hover:bg-[#3a6fa0]',
                  'shadow-sm',
                  'disabled:opacity-50 disabled:shadow-none',
              )}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {isEdit ? 'Save Changes' : 'Create Type'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
});

export default CustomizeTypeDialog;
