import { useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
    Loader2,
    Package,
    Tag,
    DollarSign,
    Scale,
    CircleDot,
    Sparkles,
    RefreshCw,
    Ruler,
    Move3D,
} from 'lucide-react';
import type { ProductVariant, VariantStatus, CreateVariantRequest, VariantAttributes } from '../../types';
import { VARIANT_STATUS_TO_INT } from '../../types';
import ColorPicker from './ColorPicker';
import SectionHeading from '../shared/SectionHeading';
import AttributesEditor, { type AttributeField } from './AttributesEditor';

/* ─── Constants ───────────────────────────────────────── */
const STATUS_COLORS: Record<string, string> = {
    Active: 'bg-emerald-500',
    Inactive: 'bg-gray-400',
};

const VARIANT_STATUSES: { value: VariantStatus; label: string }[] = [
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
];

const INPUT_CLS =
    'h-11 rounded-xl border-gray-200 bg-gray-50/50 hover:border-purple-300 hover:bg-white focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 transition-all';

const SELECT_CLS = cn(INPUT_CLS, 'px-3.5 [&>span]:flex [&>span]:items-center [&>span]:gap-2');

/* ─── Helper: Generate SKU ────────────────────────────── */
const generateSku = (productSlug: string, variantIndex: number): string => {
    const prefix = productSlug
        .split('-')
        .slice(0, 3)
        .map(s => s.toUpperCase().slice(0, 4))
        .join('-');
    return `${prefix}-V${String(variantIndex + 1).padStart(3, '0')}`;
};

/* ─── Helper: Parse Attributes ────────────────────────── */
const parseAttributesToFields = (attributes: VariantAttributes | null | undefined): AttributeField[] => {
    if (!attributes) return [];
    return Object.entries(attributes)
        .filter(([key]) => !['width', 'length', 'thickness', 'color'].includes(key))
        .map(([key, value]) => ({ key, value: String(value ?? '') }));
};

