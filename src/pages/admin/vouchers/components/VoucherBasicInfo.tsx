import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tag, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

interface VoucherBasicInfoProps {
    code: string;
    name: string;
    description: string;
    onCodeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onDescriptionChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    isLoading?: boolean;
}

export function VoucherBasicInfo({
    code,
    name,
    description,
    onCodeChange,
    onNameChange,
    onDescriptionChange,
    isLoading = false,
}: VoucherBasicInfoProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
        >
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                <Tag className="w-4 h-4 text-gray-600" />
                Basic Information
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Code */}
                <div className="space-y-2">
                    <Label htmlFor="code" className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                        Voucher Code <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="code"
                        placeholder="SUMMER2024"
                        value={code}
                        onChange={onCodeChange}
                        disabled={isLoading}
                        className="font-mono text-sm font-semibold tracking-wide uppercase bg-gray-50 border-gray-300 focus:border-[#4988c4] focus:ring-[#4988c4]/20 h-10 transition-colors"
                        autoFocus
                        maxLength={20}
                    />
                    <p className="text-xs text-gray-500">Uppercase letters and numbers only</p>
                </div>

                {/* Name */}
                <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                        Display Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="name"
                        placeholder="Summer Sale 2024"
                        value={name}
                        onChange={onNameChange}
                        disabled={isLoading}
                        className="bg-gray-50 border-gray-300 focus:border-[#4988c4] focus:ring-[#4988c4]/20 h-10 transition-colors"
                        maxLength={100}
                    />
                    <p className="text-xs text-gray-500">Customer-facing name</p>
                </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-gray-500" />
                    Description
                </Label>
                <Textarea
                    id="description"
                    placeholder="E.g., Get 20% off on all summer collection items. Valid for orders above $50."
                    value={description}
                    onChange={onDescriptionChange}
                    disabled={isLoading}
                    rows={3}
                    maxLength={500}
                    className="resize-none bg-gray-50 border-gray-300 focus:border-[#4988c4] focus:ring-[#4988c4]/20 transition-colors"
                />
                <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Optional - Displayed to customers</span>
                    <span>{description.length}/500</span>
                </div>
            </div>
        </motion.div>
    );
}
