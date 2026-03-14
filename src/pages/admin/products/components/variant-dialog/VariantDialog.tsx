import { useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
    Tag,
    DollarSign,
    Scale,
    Sparkles,
    RefreshCw,
    Ruler,
    Move3D,
    CircleDot,
} from 'lucide-react';
import type { ProductVariant, VariantStatus, VariantAttributes } from '../../types';
import { VARIANT_STATUS_OPTIONS, normalizeStatus, getAllowedStatusTransitions, PRODUCT_STATUS_COLORS } from '../../types';
import { useVariantDetail } from '@/hooks/queries/useProduct';
import ColorPicker from './ColorPicker';
import SectionHeading from '../shared/SectionHeading';
import { Badge } from '@/components/ui/badge';

const INPUT_CLS =
    'h-11 rounded-xl border-gray-200 bg-gray-50/50 hover:border-[#4988c4]/60 hover:bg-white focus:border-[#4988c4] focus:ring-2 focus:ring-[#4988c4]/20 transition-all';


/* ─── Helper: Generate SKU ────────────────────────────── */
const generateSku = (productSlug: string, variantIndex: number): string => {
    const prefix = productSlug
        .split('-')
        .slice(0, 3)
        .map(s => s.toUpperCase().slice(0, 4))
        .join('-');
    return `${prefix}-V${String(variantIndex + 1).padStart(3, '0')}`;
};

/* ─── Props ───────────────────────────────────────────── */
export interface VariantFormData {
    productid: string;
    sku: string;
    baseprice: number;
    saleprice: number;
    weight: number;
    status: VariantStatus;
    stockStatus: string;
    attributes: VariantAttributes | null;
    isNew: boolean;
}

interface VariantDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    variant?: ProductVariant | null;
    productId: string;
    productName: string;
    productSlug?: string;
    variantCount?: number;
    onSubmit: (data: VariantFormData) => void;
    isLoading?: boolean;
}

