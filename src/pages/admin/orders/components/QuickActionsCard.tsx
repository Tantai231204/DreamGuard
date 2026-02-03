import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Truck, XCircle } from 'lucide-react';

interface QuickActionsCardProps {
  onMarkDelivered?: () => void;
  onUpdateTracking?: () => void;
  onCancelOrder?: () => void;
  delay?: number;
}

export function QuickActionsCard({
  onMarkDelivered,
  onUpdateTracking,
  onCancelOrder,
  delay = 0,
}: QuickActionsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className="p-5 border-2 border-gray-200 rounded-xl bg-gradient-to-br from-white to-gray-50">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-6 bg-gradient-to-b from-[var(--color-primary)] to-[var(--color-primary-hover)] rounded-full"></div>
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
            Quick Actions
          </h2>
        </div>
        <div className="space-y-3">
          <Button
            onClick={onMarkDelivered}
            className="w-full justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl h-11 text-sm font-semibold shadow-md hover:shadow-lg transition-all hover:scale-[1.02]"
          >
            <CheckCircle2 className="h-4 w-4" />
            Mark as Delivered
          </Button>
          <Button
            onClick={onUpdateTracking}
            variant="outline"
            className="w-full justify-center gap-2 rounded-xl hover:bg-blue-50 border-2 border-blue-200 text-blue-700 hover:border-blue-300 h-11 text-sm font-medium hover:scale-[1.02] transition-all"
          >
            <Truck className="h-4 w-4" />
            Update Tracking
          </Button>
          <Button
            onClick={onCancelOrder}
            variant="outline"
            className="w-full justify-center gap-2 rounded-xl hover:bg-red-50 border-2 border-red-200 text-red-600 hover:border-red-300 h-11 text-sm font-medium hover:scale-[1.02] transition-all"
          >
            <XCircle className="h-4 w-4" />
            Cancel Order
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
