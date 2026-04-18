import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings2, RefreshCw, Coins, Percent } from 'lucide-react';
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    type SortingState,
} from '@tanstack/react-table';
import AdminPageHeader from '@/components/layout/AdminPageHeader';
import { 
    AdminTableContent, 
    AdminTablePagination, 
    AdminTableSearch,
    AdminActions
} from '@/components/admin';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useSystemConfigs, useDeleteSystemConfig } from '@/hooks/queries/useSystemConfig';
import { useConfigColumns } from './components/useConfigColumns';
import { EditConfigDialog } from './components/EditConfigDialog';
import type { SystemConfig } from '@/api/types/systemConfig';
import { toast } from 'sonner';

export default function SystemConfigManagement() {
    const [selectedConfig, setSelectedConfig] = useState<SystemConfig | 'new' | null>(null);
    const [configToDelete, setConfigToDelete] = useState<SystemConfig | null>(null);
    
    const [sorting, setSorting] = useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });

    const { data: configData, isLoading, refetch, isRefetching } = useSystemConfigs({
        pageNumber: pagination.pageIndex + 1,
        pageSize: pagination.pageSize,
        Key: globalFilter,
    });

    const { mutate: deleteConfig, isPending: isDeleting } = useDeleteSystemConfig();

    const handleDelete = () => {
        if (!configToDelete) return;
        deleteConfig(configToDelete.configKey, {
            onSuccess: () => {
                toast.success('Registry key revoked successfully');
                setConfigToDelete(null);
            },
            onError: () => toast.error('Failed to revoke key'),
        });
    };

    const columns = useConfigColumns({
        onEdit: (config) => setSelectedConfig(config),
        onDelete: (config) => setConfigToDelete(config),
    });

    const data = configData?.items ?? [];
    const pageCount = configData?.totalPages ?? -1;

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            pagination,
        },
        onPaginationChange: setPagination,
        manualPagination: true,
        pageCount,
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    const rewardKeysCount = data.filter(item => item.configKey.toUpperCase().includes('COIN') && !item.configKey.toUpperCase().includes('PERCENT')).length;
    const percentKeysCount = data.filter(item => item.configKey.toUpperCase().includes('PERCENT')).length;

    return (
        <div className="flex flex-col h-full bg-white overflow-hidden">
            <AdminPageHeader
                title="System Intelligence"
                description="Manage global operational variables and behavioral keys."
                icon={Settings2}
                stats={[
                    { label: 'Reward Keys', value: rewardKeysCount, icon: Coins },
                    { label: 'Logic Filters', value: percentKeysCount, icon: Percent },
                ]}
            />

            <div className="flex-1 overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="m-6 bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm flex flex-col h-[calc(100%-3rem)]"
                >
                    <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white sticky top-0 z-10">
                        <div className="flex-1 max-w-xl">
                            <AdminTableSearch
                                value={globalFilter}
                                onChange={setGlobalFilter}
                                placeholder="Filter by variable identifier..."
                                table={table}
                                resultCount={configData?.totalCount}
                                resultLabel="Registry Keys"
                            />
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => refetch()}
                                disabled={isRefetching}
                                className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-100 text-slate-400 hover:text-blue-600 hover:bg-white hover:shadow-md transition-all active:scale-95 group"
                                title="Refresh Registry"
                            >
                                <RefreshCw className={`h-4 w-4 transition-transform duration-700 ${isRefetching ? 'animate-spin' : 'group-hover:rotate-180'}`} />
                            </button>

                            <AdminActions
                                onAdd={() => setSelectedConfig('new')}
                                addLabel="Initialize Key"
                                showExport={false}
                                showFilter={false}
                                showImport={false}
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto custom-scrollbar">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={isLoading ? 'loading' : 'content'}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="h-full"
                            >
                                <AdminTableContent
                                    table={table}
                                    isLoading={isLoading}
                                    emptyMessage="No system variables found in your current view."
                                />
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    <div className="p-6 border-t border-slate-50 bg-slate-50/30">
                        <AdminTablePagination table={table} />
                    </div>
                </motion.div>
            </div>

            <EditConfigDialog
                key={typeof selectedConfig === 'string' ? 'new' : selectedConfig?.configKey || 'none'}
                config={selectedConfig}
                onClose={() => setSelectedConfig(null)}
            />

            <ConfirmDialog
                open={!!configToDelete}
                onOpenChange={(open) => !open && setConfigToDelete(null)}
                title="Revoke Registry Key?"
                description={`Warning: This action will permanently remove the logic for "**${configToDelete?.configKey}**". This may impact global system behaviors.`}
                confirmText="Confirm Revocation"
                cancelText="Retain Key"
                onConfirm={handleDelete}
                variant="danger"
                isLoading={isDeleting}
            />
        </div>
    );
}
