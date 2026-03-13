import { memo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Layers, Package, ChevronDown, Upload, Trash2, Image as ImageIcon, Loader2, Calculator, Sparkles } from 'lucide-react';
import SectionHeading from '../shared/SectionHeading';
import { PRODUCT_STATUSES, PRODUCT_STATUS_COLORS } from '../../types';
import { INPUT_CLS, SELECT_TRIGGER_CLS, getAllowedStatusTransitions } from './index';
import type { ComboDialogMode, ComboFormState } from './index';
import type { ComboResponse } from '@/api/services/comboService';
import ColorPicker from '../variant-dialog/ColorPicker';
import { useUploadComboImage, useDeleteComboImage } from '@/hooks/queries/useCombo';
import { ImageUploadDialog } from '../dialogs';
import { AGE_GROUPS } from '../../types';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TabsContent } from "@/components/ui/tabs";

// ── Props ────────────────────────────────────────────────
interface ComboFormFieldsProps {
    form: ComboFormState;
    setField: (field: keyof Omit<ComboFormState, 'items'>, value: string) => void;
    onNameChange: (value: string) => void;
    isLoading: boolean;
    mode: ComboDialogMode;
    /** Available parent combos for variant mode */
    comboParents?: ComboResponse[];
    isLoadingParents?: boolean;
    /** ID of current combo for image upload */
    comboId?: string;
    /** Whether pricing is being auto-calculated */
    isPriceAutoManaged?: boolean;
    /** Whether variant base price is auto-calculated from items */
    isVariantBasePriceAuto?: boolean;
    /** Source of the auto-calculation (e.g. 'items' or 'children') */
    priceSource?: 'items' | 'children' | null;
}

