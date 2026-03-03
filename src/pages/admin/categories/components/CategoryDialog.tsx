import { useState } from 'react';
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
import { Loader2 } from 'lucide-react';
import type { CategoryResponse } from '@/api';

interface CategoryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    category?: CategoryResponse | null;
    onSubmit: (data: { name: string; slug: string; isActive: boolean }) => void;
    isLoading?: boolean;
}

function CategoryDialogInner({
    category,
    onOpenChange,
    onSubmit,
    isLoading = false,
}: Omit<CategoryDialogProps, 'open'>) {
    const isEdit = !!category;

    const [name, setName] = useState(category?.name ?? '');
    const [slug, setSlug] = useState(category?.slug ?? '');
    const [isActive, setIsActive] = useState(category?.isActive ?? true);

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
        onSubmit({ name: name.trim(), slug: slug.trim(), isActive });
    };

    return (
        <>
            <DialogHeader>
                <DialogTitle className="text-xl font-bold">
                    {isEdit ? 'Edit Category' : 'Create Category'}
                </DialogTitle>
                <DialogDescription>
                    {isEdit
                        ? 'Update the category information below.'
                        : 'Fill in the details to create a new category.'}
                </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-5 py-2">
                {/* Name */}
                <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                        Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="name"
                        placeholder="e.g. Mattresses"
                        value={name}
                        onChange={(e) => handleNameChange(e.target.value)}
                        disabled={isLoading}
                        autoFocus
                    />
                </div>

                {/* Slug */}
                <div className="space-y-2">
                    <Label htmlFor="slug" className="text-sm font-semibold text-gray-700">
                        Slug <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="slug"
                        placeholder="e.g. mattresses"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        disabled={isLoading}
                        className="font-mono text-sm"
                    />
                    <p className="text-xs text-gray-400">
                        URL-friendly identifier. Auto-generated from name.
                    </p>
                </div>

                {/* isActive */}
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <Label htmlFor="isActive" className="text-sm font-semibold text-gray-700">
                            Active
                        </Label>
                        <p className="text-xs text-gray-400">
                            Enable to make this category visible.
                        </p>
                    </div>
                    <Switch
                        id="isActive"
                        checked={isActive}
                        onCheckedChange={setIsActive}
                        disabled={isLoading}
                    />
                </div>

                <DialogFooter className="pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={isLoading || !name.trim() || !slug.trim()}
                        className="bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90"
                    >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isEdit ? 'Update' : 'Create'}
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
    onSubmit,
    isLoading,
}: CategoryDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[480px]">
                {/* key forces remount so state resets each time dialog opens/changes */}
                {open && (
                    <CategoryDialogInner
                        key={category?.cateId ?? 'new'}
                        category={category}
                        onOpenChange={onOpenChange}
                        onSubmit={onSubmit}
                        isLoading={isLoading}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}