/* ─── Props ───────────────────────────────────────────── */
interface VariantDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    variant?: ProductVariant | null;
    productId: string;
    productName: string;
    productSlug?: string;
    variantCount?: number;
    onSubmit: (data: CreateVariantRequest) => void;
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
    
    // Color (hex code stored in attributes)
    const [color, setColor] = useState(variant?.attributes?.color ?? '#f5f5f5');
    
    // Pricing
    const [basePrice, setBasePrice] = useState(
        variant?.basePrice != null ? String(variant.basePrice) : ''
    );
    const [salePrice, setSalePrice] = useState(
        variant?.salePrice != null ? String(variant.salePrice) : ''
    );
    const [weight, setWeight] = useState(
        variant?.weight != null ? String(variant.weight) : ''
    );
    
    // Other
    const [isNew, setIsNew] = useState(variant?.isNew ?? false);
    const [status, setStatus] = useState<VariantStatus>(variant?.status || 'Active');

    // Dynamic attributes (key-value pairs for extra fields)
    const [attributes, setAttributes] = useState<AttributeField[]>(
        () => parseAttributesToFields(variant?.attributes)
    );

    const handleColorChange = useCallback((_name: string, code: string) => {
        setColor(code);
    }, []);

    const handleRegenerateSku = useCallback(() => {
        if (productSlug) {
            setSku(generateSku(productSlug, variantCount));
        }
    }, [productSlug, variantCount]);

    const handleSubmit = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            if (!sku.trim() || !basePrice.trim()) return;

            // Build attributes object
            const finalAttributes: VariantAttributes = {};

            // Add dimensions if present
            if (width) finalAttributes.width = Number(width);
            if (length) finalAttributes.length = Number(length);
            if (thickness) finalAttributes.thickness = Number(thickness);
            
            // Add color (hex)
            if (color) finalAttributes.color = color;

            // Add dynamic attributes
            attributes.forEach(attr => {
                if (attr.key.trim()) {
                    finalAttributes[attr.key.trim()] = attr.value;
                }
            });

            onSubmit({
                productId,
                sku: sku.trim(),
                basePrice: Number(basePrice),
                salePrice: salePrice ? Number(salePrice) : Number(basePrice),
                weight: weight ? Number(weight) : null,
                isNew,
                status: VARIANT_STATUS_TO_INT[status],
                attributes: Object.keys(finalAttributes).length > 0 ? finalAttributes : null,
            });
        },
        [productId, sku, width, length, thickness, color, basePrice, salePrice, weight, isNew, status, attributes, onSubmit]
    );

    const handleStatusChange = useCallback((v: string) => setStatus(v as VariantStatus), []);

    const isValid = sku.trim() !== '' && basePrice.trim() !== '';

    return (
        <>
            {/* Header */}
            <div className="flex items-center gap-4 pb-5 border-b border-gray-100">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                    <Package className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                    <DialogTitle className="text-xl font-bold text-gray-900">
                        {isEdit ? 'Edit Variant' : 'Add Variant'}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-gray-500 mt-0.5">
                        {isEdit ? 'Update variant details' : `Add a new variant for "${productName}"`}
                    </DialogDescription>
                </div>
            </div>

            {/* Form */}
            <form
                id="variant-form"
                onSubmit={handleSubmit}
                className="space-y-6 py-6 max-h-[65vh] overflow-y-auto px-1"
            >
                {/* Basic Info */}
                <section className="space-y-4">
                    <SectionHeading title="Basic Information" />

                    {/* SKU */}
                    <div className="space-y-2">
                        <Label htmlFor="sku" className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                            <Tag className="h-3.5 w-3.5 text-gray-400" />
                            SKU <span className="text-red-500">*</span>
                        </Label>
                        <div className="flex gap-2">
                            <Input
                                id="sku"
                                placeholder="e.g. PROD-001"
                                value={sku}
                                onChange={(e) => setSku(e.target.value)}
                                disabled={isLoading}
                                className={cn(INPUT_CLS, 'font-mono text-sm flex-1')}
                                autoFocus
                            />
                            {!isEdit && productSlug && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={handleRegenerateSku}
                                    disabled={isLoading}
                                    className="h-11 w-11 rounded-xl border-gray-200 hover:border-purple-300"
                                    title="Regenerate SKU"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                </section>

                {/* Dimensions */}
                <section className="space-y-4">
                    <SectionHeading title="Dimensions" />

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="width" className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                                <Ruler className="h-3.5 w-3.5 text-gray-400" />
                                Width
                            </Label>
                            <div className="relative">
                                <Input
                                    id="width"
                                    type="number"
                                    min={0}
                                    placeholder="0"
                                    value={width}
                                    onChange={(e) => setWidth(e.target.value)}
                                    disabled={isLoading}
                                    className={cn(INPUT_CLS, 'pr-10')}
                                />
                                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">cm</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="length" className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                                <Ruler className="h-3.5 w-3.5 text-gray-400" />
                                Length
                            </Label>
                            <div className="relative">
                                <Input
                                    id="length"
                                    type="number"
                                    min={0}
                                    placeholder="0"
                                    value={length}
                                    onChange={(e) => setLength(e.target.value)}
                                    disabled={isLoading}
                                    className={cn(INPUT_CLS, 'pr-10')}
                                />
                                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">cm</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="thickness" className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                                <Move3D className="h-3.5 w-3.5 text-gray-400" />
                                Thickness
                            </Label>
                            <div className="relative">
                                <Input
                                    id="thickness"
                                    type="number"
                                    min={0}
                                    placeholder="0"
                                    value={thickness}
                                    onChange={(e) => setThickness(e.target.value)}
                                    disabled={isLoading}
                                    className={cn(INPUT_CLS, 'pr-10')}
                                />
                                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">cm</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Color */}
                <section className="space-y-4">
                    <SectionHeading title="Color" />
                    <ColorPicker
                        color=""
                        colorCode={color}
                        onColorChange={handleColorChange}
                        disabled={isLoading}
                    />
                </section>

                {/* Custom Attributes */}
                <AttributesEditor
                    attributes={attributes}
                    onChange={setAttributes}
                    disabled={isLoading}
                />

                {/* Pricing */}
                <section className="space-y-4">
                    <SectionHeading title="Pricing" />

                    <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <Label htmlFor="basePrice" className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                                <DollarSign className="h-3.5 w-3.5 text-gray-400" />
                                Base Price <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                                <Input
                                    id="basePrice"
                                    type="number"
                                    min={0}
                                    placeholder="0"
                                    value={basePrice}
                                    onChange={(e) => setBasePrice(e.target.value)}
                                    disabled={isLoading}
                                    className={cn(INPUT_CLS, 'pr-10')}
                                />
                                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">đ</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="salePrice" className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                                <DollarSign className="h-3.5 w-3.5 text-green-500" />
                                Sale Price
                            </Label>
                            <div className="relative">
                                <Input
                                    id="salePrice"
                                    type="number"
                                    min={0}
                                    placeholder="Leave empty for no sale"
                                    value={salePrice}
                                    onChange={(e) => setSalePrice(e.target.value)}
                                    disabled={isLoading}
                                    className={cn(INPUT_CLS, 'pr-10')}
                                />
                                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">đ</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Other Details */}
                <section className="space-y-4">
                    <SectionHeading title="Other Details" />

                    <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <Label htmlFor="weight" className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                                <Scale className="h-3.5 w-3.5 text-gray-400" />
                                Weight
                            </Label>
                            <div className="relative">
                                <Input
                                    id="weight"
                                    type="number"
                                    min={0}
                                    step={0.1}
                                    placeholder="0"
                                    value={weight}
                                    onChange={(e) => setWeight(e.target.value)}
                                    disabled={isLoading}
                                    className={cn(INPUT_CLS, 'pr-10')}
                                />
                                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">kg</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                                <CircleDot className="h-3.5 w-3.5 text-gray-400" />
                                Status
                            </Label>

                            <Select value={status} onValueChange={handleStatusChange} disabled={isLoading}>
                                <SelectTrigger className={SELECT_CLS}>
                                    <span
                                        className={cn(
                                            'h-2.5 w-2.5 rounded-full shrink-0',
                                            STATUS_COLORS[status]
                                        )}
                                    />
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>

                                <SelectContent className="rounded-xl shadow-xl z-[200]">
                                    {VARIANT_STATUSES.map((s, index) => (
                                        <SelectItem
                                            key={`status-${index}`}
                                            value={s.value}
                                            className="rounded-lg hover:bg-purple-50 hover:text-purple-900"
                                        >
                                            <span className="flex items-center gap-2">
                                                {s.label}
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* isNew Toggle */}
                    <div className="rounded-xl border border-gray-200 bg-white p-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1 flex-1">
                                <Label htmlFor="isNew" className="text-sm font-medium text-gray-900 cursor-pointer flex items-center gap-2">
                                    <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                                    Mark as New
                                </Label>
                                <p className="text-xs text-gray-500">
                                    {isNew ? 'This variant will display a "New" badge' : 'No "New" badge will be shown'}
                                </p>
                            </div>
                            <Switch
                                id="isNew"
                                checked={isNew}
                                onCheckedChange={setIsNew}
                                disabled={isLoading}
                                className="data-[state=checked]:bg-purple-600"
                            />
                        </div>
                    </div>
                </section>
            </form>

            {/* Footer */}
            <div className="flex items-center gap-3 pt-5 border-t border-gray-100">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    disabled={isLoading}
                    className="flex-1 h-11 rounded-xl border-gray-200 hover:border-gray-300 hover:bg-gray-50 font-medium transition-all"
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    form="variant-form"
                    disabled={isLoading || !isValid}
                    className={cn(
                        'flex-1 h-11 rounded-xl font-medium transition-all',
                        'bg-gradient-to-r from-indigo-600 to-purple-600',
                        'hover:from-indigo-700 hover:to-purple-700',
                        'shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40',
                        'disabled:opacity-50 disabled:shadow-none',
                    )}
                >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isEdit ? 'Save Changes' : 'Add Variant'}
                </Button>
            </div>
        </>
    );
}

/* ─── Dialog Wrapper ──────────────────────────────────── */
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
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[740px] rounded-2xl p-7 gap-0">
                <VariantDialogInner
                    key={variant?.id ?? 'new'}
                    variant={variant}
                    productId={productId}
                    productName={productName}
                    productSlug={productSlug}
                    variantCount={variantCount}
                    onOpenChange={onOpenChange}
                    onSubmit={onSubmit}
                    isLoading={isLoading}
                />
            </DialogContent>
        </Dialog>
    );
}
