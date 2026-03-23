import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Layers, CheckCircle2, Loader2, Link2, Banknote, HelpCircle } from 'lucide-react';
import { useProductTypes } from '@/hooks/queries/useProductType';
import { usePackageMappings, useAssignMapping, useUpdateMapping } from '@/hooks/queries/useServicePackageMapping';
import type { ServicePackageMapping } from '@/api/services/servicePackageMappingService';
import type { ServicePackage } from '@/api/services/servicePackageService';
import { useToast } from '@/hooks/useToast';
import { ProductAssetIcons } from '@/components/common/icons';

interface PackageMappingDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    pkg: ServicePackage | null;
}

const resolveProductTypeIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('thảm') || lower.includes('chăn') || lower.includes('nệm') || lower.includes('quây') || lower.includes('blanket')) return ProductAssetIcons.BLANKET;
    if (lower.includes('nôi') || lower.includes('cũi') || lower.includes('giường') || lower.includes('cradle') || lower.includes('bed') || lower.includes('pillow')) return ProductAssetIcons.CRIB;
    if (lower.includes('gấp') || lower.includes('xếp') || lower.includes('sofa') || lower.includes('sheet') || lower.includes('fold')) return ProductAssetIcons.FOLDING;
    if (lower.includes('ngủ') || lower.includes('mẹ') || lower.includes('bé') || lower.includes('set') || lower.includes('mattress') || lower.includes('baby')) return ProductAssetIcons.BABY_SLEEP;
    return ProductAssetIcons.PRODUCT_CATEGORIES;
};

// ----------------------------------------------------------------------
// Extracted MappingRow Component (Minimalist Modern Style)
// ----------------------------------------------------------------------
interface MappingRowProps {
    productType: { productTypeId: string; productTypeName: string };
    servicePackageId: string;
    existingMapping?: ServicePackageMapping;
    onAssigned: () => void;
    packageDetails: ServicePackage;
}

