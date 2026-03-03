import { useState, useMemo } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
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
import { Loader2, FolderTree, Tag, Link2, Power, FolderOpen } from 'lucide-react';
import type { CategoryResponse } from '@/api';

interface CategoryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    category?: CategoryResponse | null;
    allCategories?: CategoryResponse[];
    onSubmit: (data: { name: string; slug: string; isActive: boolean; cateParentId?: number }) => void;
    isLoading?: boolean;
}

function CategoryDialogInner({
    category,
    allCategories = [],
    onOpenChange,
    onSubmit,
    isLoading = false,
}: Omit<CategoryDialogProps, 'open'>) {
    const isEdit = !!category;

    const [name, setName] = useState(category?.name ?? '');
    const [slug, setSlug] = useState(category?.slug ?? '');
    const [isActive, setIsActive] = useState(category?.isActive ?? true);
    const [parentId, setParentId] = useState<string | undefined>(undefined);

    // Only show top-level categories in dropdown (exclude current category when editing)
    const topLevelCategories = useMemo(() => {
        // When editing, exclude self to prevent circular reference
        if (isEdit && category) {
            return allCategories.filter(c => c.cateId !== category.cateId);
        }
        return allCategories;
    }, [allCategories, category, isEdit]);

    // Auto generate slug từ name
    const handleNameChange = (value: string) => {
        setName(value);
        if (!isEdit) {
            setSlug(
                value
                    .toLowerCase()
                    .trim()
                    .replace(/[^\w\s-]/g, '')
                    .replace(/\s+/g, '-')
            );
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !slug.trim()) return;
        onSubmit({ 
            name: name.trim(), 
            slug: slug.trim(), 
            isActive,
            cateParentId: parentId && parentId !== 'none' ? parseInt(parentId) : undefined
        });
    };

    return (
        <>
            <DialogHeader className="pb-4 border-b">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-md">
                        <FolderTree className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <DialogTitle className="text-xl font-bold text-gray-900">
                            {isEdit ? 'Edit Category' : 'Create Category'}
                        </DialogTitle>
                        <DialogDescription className="text-sm text-gray-500">
                            {isEdit
                                ? 'Update the category information'
                                : 'Fill in the details for new category'}
                        </DialogDescription>
                    </div>
                </div>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-5 py-4">
                {/* Name */}
                <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-gray-500" />
                        Category Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="name"
                        placeholder="e.g. Mattresses"
                        value={name}
                        onChange={(e) => handleNameChange(e.target.value)}
                        disabled={isLoading}
                        className="bg-gray-50 border-gray-300 focus:border-purple-500 focus:ring-purple-500/20 h-10 transition-colors"
                        autoFocus
                    />
                </div>

                {/* Slug */}
                <div className="space-y-2">
                    <Label htmlFor="slug" className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                        <Link2 className="w-3.5 h-3.5 text-gray-500" />
                        URL Slug <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="slug"
                        placeholder="e.g. mattresses"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        disabled={isLoading}
                        className="font-mono text-sm bg-gray-50 border-gray-300 focus:border-purple-500 focus:ring-purple-500/20 h-10 transition-colors"
                    />
                    <p className="text-xs text-gray-500">
                        URL-friendly identifier. Auto-generated from name.
                    </p>
                </div>

                {/* Parent Category */}
                <div className="space-y-2">
                    <Label htmlFor="parentId" className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                        <FolderOpen className="w-3.5 h-3.5 text-gray-500" />
                        Parent Category
                        <span className="text-xs font-normal text-gray-400">(optional)</span>
                    </Label>
                    <Select value={parentId} onValueChange={setParentId} disabled={isLoading}>
                        <SelectTrigger className="bg-gray-50 border-gray-300 focus:border-purple-500 focus:ring-purple-500/20 h-10">
                            <SelectValue placeholder="None - Top level category" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                            <SelectItem value="none">None - Top level category</SelectItem>
                            {topLevelCategories.map((cat) => (
                                <SelectItem key={cat.cateId} value={cat.cateId.toString()}>
                                    {cat.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500">
                        Select a top-level category as parent to create a subcategory.
                    </p>
                </div>

                {/* isActive */}
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1 flex-1">
                            <Label htmlFor="isActive" className="text-sm font-medium text-gray-900 cursor-pointer flex items-center gap-2">
                                <Power className="w-3.5 h-3.5 text-gray-500" />
                                Category Status
                            </Label>
                            <p className="text-xs text-gray-500">
                                {isActive ? 'Visible to customers' : 'Hidden from customers'}
                            </p>
                        </div>
                        <Switch
                            id="isActive"
                            checked={isActive}
                            onCheckedChange={setIsActive}
                            disabled={isLoading}
                            className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-green-500 data-[state=checked]:to-emerald-600"
                        />
                    </div>
                </div>

                <DialogFooter className="pt-4 border-t gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                        className="flex-1 h-10 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 font-medium transition-all"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={isLoading || !name.trim() || !slug.trim()}
                        className="flex-1 h-10 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg shadow-purple-500/30 font-medium transition-all disabled:opacity-50"
                    >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isEdit ? 'Update Category' : 'Create Category'}
                    </Button>
                </DialogFooter>
            </form>
        </>
    );
}

export default function CategoryDialog({
    open,
    onOpenChange,
    category,
    allCategories,
    onSubmit,
    isLoading,
}: CategoryDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[480px]">
                {/* key forces remount so state resets each time dialog opens/changes */}
                <CategoryDialogInner
                    key={category?.cateId ?? 'new'}
                    category={category}
                    allCategories={allCategories}
                    onOpenChange={onOpenChange}
                    onSubmit={onSubmit}
                    isLoading={isLoading}
                />
            </DialogContent>
        </Dialog>
    );
}
