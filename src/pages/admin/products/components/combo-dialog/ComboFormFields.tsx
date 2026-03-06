import { memo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Layers, Package, ChevronDown } from 'lucide-react';
import SectionHeading from '../shared/SectionHeading';
import { PRESET_COLORS, SIZE_OPTIONS, PRODUCT_STATUSES, PRODUCT_STATUS_COLORS } from '../../types';
import { INPUT_CLS, SELECT_TRIGGER_CLS } from './index';
import type { ComboDialogMode, ComboFormState } from './index';
import type { ComboResponse } from '@/api/services/comboService';
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
}

// ── Component ────────────────────────────────────────────
const ComboFormFields = memo(function ComboFormFields({
    form, setField, onNameChange, isLoading,
    mode, comboParents = [], isLoadingParents = false,
}: ComboFormFieldsProps) {
    const isVariant = mode === 'variant';
    const isParentLocked = isVariant && !!form.comboParentId;

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
                                <SelectTrigger className={cn(SELECT_TRIGGER_CLS, "bg-white border-indigo-100")}>
                                    <SelectValue placeholder={isLoadingParents ? "Loading parents..." : "Select parent combo..."}>
                                        {form.comboParentId && (
                                            <div className="flex items-center gap-2">
                                                <Package className="h-4 w-4 text-indigo-500 shrink-0" />
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
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">Color</Label>
                                    <Select value={form.color} onValueChange={v => setField('color', v)} disabled={isLoading}>
                                        <SelectTrigger className={cn(SELECT_TRIGGER_CLS, "bg-white")}>
                                            <SelectValue placeholder="Select Color">
                                                {form.color && (
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="h-3 w-3 rounded-full border border-gray-200 shadow-sm" style={{ backgroundColor: form.color }} />
                                                        <span className="font-bold">{PRESET_COLORS.find(c => c.code === form.color)?.name ?? form.color}</span>
                                                    </div>
                                                )}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl shadow-xl">
                                            {PRESET_COLORS.map(c => (
                                                <SelectItem key={c.code} value={c.code}>
                                                    <div className="flex items-center gap-2 font-medium">
                                                        <div className="h-3.5 w-3.5 rounded-full border border-gray-200" style={{ backgroundColor: c.code }} />
                                                        {c.name}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">Size</Label>
                                    <Select value={form.size} onValueChange={v => setField('size', v)} disabled={isLoading}>
                                        <SelectTrigger className={cn(SELECT_TRIGGER_CLS, "bg-white")}>
                                            <SelectValue placeholder="Select Size" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl shadow-xl">
                                            {SIZE_OPTIONS.map(s => (
                                                <SelectItem key={s.value} value={s.value}>
                                                    <span className="font-bold">{s.label}</span>
                                                    <span className="text-[10px] text-gray-400 ml-2">{s.description}</span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                <section className="space-y-4">
                    <SectionHeading title="Operational Status" />
                    <div>
                        <Label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">Status</Label>
                        <Select value={form.status} onValueChange={v => setField('status', v)} disabled={isLoading}>
                            <SelectTrigger className={cn(SELECT_TRIGGER_CLS, "bg-white")}>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl shadow-xl">
                                {PRODUCT_STATUSES.map(s => (
                                    <SelectItem key={s.value} value={s.value} className="rounded-lg">
                                        <span className="flex items-center gap-2 font-bold">
                                            <span className={cn('h-2 w-2 rounded-full', PRODUCT_STATUS_COLORS[s.value])} />
                                            {s.label}
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </section>
            </TabsContent>

            {/* ── TAB: PRICING ── */}
            <TabsContent value="pricing" className="mt-0 space-y-6 animate-in fade-in slide-in-from-left-2 duration-300">
                <section className="space-y-4">
                    <SectionHeading title="Pricing Economics" />
                    <div className="grid grid-cols-1 gap-5">
                        <div>
                            <Label htmlFor="c-base" className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">
                                Base Price (VNĐ) {isVariant && <span className="text-red-500">*</span>}
                            </Label>
                            <div className="relative">
                                <Input id="c-base" type="number" placeholder="850000"
                                    value={form.basePrice} onChange={e => setField('basePrice', e.target.value)}
                                    disabled={isLoading} className={cn(INPUT_CLS, "bg-white pl-10")} min={0} />
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">VNĐ</span>
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="c-sale" className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">Sale Price (VNĐ)</Label>
                            <div className="relative">
                                <Input id="c-sale" type="number" placeholder="699000"
                                    value={form.salePrice} onChange={e => setField('salePrice', e.target.value)}
                                    disabled={isLoading} className={cn(INPUT_CLS, "bg-white pl-10")} min={0} />
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">VNĐ</span>
                                {form.basePrice && form.salePrice && Number(form.salePrice) < Number(form.basePrice) && (
                                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg shadow-sm">
                                        -{Math.round(((Number(form.basePrice) - Number(form.salePrice)) / Number(form.basePrice)) * 100)}%
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="space-y-4">
                    <SectionHeading title="Media & Assets" />
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="c-imgurl" className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">Image URL</Label>
                            <Input id="c-imgurl" placeholder="https://..." value={form.imageUrl}
                                onChange={e => setField('imageUrl', e.target.value)}
                                disabled={isLoading} className={cn(INPUT_CLS, "bg-white")} />
                        </div>
                        {form.imageUrl && (
                            <div className="flex items-center gap-3 p-3 rounded-xl border border-indigo-100 bg-indigo-50/30 shadow-inner">
                                <img src={form.imageUrl} alt="preview" className="h-14 w-14 object-cover rounded-lg border border-white shadow-md shrink-0" />
                                <div className="min-w-0 flex-1">
                                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-tighter mb-0.5">Live Preview</p>
                                    <p className="text-[11px] text-slate-500 truncate italic">{form.imageUrl}</p>
                                </div>
                            </div>
                        )}
                        <div>
                            <Label htmlFor="c-pubid" className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">Public ID</Label>
                            <Input id="c-pubid" placeholder="combos/thumb" value={form.imagePublicId}
                                onChange={e => setField('imagePublicId', e.target.value)}
                                disabled={isLoading} className={cn(INPUT_CLS, 'font-mono text-[11px] bg-white')} />
                        </div>
                    </div>
                </section>
            </TabsContent>
        </div>
    );
});

export default ComboFormFields;
