import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Separator } from '@radix-ui/react-separator';

interface CustomerInfoCardProps {
  name: string;
  email: string;
  phone?: string;
  delay?: number;
}

export function CustomerInfoCard({ name, email, phone, delay = 0 }: CustomerInfoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className="p-5 border border-gray-200 rounded-xl">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 bg-gradient-to-b from-[var(--color-primary)] to-[var(--color-primary-hover)] rounded-full"></div>
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
            Customer Info
          </h2>
        </div>
        <div className="space-y-3">
          <div>
            <div className="text-xs text-gray-500 mb-1">Name</div>
            <div className="font-medium text-gray-900">{name}</div>
          </div>
          <Separator className="h-px bg-gray-200" />
          <div>
            <div className="text-xs text-gray-500 mb-1">Email</div>
            <div className="text-sm text-gray-700 break-all">{email}</div>
          </div>
          {phone && (
            <>
              <Separator className="h-px bg-gray-200" />
              <div>
                <div className="text-xs text-gray-500 mb-1">Phone</div>
                <div className="text-sm text-gray-700">{phone}</div>
              </div>
            </>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
