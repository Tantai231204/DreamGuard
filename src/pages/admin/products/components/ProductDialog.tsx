import { useState, useCallback, useMemo, memo } from 'react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import MaterialCombobox from './MaterialCombobox';
import {
    Loader2,
    Package,
    FolderTree,
    Baby,
    Shirt,
    Shield,
    RotateCcw,
    CircleDot,
} from 'lucide-react';
import type { Product, CreateProductRequest, ProductStatus } from '../types';
import { AGE_GROUPS, PRODUCT_STATUSES, STATUS_TO_INT } from '../types';
import type { CategoryResponse } from '@/api';

/* ─── Constants ───────────────────────────────────────── */
import { PRODUCT_STATUS_COLORS } from '../types';

const INPUT_CLS =
    'h-11 rounded-xl border-gray-200 bg-gray-50/50 hover:border-purple-300 hover:bg-white focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 transition-all';

const SELECT_CLS = cn(INPUT_CLS, 'px-3.5 [&>span]:!flex [&>span]:!items-center [&>span]:!gap-2');

/* ─── Section Heading ─────────────────────────────────── */
const SectionHeading = memo(function SectionHeading({ title }: { title: string }) {
    return (
        <h3 className="text-xs font-bold uppercase tracking-widest text-purple-600/70 flex items-center gap-2">
            <span className="h-px flex-1 bg-gradient-to-r from-purple-200 to-transparent" />
            {title}
            <span className="h-px flex-1 bg-gradient-to-l from-purple-200 to-transparent" />
        </h3>
    );
});

/* ─── Props ───────────────────────────────────────────── */
interface ProductDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product?: Product | null;
    onSubmit: (data: CreateProductRequest) => void | Promise<void>;
    isLoading?: boolean;
    categories?: CategoryResponse[];
}

