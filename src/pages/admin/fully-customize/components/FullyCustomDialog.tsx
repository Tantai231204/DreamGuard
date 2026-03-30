import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect } from 'react';
import { toSlug } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Sparkles, Box, ShieldCheck, DollarSign, Package } from 'lucide-react';
import type {
  CreateFullyCustomizedProductRequest,
  UpdateFullyCustomizedProductRequest,
  FullyCustomizedProductResponse
} from '@/api/types';
import { cn } from '@/lib/utils';


const formSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  slug: z.string().min(2, 'Slug is required'),
  summary: z.string().min(5, 'Summary is required'),
  description: z.string().min(10, 'Description is required'),
  warrantyPolicyDay: z.coerce.number().min(0),
  returnPolicyDay: z.coerce.number().min(0),
  fullyCustomizedProductType: z.enum(['Mattresses', 'Pillows', 'Cribs']),
  sku: z.string().min(3, 'SKU is required'),
  basePrice: z.coerce.number().min(0),
  salePrice: z.coerce.number().min(0),
  weight: z.coerce.number().min(0),
});

type FormValues = z.infer<typeof formSchema>;

interface FullyCustomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateFullyCustomizedProductRequest | UpdateFullyCustomizedProductRequest) => Promise<void>;
  isSubmitting?: boolean;
  product?: FullyCustomizedProductResponse | null;
}

