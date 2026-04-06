import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useEffect, useMemo, memo, useState } from 'react';
import { toSlug, cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import variantService from '@/api/services/variantService';
import productService from '@/api/services/productService';
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
  CreateFullyCustomizedProductRequest as CreateTemplateRequest,
  UpdateFullyCustomizedProductRequest as UpdateTemplateRequest,
  FullyCustomizedProductResponse as TemplateResponse
} from '@/api/types';
import { formSchema } from './formSchema';


type FormValues = z.infer<typeof formSchema>;

interface TemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateTemplateRequest | UpdateTemplateRequest) => Promise<void>;
  isSubmitting?: boolean;
  product?: TemplateResponse | null;
  takenCustomTypes?: string[];
}

export const TemplateDialog = memo(function TemplateDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  product,
  takenCustomTypes = [],
}: TemplateDialogProps) {
  const isEdit = !!product;
  const [activeTab, setActiveTab] = useState("general");

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

  // 1. Fetch variant details for pricing/SKU mapping
  const { data: variants, isLoading: isLoadingVariants } = useQuery({
    queryKey: ['product-variants', product?.id],
    queryFn: () => variantService.getByProductId(product!.id),
    enabled: !!product && open,
  });

  // 2. Fetch full product details for summary/description mapping (often missing in lists)
  const { data: fullProduct, isLoading: isLoadingProduct } = useQuery({
    queryKey: ['product-detail', product?.id],
    queryFn: () => productService.getById(product!.id),
    enabled: !!product && open,
  });

  const mainVariant = variants?.[0];
  const isLoadingDetails = isLoadingVariants || isLoadingProduct;

  const normalizedType = useMemo(() => {
    if (!product) return 'Pillows';
    return (product.fullyCustomizedProductType && product.fullyCustomizedProductType !== 'None')
      ? product.fullyCustomizedProductType
      : 'Pillows';
  }, [product]);

  useEffect(() => {
    if (open && product) {
      reset({
        name: fullProduct?.name ?? product.name ?? '',
        slug: fullProduct?.slug ?? product.slug ?? '',
        summary: fullProduct?.summary ?? product.summary ?? '',
        description: fullProduct?.description ?? product.description ?? '',
        warrantyPolicyDay: fullProduct?.warrantyPolicyDay ?? product.warrantyPolicyDay ?? 90,
        returnPolicyDay: fullProduct?.returnPolicyDay ?? product.returnPolicyDay ?? 7,
        fullyCustomizedProductType: normalizedType as 'Mattresses' | 'Pillows' | 'Cribs',
        sku: mainVariant?.sku ?? product.sku ?? '',
        basePrice: mainVariant?.basePrice ?? product.basePrice ?? 0,
        salePrice: mainVariant?.salePrice ?? product.salePrice ?? 0,
        weight: mainVariant?.weight ?? product.weight ?? 1,
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
  }, [open, product, fullProduct, mainVariant, reset, isEdit, normalizedType]);

  const watchName = watch('name');

  useEffect(() => {
    if (watchName && open && !isEdit) {
      setValue('slug', toSlug(watchName), { shouldValidate: true });
    }
  }, [watchName, setValue, open, isEdit]);

  const onFormSubmit = async (values: FormValues) => {
    const payload = isEdit
      ? { ...values, id: product!.id } as UpdateTemplateRequest
      : values as CreateTemplateRequest;

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
        <div className="bg-white px-6 pt-6 pb-2 border-b border-gray-100/50">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-[#4988c4] flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl font-bold text-gray-900 leading-none mb-1">
                {isEdit ? 'Update Product Template' : 'New Product Template'}
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-400 font-medium">
                {isEdit ? `Editing parameters for ${product?.name}` : 'Define master template for user-led customization'}
              </DialogDescription>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="relative grid grid-cols-3 w-full h-11 bg-slate-100/40 p-1.5 rounded-2xl border border-slate-200/40 gap-1 shrink-0 overflow-hidden mb-2">
              <div className="absolute inset-y-1.5 left-1.5 right-1.5 grid grid-cols-3 pointer-events-none">
                {['general', 'specs', 'pricing'].map((tab) => (
                  <div key={tab} className="relative flex items-center justify-center">
                    {activeTab === tab && (
                      <motion.div
                        layoutId="template-active-tab"
                        className="absolute inset-0 bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-slate-200/20"
                        initial={false}
                        transition={{ type: "spring", bounce: 0.1, duration: 0.4 }}
                      />
                    )}
                  </div>
                ))}
              </div>

              {[
                { id: 'general', label: 'General', icon: Box },
                { id: 'specs', label: 'Specs', icon: Package },
                { id: 'pricing', label: 'Pricing', icon: DollarSign }
              ].map(({ id, label, icon: Icon }) => (
                <TabsTrigger
                  key={id}
                  value={id}
                  className={cn(
                    "relative z-10 rounded-xl text-[11px] font-bold gap-2 transition-all duration-300",
                    "data-[state=active]:text-[#4988c4] text-slate-400 hover:text-slate-600",
                    "flex items-center justify-center outline-none h-full"
                  )}
                >
                  <Icon className={cn("h-3.5 w-3.5", activeTab === id ? "scale-110" : "scale-100")} />
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col max-h-[70vh]">
          <Tabs value={activeTab} className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="flex-1 overflow-y-auto px-6 py-5 no-scrollbar min-h-[400px]">
              <TabsContent value="general" className="mt-0 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Box className="w-4 h-4 text-[#4988c4]" />
                    <span className="text-[11px] font-bold uppercase tracking-widest text-[#4988c4]/60">
                      General Information {isLoadingDetails && " (Fetching...)"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[13px] font-semibold text-gray-700">Product Name</Label>
                      <Input {...register('name')} className="rounded-xl border-gray-200" />
                      {errors.name && <p className="text-[10px] font-bold text-rose-500 mt-1">{errors.name.message}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[13px] font-semibold text-gray-700">Slug</Label>
                      <Input {...register('slug')} className="rounded-xl border-gray-200" />
                      {errors.slug && <p className="text-[10px] font-bold text-rose-500 mt-1">{errors.slug.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-semibold text-gray-700">Summary</Label>
                    <Input {...register('summary')} className="rounded-xl border-gray-200" />
                    {errors.summary && <p className="text-[10px] font-bold text-rose-500 mt-1">{errors.summary.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[13px] font-semibold text-gray-700">Description</Label>
                    <Textarea className="min-h-[120px] rounded-xl border-gray-200" {...register('description')} />
                    {errors.description && <p className="text-[10px] font-bold text-rose-500 mt-1">{errors.description.message}</p>}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="specs" className="mt-0 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="w-4 h-4 text-[#4988c4]" />
                    <span className="text-[11px] font-bold uppercase tracking-widest text-[#4988c4]/60">Technical Specs</span>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[13px] font-semibold text-gray-700">Customization Category</Label>
                      <Controller
                        name="fullyCustomizedProductType"
                        control={control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="rounded-xl border-gray-200"><SelectValue /></SelectTrigger>
                            <SelectContent className="rounded-xl">
                              {['Mattresses', 'Pillows', 'Cribs'].map(t => (
                                <SelectItem key={t} value={t} disabled={takenCustomTypes.includes(t) && product?.fullyCustomizedProductType !== t}>{t}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div className="space-y-1.5">
                        <Label className="text-[13px] font-semibold text-gray-700">SKU Pattern</Label>
                        <Input {...register('sku')} className="rounded-xl border-gray-200 font-mono" />
                        {errors.sku && <p className="text-[10px] font-bold text-rose-500 mt-1">{errors.sku.message}</p>}
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[13px] font-semibold text-gray-700">Base Weight (kg)</Label>
                        <Input {...register('weight')} className="rounded-xl border-gray-200" />
                        {errors.weight && <p className="text-[10px] font-bold text-rose-500 mt-1">{errors.weight.message}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="pricing" className="mt-0 space-y-6">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="w-4 h-4 text-[#4988c4]" />
                      <span className="text-[11px] font-bold uppercase tracking-widest text-[#4988c4]/60">Pricing Structure</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-bold uppercase text-slate-400">Fixed Base Price</Label>
                        <Controller
                          name="basePrice"
                          control={control}
                          render={({ field }) => (
                            <Input value={formatNumber(field.value)} onChange={(e) => field.onChange(parseNumber(e.target.value))} className="h-10 rounded-xl font-bold bg-white border-slate-200" />
                          )}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-bold uppercase text-slate-400">Promo Sale Price</Label>
                        <Controller
                          name="salePrice"
                          control={control}
                          render={({ field }) => (
                            <Input value={formatNumber(field.value)} onChange={(e) => field.onChange(parseNumber(e.target.value))} className="h-10 rounded-xl font-bold bg-white border-slate-200" />
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-1">
                      <ShieldCheck className="w-4 h-4 text-[#4988c4]" />
                      <span className="text-[11px] font-bold uppercase tracking-widest text-[#4988c4]/60">Default Policies</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-bold uppercase text-slate-400 ml-1">Warranty Days</Label>
                        <Input {...register('warrantyPolicyDay')} className="rounded-xl border-slate-200" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[11px] font-bold uppercase text-slate-400 ml-1">Return Window</Label>
                        <Input {...register('returnPolicyDay')} className="rounded-xl border-slate-200" />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>

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
});
