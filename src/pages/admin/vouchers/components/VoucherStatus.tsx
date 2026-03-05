import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Power } from 'lucide-react';
import { motion } from 'framer-motion';

interface VoucherStatusProps {
    isActive: boolean;
    onActiveChange: (checked: boolean) => void;
    isLoading?: boolean;
}

export function VoucherStatus({
    isActive,
    onActiveChange,
    isLoading = false,
}: VoucherStatusProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.3 }}
            className="space-y-4"
        >
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                <Power className="w-4 h-4 text-gray-600" />
                Status
            </div>

            <div className="rounded-lg p-4 border border-gray-200 bg-white">
                <div className="flex items-center justify-between">
                    <div className="space-y-2 flex-1">
                        <Label
                            htmlFor="isActive"
                            className="text-base font-semibold text-gray-900 cursor-pointer flex items-center gap-2.5"
                        >
                            <motion.div
                                animate={{
                                    backgroundColor: isActive ? 'rgb(34 197 94)' : 'rgb(156 163 175)',
                                    scale: isActive ? [1, 1.2, 1] : 1,
                                }}
                                transition={{ duration: 0.3 }}
                                className="w-3 h-3 rounded-full"
                                style={{ boxShadow: isActive ? '0 0 0 4px rgba(34, 197, 94, 0.2)' : 'none' }}
                            />
                            Voucher Status
                        </Label>
                        <motion.p
                            key={isActive ? 'active' : 'inactive'}
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            className={`text-sm ${isActive ? 'text-green-700 font-medium' : 'text-gray-500'}`}
                        >
                            {isActive
                                ? 'Customers can use this voucher'
                                : 'Hidden from customers'}
                        </motion.p>
                    </div>
                    <Switch
                        id="isActive"
                        checked={isActive}
                        onCheckedChange={onActiveChange}
                        disabled={isLoading}
                        className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-green-500 data-[state=checked]:to-emerald-600 shadow-md"
                    />
                </div>

                {!isActive && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t border-gray-200"
                    >
                        <p className="text-xs text-gray-600">
                            <strong>Note:</strong> Inactive vouchers won't appear in customer searches or be applicable at checkout.
                        </p>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}