function MappingRow({ productType, servicePackageId, existingMapping, onAssigned, packageDetails }: MappingRowProps) {
    const toast = useToast();
    const [localPrice, setLocalPrice] = useState<number | ''>('');
    const isMapped = !!existingMapping;

    const currentPrice = localPrice !== '' ? localPrice : (existingMapping?.price ?? '');

    const hasChanged = isMapped
        ? currentPrice !== existingMapping?.price
        : currentPrice !== '';

    const assignMutation = useAssignMapping();
    const updateMutation = useUpdateMapping();

    const handleAssign = async () => {
        if (typeof currentPrice !== 'number' || currentPrice <= 0) {
            toast.error('Invalid Price', 'Please enter a valid amount greater than 0.');
            return;
        }

        try {
            if (isMapped && existingMapping?.servicePackageMappingId) {
                await updateMutation.mutateAsync({
                    mappingId: existingMapping.servicePackageMappingId,
                    price: currentPrice,
                    duration: packageDetails.duration,
                    servicePackage: {
                        packageName: packageDetails.packageName,
                        duration: packageDetails.duration,
                        suitableFor: packageDetails.suitableFor || '',
                        benefits: packageDetails.benefits || '',
                        serviceContent: packageDetails.serviceContent || ''
                    }
                });
                toast.success('Mapping Updated', 'Pricing updated successfully.');
            } else {
                await assignMutation.mutateAsync({
                    productTypeId: productType.productTypeId,
                    servicePackageId,
                    price: currentPrice
                });
                toast.success('Mapping Applied', 'Pricing successfully linked.');
            }
            onAssigned();
            setLocalPrice('');
        } catch (e) {
            toast.error('Assignment Failed', (e as Error)?.message || 'Could not complete the binding.');
        }
    };

    const handlePriceChange = (rawValue: string) => {
        const numericValue = rawValue.replace(/\D/g, '');
        setLocalPrice(numericValue ? parseInt(numericValue, 10) : '');
    };

    const ptIcon = resolveProductTypeIcon(productType.productTypeName);

    return (
        <div
            className={`px-5 py-4 rounded-2xl border transition-all duration-300 ease-out flex items-center justify-between group ${isMapped
                ? 'bg-[#fcfdfd] border-emerald-100 hover:border-emerald-200 hover:shadow-[0_2px_8px_rgba(16,185,129,0.06)]'
                : 'bg-white border-zinc-100 hover:border-zinc-200 hover:shadow-[0_2px_8px_rgba(0,0,0,0.03)]'
                }`}
        >
            <div className="flex-1 space-y-1.5 pr-6">
                <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${isMapped
                        ? 'bg-emerald-50'
                        : 'bg-zinc-50 group-hover:bg-zinc-100'
                        }`}>
                        <img src={ptIcon} alt="type icon" className={`w-5 h-5 object-contain ${isMapped ? 'opacity-80' : 'opacity-60 group-hover:opacity-80 transition-opacity'}`} />
                    </div>
                    <h4 className="font-semibold text-[15px] text-zinc-800 tracking-tight leading-none">{productType.productTypeName}</h4>
                    {isMapped && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider ml-1">
                            <CheckCircle2 className="w-3 h-3" /> Mapped
                        </span>
                    )}
                </div>
                <p className="text-[13px] text-zinc-500 pl-12 leading-relaxed">
                    Configure the specific service pricing for the <strong className="font-semibold text-zinc-700">{productType.productTypeName}</strong> category.
                </p>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0 w-[240px]">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Banknote className={`w-4 h-4 transition-colors ${isMapped && !hasChanged ? 'text-emerald-500' : 'text-zinc-400'}`} />
                    </div>
                    <Input
                        type="text"
                        value={currentPrice ? (currentPrice as number).toLocaleString('vi-VN') : ''}
                        onChange={(e) => handlePriceChange(e.target.value)}
                        placeholder="Price (VND)..."
                        className={`pl-9 h-9 font-medium font-sans tabular-nums text-right rounded-lg focus:ring-2 transition-all shadow-none text-[14px] ${isMapped && !hasChanged
                            ? 'border-emerald-100 text-emerald-800 focus:border-emerald-400 focus:ring-emerald-400/20 bg-emerald-50/30'
                            : 'border-zinc-200 focus:border-zinc-400 focus:ring-zinc-400/20 bg-white placeholder:text-zinc-300'
                            }`}
                    />
                </div>

                <Button
                    onClick={handleAssign}
                    disabled={assignMutation.isPending || updateMutation.isPending || !currentPrice || (!hasChanged && isMapped)}
                    size="sm"
                    className={`h-9 px-4 rounded-lg font-semibold transition-all shadow-none shrink-0 min-w-[80px] ${hasChanged
                        ? 'bg-gradient-to-r from-[var(--color-primary)] to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md shadow-blue-500/10'
                        : isMapped
                            ? 'bg-transparent text-emerald-600 hover:bg-emerald-50 border border-emerald-200/60'
                            : 'bg-transparent text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 border border-zinc-200'
                        }`}
                >
                    {assignMutation.isPending || updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (isMapped ? 'Update' : 'Link')}
                </Button>
            </div>
        </div>
    );
}

// ----------------------------------------------------------------------
// Main Dialog Orchestrator (Minimalist Modern)
// ----------------------------------------------------------------------
export default function PackageMappingDialog({ open, onOpenChange, pkg }: PackageMappingDialogProps) {
    const queryClient = useQueryClient();

    const { data: ptData, isLoading: ptLoading } = useProductTypes({ pageSize: 500, isActive: true });
    const productTypes = useMemo(() => ptData?.items ?? [], [ptData]);

    const { data: mappingsData, isLoading: mappingsLoading, refetch } = usePackageMappings(pkg?.servicePackageId, open);

    const currentMappings = useMemo(() => {
        const raw = mappingsData ?? [];
        return Array.isArray(raw) ? raw : (raw?.items ?? []);
    }, [mappingsData]);

    const filteredProductTypes = useMemo(() => {
        if (!pkg?.suitableFor) return [];
        const suitableArray = pkg.suitableFor.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
        return productTypes.filter((pt: { productTypeId: string; productTypeName: string }) => 
            suitableArray.includes(pt.productTypeId.toLowerCase()) || 
            suitableArray.includes(pt.productTypeName.toLowerCase())
        );
    }, [productTypes, pkg]);

    const handleMappingUpdated = () => {
        refetch();
        queryClient.invalidateQueries({ queryKey: ['service-package-mappings'] });
        queryClient.invalidateQueries({ queryKey: ['mapping-info'] });
    };

    if (!pkg) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] h-[85vh] sm:h-[80vh] p-0 overflow-hidden bg-[#fafafa] border-zinc-200 shadow-xl flex flex-col rounded-[24px]">

                {/* Header */}
                <DialogHeader className="px-8 py-6 border-b border-zinc-100 bg-white flex-shrink-0 z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-zinc-50 flex items-center justify-center border border-zinc-100 shadow-sm relative overflow-hidden">
                            <Link2 className="w-5 h-5 text-zinc-700 relative z-10" />
                        </div>
                        <div>
                            <DialogTitle className="text-[20px] font-bold text-zinc-900 tracking-tight">
                                {pkg.packageName} Pricing
                            </DialogTitle>
                            <DialogDescription className="text-[13px] font-medium text-zinc-500 mt-1 flex items-center gap-1.5">
                                <HelpCircle className="w-3.5 h-3.5 text-zinc-400" /> Configure price tiers dependent on the product category.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
                    {ptLoading || mappingsLoading ? (
                        <div className="flex flex-col items-center justify-center h-full min-h-[200px]">
                            <Loader2 className="w-6 h-6 text-zinc-400 animate-spin mb-4" />
                            <p className="text-zinc-500 font-medium text-[13px]">Loading catalog...</p>
                        </div>
                    ) : (
                        <div className="space-y-3 max-w-4xl mx-auto">
                            {filteredProductTypes.map((pt) => (
                                <MappingRow
                                    key={pt.productTypeId}
                                    productType={pt}
                                    servicePackageId={pkg.servicePackageId!}
                                    existingMapping={currentMappings.find((m: ServicePackageMapping) => m.productTypeId === pt.productTypeId)}
                                    onAssigned={handleMappingUpdated}
                                    packageDetails={pkg}
                                />
                            ))}

                            {productTypes.length === 0 && (
                                <div className="text-center py-16 px-6 bg-white rounded-2xl border border-zinc-100 shadow-sm mt-2">
                                    <div className="w-14 h-14 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center mx-auto mb-4">
                                        <Layers className="w-6 h-6 text-zinc-300" />
                                    </div>
                                    <h3 className="text-[16px] font-semibold text-zinc-800 mb-1">No Product Categories Found</h3>
                                    <p className="text-[13px] text-zinc-500 max-w-sm mx-auto">
                                        You need to provision Product Types before linking service pricing arrays.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-8 py-4 border-t border-zinc-100 bg-white flex justify-end gap-3 z-10">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="h-9 px-6 font-semibold text-zinc-600 hover:bg-zinc-100 rounded-lg hover:text-zinc-900"
                    >
                        Done
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

