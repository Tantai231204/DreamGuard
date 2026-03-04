/**
 * ComboFormFields — Left panel form sections
 *
 * Shows different fields based on mode:
 *  - "parent"  → General + Image (no color/size/pricing/items)
 *  - "variant" → Parent selector + Classification + Pricing + Image + refs
 */

import { memo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Layers, Package } from 'lucide-react';
import SectionHeading from '../shared/SectionHeading';
import { AGE_GROUPS, PRESET_COLORS, SIZE_OPTIONS, PRODUCT_STATUSES, PRODUCT_STATUS_COLORS } from '../../types';
import { INPUT_CLS, SELECT_TRIGGER_CLS } from './index';
import type { ComboDialogMode, ComboFormState } from './index';
import type { ComboResponse } from '@/api/services/comboService';

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
    // In variant mode: lock parent selector once chosen, lock name/slug (auto-generated)
    const isParentLocked = isVariant && !!form.comboParentId;
    const isNameLocked = isVariant;

    return (
        <div className="p-5 space-y-6">
            {/* ── Parent Selector (variant mode only) ── */}
            {isVariant && (
                <section className="space-y-3.5">
                    <SectionHeading title="Parent Combo" />
                    <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">
                            Select Parent <span className="text-red-500">*</span>
                        </Label>
                        <Select
                            value={form.comboParentId}
                            onValueChange={v => setField('comboParentId', v)}
                            disabled={isLoading || isLoadingParents || isParentLocked}
                        >
                            <SelectTrigger className={SELECT_TRIGGER_CLS}>
                                <SelectValue placeholder={isLoadingParents ? "Loading parents..." : "Select parent combo..."}>
                                    {form.comboParentId && (
                                        <div className="flex items-center gap-2">
                                            <Package className="h-4 w-4 text-indigo-500 shrink-0" />
                                            <span className="truncate text-slate-900 font-semibold">
                                                {comboParents.find(p => p.id === form.comboParentId)?.name ?? form.comboParentId.slice(0, 12) + '…'}
                                            </span>
                                        </div>
                                    )}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="rounded-xl shadow-xl z-[300] max-h-60">
                                {comboParents.length === 0 && !isLoadingParents && (
                                    <div className="px-3 py-4 text-center text-sm text-gray-400">
                                        No parent combos found. Create a parent first.
                                    </div>
                                )}
                                {comboParents.map(parent => (
                                    <SelectItem
                                        key={parent.id}
                                        value={parent.id}
                                        className="rounded-lg hover:bg-violet-50"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            {parent.imageUrl ? (
                                                <img
                                                    src={parent.imageUrl}
                                                    alt=""
                                                    className="h-7 w-7 rounded-md object-cover border border-gray-200 shrink-0"
                                                />
                                            ) : (
                                                <div className="h-7 w-7 rounded-md bg-violet-100 flex items-center justify-center shrink-0">
                                                    <Layers className="h-3.5 w-3.5 text-violet-500" />
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <div className="text-sm font-medium text-gray-900 truncate">{parent.name}</div>
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

            {/* ── General ── */}
            <section className="space-y-3.5">
                <SectionHeading title="General" />
                <div className="space-y-3">
                    <div>
                        <Label htmlFor="c-name" className="text-sm font-medium text-gray-700 mb-2 block">
                            {isVariant ? 'Variant Name' : 'Combo Name'} <span className="text-red-500">*</span>
                        </Label>
                        <Input id="c-name" placeholder={isVariant ? "Auto-generated from parent" : "e.g. Combo Chăm Sóc Bé Yêu"}
                            value={form.name} onChange={e => onNameChange(e.target.value)}
                            disabled={isLoading || isNameLocked} className={cn(INPUT_CLS, isNameLocked && 'bg-gray-50 text-gray-500 cursor-not-allowed')} autoFocus={!isNameLocked} />
                        {isNameLocked && (
                            <p className="text-[10px] text-gray-400 mt-1">Auto-generated from parent name</p>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="c-slug" className="text-sm font-medium text-gray-700 mb-1.5 block">
                            URL Slug <span className="text-red-500">*</span>
                        </Label>
                        <Input id="c-slug" placeholder="combo-cham-soc-be-yeu"
                            value={form.slug} onChange={e => setField('slug', e.target.value)}
                            disabled={isLoading || isNameLocked} className={cn(INPUT_CLS, 'font-mono text-[12px]', isNameLocked && 'bg-gray-50 text-gray-500 cursor-not-allowed')} />
                    </div>
                    <div>
                        <Label htmlFor="c-desc" className="text-sm font-medium text-gray-700 mb-2 block">Description</Label>
                        <Textarea id="c-desc" placeholder="Brief description..."
                            value={form.description} onChange={e => setField('description', e.target.value)}
                            disabled={isLoading} rows={3}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-indigo-300 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm font-medium text-slate-900 placeholder:text-slate-400 shadow-[0_1px_2px_-1px_rgba(0,0,0,0.05)] resize-none p-3" />
                    </div>
                </div>
            </section>

            {/* ── Classification (variant mode shows color/size; parent only age group) ── */}
            <section className="space-y-3.5">
                <SectionHeading title="Classification" />
                <div className={cn("grid gap-3", isVariant ? "grid-cols-3" : "grid-cols-1")}>
                    <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">Age Group</Label>
                        <Select value={form.ageGroup} onValueChange={v => setField('ageGroup', v)} disabled={isLoading}>
                            <SelectTrigger className={SELECT_TRIGGER_CLS}>
                                <SelectValue placeholder="Age..." />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl shadow-xl z-[300]">
                                {Object.entries(AGE_GROUPS).map(([k, label]) => (
                                    <SelectItem key={k} value={k}>{label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {isVariant && (
                        <>
                            <div>
                                <Label className="text-sm font-medium text-gray-700 mb-2 block">Color</Label>
                                <Select value={form.color} onValueChange={v => setField('color', v)} disabled={isLoading}>
                                    <SelectTrigger className={SELECT_TRIGGER_CLS}>
                                        <SelectValue placeholder="Color...">
                                            {form.color && (
                                                <div className="flex items-center gap-1.5">
                                                    <div className="h-3.5 w-3.5 rounded-full border border-gray-200"
                                                        style={{ backgroundColor: form.color }} />
                                                    <span>{PRESET_COLORS.find(c => c.code === form.color)?.name ?? form.color}</span>
                                                </div>
                                            )}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl shadow-xl z-[300]">
                                        {PRESET_COLORS.map(c => (
                                            <SelectItem key={c.code} value={c.code}>
                                                <div className="flex items-center gap-2">
                                                    <div className="h-3.5 w-3.5 rounded-full border border-gray-200" style={{ backgroundColor: c.code }} />
                                                    {c.name}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-gray-700 mb-2 block">Size</Label>
                                <Select value={form.size} onValueChange={v => setField('size', v)} disabled={isLoading}>
                                    <SelectTrigger className={SELECT_TRIGGER_CLS}>
                                        <SelectValue placeholder="Size..." />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl shadow-xl z-[300]">
                                        {SIZE_OPTIONS.map(s => (
                                            <SelectItem key={s.value} value={s.value}>
                                                <span className="font-medium">{s.label}</span>
                                                <span className="text-xs text-gray-400 ml-1">{s.description}</span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </>
                    )}
                </div>
            </section>

            {/* ── Pricing & Status ── */}
            <section className="space-y-3.5">
                <SectionHeading title="Pricing & Status" />
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="c-base" className="text-sm font-medium text-gray-700 mb-2 block">
                            Base Price (VNĐ) {isVariant && <span className="text-red-500">*</span>}
                        </Label>
                        <Input id="c-base" type="number" placeholder="850000"
                            value={form.basePrice} onChange={e => setField('basePrice', e.target.value)}
                            disabled={isLoading} className={INPUT_CLS} min={0} />
                    </div>
                    <div>
                        <Label htmlFor="c-sale" className="text-sm font-medium text-gray-700 mb-2 block">
                            Sale Price (VNĐ)
                        </Label>
                        <div className="relative">
                            <Input id="c-sale" type="number" placeholder="699000"
                                value={form.salePrice} onChange={e => setField('salePrice', e.target.value)}
                                disabled={isLoading} className={INPUT_CLS} min={0} />
                            {form.basePrice && form.salePrice && Number(form.salePrice) < Number(form.basePrice) && (
                                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md">
                                    -{Math.round(((Number(form.basePrice) - Number(form.salePrice)) / Number(form.basePrice)) * 100)}%
                                </span>
                            )}
                        </div>
                    </div>
                    {/* Status Field */}
                    <div className="col-span-2 mt-2">
                        <Label className="text-sm font-medium text-gray-700 mb-2">
                            Status
                        </Label>
                        <Select value={form.status} onValueChange={v => setField('status', v)} disabled={isLoading}>
                            <SelectTrigger className={SELECT_TRIGGER_CLS}>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl shadow-xl z-[300]">
                                {PRODUCT_STATUSES.map((s, index) => (
                                    <SelectItem
                                        key={s.value ?? `status-${index}`}
                                        value={s.value}
                                        className="rounded-lg hover:bg-violet-50 hover:text-violet-900"
                                    >
                                        <span className="flex items-center gap-2">
                                            <span className={cn('h-2 w-2 rounded-full', PRODUCT_STATUS_COLORS[s.value])} />
                                            {s.label}
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </section>

            {/* ── Image ── */}
            <section className="space-y-3.5">
                <SectionHeading title="Image" />
                <div className="space-y-3">
                    <div>
                        <Label htmlFor="c-imgurl" className="text-[13px] font-semibold text-slate-700 mb-2 block">Image URL</Label>
                        <Input id="c-imgurl" placeholder="https://..." value={form.imageUrl}
                            onChange={e => setField('imageUrl', e.target.value)}
                            disabled={isLoading} className={INPUT_CLS} />
                    </div>
                    {form.imageUrl && (
                        <div className="flex items-center gap-3 p-2.5 rounded-lg border border-gray-200 bg-gray-50">
                            <img src={form.imageUrl} alt="preview"
                                className="h-12 w-12 object-cover rounded-md border border-gray-200 shrink-0"
                                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                            <span className="text-[11px] text-gray-400 truncate flex-1">{form.imageUrl}</span>
                        </div>
                    )}
                    <div>
                        <Label htmlFor="c-pubid" className="text-[13px] font-semibold text-slate-700 mb-2 block">Public ID</Label>
                        <Input id="c-pubid" placeholder="combos/combo1" value={form.imagePublicId}
                            onChange={e => setField('imagePublicId', e.target.value)}
                            disabled={isLoading} className={cn(INPUT_CLS, 'font-mono text-[12px]')} />
                    </div>
                </div>
            </section>
        </div>
    );
});

export default ComboFormFields;
