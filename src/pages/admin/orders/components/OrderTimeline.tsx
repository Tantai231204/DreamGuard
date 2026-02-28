import { motion } from 'framer-motion';
import { CheckCircle2, Package, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface TimelineEvent {
  title: string;
  description?: string;
  timestamp: string;
  icon: string;
}

interface OrderTimelineProps {
  timeline: TimelineEvent[];
}

export function OrderTimeline({ timeline }: OrderTimelineProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="p-6 border border-gray-200 rounded-xl">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-1 h-6 bg-gradient-to-b from-[var(--color-primary)] to-[var(--color-primary-hover)] rounded-full"></div>
          <h2 className="text-lg font-semibold text-gray-900 tracking-tight">
            Order Timeline
          </h2>
        </div>
        <div className="space-y-5">
          {timeline.map((event, index) => (
            <div key={index} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shadow-sm ${
                    index === 0
                      ? 'bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-hover)] text-white'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {event.icon === 'check' && <CheckCircle2 className="h-4 w-4" />}
                  {event.icon === 'package' && <Package className="h-4 w-4" />}
                </div>
                {index < timeline.length - 1 && (
                  <div className="w-px h-12 bg-gray-200 mt-2" />
                )}
              </div>
              <div className="flex-1 pb-1">
                <div className="font-medium text-gray-900">{event.title}</div>
                <div className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
                  <Clock className="h-3 w-3" />
                  {new Date(event.timestamp).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
                {event.description && (
                  <div className="text-sm text-gray-600 mt-2 bg-gray-50 p-3 rounded-lg">
                    {event.description}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}
