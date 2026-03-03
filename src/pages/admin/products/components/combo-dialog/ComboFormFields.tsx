/**
 * ComboFormFields — Left panel form sections
 *
 * Contains: General, Classification, Pricing, Image, References sections.
 * Pure presentational — all state comes from parent via props.
 */

import { memo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import SectionHeading from '../shared/SectionHeading';
import { AGE_GROUPS, PRESET_COLORS, SIZE_OPTIONS } from '../../types';
import { INPUT_CLS, SELECT_TRIGGER_CLS } from './index';
import type { ComboFormState } from './index';

// ── Props ────────────────────────────────────────────────
interface ComboFormFieldsProps {
    form: ComboFormState;
    setField: (field: keyof Omit<ComboFormState, 'items'>, value: string) => void;
    onNameChange: (value: string) => void;
    isLoading: boolean;
}

// ── Component ────────────────────────────────────────────
const ComboFormFields = memo(function ComboFormFields({
    form, setField, onNameChange, isLoading,
}: ComboFormFieldsProps) {
    return (
        <div className="p-5 space-y-6">
            {/* ── General ── */}
            <section className="space-y-3.5">
                <SectionHeading title="General" />
                <div className="space-y-3">
                    <div>
                        <Label htmlFor="c-name" className="text-xs font-semibold text-gray-600 mb-1.5 block">
                            Combo Name <span className="text-red-500">*</span>
                        </Label>
                        <Input id="c-name" placeholder="e.g. Combo Chăm Sóc Bé Yêu"
                            value={form.name} onChange={e => onNameChange(e.target.value)}
                            disabled={isLoading} className={INPUT_CLS} autoFocus />
                    </div>
                    <div>
                        <Label htmlFor="c-slug" className="text-xs font-semibold text-gray-600 mb-1.5 block">
                            URL Slug <span className="text-red-500">*</span>
                        </Label>
                        <Input id="c-slug" placeholder="combo-cham-soc-be-yeu"
                            value={form.slug} onChange={e => setField('slug', e.target.value)}
                            disabled={isLoading} className={cn(INPUT_CLS, 'font-mono text-[12px]')} />
                    </div>
                    <div>
                        <Label htmlFor="c-desc" className="text-xs font-semibold text-gray-600 mb-1.5 block">Description</Label>
                        <Textarea id="c-desc" placeholder="Brief description..."
                            value={form.description} onChange={e => setField('description', e.target.value)}
                            disabled={isLoading} rows={2}
                            className="rounded-lg border-gray-200 bg-white hover:border-violet-300 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/15 resize-none transition-all text-sm" />
                    </div>
                </div>
            </section>

            {/* ── Classification ── */}
            <section className="space-y-3.5">
                <SectionHeading title="Classification" />
                <div className="grid grid-cols-3 gap-3">
                    <div>
                        <Label className="text-xs font-semibold text-gray-600 mb-1.5 block">Age Group</Label>
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
                    <div>
                        <Label className="text-xs font-semibold text-gray-600 mb-1.5 block">Color</Label>
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
                        <Label className="text-xs font-semibold text-gray-600 mb-1.5 block">Size</Label>
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
                </div>
            </section>

            {/* ── Pricing ── */}
            <section className="space-y-3.5">
                <SectionHeading title="Pricing" />
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <Label htmlFor="c-base" className="text-xs font-semibold text-gray-600 mb-1.5 block">
                            Base Price (VNĐ) <span className="text-red-500">*</span>
                        </Label>
                        <Input id="c-base" type="number" placeholder="850000"
                            value={form.basePrice} onChange={e => setField('basePrice', e.target.value)}
                            disabled={isLoading} className={INPUT_CLS} min={0} />
                    </div>
                    <div>
                        <Label htmlFor="c-sale" className="text-xs font-semibold text-gray-600 mb-1.5 block">
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
                </div>
            </section>

            {/* ── Image ── */}
            <section className="space-y-3.5">
                <SectionHeading title="Image" />
                <div className="space-y-3">
                    <div>
                        <Label htmlFor="c-imgurl" className="text-xs font-semibold text-gray-600 mb-1.5 block">Image URL</Label>
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
                        <Label htmlFor="c-pubid" className="text-xs font-semibold text-gray-600 mb-1.5 block">Public ID</Label>
                        <Input id="c-pubid" placeholder="combos/combo1" value={form.imagePublicId}
                            onChange={e => setField('imagePublicId', e.target.value)}
                            disabled={isLoading} className={cn(INPUT_CLS, 'font-mono text-[12px]')} />
                    </div>
                </div>
            </section>

            {/* ── References ── */}
            <section className="space-y-3.5">
                <SectionHeading title="References" />
                <div>
                    <Label htmlFor="c-parent" className="text-xs font-semibold text-gray-600 mb-1.5 block">
                        Parent Combo ID
                        <span className="text-[10px] text-gray-400 font-normal ml-1">(optional)</span>
                    </Label>
                    <Input id="c-parent" placeholder="e.g. cc01e8e0-12e6-48eb-..."
                        value={form.comboParentId} onChange={e => setField('comboParentId', e.target.value)}
                        disabled={isLoading} className={cn(INPUT_CLS, 'font-mono text-[12px]')} />
                </div>
            </section>
        </div>
    );
});

export default ComboFormFields;
