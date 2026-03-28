import { memo, useState, useCallback, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
    Upload, Trash2, Image as ImageIcon, Loader2,
    AlertCircle, CheckCircle2, RefreshCw,
} from 'lucide-react';
import { PRODUCT_STATUSES, PRODUCT_STATUS_COLORS, AGE_GROUPS, normalizeStatus } from '../../types';
import { INPUT_CLS, SELECT_TRIGGER_CLS, getAllowedStatusTransitions } from './index';
import type { ComboDialogMode, ComboFormValues } from './index';
import ColorPicker from '../variant-dialog/ColorPicker';
import { useUploadComboImage, useDeleteComboImage } from '@/hooks/queries/useCombo';
import { ImageUploadDialog } from '../dialogs';
import { TabsContent } from '@/components/ui/tabs';
import type { FieldErrors, UseFormRegister, Path, PathValue } from 'react-hook-form';
import type { VariantOption } from '@/hooks/queries/useProduct';
import ComboItemsPanel from './ComboItemsPanel';
import VirtualVariantSelect from './VirtualVariantSelect';
import { formatNumber, unformatNumber, formatPrice } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────
// Shared primitives
// ─────────────────────────────────────────────────────────────

const ErrorMsg = memo(({ error }: { error?: { message?: string } }) => {
    if (!error) return null;
    return (
        <p className="flex items-center gap-1 mt-1 text-[11px] text-red-500 font-medium">
            <AlertCircle className="h-3 w-3 shrink-0" />
            {error.message}
        </p>
    );
});
ErrorMsg.displayName = 'ErrorMsg';

/** Thin uppercase divider label used between form sections */
const SectionDivider = ({ label }: { label: string }) => (
    <div className="flex items-center gap-3 mb-3">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 whitespace-nowrap">
            {label}
        </span>
        <div className="flex-1 h-px bg-slate-100" />
    </div>
);

/** Compact field wrapper with label + optional right slot */
const Field = ({
    label,
    required,
    hint,
    children,
    className,
}: {
    label: string;
    required?: boolean;
    hint?: string;
    children: React.ReactNode;
    className?: string;
}) => (
    <div className={cn('space-y-1', className)}>
        <div className="flex items-center justify-between">
            <Label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                {label}
                {required && <span className="text-red-400 ml-0.5">*</span>}
            </Label>
            {hint && <span className="text-[10px] text-slate-400">{hint}</span>}
        </div>
        {children}
    </div>
);

// ─────────────────────────────────────────────────────────────
// Pricing strip — fixed bar at top of right column
// ─────────────────────────────────────────────────────────────

const PricingStrip = memo(({
    marketValue,
    salePrice,
    isLoading,
    setField,
    onSync,
}: {
    marketValue?: number;
    salePrice?: number;
    isLoading: boolean;
    setField: <K extends Path<ComboFormValues>>(field: K, value: PathValue<ComboFormValues, K>) => void;
    onSync: () => void;
}) => {
    const isSynced = salePrice === marketValue;
    const hasDiscount = (marketValue ?? 0) > 0 && (salePrice ?? 0) < (marketValue ?? 0);
    const discountPct = hasDiscount
        ? Math.round(((marketValue! - salePrice!) / marketValue!) * 100)
        : 0;

    return (
        <div className="flex items-center gap-0 px-5 py-3 bg-white border-b border-slate-100 shrink-0">
            {/* Market value (auto) */}
            <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                    Market value
                </span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-base font-semibold text-slate-900 tabular-nums">
                        {formatPrice(marketValue ?? 0)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">Auto</span>
                </div>
            </div>

            <div className="w-px h-8 bg-slate-100 mx-4 shrink-0" />

            {/* Sale price (editable) */}
            <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                    Sale price <span className="text-red-400">*</span>
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                    <div className="relative">
                        <Input
                            value={formatNumber(salePrice)}
                            onChange={e =>
                                setField(
                                    'salePrice' as Path<ComboFormValues>,
                                    unformatNumber(e.target.value) as PathValue<ComboFormValues, 'salePrice'>,
                                )
                            }
                            disabled={isLoading}
                            className={cn(
                                INPUT_CLS,
                                'h-8 w-36 pr-9 text-sm font-semibold bg-slate-50 focus:bg-white',
                            )}
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-400">
                            ₫
                        </span>
                    </div>
                    {hasDiscount && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
                            -{discountPct}%
                        </span>
                    )}
                </div>
            </div>

            {/* Sync action */}
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onSync}
                disabled={isSynced || isLoading || !marketValue}
                className={cn(
                    'ml-auto h-8 gap-1.5 text-[11px] font-semibold rounded-lg',
                    isSynced
                        ? 'text-slate-300 cursor-default'
                        : 'text-blue-600 hover:bg-blue-50',
                )}
            >
                {isSynced ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                    <RefreshCw className="h-3.5 w-3.5" />
                )}
                {isSynced ? 'Synced' : 'Sync from items'}
            </Button>
        </div>
    );
});
PricingStrip.displayName = 'PricingStrip';

