import { memo } from 'react';
import { cn, formatNumber, unformatNumber } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
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
    Move3D
} from 'lucide-react';
import type { ProductVariant, VariantStatus } from '../../types';
import { VARIANT_STATUS_OPTIONS, PRODUCT_STATUS_COLORS } from '../../types';
import ColorPicker from './ColorPicker';
import SectionHeading from '../shared/SectionHeading';
import type { VariantSubmitData } from './VariantDialog';
import { useVariantForm } from './useVariantForm';
import { type VariantFormState } from './variantFormReducer';
import { AdminStatusBadge } from '@/components/admin';

/* ─── Senior Optimization: Reusable Layout Components ─── */
const INPUT_CLS = 'h-11 rounded-xl border-gray-200 bg-gray-50/50 hover:border-[#4988c4]/60 hover:bg-white focus:border-[#4988c4] focus:ring-2 focus:ring-[#4988c4]/20 transition-all';
const TAB_TRIGGER_CLS = 'flex-1 h-11 rounded-lg data-[state=active]:bg-[#4988c4] data-[state=active]:text-white data-[state=active]:shadow-sm text-xs font-bold gap-2 transition-colors';

const FieldGroup = memo(({
    label,
    children,
    required,
    highlight,
    icon: Icon
}: {
    label: string;
    children: React.ReactNode;
    required?: boolean;
    highlight?: boolean;
    icon?: React.ElementType
}) => (
    <div className="space-y-2">
        <Label className={cn("text-sm font-medium flex items-center gap-1.5", highlight ? "text-[#4988c4]" : "text-gray-700")}>
            {Icon && <Icon className="h-3.5 w-3.5 text-gray-400" />}
            {label} {required && <span className="text-red-500">*</span>}
        </Label>
        {children}
    </div>
));

FieldGroup.displayName = 'FieldGroup';

interface VariantDialogFormProps {
    variant?: ProductVariant | null;
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
    const isEdit = !!variant;

    const {
        state,
        setField,
        handleRegenerateSku,
        handleColorChange,
        handleSubmit,
        isValid
    } = useVariantForm({
        variant: variant || null,
        productId,
        productSlug,
        variantCount,
        onSubmit,
        isEdit
    });

