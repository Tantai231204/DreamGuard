import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Pencil, Banknote, Power } from 'lucide-react';
import { AdminStatusBadge, AdminRowActions } from '@/components/admin';
import type { ServicePackage } from '@/api/services/servicePackageService';
import { useProductTypes } from '@/hooks/queries/useProductType';
import { MappingStatusCell } from './MappingStatusCell';

interface UseServicePackageColumnsProps {
    onEdit: (pkg: ServicePackage) => void;
    onToggleStatus: (pkg: ServicePackage) => void;
    onMapPricing: (pkg: ServicePackage) => void;
}

export const useServicePackageColumns = ({ onEdit, onToggleStatus, onMapPricing }: UseServicePackageColumnsProps) => {
    const { data: productTypesData } = useProductTypes({ pageSize: 100, isActive: true });
    const productTypes = useMemo(() => productTypesData?.items ?? [], [productTypesData]);

    return useMemo<ColumnDef<ServicePackage>[]>(() => [
        {
            accessorKey: 'packageName',
            header: 'Package Name',
            cell: ({ row }) => {
                const pkg = row.original;
                return (
                    <div className="flex items-center gap-3">
                        <img
                            src={pkg.imageUrl || 'https://via.placeholder.com/40'}
                            alt={pkg.packageName}
                            className="w-10 h-10 rounded-lg object-cover border border-gray-100"
                        />
                        <div>
                            <span className="font-bold text-gray-900 block">{pkg.packageName}</span>
                            <span className="text-xs text-gray-500 line-clamp-1">{pkg.description}</span>
                        </div>
                    </div>
                );
            }
        },

        {
            accessorKey: 'suitableFor',
            header: 'Product Category',
            cell: ({ row }) => <MappingStatusCell pkg={row.original} productTypes={productTypes} />
        },
        {
            accessorKey: 'duration',
            header: 'Duration',
            cell: ({ getValue }) => <span className="text-xs font-bold text-slate-600">{(getValue() as number) ?? 0} mins</span>
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => <AdminStatusBadge status={row.original.status} />
        },
        {
            id: 'actions',
            header: () => <div className="text-right">Actions</div>,
            cell: ({ row }) => (
                <div className="flex justify-end">
                    <AdminRowActions
                        sections={[
                            [
                                {
                                    label: 'Map Pricing',
                                    icon: <Banknote className="h-4 w-4" />,
                                    onClick: () => onMapPricing(row.original)
                                },
                                {
                                    label: 'Edit Package',
                                    icon: <Pencil className="h-4 w-4" />,
                                    onClick: () => onEdit(row.original)
                                },
                            ],
                            [
                                {
                                    label: row.original.status === 'Active' ? 'Deactivate' : 'Activate',
                                    icon: <Power className="h-4 w-4" />,
                                    variant: row.original.status === 'Active' ? 'warning' : 'success',
                                    onClick: () => onToggleStatus(row.original)
                                },
                            ]
                        ]}
                    />
                </div>
            )
        }
    ], [onEdit, onToggleStatus, onMapPricing, productTypes]);
};
