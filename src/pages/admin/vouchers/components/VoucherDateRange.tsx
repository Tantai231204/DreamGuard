import { Label } from '@/components/ui/label';
import { AlertCircle, Calendar as CalendarIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { DatePicker } from '@/components/ui/date-picker';
import { format } from 'date-fns';

interface VoucherDateRangeProps {
    startDate: string;
    endDate: string;
    dateRangeError?: string;
    onStartDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onEndDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isLoading?: boolean;
}

export function VoucherDateRange({
    startDate,
    endDate,
    dateRangeError,
    onStartDateChange,
    onEndDateChange,
    isLoading = false,
}: VoucherDateRangeProps) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isDateRangeValid = startDate && endDate && new Date(startDate) <= new Date(endDate);
    const isEndDateInPast = endDate && new Date(endDate) < today;

    let fallbackDateRangeError = undefined;
    if (startDate && endDate && !isDateRangeValid) {
        fallbackDateRangeError = 'End date must be on or after start date';
    } else if (isEndDateInPast) {
        fallbackDateRangeError = 'Expiration date cannot be in the past';
    }

    const effectiveDateRangeError = dateRangeError || fallbackDateRangeError;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.2 }}
            className="space-y-4"
        >
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                <CalendarIcon className="w-4 h-4 text-gray-600" />
                Valid Period
            </div>

            <div className="rounded-lg p-4 border border-gray-200 bg-white">
                <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                        Active Period <span className="text-red-500">*</span>
                    </Label>
                    <DatePicker
                        mode="range"
                        value={{
                            from: startDate ? new Date(startDate) : undefined,
                            to: endDate ? new Date(endDate) : undefined
                        }}
                        onChange={(range) => {
                            if (range?.from) {
                                onStartDateChange({ target: { value: format(range.from, "yyyy-MM-dd") } } as unknown as React.ChangeEvent<HTMLInputElement>);
                            } else {
                                onStartDateChange({ target: { value: "" } } as unknown as React.ChangeEvent<HTMLInputElement>);
                            }

                            if (range?.to) {
                                onEndDateChange({ target: { value: format(range.to, "yyyy-MM-dd") } } as unknown as React.ChangeEvent<HTMLInputElement>);
                            } else {
                                onEndDateChange({ target: { value: "" } } as unknown as React.ChangeEvent<HTMLInputElement>);
                            }
                        }}
                        disabled={isLoading}
                        disabledDays={{ before: today }}
                        placeholder="Select start and end date"
                        className="w-full"
                    />
                    <p className="text-xs text-gray-500">Pick the start and expiration range for this voucher</p>
                </div>

                {effectiveDateRangeError && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg"
                    >
                        <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                            <p className="text-xs text-red-700 font-medium">
                                {effectiveDateRangeError}
                            </p>
                        </div>
                    </motion.div>
                )}

                {!effectiveDateRangeError && isDateRangeValid && (
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
        </motion.div >
    );
}