/* ─── Inner Form ──────────────────────────────────────── */
function VariantDialogInner({
    variant,
    productId,
    productName,
    productSlug = '',
    variantCount = 0,
    onOpenChange,
    onSubmit,
    isLoading = false,
}: Omit<VariantDialogProps, 'open'>) {
    const isEdit = !!variant;

    // Generate initial SKU for new variants
    const initialSku = useMemo(() => {
        if (variant?.sku) return variant.sku;
        if (productSlug) return generateSku(productSlug, variantCount);
        return '';
    }, [variant?.sku, productSlug, variantCount]);

    // State
    const [sku, setSku] = useState(initialSku);

    // Dimensions (stored in attributes)
    const [width, setWidth] = useState(
        variant?.attributes?.width != null ? String(variant.attributes.width) : ''
    );
    const [length, setLength] = useState(
        variant?.attributes?.length != null ? String(variant.attributes.length) : ''
    );
    const [thickness, setThickness] = useState(
        variant?.attributes?.thickness != null ? String(variant.attributes.thickness) : ''
    );

    // Color (stored in attributes as color (name) and hexColor (code))
    const [colorHex, setColorHex] = useState(() => {
        const attr = variant?.attributes;
        // Case 1: hexColor exists
        if (attr?.hexColor && typeof attr.hexColor === 'string') return attr.hexColor;
        // Case 2: color exists and is a hex
        if (attr?.color && typeof attr.color === 'string' && attr.color.startsWith('#')) return attr.color;
        return '#f5f5f5';
    });
    const [colorName, setColorName] = useState(() => {
        const attr = variant?.attributes;
        if (attr?.color && typeof attr.color === 'string' && !attr.color.startsWith('#')) return attr.color;
        return 'Custom';
    });

    // Pricing
    const [basePrice, setBasePrice] = useState(
        variant?.basePrice != null ? String(variant.basePrice) : ''
    );
    const [salePrice, setSalePrice] = useState(() => {
        if (variant?.salePrice != null) {
            // Nếu Sale Price khớp Base Price, hiển thị trống để hệ thống tự process lại bằng Base Price.
            return variant.salePrice === variant.basePrice ? '' : String(variant.salePrice);
        }
        return '';
    });
    const [weight, setWeight] = useState(
        variant?.weight != null ? String(variant.weight) : ''
    );

    // Other
    const [isNew, setIsNew] = useState(variant?.isNew ?? false);
    const [status, setStatus] = useState<VariantStatus>(() => normalizeStatus(variant?.status || 'Draft') as VariantStatus);
    const stockStatus = variant?.stockStatus || 'In Stock';

    const handleColorChange = useCallback((name: string, code: string) => {
        setColorHex(code);
        setColorName(name);
    }, []);

    const handleRegenerateSku = useCallback(() => {
        if (productSlug) {
            setSku(generateSku(productSlug, variantCount));
        }
    }, [productSlug, variantCount]);

    const handleSubmit = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            const parsedBase = Number(basePrice);
            const isEmptySale = salePrice.toString().trim() === '';
            const parsedSale = isEmptySale ? parsedBase : Number(salePrice);

            if (!sku.trim() || !basePrice.trim() || parsedBase <= 0) return;
            if (!isEmptySale && (parsedSale <= 0 || parsedSale > parsedBase)) return;

            // Build attributes object
            const finalAttributes: VariantAttributes = {};

            // Add dimensions if present
            if (width) finalAttributes.width = Number(width);
            if (length) finalAttributes.length = Number(length);
            if (thickness) finalAttributes.thickness = Number(thickness);

            // Add color info
            if (colorName) finalAttributes.color = colorName;
            if (colorHex) finalAttributes.hexColor = colorHex;

            onSubmit({
                productid: productId,
                sku: sku.trim(),
                baseprice: parsedBase,
                saleprice: parsedSale,
                weight: weight ? Number(weight) : 0,
                status,
                stockStatus: stockStatus,
                attributes: Object.keys(finalAttributes).length > 0 ? finalAttributes : null,
                isNew,
            });
        },
        [productId, sku, width, length, thickness, colorName, colorHex, basePrice, salePrice, weight, status, stockStatus, isNew, onSubmit]
    );

    const parsedBasePrice = Number(basePrice);
    const parsedSalePrice = Number(salePrice);
    const isSalePriceEmpty = salePrice.toString().trim() === '';

    const isValid = sku.trim() !== '' &&
        basePrice.trim() !== '' &&
        parsedBasePrice > 0 &&
        (isSalePriceEmpty || (parsedSalePrice > 0 && parsedSalePrice <= parsedBasePrice));

    return (
        <>
            {/* Header */}
            <div className="flex items-center gap-4 pb-5 border-b border-gray-100">
                <div className="w-12 h-12 rounded-2xl bg-[#4988c4] flex items-center justify-center shadow-sm">
                    <Package className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                        <DialogTitle className="text-xl font-bold text-gray-900">
                            {isEdit ? 'Edit Variant' : 'Add Variant'}
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-sm text-gray-500 mt-0.5">
                        {isEdit ? 'Update variant details' : `Add a new variant for "${productName}"`}
                    </DialogDescription>
                </div>
            </div>

            {/* Form */}
            <form
                id="variant-form"
                onSubmit={handleSubmit}
                className="space-y-8 py-8 max-h-[70vh] overflow-y-auto px-1 custom-scrollbar"
            >
                {/* ── Section 1: Identity ── */}
                <div className="space-y-2">
                    <Label htmlFor="sku" className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                        <Tag className="h-3.5 w-3.5 text-gray-400" />
                        SKU Identifier <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex gap-2">
                        <Input
                            id="sku"
                            placeholder="e.g. BABY-BEDD-V001"
                            value={sku}
                            onChange={(e) => setSku(e.target.value)}
                            disabled={isLoading}
                            className={cn(INPUT_CLS, 'font-mono text-sm flex-1 font-bold')}
                        />
                        {!isEdit && productSlug && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleRegenerateSku}
                                disabled={isLoading}
                                className="h-11 px-3 rounded-xl border-gray-200"
                            >
                                <RefreshCw className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* ── Section 2: Pricing (Fixed Alignment) ── */}
                <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100 space-y-5">
                    <SectionHeading title="Pricing & Commercials" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between min-h-[20px]">
                                <Label htmlFor="basePrice" className="text-sm font-medium text-gray-700">
                                    Base Price (Original) <span className="text-red-500">*</span>
                                </Label>
                            </div>
                            <div className="relative group">
                                <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    id="basePrice"
                                    type="number"
                                    placeholder="0"
                                    value={basePrice}
                                    onChange={(e) => setBasePrice(e.target.value)}
                                    disabled={isLoading}
                                    className={cn(INPUT_CLS, 'pl-10 font-bold')}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between min-h-[20px]">
                                <Label htmlFor="salePrice" className="text-sm font-medium text-gray-700">
                                    Sale Price (Discounted)
                                </Label>
                                {Number(basePrice) > Number(salePrice) && Number(salePrice) > 0 && (
                                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                                        -{Math.round(((Number(basePrice) - Number(salePrice)) / Number(basePrice)) * 100)}%
                                    </span>
                                )}
                            </div>
                            <div className="relative group">
                                <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                                <Input
                                    id="salePrice"
                                    type="number"
                                    placeholder="Promotional price"
                                    value={salePrice}
                                    onChange={(e) => setSalePrice(e.target.value)}
                                    disabled={isLoading}
                                    className={cn(INPUT_CLS, 'pl-10 font-bold text-emerald-600')}
                                />
                            </div>
                        </div>
                    </div>

                </div>

                {/* ── Section 3: Physical Specifications ── */}
                <div className="space-y-5">
                    <SectionHeading title="Physical Specifications" />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { id: 'width', label: 'Width', icon: Ruler, state: width, set: setWidth },
                            { id: 'length', label: 'Length', icon: Ruler, state: length, set: setLength },
                            { id: 'thickness', label: 'Thickness', icon: Move3D, state: thickness, set: setThickness },
                            { id: 'weight', label: 'Weight', icon: Scale, state: weight, set: setWeight, unit: 'kg' },
                        ].map((field) => (
                            <div key={field.id} className="space-y-2">
                                <Label htmlFor={field.id} className="text-[10px] font-black uppercase tracking-tighter text-slate-400 flex items-center gap-1.5">
                                    <field.icon className="h-3 w-3" />
                                    {field.label}
                                </Label>
                                <div className="relative">
                                    <Input
                                        id={field.id}
                                        type="number"
                                        placeholder="0"
                                        value={field.state}
                                        onChange={(e) => field.set(e.target.value)}
                                        disabled={isLoading}
                                        className={cn(INPUT_CLS, 'pr-10 font-bold')}
                                    />
                                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase">{field.unit || 'cm'}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Section 4: Visual & Other ── */}
                <div className="space-y-8">
                    <div className="space-y-4">
                        <SectionHeading title="Visual Characteristic" />
                        <ColorPicker
                            color={colorName}
                            colorCode={colorHex}
                            onColorChange={handleColorChange}
                            disabled={isLoading}
                        />
                    </div>

                    {/* Market & Configuration */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                        {/* Status Selection */}
                        <div className="space-y-2 flex-1">
                            <Label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                                <CircleDot className="h-3.5 w-3.5 text-gray-400" />
                                Market Status
                            </Label>
                            {!isEdit ? (
                                <div className="flex items-center gap-2.5 p-2.5 h-11 rounded-xl bg-amber-50 border border-amber-200/60 shadow-inner-sm">
                                    <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                                    <span className="text-xs font-bold text-amber-700">Initially <span className="border-b border-amber-400">Draft</span></span>
                                    <Badge variant="outline" className="ml-auto bg-white text-[10px] font-black uppercase text-amber-600 border-amber-200 shadow-sm">New</Badge>
                                </div>
                            ) : (
                                <Select
                                    value={status}
                                    onValueChange={(val) => setStatus(val as VariantStatus)}
                                    disabled={isLoading}
                                >
                                    <SelectTrigger className={cn(INPUT_CLS, 'w-full')}>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl shadow-xl">
                                        {VARIANT_STATUS_OPTIONS
                                            .filter(opt => getAllowedStatusTransitions(status).includes(opt.value))
                                            .map(opt => (
                                                <SelectItem key={opt.value} value={opt.value} className="rounded-lg">
                                                    <div className="flex items-center gap-2 font-bold text-slate-700">
                                                        <div className={cn(
                                                            'w-2 h-2 rounded-full',
                                                            PRODUCT_STATUS_COLORS[opt.value]
                                                        )} />
                                                        <span>{opt.label}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>

                        {/* isNew Toggle */}
                        <div className="flex flex-col justify-end">
                            <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 h-11 shadow-sm hover:border-[#4988c4]/40 transition-colors">
                                <Label htmlFor="isNew" className="text-sm font-medium text-gray-700 cursor-pointer flex items-center gap-2">
                                    <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                                    Mark as New Arrival
                                </Label>
                                <Switch
                                    id="isNew"
                                    checked={isNew}
                                    onCheckedChange={setIsNew}
                                    disabled={isLoading}
                                    className="data-[state=checked]:bg-[#4988c4] scale-75"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </form>

            {/* Footer */}
            <div className="flex items-center gap-4 pt-8 border-t border-slate-100">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={() => onOpenChange(false)}
                    disabled={isLoading}
                    className="flex-1 h-12 rounded-xl text-slate-500 font-bold hover:bg-slate-50"
                >
                    Discard Changes
                </Button>
                <Button
                    type="submit"
                    form="variant-form"
                    disabled={isLoading || !isValid}
                    className={cn(
                        'flex-[2] h-12 rounded-xl font-black uppercase tracking-widest text-white shadow-lg transition-all',
                        'bg-[#4988c4] hover:bg-[#3a6fa0] shadow-[#4988c4]/20 hover:shadow-[#4988c4]/30',
                        'disabled:opacity-50 disabled:shadow-none'
                    )}
                >
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Package className="mr-2 h-4 w-4" />}
                    {isEdit ? 'Commit Changes' : 'Initialize Variant'}
                </Button>
            </div>
        </>
    );
}

/* ─── Dialog Wrapper ──────────────────────────────────── */
function VariantDialogContent({
    variant,
    productId,
    productName,
    productSlug,
    variantCount,
    onOpenChange,
    onSubmit,
    isLoading,
}: Omit<VariantDialogProps, 'open'>) {
    const { data: fullData } = useVariantDetail(variant?.id || '', !!variant);

    const mergedVariant = useMemo(() => {
        if (!variant) return null;
        if (!fullData) return variant;
        return {
            ...variant,
            weight: fullData.weight ?? variant.weight,
            isNew: fullData.isNew ?? variant.isNew,
            attributes: fullData.attributes ?? variant.attributes,
            status: (fullData.status || variant.status) as VariantStatus,
            createdAt: fullData.createdAt || variant.createdAt,
            salePrice: fullData.salePrice ?? variant.salePrice,
            basePrice: fullData.basePrice ?? variant.basePrice,
        } as ProductVariant;
    }, [variant, fullData]);

    return (
        <VariantDialogInner
            key={mergedVariant?.id ? `${mergedVariant.id}-${!!fullData}` : 'new'}
            variant={mergedVariant}
            productId={productId}
            productName={productName}
            productSlug={productSlug}
            variantCount={variantCount}
            onOpenChange={onOpenChange}
            onSubmit={onSubmit}
            isLoading={isLoading}
        />
    );
}

export default function VariantDialog({
    open,
    onOpenChange,
    variant,
    productId,
    productName,
    productSlug,
    variantCount,
    onSubmit,
    isLoading,
}: VariantDialogProps) {
    // ⚡ {open && ...} forces unmount on close → fresh mount on re-open.
    // This guarantees useState() re-initializes with latest data every time.
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[740px] rounded-2xl p-7 gap-0">
                {open && (
                    <VariantDialogContent
                        variant={variant}
                        productId={productId}
                        productName={productName}
                        productSlug={productSlug}
                        variantCount={variantCount}
                        onOpenChange={onOpenChange}
                        onSubmit={onSubmit}
                        isLoading={isLoading}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}
