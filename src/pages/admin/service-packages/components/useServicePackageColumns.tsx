import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Pencil, Package } from 'lucide-react';
import { AdminStatusBadge, AdminRowActions } from '@/components/admin';
import type { ServicePackage } from '@/api/services/servicePackageService';

interface UseServicePackageColumnsProps {
    onEdit: (pkg: ServicePackage) => void;
    onToggleStatus: (pkg: ServicePackage) => void;
}

export const useServicePackageColumns = ({ onEdit, onToggleStatus }: UseServicePackageColumnsProps) => {
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
            accessorKey: 'price',
            header: 'Price',
            cell: ({ getValue }) => {
                const val = getValue() as number;
                return <span className="font-bold text-slate-800">{val.toLocaleString('vi-VN')} đ</span>;
            }
        },
        {
            accessorKey: 'suitableFor',
            header: 'Suitable For',
            cell: ({ getValue }) => <span className="text-xs font-bold text-slate-600">{getValue() as string}</span>
        },
        {
            accessorKey: 'duration',
            header: 'Duration',
            cell: ({ getValue }) => <span className="text-xs font-bold text-slate-600">{getValue() as number} mins</span>
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
                        actions={[
                            {
                                label: 'Edit Package',
                                icon: <Pencil className="h-4 w-4" />,
                                onClick: () => onEdit(row.original)
                            },
                            {
                                label: row.original.status === 'Active' ? 'Deactivate' : 'Activate',
                                icon: <Package className="h-4 w-4" />,
                                onClick: () => onToggleStatus(row.original)
                            },
                        ]}
                    />
                </div>
            )
        }
    ], [onEdit, onToggleStatus]);
};
