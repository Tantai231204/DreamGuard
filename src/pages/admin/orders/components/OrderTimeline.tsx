import { motion } from 'framer-motion';
import { CheckCircle2, Package, Clock, Activity } from 'lucide-react';
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
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.15 }}
    >
      <Card className="border border-blue-100/50 rounded-2xl bg-white shadow-sm overflow-hidden translate-z-0">
        <div className="px-6 py-4 border-b border-blue-50 flex items-center justify-between bg-gradient-to-r from-blue-50/20 to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-primary/10">
                <Activity className="w-3.5 h-3.5 text-primary" />
            </div>
            <h2 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">
              Order Timeline
            </h2>
          </div>
          <Activity className="w-3.5 h-3.5 text-slate-200" />
        </div>

        <div className="p-6">
          <div className="space-y-0">
            {timeline.map((event, index) => (
              <div key={index} className="flex gap-5 group">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-all duration-300 ${
                      index === 0
                        ? 'bg-primary border-primary text-white shadow-md shadow-primary/20 scale-105'
                        : 'bg-white border-blue-50 text-slate-300 group-hover:border-primary/20 group-hover:text-primary transition-colors'
                    }`}
                  >
                    {event.icon === 'check' && <CheckCircle2 className="h-3.5 w-3.5" />}
                    {event.icon === 'package' && <Package className="h-3.5 w-3.5" />}
                  </div>
                  {index < timeline.length - 1 && (
                    <div className="w-px h-full min-h-[40px] bg-gradient-to-b from-blue-50 to-transparent my-1" />
                  )}
                </div>
                <div className="flex-1 pb-8">
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-slate-900 leading-tight group-hover:text-primary transition-colors">
                        {event.title}
                    </span>
                    <div className="flex items-center gap-2 mt-2">
                        <Clock className="h-3 w-3 text-slate-300" />
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded border border-slate-100/50">
                            {new Date(event.timestamp).toLocaleString('vi-VN', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false,
                            })}
                        </span>
                    </div>
                  </div>
                  {event.description && (
                    <motion.div 
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="mt-3 p-3 bg-blue-50/20 rounded-xl border border-blue-100/20 text-[10px] font-bold text-slate-500 leading-relaxed shadow-sm"
                    >
                      {event.description}
                    </motion.div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
