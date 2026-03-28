import { memo, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useWatch, type Control, type FieldErrors, type UseFormRegister, type UseFormSetValue } from 'react-hook-form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Loader2,
    Package,
    RefreshCw,
    Sparkles,
    Info,
    LayoutGrid,
    ShieldCheck,
    DollarSign,
    Weight,
    Ruler,
    Move3D,
    AlertCircle,
    type LucideIcon
} from 'lucide-react';
import { VARIANT_STATUS_OPTIONS, PRODUCT_STATUS_COLORS, type VariantStatus } from '../../types';
import ColorPicker from './ColorPicker';
import SectionHeading from '../shared/SectionHeading';
import type { VariantSubmitData } from './VariantDialog';
import { useVariantForm, type ExtendedProductVariant } from './useVariantForm';
import { AdminStatusBadge } from '@/components/admin';
import VariantCustomization from './VariantCustomization';
import { type VariantFormValues } from './variantSchema';

/* ─── Senior Optimization: Reusable Layout Components ─── */
const INPUT_CLS = 'h-11 rounded-xl border-gray-200 bg-gray-50/50 hover:border-[#4988c4]/60 hover:bg-white focus:border-[#4988c4] focus:ring-2 focus:ring-[#4988c4]/20 transition-all';
const TAB_TRIGGER_CLS = 'flex-1 h-11 rounded-lg data-[state=active]:bg-[#4988c4] data-[state=active]:text-white data-[state=active]:shadow-sm text-xs font-bold gap-2 transition-colors';

const FieldGroup = memo(({ label, children, icon: Icon, highlight = false }: { label: string; children: ReactNode; icon: LucideIcon; highlight?: boolean }) => (
    <div className="space-y-2.5">
        <div className="flex items-center gap-2 px-1">
            <Icon className={cn("w-3.5 h-3.5", highlight ? "text-[#4988c4]" : "text-slate-400")} />
            <Label className="text-[11px] font-black uppercase text-slate-500 tracking-wider">{label}</Label>
        </div>
        {children}
    </div>
));

FieldGroup.displayName = 'FieldGroup';

const ErrorMsg = memo(({ error }: { error?: { message?: string } }) => {
    if (!error) return null;
    return (
        <p className="text-[10px] text-red-500 font-bold mt-1.5 animate-in fade-in slide-in-from-top-1 duration-200 flex items-center gap-1 px-1">
            <AlertCircle className="h-3 w-3" />
            {error.message}
        </p>
    );
});

ErrorMsg.displayName = 'ErrorMsg';

/* ─── Optimized Sub-Sections for Performance ─── */

