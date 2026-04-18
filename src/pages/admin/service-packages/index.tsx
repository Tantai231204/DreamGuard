import { useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    getPaginationRowModel,
    type SortingState,
    type RowSelectionState,
    type PaginationState,
    type Updater,
} from '@tanstack/react-table';
import { motion } from 'framer-motion';
import {
    Package, Filter, CheckCircle2, Layers
} from 'lucide-react';

import AdminPageHeader from '@/components/layout/AdminPageHeader';
import {
    AdminTableSearch,
    AdminTableContent,
    AdminTablePagination,
    AdminActions,
} from '@/components/admin';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/lib/utils';
import ServicePackageDialog, { type PackageFormData } from './components/ServicePackageDialog';
import PackageMappingDialog from './components/PackageMappingDialog';
import { useServicePackageColumns } from './components/useServicePackageColumns';
import {
    useAdminServicePackages,
    useCreateServicePackage,
    useUpdateServicePackage,
    useUpdateServicePackageStatus,
    useReplacePackageImage
} from '@/hooks/queries/useServicePackage';

import servicePackageService, { type ServicePackage } from '@/api/services/servicePackageService';

export default function ServicePackagesPage() {
    const toast = useToast();
    const [searchParams, setSearchParams] = useSearchParams();

    // Sync table state with URL
    const pagination = useMemo(() => ({
        pageIndex: parseInt(searchParams.get('page') || '1') - 1,
        pageSize: parseInt(searchParams.get('pageSize') || '10'),
    }), [searchParams]);

    const globalFilter = searchParams.get('search') || '';
    const statusFilter = searchParams.get('status') || 'all';

    const [sorting, setSorting] = useState<SortingState>([]);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingPackage, setEditingPackage] = useState<ServicePackage | null>(null);

    const [mappingOpen, setMappingOpen] = useState(false);
    const [mappingPackage, setMappingPackage] = useState<ServicePackage | null>(null);

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmTarget, setConfirmTarget] = useState<ServicePackage | null>(null);

    // Queries
    const { data, isLoading, isError, error } = useAdminServicePackages({
        pageNumber: pagination.pageIndex + 1,
        pageSize: pagination.pageSize,
        status: statusFilter === 'all' ? undefined : statusFilter === 'active' ? 'Active' : 'Inactive'
    });

    const packages = useMemo(() => data?.items ?? [], [data]);

    // Mutations
    const createMutation = useCreateServicePackage();
    const updateMutation = useUpdateServicePackage();
    const updateStatusMutation = useUpdateServicePackageStatus();
    const replaceImageMutation = useReplacePackageImage();


    // Handlers
    const setPagination = useCallback((updaterOrValue: Updater<PaginationState>) => {
        const next = typeof updaterOrValue === 'function' ? updaterOrValue(pagination) : updaterOrValue;
        setSearchParams((prev) => {
            prev.set('page', String(next.pageIndex + 1));
            prev.set('pageSize', String(next.pageSize));
            return prev;
        }, { replace: true });
    }, [pagination, setSearchParams]);

    const setGlobalFilter = useCallback((value: string) => {
        setSearchParams((prev) => {
            if (value) prev.set('search', value);
            else prev.delete('search');
            prev.set('page', '1');
            return prev;
        }, { replace: true });
    }, [setSearchParams]);

    const handleStatusFilterChange = useCallback((value: string) => {
        setSearchParams((prev) => {
            if (value === 'all') prev.delete('status');
            else prev.set('status', value);
            prev.set('page', '1');
            return prev;
        }, { replace: true });
    }, [setSearchParams]);

    const handleAdd = useCallback(() => {
        setEditingPackage(null);
        setDialogOpen(true);
    }, []);

    const handleEdit = useCallback((pkg: ServicePackage) => {
        setEditingPackage(pkg);
        setDialogOpen(true);
    }, []);

    const handleMapPricing = useCallback((pkg: ServicePackage) => {
        setMappingPackage(pkg);
        setMappingOpen(true);
    }, []);

    const handleToggleStatus = useCallback((pkg: ServicePackage) => {
        setConfirmTarget(pkg);
        setConfirmOpen(true);
    }, []);

    const executeToggleStatus = async () => {
        if (!confirmTarget) return;
        const nextStatus = confirmTarget.status === 'Active' ? 'Inactive' : 'Active';
        try {
            await updateStatusMutation.mutateAsync({ id: confirmTarget.servicePackageId, status: nextStatus });
            toast.success('Status Updated', `Package visibility shifted to ${nextStatus}.`);
            setConfirmOpen(false);
        } catch (error) {
            console.error(error);
            toast.error('Update Failed', 'Could not sync status change.');
        }
    };

    const handleSubmit = async (formData: PackageFormData) => {
        try {
            if (!editingPackage && !formData.file) {
                toast.error('Validation Error', 'A visual cover image is required by the API to create a new package.');
                return;
            }

            if (editingPackage) {
                // Use JSON for basic details to avoid 415 error
                const updateData = {
                    packageName: formData.packageName,
                    description: formData.description || '',
                    serviceContent: formData.serviceContent || '',
                    suitableFor: formData.suitableFor || '',
                    benefits: formData.benefits || '',
                    duration: formData.duration,
                    status: formData.status
                };

                const tasks: Promise<unknown>[] = [
                    updateMutation.mutateAsync({ id: editingPackage.servicePackageId, data: updateData })
                ];

                if (formData.file) {
                    tasks.push(replaceImageMutation.mutateAsync({ id: editingPackage.servicePackageId, file: formData.file }));
                }

                await Promise.all(tasks);
                toast.success('Sync Complete', 'Service tier updated successfully.');
            } else {
                // Create still uses FormData because it bundle the file normally in POST
                const body = new FormData();
                body.append('PackageName', formData.packageName);
                body.append('Description', formData.description || '');
                body.append('ServiceContent', formData.serviceContent || '');
                body.append('SuitableFor', formData.suitableFor || '');
                body.append('Benefits', formData.benefits || '');
                body.append('Duration', String(formData.duration));
                body.append('Status', formData.status);
                if (formData.file) {
                    body.append('FormFile', formData.file);
                }

                // Creation must await sequentially before assigning price
                const newPkg = await createMutation.mutateAsync(body) as unknown;

                // Aggressive ID Extractor: Backend responses can vary between full objects or primitive UUID strings
                const extractServicePackageId = (rawObj: unknown): string => {
                    if (typeof rawObj === 'string' && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(rawObj)) return rawObj;
                    const obj = rawObj as Record<string, unknown>;
                    if (obj && typeof obj === 'object') {
                        if (typeof obj.servicePackageId === 'string') return obj.servicePackageId;
                        if (typeof obj.id === 'string') return obj.id;
                        for (const key of Object.keys(obj)) {
                            const val = obj[key];
                            if (typeof val === 'string' && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(val)) return val;
                        }
                    }
                    return '';
                };

                let createdId = extractServicePackageId(newPkg);

                // Ultimate Fallback: If Backend entirely omits ID in response body, query the admin list to find the newly minted row using standard heuristics.
                if (!createdId) {
                    try {
                        const fallbackData = await servicePackageService.getAllAdmin({ pageSize: 150 });
                        const match = fallbackData?.items?.find((p: ServicePackage) => p.packageName === formData.packageName);
                        if (match) {
                            createdId = match.servicePackageId;
                        }
                    } catch (e) {
                        console.error("Fallback lookup failed", e);
                    }
                }

                if (!createdId) {
                    console.error("Created Package parsing & fallback fetch failed:", newPkg);
                    toast.error("Package Created", "However, we couldn't automatically map the price. Server omitted ID context.");
                }

                toast.success('System Published', 'New service package is now indexed and priced.');
            }
            setDialogOpen(false);
        } catch (err) {
            console.error(err);
            toast.error('Sync Failed', 'Could not save the package data.');
        }
    };

    const columns = useServicePackageColumns({ onEdit: handleEdit, onToggleStatus: handleToggleStatus, onMapPricing: handleMapPricing });

    const table = useReactTable({
        data: packages,
        columns,
        pageCount: data?.totalPages ?? -1,
        state: { sorting, globalFilter, rowSelection, pagination },
        onPaginationChange: setPagination,
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        onRowSelectionChange: setRowSelection,
        manualPagination: true,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    const FilterMenu = (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className={cn("gap-2 rounded-xl border-2 font-medium shadow-sm transition-all", statusFilter !== 'all' ? "border-[#4988c4] text-[#4988c4] bg-blue-50" : "border-gray-200")}>
                    <Filter className="h-4 w-4" /> Filters {statusFilter !== 'all' && <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#4988c4] text-[10px] text-white">1</span>}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[180px] rounded-xl shadow-xl border-slate-200">
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleStatusFilterChange('all')}>All Packages</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusFilterChange('active')} className="text-emerald-600 font-medium">Active Only</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusFilterChange('inactive')} className="text-rose-600 font-medium">Inactive Only</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );

    return (
        <div className="flex flex-col h-full bg-slate-50">
            <AdminPageHeader
                title="Service Packages"
                description="Manage professional cleaning tiers and physical targets"
                icon={Package}
                stats={[
                    { label: 'Total Tiers', value: data?.totalCount ?? 0, icon: Layers },
                    { label: 'Live Slots', value: packages.filter(p => p.status === 'Active').length, icon: CheckCircle2 },
                ]}
            />

            <div className="flex-1 overflow-hidden flex flex-col bg-gradient-to-br from-gray-50 via-white to-blue-50/10 p-6">
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col h-full bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
                    <AdminTableSearch
                        table={table}
                        value={globalFilter}
                        onChange={setGlobalFilter}
                        placeholder="Search service configurations..."
                        resultCount={data?.totalCount ?? 0}
                        resultLabel="packages"
                        actions={
                            <div className="flex items-center gap-3">
                                {FilterMenu}
                                <AdminActions onAdd={handleAdd} addLabel="Add Package" showFilter={false} />
                            </div>
                        }
                    />



                    <div className="flex-1 overflow-auto bg-white">
                        <AdminTableContent
                            table={table}
                            emptyMessage={isError ? `Connection Lost: ${error?.message}` : "No matches in index."}
                            isLoading={isLoading}
                        />
                    </div>

                    <div className="p-4 border-t border-gray-100 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
                        <AdminTablePagination table={table} itemLabel="packages" />
                    </div>
                </motion.div>
            </div>

            <ServicePackageDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                pkg={editingPackage}
                onSubmit={handleSubmit}
                isLoading={createMutation.isPending || updateMutation.isPending}
            />

            <PackageMappingDialog
                open={mappingOpen}
                onOpenChange={setMappingOpen}
                pkg={mappingPackage}
            />

            <ConfirmDialog
                open={confirmOpen} onOpenChange={setConfirmOpen}
                title={confirmTarget?.status === 'Active' ? 'Deactivate Package?' : 'Activate Package?'}
                description={`Are you sure you want to shift "${confirmTarget?.packageName}" to ${confirmTarget?.status === 'Active' ? 'Hidden' : 'Visible'} status?`}
                confirmText={confirmTarget?.status === 'Active' ? 'Deactivate' : 'Activate'}
                onConfirm={executeToggleStatus}
                variant={confirmTarget?.status === 'Active' ? 'danger' : 'success'}
                isLoading={updateStatusMutation.isPending}
            />
        </div>
    );
}