// ── Component ────────────────────────────────────────────
const ComboFormFields = memo(function ComboFormFields({
    form, setField, onNameChange, isLoading,
    mode, comboParents = [], isLoadingParents = false,
    comboId, isPriceAutoManaged = false,
    isVariantBasePriceAuto = false,
    priceSource = null,
}: ComboFormFieldsProps) {
    const isVariant = mode === 'variant';
    const isParentLocked = isVariant && !!form.comboParentId;

    const [showUploadDialog, setShowUploadDialog] = useState(false);
    const uploadMutation = useUploadComboImage();
    const deleteMutation = useDeleteComboImage();

    const isMediaLoading = uploadMutation.isPending || deleteMutation.isPending;

    const handleDeleteImage = async () => {
        if (!form.imagePublicId) return;
        if (window.confirm("Are you sure you want to delete this image?")) {
            await deleteMutation.mutateAsync(form.imagePublicId);
        }
    };

    return (
        <div className="p-5 pb-10">
            {/* ── TAB: GENERAL ── */}
            <TabsContent value="general" className="mt-0 space-y-6 animate-in fade-in slide-in-from-left-2 duration-300">
                {/* Parent Selector */}
                {isVariant && (
                    <section className="space-y-3.5">
                        <SectionHeading title="Identity Context" />
                        <div>
                            <Label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">
                                Parent Combo <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                value={form.comboParentId}
                                onValueChange={v => setField('comboParentId', v)}
                                disabled={isLoading || isLoadingParents || isParentLocked}
                            >
                                <SelectTrigger className={cn(SELECT_TRIGGER_CLS, "bg-white border-primary-100")}>
                                    <SelectValue placeholder={isLoadingParents ? "Loading parents..." : "Select parent combo..."}>
                                        {form.comboParentId && (
                                            <div className="flex items-center gap-2">
                                                <Package className="h-4 w-4 text-primary-500 shrink-0" />
                                                <span className="truncate text-slate-900 font-bold">
                                                    {comboParents.find(p => p.id === form.comboParentId)?.name ?? form.comboParentId.slice(0, 12) + '…'}
                                                </span>
                                            </div>
                                        )}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent className="rounded-xl shadow-xl z-[300] max-h-60">
                                    {comboParents.map(parent => (
                                        <SelectItem key={parent.id} value={parent.id} className="rounded-lg">
                                            <div className="flex items-center gap-2.5">
                                                {parent.imageUrl ? (
                                                    <img src={parent.imageUrl} alt="" className="h-7 w-7 rounded-md object-cover border border-gray-200" />
                                                ) : (
                                                    <div className="h-7 w-7 rounded-md bg-violet-100 flex items-center justify-center">
                                                        <Layers className="h-3.5 w-3.5 text-violet-500" />
                                                    </div>
                                                )}
                                                <div className="min-w-0">
                                                    <div className="text-sm font-bold text-gray-900 truncate">{parent.name}</div>
                                                    <div className="text-[10px] text-gray-400 font-mono">{parent.sku}</div>
                                                </div>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </section>
                )}

                <section className="space-y-4">
                    <SectionHeading title="Basic Information" />
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="c-name" className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">
                                {isVariant ? 'Variant Name' : 'Combo Name'} <span className="text-red-500">*</span>
                            </Label>
                            <Input id="c-name" value={form.name} onChange={e => onNameChange(e.target.value)}
                                disabled={isLoading} className={cn(INPUT_CLS, "bg-white")} autoFocus />
                        </div>
                        <div>
                            <Label htmlFor="c-slug" className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">URL Slug</Label>
                            <Input id="c-slug" value={form.slug} readOnly
                                className={cn(INPUT_CLS, 'font-mono text-[11px] bg-slate-100 text-slate-500 cursor-not-allowed border-dashed')} />
                        </div>
                        <div>
                            <Label htmlFor="c-desc" className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">Description</Label>
                            <Textarea id="c-desc" placeholder="Brief description..."
                                value={form.description} onChange={e => setField('description', e.target.value)}
                                disabled={isLoading} rows={4}
                                className="w-full rounded-xl border border-slate-200 bg-white hover:border-[#4988c4]/60 focus:border-[#4988c4] focus:ring-4 focus:ring-[#4988c4]/20 transition-all text-sm font-medium text-slate-900 shadow-sm resize-none p-3" />
                        </div>
                    </div>
                </section>

                <section className="space-y-4">
                    <SectionHeading title="Combo Media" />

                    {!comboId ? (
                        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 gap-3 grayscale opacity-60">
                            <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                <Upload className="h-6 w-6" />
                            </div>
                            <div className="text-center">
                                <p className="text-xs font-bold text-slate-600">Uploads locked</p>
                                <p className="text-[10px] text-slate-400">Save this combo first to enable media management.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white bg-grid-slate-50 shadow-sm group">
                            {isMediaLoading && (
                                <div className="absolute inset-0 z-20 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                                    <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
                                </div>
                            )}

                            <div className="aspect-[16/9] w-full bg-slate-50 flex items-center justify-center overflow-hidden">
                                {form.imageUrl ? (
                                    <img
                                        src={form.imageUrl}
                                        alt="Main"
                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-slate-300">
                                        <ImageIcon className="h-10 w-10 stroke-[1.5]" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">No Media Selected</span>
                                    </div>
                                )}
                            </div>

                            {/* Actions Overlay */}
                            <div className="p-4 border-t border-slate-100 flex items-center justify-between gap-3 bg-white">
                                <div className="flex-1 min-w-0">
                                    {form.imageUrl ? (
                                        <p className="text-[10px] text-slate-400 font-mono truncate tracking-tight">{form.imagePublicId}</p>
                                    ) : (
                                        <p className="text-[10px] text-slate-400 italic">Select a high-quality photo...</p>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    {form.imagePublicId && (
                                        <Button
                                            onClick={handleDeleteImage}
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                            disabled={isMediaLoading}
                                            type="button"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                    <Button
                                        onClick={() => setShowUploadDialog(true)}
                                        className="h-9 px-4 rounded-xl gap-2 text-[11px] font-bold uppercase tracking-wider bg-primary-600 hover:bg-primary-700 shadow-md shadow-primary-200 transition-all border-none"
                                        disabled={isMediaLoading}
                                        type="button"
                                    >
                                        <Upload className="h-3.5 w-3.5" />
                                        {form.imageUrl ? 'Change' : 'Upload Image'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </section>

                {comboId && (
                    <ImageUploadDialog
                        open={showUploadDialog}
                        onOpenChange={setShowUploadDialog}
                        productId={comboId}
                        productName={form.name}
                        onUpload={async (cid, files) => {
                            await uploadMutation.mutateAsync({ comboId: cid, files });
                            setShowUploadDialog(false);
                        }}
                        isUploading={uploadMutation.isPending}
                    />
                )}
            </TabsContent>

            {/* ── TAB: CONFIG ── */}
            <TabsContent value="config" className="mt-0 space-y-6 animate-in fade-in slide-in-from-left-2 duration-300">
                <section className="space-y-4">
                    <SectionHeading title="Classification & Specs" />
                    <div className="grid grid-cols-1 gap-5">
                        <div>
                            <Label htmlFor="c-age" className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">Age Group (months)</Label>
                            <div className="relative flex">
                                <Input id="c-age" type="number" value={form.ageGroup}
                                    onChange={e => setField('ageGroup', e.target.value)}
                                    disabled={isLoading} className={cn(INPUT_CLS, "pr-24 bg-white")} min={0} />
                                <div className="absolute right-0 top-0 h-full flex items-center">
                                    <span className="text-[10px] font-black text-slate-400 uppercase mr-8">MO</span>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button type="button" className="h-full px-2 hover:bg-slate-100 border-l border-slate-200 rounded-r-xl">
                                                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-xl z-[400]">
                                            {Object.entries(AGE_GROUPS).map(([val, label]) => (
                                                <DropdownMenuItem key={val} onClick={() => setField('ageGroup', val)} className="cursor-pointer text-xs font-bold py-2.5">
                                                    {label}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        </div>

                        {isVariant && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="space-y-3">
                                        <Label className="text-xs font-black text-slate-500 uppercase tracking-widest block">Variant Color</Label>
                                        <ColorPicker
                                            color=""
                                            colorCode={form.color}
                                            onColorChange={(_name: string, code: string) => setField('color', code)}
                                            disabled={isLoading}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="c-size" className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">Variant Size</Label>
                                        <Input
                                            id="c-size"
                                            placeholder="S, M, L, XL..."
                                            value={form.size}
                                            onChange={e => setField('size', e.target.value)}
                                            disabled={isLoading}
                                            className={cn(INPUT_CLS, "bg-white")}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                <section className="space-y-4">
                    <SectionHeading title="Operational Status" />
                    <div className="space-y-3">
                        <Label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">Status Management</Label>
                        {!comboId ? (
                            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200/60">
                                <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                                <span className="text-xs font-bold text-amber-700">Initial status is locked to <span className="border-b border-amber-400">Draft</span></span>
                                <Badge variant="outline" className="ml-auto bg-white text-[10px] font-black uppercase text-amber-600 border-amber-200">New Creation</Badge>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <Select value={form.status} onValueChange={v => setField('status', v)} disabled={isLoading}>
                                    <SelectTrigger className={cn(SELECT_TRIGGER_CLS, "bg-white")}>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl shadow-xl">
                                        {PRODUCT_STATUSES
                                            .filter(s => getAllowedStatusTransitions(form.status).includes(s.value))
                                            .map(s => (
                                                <SelectItem key={s.value} value={s.value} className="rounded-lg">
                                                    <span className="flex items-center gap-2 font-bold text-slate-700">
                                                        <span className={cn('h-2 w-2 rounded-full', PRODUCT_STATUS_COLORS[s.value])} />
                                                        {s.label}
                                                    </span>
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-[10px] text-slate-400 px-1 italic">
                                    Transitions from <span className="font-bold text-slate-500">{form.status}</span> are restricted based on business rules.
                                </p>
                            </div>
                        )}
                    </div>
                </section>
            </TabsContent>

            {/* ── TAB: PRICING ── */}
            <TabsContent value="pricing" className="mt-0 space-y-6 animate-in fade-in slide-in-from-left-2 duration-300">
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <SectionHeading title="Pricing Economics" />
                        {isPriceAutoManaged && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-primary-50 border border-primary-100 rounded-full animate-in zoom-in duration-300">
                                <Sparkles className="h-3 w-3 text-primary-500" />
                                <span className="text-[10px] font-black text-primary-600 uppercase tracking-wider">
                                    {priceSource === 'items' ? 'Calculated from Items' : 'Derived from Variants'}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-5">
                        {isPriceAutoManaged ? (
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Base Price</p>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-xl font-black text-slate-900">
                                                {Number(form.basePrice).toLocaleString('en-US')}
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-400">VNĐ</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sale Price</p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-xl font-black text-blue-600">
                                                {Number(form.salePrice).toLocaleString('en-US')}
                                            </span>
                                            <span className="text-[10px] font-bold text-blue-400">VNĐ</span>
                                            {form.basePrice && form.salePrice && Number(form.salePrice) < Number(form.basePrice) && (
                                                <Badge className="bg-emerald-500 text-white border-0 text-[10px] h-5 px-1.5">
                                                    -{Math.round(((Number(form.basePrice) - Number(form.salePrice)) / Number(form.basePrice)) * 100)}%
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2 pt-2 border-t border-slate-200/60 text-slate-500">
                                    <Calculator className="h-3.5 w-3.5 mt-0.5" />
                                    <p className="text-[11px] italic leading-relaxed">
                                        {mode === 'parent'
                                            ? (Number(form.salePrice) > 0
                                                ? "This price represents the base/starting value derived from the child variants in this collection."
                                                : "No variants found yet. Pricing will be automatically determined once variant combos are added to this collection.")
                                            : "Pricing is calculated based on the sum of individual products and quantities specified in the items list."}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div>
                                    <Label htmlFor="c-base" className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block flex items-center gap-2">
                                        Base Price (VNĐ)
                                        {isVariantBasePriceAuto && (
                                            <span className="flex items-center gap-1 text-[9px] text-primary-500 bg-primary-50 px-1.5 py-0.5 rounded border border-primary-100">
                                                <Calculator className="h-2.5 w-2.5" /> Sum of Items
                                            </span>
                                        )}
                                    </Label>
                                    <div className="relative group">
                                        <Input
                                            id="c-base"
                                            type="number"
                                            placeholder="850000"
                                            value={form.basePrice}
                                            onChange={e => setField('basePrice', e.target.value)}
                                            disabled={isLoading || isVariantBasePriceAuto}
                                            className={cn(
                                                INPUT_CLS,
                                                "pl-10",
                                                isVariantBasePriceAuto ? "bg-slate-50 text-slate-500 border-dashed cursor-not-allowed" : "bg-white"
                                            )}
                                            min={0}
                                        />
                                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">VNĐ</span>
                                    </div>
                                    {isVariantBasePriceAuto && (
                                        <p className="text-[10px] text-primary-500 mt-1.5 italic font-medium px-1">
                                            Calculated automatically from the items you added on the right.
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="c-sale" className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">Sale Price (VNĐ)</Label>
                                    <div className="relative group">
                                        <Input
                                            id="c-sale"
                                            type="number"
                                            placeholder="699000"
                                            value={form.salePrice}
                                            onChange={e => setField('salePrice', e.target.value)}
                                            disabled={isLoading}
                                            className={cn(INPUT_CLS, "bg-white pl-10")}
                                            min={0}
                                        />
                                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">VNĐ</span>
                                        {form.basePrice && form.salePrice && Number(form.salePrice) < Number(form.basePrice) && (
                                            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg shadow-sm">
                                                -{Math.round(((Number(form.basePrice) - Number(form.salePrice)) / Number(form.basePrice)) * 100)}%
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </section>
            </TabsContent>
        </div>
    );
});

export default ComboFormFields;