    return (
        <div className="flex flex-col h-full bg-white relative">
            <div className="flex items-center gap-4 pb-5 border-b border-gray-100 shrink-0">
                <div className="w-12 h-12 rounded-2xl bg-[#4988c4] flex items-center justify-center shadow-sm shrink-0">
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
                    <TabsList className="grid grid-cols-2 w-full h-12 bg-gray-100/50 p-1 rounded-xl border border-gray-200/50">
                        <TabsTrigger value="core" className={TAB_TRIGGER_CLS}><Info className="h-4 w-4" /> Logistics</TabsTrigger>
                        <TabsTrigger value="specs" className={TAB_TRIGGER_CLS}><LayoutGrid className="h-4 w-4" /> Attributes</TabsTrigger>
                    </TabsList>

                    <div className="mt-6 space-y-6 animate-in fade-in-50 duration-300">
                        <TabsContent value="core" className="mt-0 space-y-8 outline-none">
                            <section className="space-y-5">
                                <SectionHeading title="General Logistics" />

                                <div className="grid grid-cols-2 gap-5">
                                    <FieldGroup label="SKU Code" icon={Package}>
                                        <div className="relative">
                                            <Input
                                                value={state.sku}
                                                onChange={(e) => setField('sku', e.target.value)}
                                                className={cn(INPUT_CLS, 'font-mono uppercase')}
                                                placeholder="AUTO-GENERATED"
                                            />
                                            {!isEdit && (
                                                <Button type="button" variant="ghost" size="icon" onClick={handleRegenerateSku} className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-slate-300 hover:text-blue-500">
                                                    <RefreshCw className="w-3.5 h-3.5" />
                                                </Button>
                                            )}
                                        </div>
                                    </FieldGroup>

                                    <FieldGroup label="Market Visibility" icon={RefreshCw}>
                                        {!isEdit ? (
                                            <div className="flex items-center gap-2.5 px-4 h-11 rounded-xl bg-amber-50 border border-amber-200/60 transition-all">
                                                <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                                                <span className="text-xs font-bold text-amber-700">Defaults to <span className="border-b border-amber-400">Draft</span></span>
                                                <AdminStatusBadge status="New" type="warning" className="ml-auto bg-white scale-90" />
                                            </div>
                                        ) : (
                                            <Select value={state.status} onValueChange={(val) => setField('status', val as VariantStatus)}>
                                                <SelectTrigger className={cn(INPUT_CLS, "font-bold text-slate-700")}>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl shadow-xl">
                                                    {VARIANT_STATUS_OPTIONS.map(opt => (
                                                        <SelectItem key={opt.value} value={opt.value} className="rounded-lg py-2.5">
                                                            <span className="flex items-center gap-2 font-bold text-slate-700">
                                                                <span className={cn('h-2 w-2 rounded-full', PRODUCT_STATUS_COLORS[opt.value])} />
                                                                {opt.label}
                                                            </span>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    </FieldGroup>
                                </div>

                                <div className="grid grid-cols-2 gap-5">
                                    <FieldGroup label="Standard Price" icon={DollarSign}>
                                        <div className="relative">
                                            <Input
                                                value={formatNumber(state.basePrice)}
                                                onChange={(e) => setField('basePrice', unformatNumber(e.target.value).toString())}
                                                className={cn(INPUT_CLS, 'pr-12 font-bold text-slate-900')}
                                                placeholder="0"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase">VND</span>
                                        </div>
                                    </FieldGroup>

                                    <FieldGroup label="Launch Price" highlight icon={Sparkles}>
                                        <div className="relative">
                                            <Input
                                                value={formatNumber(state.salePrice)}
                                                onChange={(e) => setField('salePrice', unformatNumber(e.target.value).toString())}
                                                className={cn(INPUT_CLS, 'pr-12 border-[#4988c4]/20 text-[#4988c4] font-bold bg-[#4988c4]/5')}
                                                placeholder="Optional"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-[#4988c4]/40 uppercase pointer-events-none">VND</span>
                                        </div>
                                    </FieldGroup>
                                </div>
                            </section>

                            <section className="pt-6 border-t border-gray-100 flex flex-col gap-5">
                                <div className="flex items-center justify-between p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                                            <Sparkles className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <Label className="text-sm font-bold text-slate-800 tracking-tight">Cấu hình tùy chỉnh (Bán lẻ)</Label>
                                            <p className="text-[11px] text-slate-500 font-medium">Bật thuộc tính nảy cho khách hàng.</p>
                                        </div>
                                    </div>
                                    <Switch 
                                        checked={state.isCustomizable} 
                                        onCheckedChange={(v: boolean) => setField('isCustomizable', v)} 
                                        className="data-[state=checked]:bg-[var(--color-primary)]"
                                    />
                                </div>

                                {state.isCustomizable && (
                                    <FieldGroup label="Nhãn chỉ dẫn (Customize Label)" highlight>
                                        <Input
                                            placeholder="VD: 'Nhập kích thước nệm của bạn...'"
                                            value={state.customizeLabel}
                                            onChange={(e) => setField('customizeLabel', e.target.value)}
                                            className={cn(INPUT_CLS, "h-11 border-blue-100/50 bg-white font-medium")}
                                        />
                                    </FieldGroup>
                                )}
                            </section>

                            <div className="flex items-center justify-between p-4 bg-blue-50/40 rounded-2xl border border-blue-100/50 shadow-sm transition-all hover:bg-white group">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white border border-blue-100 flex items-center justify-center text-[#4988c4] shadow-sm transform transition-transform group-hover:scale-105">
                                        <Sparkles className="w-5 h-5" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <Label htmlFor="isNew" className="text-sm font-bold text-slate-800">Seasonal New Arrival</Label>
                                        <p className="text-[11px] text-slate-400 font-medium">Flag this variant with a "NEW" badge.</p>
                                    </div>
                                </div>
                                <Switch id="isNew" checked={state.isNew} onCheckedChange={(v: boolean) => setField('isNew', v)} className="data-[state=checked]:bg-[#4988c4]" />
                            </div>
                        </TabsContent>

                        <TabsContent value="specs" className="mt-0 space-y-8 outline-none">
                            <section className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-1 h-6 bg-[var(--color-primary)] rounded-full" />
                                    <SectionHeading title="Product Physical Spec" />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-x-8 gap-y-6 bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
                                    <FieldGroup label="Base Weight" icon={Weight} highlight>
                                        <div className="relative group/field">
                                            <Input
                                                type="number"
                                                value={state.weight}
                                                onChange={(e) => setField('weight', e.target.value)}
                                                className={cn(INPUT_CLS, "pr-12 font-black text-slate-800 text-lg group-hover/field:border-[var(--color-primary)]/50 transition-colors")}
                                                placeholder="0.00"
                                            />
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 bg-white border border-gray-100 rounded-lg shadow-sm">
                                                <span className="text-[10px] font-black text-[var(--color-primary)] uppercase">kg</span>
                                            </div>
                                        </div>
                                    </FieldGroup>

                                    <div className="grid grid-cols-1 gap-4">
                                         <div className="flex flex-col justify-center">
                                             <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Dimension Summary</Label>
                                             <div className="flex items-center gap-2">
                                                 <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-100 rounded-xl shadow-sm">
                                                     <span className="text-xs font-black text-slate-700">{state.width || '0'}</span>
                                                     <span className="text-[9px] font-bold text-slate-300">W</span>
                                                 </div>
                                                 <span className="text-slate-300 text-xs">×</span>
                                                 <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-100 rounded-xl shadow-sm">
                                                     <span className="text-xs font-black text-slate-700">{state.length || '0'}</span>
                                                     <span className="text-[9px] font-bold text-slate-300">L</span>
                                                 </div>
                                                 <span className="text-slate-300 text-xs">×</span>
                                                 <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-100 rounded-xl shadow-sm">
                                                     <span className="text-xs font-black text-slate-700">{state.thickness || '0'}</span>
                                                     <span className="text-[9px] font-bold text-slate-300">T</span>
                                                 </div>
                                             </div>
                                         </div>
                                    </div>

                                    <div className="col-span-2 grid grid-cols-3 gap-4 pt-2 border-t border-gray-200/50 mt-2">
                                        {[
                                            { id: 'width', label: 'Width (W)', icon: Ruler, state: state.width },
                                            { id: 'length', label: 'Length (L)', icon: Ruler, state: state.length },
                                            { id: 'thickness', label: 'Thickness (T)', icon: Move3D, state: state.thickness },
                                        ].map(f => (
                                            <FieldGroup key={f.id} label={f.label} icon={f.icon}>
                                                <div className="relative group/sub">
                                                    <Input
                                                        type="number"
                                                        value={f.state}
                                                        onChange={(e) => setField(f.id as keyof VariantFormState, e.target.value)}
                                                        className={cn(INPUT_CLS, 'pr-10 text-sm font-bold bg-white group-hover/sub:border-[var(--color-primary)]/40')}
                                                        placeholder="0"
                                                    />
                                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-300 uppercase">cm</span>
                                                </div>
                                            </FieldGroup>
                                        ))}
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-1 h-6 bg-amber-400 rounded-full" />
                                    <SectionHeading title="Visual Identity & Color" />
                                </div>
                                <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm">
                                    <ColorPicker color={state.colorName} colorCode={state.colorHex} onColorChange={handleColorChange} disabled={isLoading} />
                                </div>
                            </section>
                        </TabsContent>

                    </div>
                </Tabs>
            </form>

            <div className="flex items-center justify-end gap-3 pt-5 border-t border-gray-100 mt-auto shrink-0">
                <Button
                    variant="outline"
                    type="button"
                    onClick={() => onOpenChange(false)}
                    className="flex-1 h-11 border-gray-200 text-slate-500 font-bold rounded-xl hover:bg-slate-50 hover:text-slate-800 transition-all"
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    form="variant-form"
                    disabled={isLoading || !isValid}
                    className="flex-1 h-11 bg-[#4988c4] hover:bg-[#3a6fa0] text-white font-bold rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50"
                >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isEdit ? 'Save Changes' : 'Initialize Variant'}
                </Button>
            </div>
        </div>
    );
});

export default VariantDialogForm;
