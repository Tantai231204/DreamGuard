import { useState, useMemo } from 'react'
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    type SortingState,
} from '@tanstack/react-table'
import { Wallet } from 'lucide-react'

import AdminPageHeader from '@/components/layout/AdminPageHeader'
import { useAdminPayments } from '@/hooks/queries/usePayment'
import { usePaymentColumns } from './components/usePaymentColumns'
import { PaymentDetailSheet } from './components/PaymentDetailSheet'
import { PaymentStats } from './components/PaymentStats'
import { PaymentTable } from './components/PaymentTable'

export default function PaymentManagement() {
    const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null)
    const [sorting, setSorting] = useState<SortingState>([])
    const [globalFilter, setGlobalFilter] = useState('')
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    })

    const columns = usePaymentColumns({
        onView: (id) => setSelectedPaymentId(id)
    })

    const { data: paymentData, isPending } = useAdminPayments({
        pageNumber: pagination.pageIndex + 1,
        pageSize: pagination.pageSize,
    })

    const data = useMemo(() => paymentData?.items ?? [], [paymentData])
    const pageCount = paymentData?.totalPages ?? -1

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
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
    })

    // Business Logic for Stats
    const stats = useMemo(() => {
        const totalRevenue = data.filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0)
        const pendingAmount = data.filter(p => p.status === 'Pending').reduce((sum, p) => sum + p.amount, 0)
        const failedCount = data.filter(p => p.status === 'Failed').length
        return { totalRevenue, pendingAmount, failedCount }
    }, [data])

    return (
        <div className="flex flex-col h-full bg-[#f8fafc]">
            <AdminPageHeader
                title="Payment Management"
                description="Monitor and manage all financial transactions"
                icon={Wallet}
                stats={[
                    { label: 'Total Volume', value: paymentData?.totalCount || 0 },
                    { label: 'Successful', value: data.filter(p => p.status === 'Paid').length },
                    { label: 'Failed/Pending', value: data.filter(p => p.status !== 'Paid').length },
                ]}
            />

            <div className="flex-1 flex flex-col min-h-0">
                <PaymentStats {...stats} isLoading={isPending} />

                <PaymentTable
                    table={table}
                    globalFilter={globalFilter}
                    setGlobalFilter={setGlobalFilter}
                    isLoading={isPending}
                />
            </div>

            <PaymentDetailSheet
                id={selectedPaymentId}
                onClose={() => setSelectedPaymentId(null)}
            />
        </div>
    )
}