const LogisticsSection = memo(({
    control,
    register,
    errors,
    isEdit,
    handleRegenerateSku,
    setValue
}: {
    control: Control<VariantFormValues>;
    register: UseFormRegister<VariantFormValues>;
    errors: FieldErrors<VariantFormValues>;
    isEdit: boolean;
    handleRegenerateSku: () => void;
    setValue: UseFormSetValue<VariantFormValues>;
}) => {
    const status = useWatch({ control, name: 'status' });

    return (
        <section className="space-y-5">
            <SectionHeading title="Identity & Pricing" />

            <div className="grid grid-cols-2 gap-5">
                <FieldGroup label="SKU Code" icon={Package}>
                    <div className="relative">
                        <Input
                            {...register('sku')}
                            className={cn(INPUT_CLS, 'font-mono uppercase', errors.sku && "border-red-400 focus:ring-red-100")}
                            placeholder="AUTO-GENERATED"
                        />
                        {!isEdit && (
                            <Button type="button" variant="ghost" size="icon" onClick={handleRegenerateSku} className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-slate-300 hover:text-blue-500 transition-colors">
                                <RefreshCw className="w-3.5 h-3.5" />
                            </Button>
                        )}
                    </div>
                    <ErrorMsg error={errors.sku} />
                </FieldGroup>

                <FieldGroup label="Market Visibility" icon={RefreshCw}>
                    {!isEdit ? (
                        <div className="flex items-center gap-2.5 px-4 h-11 rounded-xl bg-amber-50 border border-amber-200/60 transition-all">
                            <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                            <span className="text-xs font-bold text-amber-700">Defaults to <span className="border-b border-amber-400">Draft</span></span>
                            <AdminStatusBadge status="New" type="warning" className="ml-auto bg-white scale-90" />
                        </div>
                    ) : (
                        <Select
                            value={status}
                            onValueChange={(val) => setValue('status', val as VariantStatus, { shouldValidate: true })}
                        >
                            <SelectTrigger className={cn(INPUT_CLS, "font-bold text-slate-700", errors.status && "border-red-400")}>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl shadow-xl">
                                {VARIANT_STATUS_OPTIONS.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value} className="rounded-lg py-2.5">
                                        <span className="flex items-center gap-2 font-bold text-slate-700">
                                            <span className={cn('h-2 w-2 rounded-full', PRODUCT_STATUS_COLORS[opt.value as VariantStatus])} />
                                            {opt.label}
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                    <ErrorMsg error={errors.status} />
                </FieldGroup>
            </div>

            <div className="grid grid-cols-2 gap-5">
                <FieldGroup label="Base Price" icon={DollarSign}>
                    <div className="relative">
                        <Input
                            type="number"
                            {...register('basePrice', { valueAsNumber: true })}
                            className={cn(INPUT_CLS, 'pr-12 font-bold text-slate-900', errors.basePrice && "border-red-400")}
                            placeholder="0"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase">VND</span>
                    </div>
                    <ErrorMsg error={errors.basePrice} />
                </FieldGroup>

                <FieldGroup label="Sale Price" icon={DollarSign} highlight>
                    <div className="relative">
                        <Input
                            type="number"
                            {...register('salePrice', { valueAsNumber: true })}
                            className={cn(INPUT_CLS, 'pr-12 font-bold text-blue-600', errors.salePrice && "border-red-400")}
                            placeholder="0"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-blue-300 uppercase underline decoration-blue-200">OFFER</span>
                    </div>
                    <ErrorMsg error={errors.salePrice} />
                </FieldGroup>
            </div>
        </section>
    );
});
LogisticsSection.displayName = 'LogisticsSection';

const AttributesSection = memo(({
    register,
    errors,
    isCustomSize,
    isCustomColor,
    colorName,
    colorHex,
    handleColorChange,
    isLoading
}: {
    register: UseFormRegister<VariantFormValues>;
    errors: FieldErrors<VariantFormValues>;
    isCustomSize: boolean;
    isCustomColor: boolean;
    colorName: string;
    colorHex: string;
    handleColorChange: (name: string, hex: string) => void;
    isLoading: boolean;
}) => {
    return (
        <section className="space-y-6">
            <SectionHeading title="Dynamic Specifications" />
            <div className="grid grid-cols-2 gap-5">
                <FieldGroup label="Item Weight" icon={Weight}>
                    <div className="relative">
                        <Input
                            type="number"
                            {...register('weight', { valueAsNumber: true })}
                            className={cn(INPUT_CLS, 'pr-14 font-bold', errors.weight && "border-red-400", isCustomSize && "bg-slate-50 text-slate-400 opacity-60 border-dashed cursor-not-allowed")}
                            placeholder="0"
                            disabled={isLoading || isCustomSize}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300">KG</span>
                    </div>
                    <ErrorMsg error={errors.weight} />
                </FieldGroup>

                <FieldGroup label="Stock Level" icon={Package}>
                    <Input
                        type="number"
                        {...register('stockQuantity', { valueAsNumber: true })}
                        className={cn(INPUT_CLS, 'font-bold text-slate-900', errors.stockQuantity && "border-red-400")}
                        placeholder="0"
                        disabled={isLoading}
                    />
                    <ErrorMsg error={errors.stockQuantity} />
                </FieldGroup>
            </div>

            <section className="space-y-4">
                <div className="flex items-center gap-2">
                    <Ruler className="w-4 h-4 text-slate-400" />
                    <Label className="text-[11px] font-black uppercase text-slate-500 tracking-wider">Physical Dimensions</Label>
                </div>
                {isCustomSize ? (
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-blue-50/40 border border-blue-100/60 animate-in zoom-in-95 duration-300 shadow-sm shadow-blue-50/50">
                        <div className="w-10 h-10 rounded-xl bg-white border border-blue-100 flex items-center justify-center text-blue-500 shadow-sm shrink-0">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[11px] font-black text-blue-900 uppercase tracking-widest leading-none mb-1">Custom Sizing Active</span>
                            <span className="text-[10px] font-bold text-blue-600/80 leading-tight">Dimensions sễ được khách hàng sác định.</span>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-3 gap-3">
                        <div className="relative">
                            <Input {...register('width', { valueAsNumber: true })} type="number" className={INPUT_CLS} placeholder="W" />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-300">W</span>
                        </div>
                        <div className="relative">
                            <Input {...register('length', { valueAsNumber: true })} type="number" className={INPUT_CLS} placeholder="L" />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-300">L</span>
                        </div>
                        <div className="relative">
                            <Input {...register('thickness', { valueAsNumber: true })} type="number" className={INPUT_CLS} placeholder="T" />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-300">T</span>
                        </div>
                    </div>
                )}
            </section>

            <section className="space-y-4">
                <div className="flex items-center gap-2">
                    <Move3D className="w-4 h-4 text-slate-400" />
                    <Label className="text-[11px] font-black uppercase text-slate-500 tracking-wider">Aesthetic Configuration</Label>
                </div>
                <div className="p-1.5 rounded-2xl border border-gray-100 bg-white shadow-sm">
                    {!isCustomColor ? (
                        <div className="flex flex-col gap-4 p-4">
                            <ColorPicker
                                color={colorName}
                                colorCode={colorHex}
                                onColorChange={handleColorChange}
                                disabled={isLoading}
                            />
                            <div className="flex items-center gap-3 pt-3 border-t border-gray-50">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Scheme:</span>
                                <Badge variant="outline" className="text-[10px] font-bold bg-slate-50 border-gray-100 py-1 px-3 rounded-full">
                                    {colorName || 'Default Palette'}
                                </Badge>
                                <div className="h-4 w-4 rounded-full border border-gray-200 shadow-sm" style={{ backgroundColor: colorHex || '#fff' }} />
                            </div>
                        </div>
                    ) : (
                        <div className="p-6 bg-blue-50/30 border border-blue-100/30 rounded-xl flex items-start gap-4 animate-in slide-in-from-right-4 duration-500">
                            <Sparkles className="h-6 w-6 text-blue-400 shrink-0" />
                            <div className="space-y-1.5">
                                <h3 className="text-xs font-black text-blue-900 uppercase">Custom Tinting Enabled</h3>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-medium text-blue-600 leading-relaxed italic">The baseline aesthetic is locked.</span>
                                    <span className="text-[9px] font-bold text-blue-500">Color selection is now client-driven.</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <ErrorMsg error={errors.colorName} />
            </section>
        </section>
    );
});

AttributesSection.displayName = 'AttributesSection';

interface VariantDialogFormProps {
    variant?: ExtendedProductVariant | null;
    productId: string;
    productName: string;
    productSlug?: string;
    variantCount?: number;
    onSubmit: (data: VariantSubmitData) => void;
    onOpenChange: (open: boolean) => void;
    isLoading?: boolean;
}

const VariantDialogForm = memo(({
    variant,
    productId,
    productName,
    productSlug = '',
    variantCount = 0,
    onSubmit,
    onOpenChange,
    isLoading = false,
}: VariantDialogFormProps) => {
    const isEditInitial = !!variant;

    const {
        form,
        register,
        errors,
        handleRegenerateSku,
        handleColorChange,
        handleSubmit,
        isValid,
        isCustomColor,
        isCustomSize,
        isFullCustomBlocked,
        existingFullCustomSku,
        isEdit,
        isCustomizable,
        colorName,
        colorHex
    } = useVariantForm({
        variant: variant || null,
        productId,
        productSlug,
        variantCount,
        onSubmit,
        isEdit: isEditInitial
    });

    return (
        <div className="flex flex-col h-full bg-white relative">
            <div className="flex items-center gap-4 pb-5 border-b border-gray-100 shrink-0">
                <div className="w-12 h-12 rounded-2xl bg-[#4988c4] flex items-center justify-center shadow-lg shadow-blue-100 shrink-0">
                    <Package className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold text-gray-900 leading-none mb-1">
                        {isEdit ? 'Update Variant' : 'New Creation'}
                    </h2>
                    <p className="text-sm text-gray-400 font-medium truncate">
                        {isEdit ? `SKU: ${variant?.sku || variant?.id}` : `Initializing for ${productName}`}
                    </p>
                </div>
            </div>

            <form
                id="variant-form"
                onSubmit={handleSubmit}
                className="flex-1 overflow-y-auto px-1 py-5 min-h-0 no-scrollbar"
            >
                <Tabs defaultValue="core" className="w-full">
                    <TabsList className="grid grid-cols-3 w-full h-12 bg-gray-100/50 p-1 rounded-xl border border-gray-200/50">
                        <TabsTrigger value="core" className={TAB_TRIGGER_CLS}><Info className="h-4 w-4" /> Logistics</TabsTrigger>
                        <TabsTrigger value="config" className={TAB_TRIGGER_CLS}><ShieldCheck className="h-4 w-4" /> Configuration</TabsTrigger>
                        <TabsTrigger value="specs" className={TAB_TRIGGER_CLS}><LayoutGrid className="h-4 w-4" /> Attributes</TabsTrigger>
                    </TabsList>

                    <div className="mt-6 animate-in fade-in-50 duration-300">
                        <TabsContent value="core" className="mt-0 outline-none border-none shadow-none bg-transparent focus-visible:ring-0">
                            <LogisticsSection
                                control={form.control}
                                register={register}
                                errors={errors}
                                isEdit={isEdit}
                                handleRegenerateSku={handleRegenerateSku}
                                setValue={form.setValue}
                            />
                        </TabsContent>

                        <TabsContent value="config" className="mt-0 space-y-6 outline-none border-none shadow-none bg-transparent focus-visible:ring-0">
                            <div className="p-6 bg-blue-50/20 border border-blue-100/30 rounded-3xl space-y-6 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-[#4988c4] flex items-center justify-center text-white shadow-lg shadow-blue-100"><Sparkles className="w-6 h-6" /></div>
                                        <div className="flex flex-col">
                                            <Label className="text-base font-black text-slate-800">Customization Mode</Label>
                                            <p className="text-xs text-slate-400 font-medium tracking-tight">Allow customers to request variations based on this product.</p>
                                        </div>
                                    </div>
                                    <Switch checked={!!isCustomizable} onCheckedChange={(v: boolean) => form.setValue('isCustomizable', v)} className="data-[state=checked]:bg-[#4988c4]" />
                                </div>

                                {isCustomizable && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-400">
                                        {isFullCustomBlocked && (
                                            <div className="flex items-start gap-4 p-5 bg-rose-50 border border-rose-100 rounded-[2rem] shadow-sm animate-in zoom-in-95 duration-500">
                                                <div className="w-12 h-12 rounded-2xl bg-white border border-rose-200 flex items-center justify-center text-rose-500 shadow-sm shrink-0">
                                                    <Sparkles className="w-6 h-6 animate-pulse" />
                                                </div>
                                                <div className="flex-1 space-y-1.5 pt-0.5">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="text-[11px] font-black text-rose-900 uppercase tracking-widest leading-none">Configuration Blocked</h4>
                                                        <span className="px-2 py-0.5 rounded-full bg-rose-500 text-[8px] font-black text-white uppercase tracking-tighter shadow-sm">Policy Error</span>
                                                    </div>
                                                    <p className="text-[10px] text-rose-600/90 font-medium leading-relaxed">
                                                        Only <span className="font-black text-rose-900">one</span> "Full Custom" SKU is permitted per product catalog.
                                                        Conflict detected with existing variant: <span className="font-black text-rose-900 underline underline-offset-4 decoration-rose-300">{existingFullCustomSku}</span>.
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            <Label className="text-[11px] font-black uppercase text-blue-500 tracking-widest px-1">Customer Instruction</Label>
                                            <Input
                                                placeholder="e.g. 'Enter your custom size or color preference...'"
                                                {...register('customizeLabel')}
                                                className={cn(INPUT_CLS, "h-11 border-blue-100 focus:ring-blue-50 shadow-sm", errors.customizeLabel && "border-red-400")}
                                            />
                                            <ErrorMsg error={errors.customizeLabel} />
                                        </div>

                                        <div className="space-y-3 pt-2">
                                            <Label className="text-[11px] font-black uppercase text-slate-400 tracking-widest px-1">Allowed Variation Types</Label>
                                            <VariantCustomization
                                                variantId={variant?.id}
                                                pendingCustomizations={variant?.pendingCustoms || []}
                                                onPendingChange={() => {/* Manual handling if needed */ }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="specs" className="mt-0 outline-none border-none shadow-none bg-transparent focus-visible:ring-0">
                            <AttributesSection
                                register={register}
                                errors={errors}
                                isCustomSize={isCustomSize}
                                isCustomColor={isCustomColor}
                                colorName={colorName || ''}
                                colorHex={colorHex || ''}
                                handleColorChange={handleColorChange}
                                isLoading={isLoading}
                            />
                        </TabsContent>
                    </div>
                </Tabs>
            </form>

            <div className="flex items-center justify-end gap-3 pt-5 border-t border-gray-100 mt-auto shrink-0 bg-white">
                <Button
                    variant="outline"
                    type="button"
                    onClick={() => onOpenChange(false)}
                    className="flex-1 h-11 border-gray-200 text-slate-500 font-bold rounded-xl hover:bg-slate-50 hover:text-slate-800 transition-all border-dashed"
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    form="variant-form"
                    disabled={isLoading || !isValid}
                    className="flex-1 h-11 bg-[#4988c4] hover:bg-[#3a6fa0] text-white font-bold rounded-xl shadow-lg shadow-blue-100 transition-all active:scale-95 disabled:opacity-50 border-none"
                >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isEdit ? 'Save Changes' : 'Initialize Variant'}
                </Button>
            </div>
        </div>
    );
});

VariantDialogForm.displayName = 'VariantDialogForm';

export default VariantDialogForm;
