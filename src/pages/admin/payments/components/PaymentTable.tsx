import { motion } from 'framer-motion'
import { AdminTableSearch, AdminTableContent, AdminTablePagination, AdminActions } from '@/components/admin'
import { type Table } from '@tanstack/react-table'
import { type PaymentResponse } from '@/api/types/payment'

interface PaymentTableProps {
    table: Table<PaymentResponse>
    globalFilter: string
    setGlobalFilter: (value: string) => void
    isLoading: boolean
}

export function PaymentTable({ table, globalFilter, setGlobalFilter, isLoading }: PaymentTableProps) {
    return (
        <div className="flex-1 px-6 pb-6 min-h-0 flex flex-col">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1 bg-white rounded-2xl border border-slate-200/60 shadow-xl shadow-slate-200/20 flex flex-col overflow-hidden"
            >
                <AdminActions
                    onFilter={() => console.log('Filter')}
                    onExport={() => console.log('Export')}
                />

                <AdminTableSearch
                    value={globalFilter}
                    onChange={setGlobalFilter}
                    placeholder="Search by ID, Order Code..."
                    table={table}
                    resultLabel="transactions"
                />

                <div className="flex-1 overflow-auto">
                    <AdminTableContent
                        table={table}
                        emptyMessage="No transactions record found"
                        isLoading={isLoading}
                    />
                </div>

                <div className="border-t border-slate-100 bg-slate-50/30">
                    <AdminTablePagination
                        table={table}
                        itemLabel="transactions"
                    />
                </div>
            </motion.div>
        </div>
    )
}
