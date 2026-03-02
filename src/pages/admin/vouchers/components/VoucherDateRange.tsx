import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface VoucherDateRangeProps {
    startDate: string;
    endDate: string;
    onStartDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onEndDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isLoading?: boolean;
}

export function VoucherDateRange({
    startDate,
    endDate,
    onStartDateChange,
    onEndDateChange,
    isLoading = false,
}: VoucherDateRangeProps) {
    const today = new Date().toISOString().split('T')[0];
    const isDateRangeValid = startDate && endDate && new Date(startDate) <= new Date(endDate);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.2 }}
            className="space-y-4"
        >
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                <Calendar className="w-4 h-4 text-gray-600" />
                Valid Period
            </div>

            <div className="rounded-lg p-4 border border-gray-200 bg-white">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="startDate" className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                            Start Date <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="startDate"
                            type="date"
                            value={startDate}
                            onChange={onStartDateChange}
                            disabled={isLoading}
                            min={today}
                            className="bg-gray-50 border-gray-300 hover:border-gray-400 focus:border-purple-500 focus:ring-purple-500/20 h-10 transition-colors"
                        />
                        <p className="text-xs text-gray-500">When voucher becomes active</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="endDate" className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                            End Date <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="endDate"
                            type="date"
                            value={endDate}
                            onChange={onEndDateChange}
                            disabled={isLoading}
                            min={startDate || today}
                            className="bg-gray-50 border-gray-300 hover:border-gray-400 focus:border-purple-500 focus:ring-purple-500/20 h-10 transition-colors"
                        />
                        <p className="text-xs text-gray-500">When voucher expires</p>
                    </div>
                </div>

                {startDate && endDate && !isDateRangeValid && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg"
                    >
                        <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                            <p className="text-xs text-red-700 font-medium">
                                End date must be after start date
                            </p>
                        </div>
                    </motion.div>
                )}

                {isDateRangeValid && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-3 p-2.5 bg-gray-50 border border-gray-200 rounded-md"
                    >
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600">Duration:</span>
                            <span className="font-semibold text-gray-900">
                                {Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} days
                            </span>
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}
