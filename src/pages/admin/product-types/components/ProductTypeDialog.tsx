import { useEffect } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import type { ProductType } from '@/api/services/productTypeService';
import { Loader2, Power } from 'lucide-react';
import { ProductAssetIcons } from '@/components/common/icons';

const productTypeSchema = z.object({
    productTypeName: z.string().min(1, 'Name is required').trim(),
    isActive: z.boolean().default(true),
});

export type ProductTypeFormValues = z.infer<typeof productTypeSchema>;

interface ProductTypeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    productType: ProductType | null;
    onSubmit: (values: ProductTypeFormValues) => Promise<void>;
    isLoading?: boolean;
}

export function ProductTypeDialog({
    open,
    onOpenChange,
    productType,
    onSubmit,
    isLoading
}: ProductTypeDialogProps) {
    const isEdit = !!productType;

    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<ProductTypeFormValues>({
        resolver: zodResolver(productTypeSchema) as Resolver<ProductTypeFormValues>,
        defaultValues: {
            productTypeName: '',
            isActive: true,
        },
    });

    const isActive = watch('isActive');

    useEffect(() => {
        if (productType && open) {
            reset({
                productTypeName: productType.productTypeName,
                isActive: productType.isActive,
            });
        } else if (!open) {
            reset({
                productTypeName: '',
                isActive: true,
            });
        }
    }, [productType, open, reset]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader className="pb-4 border-b">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-lg bg-[#4988c4] flex items-center justify-center shadow-sm">
                            <img src={ProductAssetIcons.PRODUCT_CATEGORIES} alt="Product Type" className="w-5 h-5 filter brightness-0 invert object-contain" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-bold text-gray-900">
                                {isEdit ? 'Update Product Type' : 'Create Product Type'}
                            </DialogTitle>
                            <DialogDescription className="text-sm text-gray-500">
                                {isEdit
                                    ? 'Change details for existing product type.'
                                    : 'Add a new cleaning service classification.'
                                }
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4 pb-6 px-8">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="productTypeName" className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                                Product Type Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="productTypeName"
                                placeholder="e.g. Sofa, Mattress, Curtain..."
                                {...register('productTypeName')}
                                disabled={isLoading}
                                className="bg-gray-50 border-gray-300 focus:border-[#4988c4] focus:ring-[#4988c4]/20 h-10 transition-colors"
                                autoFocus
                            />
                            {errors.productTypeName && (
                                <p className="text-xs text-red-500 font-medium ml-1">
                                    {errors.productTypeName.message}
                                </p>
                            )}
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-white p-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1 flex-1">
                                    <Label htmlFor="isActive" className="text-sm font-medium text-gray-900 cursor-pointer flex items-center gap-2">
                                        <Power className="w-3.5 h-3.5 text-gray-500" />
                                        Status
                                    </Label>
                                    <p className="text-xs text-gray-500">
                                        {isActive ? 'Visible in booking system' : 'Hidden from customers'}
                                    </p>
                                </div>
                                <Switch
                                    id="isActive"
                                    checked={isActive}
                                    onCheckedChange={(checked) => setValue('isActive', !!checked)}
                                    disabled={isLoading}
                                    className="data-[state=checked]:bg-green-600"
                                />
                            </div>
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
                            disabled={isLoading}
                            className="flex-1 h-10 bg-[#4988c4] hover:bg-[#3a6fa0] text-white shadow-sm font-medium transition-all"
                        >
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEdit ? 'Update Details' : 'Create Entry'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