// ─────────────────────────────────────────────────────────────
// Left panel — identity, appearance, media, status
// ─────────────────────────────────────────────────────────────

const LeftPanel = memo(({
    register,
    errors,
    isLoading,
    comboParents,
    watchValues,
    setField,
    onNameChange,
    comboId,
    isEdit,
}: {
    register: UseFormRegister<ComboFormValues>;
    errors: FieldErrors<ComboFormValues>;
    isLoading: boolean;
    comboParents: { id: string; label: string; imageUrl?: string; sku?: string }[];
    watchValues: Partial<ComboFormValues>;
    setField: <K extends Path<ComboFormValues>>(field: K, value: PathValue<ComboFormValues, K>) => void;
    onNameChange: (v: string) => void;
    comboId?: string;
    isEdit: boolean;
}) => {
    const [showUploadDialog, setShowUploadDialog] = useState(false);
    const uploadMutation = useUploadComboImage();
    const deleteMutation = useDeleteComboImage();
    const isMediaLoading = uploadMutation.isPending || deleteMutation.isPending;

    const handleDeleteImage = useCallback(async () => {
        if (!watchValues.imagePublicId) return;
        if (window.confirm('Delete this image?')) {
            await deleteMutation.mutateAsync(watchValues.imagePublicId);
        }
    }, [watchValues.imagePublicId, deleteMutation]);

    const transformedParents = useMemo<VariantOption[]>(
        () =>
            comboParents.map(p => ({
                variantId: p.id,
                productId: p.id,
                productName: p.label,
                imageUrl: p.imageUrl,
                sku: p.sku || '',
                basePrice: 0,
                salePrice: 0,
                stockQuantity: 0,
                stockStatus: 'InStock',
                status: 'Published' as const,
                label: p.label,
            })),
        [comboParents],
    );

    const allowedTransitions = useMemo(() =>
        getAllowedStatusTransitions(normalizeStatus(watchValues.status)),
        [watchValues.status]
    );

    return (
        <div className="flex flex-col h-full overflow-y-auto bg-white border-r border-slate-100">
            <div className="flex-1 p-5 space-y-6">

                {/* ── Identity ── */}
                <section>
                    <SectionDivider label="Identity" />
                    <div className="space-y-3">
                        <Field label="Variant name" required>
                            <Input
                                {...register('name')}
                                placeholder="e.g. XL / Rose Gold"
                                onChange={e => onNameChange(e.target.value)}
                                disabled={isLoading}
                                className={cn(INPUT_CLS, 'bg-white', errors.name && 'border-red-400')}
                            />
                            <ErrorMsg error={errors.name} />
                        </Field>

                        <Field label="URL slug" hint="Auto-generated">
                            <Input
                                {...register('slug')}
                                disabled
                                className={cn(INPUT_CLS, 'bg-slate-50 font-mono text-[11px] text-slate-400 cursor-not-allowed')}
                            />
                        </Field>

                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Parent combo" required>
                                <VirtualVariantSelect
                                    value={String(watchValues.comboParentId || '')}
                                    onChange={vid =>
                                        setField(
                                            'comboParentId' as Path<ComboFormValues>,
                                            vid as PathValue<ComboFormValues, 'comboParentId'>,
                                        )
                                    }
                                    variantOptions={transformedParents}
                                    isLoading={isLoading}
                                    placeholder="Select parent…"
                                    disabled={isLoading || isEdit}
                                />
                                <ErrorMsg error={errors.comboParentId} />
                            </Field>

                            <Field label="Age group" required>
                                <Select
                                    value={String(watchValues.ageGroup || '')}
                                    onValueChange={v =>
                                        setField(
                                            'ageGroup' as Path<ComboFormValues>,
                                            Number(v) as PathValue<ComboFormValues, 'ageGroup'>,
                                        )
                                    }
                                    disabled={isLoading}
                                >
                                    <SelectTrigger className={SELECT_TRIGGER_CLS}>
                                        <SelectValue placeholder="Select…" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                                        {Object.entries(AGE_GROUPS).map(([val, label]) => (
                                            <SelectItem key={val} value={val} className="rounded-lg py-2 text-sm">
                                                {label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <ErrorMsg error={errors.ageGroup} />
                            </Field>
                        </div>

                        <Field label="Short description" required hint={`${watchValues.description?.length ?? 0}/120`}>
                            <Textarea
                                {...register('description')}
                                placeholder="Briefly describe this variant…"
                                disabled={isLoading}
                                maxLength={120}
                                rows={2}
                                className={cn(
                                    'w-full rounded-lg border border-slate-200 bg-white hover:border-slate-300',
                                    'focus:border-blue-400 focus:ring-2 focus:ring-blue-400/15',
                                    'transition-all text-sm text-slate-900 resize-none p-2.5',
                                    errors.description && 'border-red-400',
                                )}
                            />
                            <ErrorMsg error={errors.description} />
                        </Field>
                    </div>
                </section>

                {/* ── Appearance ── */}
                <section>
                    <SectionDivider label="Appearance" />
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Color theme">
                            <ColorPicker
                                color=""
                                colorCode={watchValues.color || ''}
                                onColorChange={(_name, code) =>
                                    setField(
                                        'color' as Path<ComboFormValues>,
                                        code as PathValue<ComboFormValues, 'color'>,
                                    )
                                }
                                disabled={isLoading}
                            />
                        </Field>
                        <Field label="Size / dimension">
                            <Input
                                {...register('size')}
                                placeholder="e.g. 50×60 cm"
                                disabled={isLoading}
                                className={cn(INPUT_CLS, 'bg-white')}
                            />
                        </Field>
                    </div>
                </section>

                {/* ── Status ── */}
                <section>
                    <SectionDivider label="Status" />
                    <Field label="Published status" required>
                        <Select
                            value={normalizeStatus(watchValues.status)}
                            onValueChange={(v) => setField('status' as Path<ComboFormValues>, v as PathValue<ComboFormValues, 'status'>)}
                            disabled={isLoading}
                        >
                            <SelectTrigger className={cn(SELECT_TRIGGER_CLS, "bg-white", errors.status && "border-red-400")}>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                                {allowedTransitions.map((status) => (
                                    <SelectItem key={status} value={status} className="rounded-lg py-2">
                                        <div className="flex items-center gap-2 text-sm text-slate-700">
                                            <div className={cn(
                                                "h-1.5 w-1.5 rounded-full",
                                                PRODUCT_STATUS_COLORS[status as keyof typeof PRODUCT_STATUS_COLORS] || 'bg-amber-400'
                                            )} />
                                            {PRODUCT_STATUSES.find(s => s.value === status)?.label || status}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {isEdit && (
                            <div className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50/30 text-indigo-700 border border-indigo-100/50">
                                <span className="text-[10px] font-bold uppercase tracking-wider">
                                    Current Persistence: {normalizeStatus(watchValues.status)}
                                </span>
                            </div>
                        )}
                        <ErrorMsg error={errors.status} />
                    </Field>
                </section>

                {/* ── Media ── */}
                <section>
                    <SectionDivider label="Media" />
                    {!comboId ? (
                        <div className="flex flex-col items-center justify-center gap-2 py-5 border border-dashed border-slate-200 rounded-lg bg-slate-50/60">
                            <Upload className="h-5 w-5 text-slate-300" />
                            <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                                Save this variant first<br />to unlock image upload.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-white group">
                                {isMediaLoading && (
                                    <div className="absolute inset-0 z-10 bg-white/70 flex items-center justify-center">
                                        <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                                    </div>
                                )}
                                <div className="h-32 bg-slate-50 flex items-center justify-center overflow-hidden">
                                    {watchValues.imageUrl ? (
                                        <img
                                            src={watchValues.imageUrl}
                                            alt="Variant"
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    ) : (
                                        <ImageIcon className="h-8 w-8 text-slate-300" />
                                    )}
                                </div>
                                <div className="flex items-center justify-between gap-2 px-3 py-2.5 border-t border-slate-100">
                                    <p className="text-[10px] font-mono text-slate-400 truncate min-w-0">
                                        {watchValues.imagePublicId || '—'}
                                    </p>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        {watchValues.imagePublicId && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-red-400 hover:bg-red-50"
                                                onClick={handleDeleteImage}
                                                disabled={isMediaLoading}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        )}
                                        <Button
                                            type="button"
                                            size="sm"
                                            className="h-7 px-3 text-[11px] font-semibold rounded-md"
                                            onClick={() => setShowUploadDialog(true)}
                                            disabled={isMediaLoading}
                                        >
                                            <Upload className="h-3 w-3 mr-1.5" />
                                            {watchValues.imageUrl ? 'Change' : 'Upload'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            <ImageUploadDialog
                                open={showUploadDialog}
                                onOpenChange={setShowUploadDialog}
                                productId={comboId}
                                productName={watchValues.name || ''}
                                onUpload={async (cid, files) => {
                                    await uploadMutation.mutateAsync({ comboId: cid, files });
                                    setShowUploadDialog(false);
                                }}
                                isUploading={uploadMutation.isPending}
                            />
                        </>
                    )}
                </section>
            </div>
        </div>
    );
});
LeftPanel.displayName = 'LeftPanel';

// ─────────────────────────────────────────────────────────────
// Main ComboFormFields
// ─────────────────────────────────────────────────────────────

interface ComboFormFieldsProps {
    register: UseFormRegister<ComboFormValues>;
    errors: FieldErrors<ComboFormValues>;
    comboParents: { id: string; label: string; imageUrl?: string; sku?: string }[];
    variantOptions: VariantOption[];
    handleNameChange: (v: string) => void;
    setField: <K extends Path<ComboFormValues>>(field: K, value: PathValue<ComboFormValues, K>) => void;
    isEdit: boolean;
    mode: ComboDialogMode;
    isLoading: boolean;
    isLoadingVariants: boolean;
    watchValues: Partial<ComboFormValues>;
    comboId?: string;
}

const ComboFormFields = memo(({
    register,
    errors,
    comboParents,
    variantOptions,
    handleNameChange,
    setField,
    isEdit,
    mode,
    isLoading,
    isLoadingVariants,
    watchValues,
    comboId,
}: ComboFormFieldsProps) => {
    const LEFT_PANEL_WIDTH = "440px";

    const allowedTransitions = useMemo(() =>
        getAllowedStatusTransitions(normalizeStatus(watchValues.status)),
        [watchValues.status]
    );

    const handleSyncPrice = useCallback(() => {
        const total = (watchValues.items ?? []).reduce(
            (sum, i) => sum + (i.salePrice ?? 0) * (i.quantity ?? 1),
            0,
        );
        setField(
            'salePrice' as Path<ComboFormValues>,
            total as PathValue<ComboFormValues, 'salePrice'>,
        );
    }, [watchValues.items, setField]);

    // ── Variant mode: unified 2-column layout ────────────────
    if (mode === 'variant') {
        return (
            <TabsContent
                value="unified"
                className="mt-0 outline-none h-full overflow-hidden"
            >
                {/* Balanced Workspace: Grid structure with generous Identity column */}
                <div 
                    className="grid h-full w-full overflow-hidden"
                    style={{ gridTemplateColumns: `${LEFT_PANEL_WIDTH} 1fr` }}
                >
                {/* Left column */}
                <LeftPanel
                    register={register}
                    errors={errors}
                    isLoading={isLoading}
                    comboParents={comboParents}
                    watchValues={watchValues}
                    setField={setField}
                    onNameChange={handleNameChange}
                    comboId={comboId}
                    isEdit={isEdit}
                />

                {/* Right column */}
                <div className="flex flex-col bg-slate-50/60 min-h-0">
                    {/* Pricing strip */}
                    <PricingStrip
                        marketValue={watchValues.basePrice}
                        salePrice={watchValues.salePrice}
                        isLoading={isLoading}
                        setField={setField}
                        onSync={handleSyncPrice}
                    />

                    {/* Bundle workspace */}
                    <div className="flex-1 min-h-0 overflow-hidden">
                        <ComboItemsPanel
                            items={watchValues.items || []}
                            onChange={newItems =>
                                setField(
                                    'items' as Path<ComboFormValues>,
                                    newItems as PathValue<ComboFormValues, 'items'>,
                                )
                            }
                            onSyncPrice={total =>
                                setField(
                                    'salePrice' as Path<ComboFormValues>,
                                    total as PathValue<ComboFormValues, 'salePrice'>,
                                )
                            }
                            variantOptions={variantOptions}
                            isLoadingVariants={isLoadingVariants}
                            disabled={isLoading}
                            comboPriceOverride={watchValues.salePrice}
                        />
                    </div>
                    </div>
                </div>
            </TabsContent>
        );
    }

    // ── Parent mode: tabbed layout (unchanged structure) ─────
    return (
        <div className="animate-in fade-in duration-300">
            {/* General tab */}
            <TabsContent value="general" className="mt-0 space-y-5 animate-in fade-in slide-in-from-left-1 duration-200">
                <section className="space-y-3">
                    <SectionDivider label="Identity & attributes" />
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Combo name" required>
                            <Input
                                {...register('name')}
                                placeholder="e.g. Dreamy Night Pack"
                                onChange={e => handleNameChange(e.target.value)}
                                disabled={isLoading}
                                className={cn(INPUT_CLS, 'bg-white', errors.name && 'border-red-400')}
                            />
                            <ErrorMsg error={errors.name} />
                        </Field>
                        <Field label="URL slug" hint="Auto-generated">
                            <Input
                                {...register('slug')}
                                disabled
                                className={cn(INPUT_CLS, 'bg-slate-50 font-mono text-[11px] text-slate-400 cursor-not-allowed')}
                            />
                        </Field>
                    </div>
                    <Field label="Age group" required>
                        <Select
                            value={String(watchValues.ageGroup || '')}
                            onValueChange={v =>
                                setField(
                                    'ageGroup' as Path<ComboFormValues>,
                                    Number(v) as PathValue<ComboFormValues, 'ageGroup'>,
                                )
                            }
                            disabled={isLoading}
                        >
                            <SelectTrigger className={SELECT_TRIGGER_CLS}>
                                <SelectValue placeholder="Select age group…" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                                {Object.entries(AGE_GROUPS).map(([val, label]) => (
                                    <SelectItem key={val} value={val} className="rounded-lg py-2">
                                        {label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <ErrorMsg error={errors.ageGroup} />
                    </Field>
                    <Field label="Short description" required hint={`${watchValues.description?.length ?? 0}/120`}>
                        <Textarea
                            {...register('description')}
                            placeholder="Provide a summary of this combo…"
                            disabled={isLoading}
                            maxLength={120}
                            rows={2}
                            className={cn(
                                'w-full rounded-lg border border-slate-200 bg-white hover:border-slate-300',
                                'focus:border-blue-400 focus:ring-2 focus:ring-blue-400/15',
                                'transition-all text-sm text-slate-900 resize-none p-2.5',
                                errors.description && 'border-red-400',
                            )}
                        />
                        <ErrorMsg error={errors.description} />
                    </Field>
                </section>

                <section className="space-y-3">
                    <SectionDivider label="Media" />
                    {!comboId ? (
                        <div className="flex flex-col items-center justify-center gap-2 py-6 border border-dashed border-slate-200 rounded-lg bg-slate-50/60">
                            <Upload className="h-5 w-5 text-slate-300" />
                            <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                                Save this combo first to enable image upload.
                            </p>
                        </div>
                    ) : (
                        <MediaBlock
                            watchValues={watchValues}
                            comboId={comboId}
                        />
                    )}
                </section>
            </TabsContent>

            {/* Config tab */}
            <TabsContent value="config" className="mt-0 space-y-5 animate-in fade-in slide-in-from-left-1 duration-200">
                <section className="space-y-3">
                    <SectionDivider label="Inventory & policy" />
                    <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-100">
                        <div className="h-10 w-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                            <Upload className="h-4 w-4 text-slate-400" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-700">Parent configuration mode</p>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Color, size and status are managed at the variant level.
                            </p>
                        </div>
                    </div>
                    <Field label="Published status" required>
                        {!isEdit ? (
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200/60">
                                <div className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                                <span className="text-[11px] font-semibold text-amber-700">Draft — auto-assigned on creation</span>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Select
                                    value={normalizeStatus(watchValues.status)}
                                    onValueChange={v =>
                                        setField(
                                            'status' as Path<ComboFormValues>,
                                            v as PathValue<ComboFormValues, 'status'>,
                                        )
                                    }
                                    disabled={isLoading}
                                >
                                    <SelectTrigger className={cn(SELECT_TRIGGER_CLS, 'bg-white', errors.status && 'border-red-400')}>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                                        {PRODUCT_STATUSES.filter(s =>
                                            allowedTransitions.includes(s.value),
                                        ).map(s => (
                                            <SelectItem key={s.value} value={s.value} className="rounded-lg py-2">
                                                <div className="flex items-center gap-2 text-sm text-slate-700">
                                                    <div className={cn('h-1.5 w-1.5 rounded-full', PRODUCT_STATUS_COLORS[s.value])} />
                                                    {s.label}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50/30 text-indigo-700 border border-indigo-100/50 w-fit">
                                    <span className="text-[10px] font-bold uppercase tracking-wider">
                                        Current Persistence: {normalizeStatus(watchValues.status)}
                                    </span>
                                </div>
                                <ErrorMsg error={errors.status} />
                            </div>
                        )}
                    </Field>
                </section>
            </TabsContent>

            {/* Pricing tab */}
            <TabsContent value="pricing" className="mt-0 space-y-5 animate-in fade-in slide-in-from-left-1 duration-200">
                <section className="max-w-sm space-y-3">
                    <SectionDivider label="Price configuration" />
                    <Field label="Base market value" required>
                        <div className="relative">
                            <Input
                                value={formatNumber(watchValues.basePrice)}
                                onChange={e =>
                                    setField(
                                        'basePrice' as Path<ComboFormValues>,
                                        unformatNumber(e.target.value) as PathValue<ComboFormValues, 'basePrice'>,
                                    )
                                }
                                disabled={isLoading}
                                className={cn(INPUT_CLS, 'pr-8 bg-white')}
                            />
                            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-400">₫</span>
                        </div>
                        <ErrorMsg error={errors.basePrice} />
                    </Field>
                    <Field label="Sale price" required>
                        <div className="relative">
                            <Input
                                value={formatNumber(watchValues.salePrice)}
                                onChange={e =>
                                    setField(
                                        'salePrice' as Path<ComboFormValues>,
                                        unformatNumber(e.target.value) as PathValue<ComboFormValues, 'salePrice'>,
                                    )
                                }
                                disabled={isLoading}
                                className={cn(INPUT_CLS, 'pr-8 bg-white')}
                            />
                            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-400">₫</span>
                        </div>
                        <ErrorMsg error={errors.salePrice} />
                    </Field>
                </section>
                <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-50 border border-slate-100">
                    <Upload className="h-4 w-4 text-slate-400 shrink-0" />
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                        Bundle items and per-variant pricing are managed inside each child variant.
                    </p>
                </div>
            </TabsContent>
        </div>
    );
});

ComboFormFields.displayName = 'ComboFormFields';
export default ComboFormFields;

// ─────────────────────────────────────────────────────────────
// Internal helper — reusable media block for parent mode
// ─────────────────────────────────────────────────────────────

const MediaBlock = ({
    watchValues,
    comboId,
}: {
    watchValues: Partial<ComboFormValues>;
    comboId: string;
}) => {
    const [showUploadDialog, setShowUploadDialog] = useState(false);
    const uploadMutation = useUploadComboImage();
    const deleteMutation = useDeleteComboImage();
    const isMediaLoading = uploadMutation.isPending || deleteMutation.isPending;

    const handleDelete = async () => {
        if (!watchValues.imagePublicId) return;
        if (window.confirm('Delete this image?')) {
            await deleteMutation.mutateAsync(watchValues.imagePublicId);
        }
    };

    return (
        <>
            <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-white group">
                {isMediaLoading && (
                    <div className="absolute inset-0 z-10 bg-white/70 flex items-center justify-center">
                        <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                    </div>
                )}
                <div className="h-32 bg-slate-50 flex items-center justify-center overflow-hidden">
                    {watchValues.imageUrl ? (
                        <img
                            src={watchValues.imageUrl}
                            alt="Combo"
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    ) : (
                        <ImageIcon className="h-8 w-8 text-slate-300" />
                    )}
                </div>
                <div className="flex items-center justify-between gap-2 px-3 py-2.5 border-t border-slate-100">
                    <p className="text-[10px] font-mono text-slate-400 truncate min-w-0">
                        {watchValues.imagePublicId || '—'}
                    </p>
                    <div className="flex items-center gap-1.5 shrink-0">
                        {watchValues.imagePublicId && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-red-400 hover:bg-red-50"
                                onClick={handleDelete}
                                disabled={isMediaLoading}
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                        )}
                        <Button
                            type="button"
                            size="sm"
                            className="h-7 px-3 text-[11px] font-semibold rounded-md"
                            onClick={() => setShowUploadDialog(true)}
                            disabled={isMediaLoading}
                        >
                            <Upload className="h-3 w-3 mr-1.5" />
                            {watchValues.imageUrl ? 'Change' : 'Upload'}
                        </Button>
                    </div>
                </div>
            </div>
            <ImageUploadDialog
                open={showUploadDialog}
                onOpenChange={setShowUploadDialog}
                productId={comboId}
                productName={watchValues.name || ''}
                onUpload={async (cid, files) => {
                    await uploadMutation.mutateAsync({ comboId: cid, files });
                    setShowUploadDialog(false);
                }}
                isUploading={uploadMutation.isPending}
            />
        </>
    );
};