export function FullyCustomDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  product,
}: FullyCustomDialogProps) {
  const isEdit = !!product;

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      slug: '',
      summary: '',
      description: '',
      warrantyPolicyDay: 90,
      returnPolicyDay: 7,
      fullyCustomizedProductType: 'Pillows',
      sku: '',
      basePrice: 0,
      salePrice: 0,
      weight: 1,
    },
  });

  useEffect(() => {
    if (open && product) {
      // Robust type recovery for template management
      const normalizedType = (product.fullyCustomizedProductType && product.fullyCustomizedProductType !== 'None')
        ? product.fullyCustomizedProductType
        : 'Pillows';

      reset({
        name: product.name || '',
        slug: product.slug || '',
        summary: product.summary || '',
        description: product.description || '',
        warrantyPolicyDay: product.warrantyPolicyDay || 90,
        returnPolicyDay: product.returnPolicyDay || 7,
        fullyCustomizedProductType: normalizedType as 'Mattresses' | 'Pillows' | 'Cribs',
        sku: product.sku || '',
        basePrice: product.basePrice || 0,
        salePrice: product.salePrice || 0,
        weight: product.weight || 1,
      });
    } else if (open && !isEdit) {
      reset({
        name: '',
        slug: '',
        summary: '',
        description: '',
        warrantyPolicyDay: 90,
        returnPolicyDay: 7,
        fullyCustomizedProductType: 'Pillows',
        sku: '',
        basePrice: 0,
        salePrice: 0,
        weight: 1,
      });
    }
  }, [open, product, reset, isEdit]);

  const watchName = watch('name');

  useEffect(() => {
    if (watchName && open && !isEdit) {
      setValue('slug', toSlug(watchName), { shouldValidate: true });
    }
  }, [watchName, setValue, open, isEdit]);

  const onFormSubmit = async (values: FormValues) => {
    const payload = isEdit
      ? { ...values, id: product!.id } as UpdateFullyCustomizedProductRequest
      : values as CreateFullyCustomizedProductRequest;

    await onSubmit(payload);
    if (!isEdit) reset();
  };

  const formatNumber = (val: number | string) => {
    if (!val && val !== 0) return '';
    return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const parseNumber = (val: string) => {
    return Number(val.replace(/,/g, '')) || 0;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-[1.5rem] border-none">
        {/* Header Section */}
        <div className="bg-white px-6 pt-6 pb-5 border-b border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#4988c4] flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <DialogTitle className="text-xl font-bold text-gray-900 leading-none mb-1">
              {isEdit ? 'Update 3D Template' : 'New 3D Custom Product'}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-400 font-medium">
              {isEdit ? `Editing parameters for ${product?.name}` : 'Define master template for user-led 3D customization'}
            </DialogDescription>
          </div>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col max-h-[70vh]">
          {/* Form Content - Scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 no-scrollbar">

            {/* 1. Basic Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Box className="w-4 h-4 text-[#4988c4]" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#4988c4]/60">General Specifications</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[13px] font-semibold text-gray-700 ml-0.5">Product Name</Label>
                  <Input
                    placeholder="Premium Memory Foam Pillow"
                    {...register('name')}
                    className="h-10 rounded-xl border-gray-200 bg-white focus:ring-2 focus:ring-[#4988c4]/20 focus:border-[#4988c4] transition-all"
                  />
                  {errors.name && <p className="text-[10px] font-bold text-rose-500 mt-1 ml-0.5">{errors.name.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[13px] font-semibold text-gray-700 ml-0.5">Unique Slug</Label>
                  <Input
                    placeholder="premium-pillow"
                    {...register('slug')}
                    onBlur={(e) => {
                      setValue('slug', toSlug(e.target.value), { shouldValidate: true });
                    }}
                    className="h-10 rounded-xl border-gray-200 bg-white focus:ring-2 focus:ring-[#4988c4]/20 focus:border-[#4988c4] transition-all"
                  />
                  {errors.slug && <p className="text-[10px] font-bold text-rose-500 mt-1 ml-0.5">{errors.slug.message}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[13px] font-semibold text-gray-700 ml-0.5">Short Summary</Label>
                <Input
                  placeholder="The pinnacle of ergonomic sleep"
                  {...register('summary')}
                  className="h-10 rounded-xl border-gray-200 bg-white focus:ring-2 focus:ring-[#4988c4]/20 focus:border-[#4988c4] transition-all"
                />
                {errors.summary && <p className="text-[10px] font-bold text-rose-500 mt-1 ml-0.5">{errors.summary.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-[13px] font-semibold text-gray-700 ml-0.5">Full Description</Label>
                <Textarea
                  placeholder="Description..."
                  className="min-h-[100px] rounded-xl border-gray-200 bg-white focus:ring-2 focus:ring-[#4988c4]/20 focus:border-[#4988c4] transition-all py-2.5 font-medium text-sm"
                  {...register('description')}
                />
                {errors.description && <p className="text-[10px] font-bold text-rose-500 mt-1 ml-0.5">{errors.description.message}</p>}
              </div>
            </div>

            {/* 2. Technical Specs */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-4 h-4 text-[#4988c4]" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#4988c4]/60">3D Technical Details</span>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[13px] font-semibold text-gray-700 ml-0.5">Template Type</Label>
                  <Controller
                    name="fullyCustomizedProductType"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger className="h-10 rounded-xl border-gray-200 bg-white focus:ring-2 focus:ring-[#4988c4]/20">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="Pillows">Pillows</SelectItem>
                          <SelectItem value="Mattresses">Mattresses</SelectItem>
                          <SelectItem value="Cribs">Cribs</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.fullyCustomizedProductType && (
                    <p className="text-[10px] font-bold text-rose-500 mt-1 ml-0.5">{errors.fullyCustomizedProductType.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[13px] font-semibold text-gray-700 ml-0.5">Master SKU</Label>
                  <Input placeholder="PROD-001" {...register('sku')} className="h-10 rounded-xl border-gray-200 bg-white font-mono" />
                  {errors.sku && <p className="text-[10px] font-bold text-rose-500 mt-1 ml-0.5">{errors.sku.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[13px] font-semibold text-gray-700 ml-0.5">Weight (kg)</Label>
                  <Input
                    placeholder="1.5"
                    {...register('weight')}
                    className="h-10 rounded-xl border-gray-200 bg-white font-medium focus:ring-2 focus:ring-[#4988c4]/20"
                  />
                  {errors.weight && <p className="text-[10px] font-bold text-rose-500 mt-1 ml-0.5">{errors.weight.message}</p>}
                </div>
              </div>
            </div>

            {/* 3. Pricing & Policies */}
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-4 h-4 text-[#4988c4]" />
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#4988c4]/60">Monetary</span>
                </div>
                <div className="space-y-3 bg-gray-50 p-4 rounded-2xl border border-gray-100/50">
                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold uppercase tracking-tight text-gray-400">Base (VND)</Label>
                    <Controller
                      name="basePrice"
                      control={control}
                      render={({ field }) => (
                        <Input
                          placeholder="0"
                          value={formatNumber(field.value)}
                          onChange={(e) => field.onChange(parseNumber(e.target.value))}
                          className="h-9 rounded-lg border-gray-200 focus:ring-2 focus:ring-[#4988c4]/20 font-bold bg-white"
                        />
                      )}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold uppercase tracking-tight text-gray-400">Sale (VND)</Label>
                    <Controller
                      name="salePrice"
                      control={control}
                      render={({ field }) => (
                        <Input
                          placeholder="0"
                          value={formatNumber(field.value)}
                          onChange={(e) => field.onChange(parseNumber(e.target.value))}
                          className="h-9 rounded-lg border-gray-200 focus:ring-2 focus:ring-[#4988c4]/20 font-bold bg-white"
                        />
                      )}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck className="w-4 h-4 text-[#4988c4]" />
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#4988c4]/60">Customer Policies</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold uppercase text-gray-400">Warranty</Label>
                    <div className="relative">
                      <Input
                        placeholder="90"
                        {...register('warrantyPolicyDay')}
                        className="h-9 rounded-lg border-gray-200 pr-9 font-semibold bg-white focus:ring-2 focus:ring-[#4988c4]/20"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-bold text-gray-300">DAYS</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold uppercase text-gray-400">Returns</Label>
                    <div className="relative">
                      <Input
                        placeholder="7"
                        {...register('returnPolicyDay')}
                        className="h-9 rounded-lg border-gray-200 pr-9 font-semibold bg-white focus:ring-2 focus:ring-[#4988c4]/20"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-bold text-gray-300">DAYS</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <DialogFooter className="px-6 py-5 border-t border-gray-100 flex items-center justify-end gap-3 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-11 rounded-xl border-gray-200 hover:border-gray-300 hover:bg-gray-50 font-medium transition-all"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className={cn(
                "flex-1 h-11 rounded-xl bg-[#4988c4] hover:bg-[#3a6fa0] text-white gap-2 transition-all active:scale-95",
              )}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              {isSubmitting ? 'Processing...' : 'Create Template'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