/* ─── Inner Form ──────────────────────────────────────── */
function ProductDialogInner({
    product,
    onOpenChange,
    onSubmit,
    isLoading = false,
    categories = [],
}: Omit<ProductDialogProps, 'open'>) {
    const isEdit = !!product;

    const [name, setName] = useState(product?.name ?? '');
    const [slug, setSlug] = useState(product?.slug ?? '');
    const [summary, setSummary] = useState(product?.summary ?? '');
    const [description, setDescription] = useState(product?.description ?? '');
    const [material, setMaterial] = useState(product?.material ?? '');
    const [ageGroup, setAgeGroup] = useState<string>(
        product?.ageGroup != null ? String(product.ageGroup) : '',
    );
    const [warrantyPolicyDay, setWarrantyPolicyDay] = useState(
        product?.warrantyPolicyDay != null ? String(product.warrantyPolicyDay) : '',
    );
    const [returnPolicyDay, setReturnPolicyDay] = useState(
        product?.returnPolicyDay != null ? String(product.returnPolicyDay) : '',
    );
    const [status, setStatus] = useState<ProductStatus>(
        product?.status || 'Draft'
    );
    const [cateId, setCateId] = useState<string>(
        product?.cateId != null ? String(product.cateId) : '',
    );
    const [subCateId, setSubCateId] = useState<string>('');

    /* Flatten category tree (must be before callbacks that reference it) */
    const flatCategories = useMemo(() => {
        const result: { cateId: number; name: string; slug: string; depth: number; parentId?: number }[] = [];
        const walk = (list: CategoryResponse[], depth = 0, parentId?: number) => {
            for (const cat of list) {
                result.push({ cateId: cat.cateId, name: cat.name, slug: cat.slug, depth, parentId });
                if (cat.childCategoryList?.length) walk(cat.childCategoryList, depth + 1, cat.cateId);
            }
        };
        walk(categories);
        return result;
    }, [categories]);

    /* Find top-level parent of a category */
    const findTopLevelParent = useCallback((selectedCateId: string): string => {
        const cat = flatCategories.find(c => String(c.cateId) === selectedCateId);
        if (!cat || cat.depth === 0) return selectedCateId;

        // Walk up to find root
        let current = cat;
        while (current.parentId) {
            const parent = flatCategories.find(c => c.cateId === current.parentId);
            if (!parent) break;
            current = parent;
        }
        return String(current.cateId);
    }, [flatCategories]);

    /* Get child categories of selected category */
    const childCategories = useMemo(() => {
        if (!cateId) return [];
        const selectedCat = categories.find(c => String(c.cateId) === cateId);
        return selectedCat?.childCategoryList || [];
    }, [cateId, categories]);

    const toSlug = (text: string) =>
        text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');

    const buildSlug = useCallback(
        (productName: string, catId: string) => {
            const productSlug = toSlug(productName);
            if (!productSlug) return '';
            const cat = flatCategories.find((c) => String(c.cateId) === catId);
            const catSlug = cat?.slug?.trim() || (cat ? toSlug(cat.name) : '');
            return catSlug ? `${catSlug}-${productSlug}` : productSlug;
        },
        [flatCategories],
    );

    const handleNameChange = useCallback(
        (value: string) => {
            setName(value);
            if (!isEdit) setSlug(buildSlug(value, cateId));
        },
        [isEdit, cateId, buildSlug],
    );

    const handleCateChange = useCallback(
        (selectedCateId: string) => {
            const selectedCat = flatCategories.find(c => String(c.cateId) === selectedCateId);

            if (selectedCat && selectedCat.depth > 0) {
                // Selected a child category - set parent as cateId, child as subCateId
                const topLevelParentId = findTopLevelParent(selectedCateId);
                setCateId(topLevelParentId);
                setSubCateId(selectedCateId);
                if (!isEdit && name.trim()) setSlug(buildSlug(name, topLevelParentId));
            } else {
                // Selected a top-level category
                setCateId(selectedCateId);
                setSubCateId('');
                if (!isEdit && name.trim()) setSlug(buildSlug(name, selectedCateId));
            }
        },
        [isEdit, name, buildSlug, flatCategories, findTopLevelParent],
    );

    const handleSubmit = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            // If has subcategories, use subcategory. Otherwise require material
            const hasSubcategories = childCategories.length > 0;
            const materialOrSubcate = hasSubcategories ? subCateId : material.trim();

            if (!name.trim() || !slug.trim() || !summary.trim() || !description.trim() || !materialOrSubcate) return;

            onSubmit({
                name: name.trim(),
                slug: slug.trim(),
                summary: summary.trim(),
                description: description.trim(),
                material: hasSubcategories && subCateId
                    ? (childCategories.find((c) => String(c.cateId) === subCateId)?.name ?? '')
                    : material.trim(),
                ageGroup: ageGroup ? Number(ageGroup) : null,
                warrantyPolicyDay: warrantyPolicyDay ? Number(warrantyPolicyDay) : null,
                returnPolicyDay: returnPolicyDay ? Number(returnPolicyDay) : null,
                status: STATUS_TO_INT[status],
                cateId: hasSubcategories && subCateId ? Number(subCateId) : (cateId ? Number(cateId) : null),
            });
        },
        [name, slug, summary, description, material, ageGroup, warrantyPolicyDay, returnPolicyDay, status, cateId, subCateId, childCategories, onSubmit],
    );

    const handleStatusChange = useCallback((v: string) => setStatus(v as ProductStatus), []);

    // Validate: name, slug, summary, description required, and either material OR subcategory
    const hasSubcategories = childCategories.length > 0;
    const materialOrSubcateValid = hasSubcategories ? subCateId !== '' : material.trim() !== '';
    const isValid = name.trim() !== '' && slug.trim() !== '' && summary.trim() !== '' && description.trim() !== '' && materialOrSubcateValid;

    return (
        <>
            {/* Header */}
            <div className="flex items-center gap-4 pb-5 border-b border-gray-100">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
                    <Package className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                    <DialogTitle className="text-xl font-bold text-gray-900">
                        {isEdit ? 'Edit Product' : 'New Product'}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-gray-500 mt-0.5">
                        {isEdit ? 'Update the product details below' : 'Fill in the details to add a new product'}
                    </DialogDescription>
                </div>
            </div>

            {/* Form */}
            <form
                id="product-form"
                onSubmit={handleSubmit}
                className="
    space-y-7 py-6 max-h-[62vh] overflow-y-auto px-1
    will-change-transform
    [contain:layout_paint]
  "
            >
                {/* General */}
                <section className="space-y-4">
                    <SectionHeading title="General" />

                    <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                                Product Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="name"
                                placeholder="e.g. Cloud Mattress"
                                value={name}
                                onChange={(e) => handleNameChange(e.target.value)}
                                disabled={isLoading}
                                className={INPUT_CLS}
                                autoFocus
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="slug" className="text-sm font-medium text-gray-700">
                                URL Slug <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="slug"
                                placeholder="cloud-mattress"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                disabled={isLoading}
                                className={cn(INPUT_CLS, 'font-mono text-sm')}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="summary" className="text-sm font-medium text-gray-700">Summary <span className="text-red-500">*</span></Label>
                        <Input
                            id="summary"
                            placeholder="Brief one-line product summary"
                            value={summary}
                            onChange={(e) => setSummary(e.target.value)}
                            disabled={isLoading}
                            className={INPUT_CLS}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-sm font-medium text-gray-700">Description <span className="text-red-500">*</span></Label>
                        <Textarea
                            id="description"
                            placeholder="Detailed product description..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            disabled={isLoading}
                            rows={3}
                            className="rounded-xl border-gray-200 bg-gray-50/50 hover:border-purple-300 hover:bg-white focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 resize-none transition-all"
                        />
                    </div>
                </section>

                {/* Classification */}
                <section className="space-y-4">
                    <SectionHeading title="Classification" />

                    <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                                <FolderTree className="h-3.5 w-3.5 text-gray-400" /> Category
                            </Label>
                            <Select value={cateId} onValueChange={handleCateChange} disabled={isLoading}>
                                <SelectTrigger className={SELECT_CLS}>
                                    <span className="flex-1">
                                        <FolderTree className="h-4 w-4 text-gray-400 shrink-0" />
                                        <SelectValue placeholder="Select category" />
                                    </span>
                                </SelectTrigger>
                                <SelectContent className="rounded-xl shadow-xl z-[200]">
                                    {flatCategories.map((cat, index) => (
                                        <SelectItem key={cat.cateId ?? `cat-${index}`} value={String(cat.cateId)} className="rounded-lg hover:bg-purple-50 hover:text-purple-900">
                                            <span style={{ paddingLeft: `${cat.depth * 16}px` }} className="flex items-center gap-1.5">
                                                {cat.depth > 0 && <span className="text-gray-300">└</span>}
                                                {cat.name}
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                                <Baby className="h-3.5 w-3.5 text-gray-400" /> Age Group
                            </Label>
                            <Select value={ageGroup} onValueChange={setAgeGroup} disabled={isLoading}>
                                <SelectTrigger className={SELECT_CLS}>
                                    <span className="flex-1">
                                        <Baby className="h-4 w-4 text-gray-400 shrink-0" />
                                        <SelectValue placeholder="Select age group" />
                                    </span>
                                </SelectTrigger>
                                <SelectContent className="rounded-xl shadow-xl z-[200]">
                                    {Object.entries(AGE_GROUPS).map(([key, label]) => (
                                        <SelectItem key={`age-${key}`} value={key} className="rounded-lg hover:bg-purple-50 hover:text-purple-900">{label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                            {childCategories.length > 0 ? (
                                <>
                                    <FolderTree className="h-3.5 w-3.5 text-gray-400" /> Subcategory
                                </>
                            ) : (
                                <>
                                    <Shirt className="h-3.5 w-3.5 text-gray-400" /> Material <span className="text-red-500">*</span>
                                </>
                            )}
                        </Label>
                        {childCategories.length > 0 ? (
                            <Select value={subCateId} onValueChange={setSubCateId} disabled={isLoading}>
                                <SelectTrigger className={SELECT_CLS}>
                                    <span className="flex-1">
                                        <FolderTree className="h-4 w-4 text-gray-400 shrink-0" />
                                        <SelectValue placeholder="Select subcategory" />
                                    </span>
                                </SelectTrigger>
                                <SelectContent className="rounded-xl shadow-xl z-[200]">
                                    {childCategories.map((subCat) => (
                                        <SelectItem
                                            key={subCat.cateId}
                                            value={String(subCat.cateId)}
                                            className="rounded-lg hover:bg-purple-50 hover:text-purple-900"
                                        >
                                            {subCat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ) : (
                            <MaterialCombobox value={material} onChange={setMaterial} disabled={isLoading} />
                        )}
                    </div>
                </section>

                {/* Policy & Status */}
                <section className="space-y-4">
                    <SectionHeading title="Policy & Status" />

                    <div className="grid grid-cols-3 gap-5">
                        <div className="space-y-2">
                            <Label htmlFor="warrantyPolicyDay" className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                                <Shield className="h-3.5 w-3.5 text-gray-400" /> Warranty
                            </Label>
                            <div className="relative">
                                <Input
                                    id="warrantyPolicyDay"
                                    type="number"
                                    min={0}
                                    placeholder="365"
                                    value={warrantyPolicyDay}
                                    onChange={(e) => setWarrantyPolicyDay(e.target.value)}
                                    disabled={isLoading}
                                    className={cn(INPUT_CLS, 'pr-14')}
                                />
                                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">days</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="returnPolicyDay" className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                                <RotateCcw className="h-3.5 w-3.5 text-gray-400" /> Return
                            </Label>
                            <div className="relative">
                                <Input
                                    id="returnPolicyDay"
                                    type="number"
                                    min={0}
                                    placeholder="30"
                                    value={returnPolicyDay}
                                    onChange={(e) => setReturnPolicyDay(e.target.value)}
                                    disabled={isLoading}
                                    className={cn(INPUT_CLS, 'pr-14')}
                                />
                                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">days</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                                <CircleDot className="h-3.5 w-3.5 text-gray-400" /> Status
                            </Label>
                            <Select value={status} onValueChange={handleStatusChange} disabled={isLoading}>
                                <SelectTrigger className={SELECT_CLS}>
                                    <span className="flex-1">
                                        <CircleDot className="h-4 w-4 text-gray-400 shrink-0" />
                                        <SelectValue placeholder="Select status" />
                                    </span>
                                </SelectTrigger>
                                <SelectContent className="rounded-xl shadow-xl z-[200]">
                                    {PRODUCT_STATUSES.map((s, index) => (
                                        <SelectItem key={s.value ?? `status-${index}`} value={s.value} className="rounded-lg hover:bg-purple-50 hover:text-purple-900">
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
                    form="product-form"
                    disabled={isLoading || !isValid}
                    className={cn(
                        'flex-1 h-11 rounded-xl font-medium transition-all',
                        'bg-gradient-to-r from-purple-600 to-indigo-600',
                        'hover:from-purple-700 hover:to-indigo-700',
                        'shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40',
                        'disabled:opacity-50 disabled:shadow-none',
                    )}
                >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isEdit ? 'Save Changes' : 'Create Product'}
                </Button>
            </div>
        </>
    );
}

/* ─── Dialog Wrapper ──────────────────────────────────── */
export default function ProductDialog({ open, onOpenChange, product, onSubmit, isLoading, categories }: ProductDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[740px] rounded-2xl p-7 gap-0">
                <ProductDialogInner
                    key={product?.id ?? 'new'}
                    product={product}
                    onOpenChange={onOpenChange}
                    onSubmit={onSubmit}
                    isLoading={isLoading}
                    categories={categories}
                />
            </DialogContent>
        </Dialog>
    );
}
