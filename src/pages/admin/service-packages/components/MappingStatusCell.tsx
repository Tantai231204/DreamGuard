import { useMemo } from 'react';
import { useAllPackageMappings } from '@/hooks/queries/useServicePackageMapping';
import { CategoryBadge } from '@/components/common';
import type { ServicePackage } from '@/api/services/servicePackageService';

interface MappingStatusCellProps {
    pkg: ServicePackage;
    productTypes: { productTypeId: string; productTypeName: string }[];
}

export const MappingStatusCell = ({ pkg, productTypes }: MappingStatusCellProps) => {
    const rawValue = pkg.suitableFor || '';
    const suitableArray = useMemo(() => rawValue.split(',').map(s => s.trim().toLowerCase()).filter(Boolean), [rawValue]);

    const { data: allMappings = [], isLoading } = useAllPackageMappings();

    const mappingsForPackage = useMemo(() => {
        return allMappings.filter((m: { servicePackageId: string }) => m.servicePackageId === pkg.servicePackageId);
    }, [allMappings, pkg.servicePackageId]);

    const isFullyMapped = useMemo(() => {
        if (suitableArray.length === 0) return true;
        return suitableArray.every((catName) => {
            const pt = productTypes.find(p => 
                p.productTypeName.toLowerCase() === catName || 
                p.productTypeId.toLowerCase() === catName
            );
            if (!pt) return false;
            return mappingsForPackage.some((m: { productTypeId: string }) => m.productTypeId === pt.productTypeId);
        });
    }, [suitableArray, productTypes, mappingsForPackage]);

    return (
        <div className="flex flex-col items-start gap-2 py-1.5 relative group">
            <CategoryBadge categoryName={rawValue} variant="badge" />

            <div className="ml-1 mt-0.5">
                {isLoading ? (
                    <div className="h-4 w-12 bg-slate-100 rounded-md animate-pulse" />
                ) : !isFullyMapped && (
                    <span className="text-[11px] text-orange-500 font-bold px-2 py-0.5 mt-0.5 bg-orange-50 rounded border border-orange-200 whitespace-nowrap inline-flex items-center gap-1 shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                        Needs Mapping
                    </span>
                )}
            </div>
        </div>
    );
};
