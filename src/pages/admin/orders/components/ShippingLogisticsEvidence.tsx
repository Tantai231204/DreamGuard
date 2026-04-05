import { memo } from 'react';
import { useShippingTaskDetail } from '@/hooks/queries/useShippingTask';
import { Card } from '@/components/ui/card';
import {  MapPin, PackageCheck, Image as ImageIcon, Camera, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatTime } from '@/lib/utils';

interface ShippingLogisticsEvidenceProps {
    taskId: string;
    delay?: number;
}

export const ShippingLogisticsEvidence = memo(function ShippingLogisticsEvidence({ taskId, delay = 0 }: ShippingLogisticsEvidenceProps) {
    const { data: task, isLoading } = useShippingTaskDetail(taskId);

    if (isLoading) {
        return (
            <div className="space-y-4 animate-pulse">
                <div className="h-4 w-32 bg-slate-100 rounded" />
                <div className="grid grid-cols-2 gap-4">
                    <div className="h-40 bg-slate-50 rounded-xl border border-slate-100" />
                    <div className="h-40 bg-slate-50 rounded-xl border border-slate-100" />
                </div>
            </div>
        );
    }

    if (!task?.evidences || task.evidences.length === 0) return null;

    return (
        <section className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-700" style={{ animationDelay: `${delay}s` }}>
            <div className="flex items-center justify-between px-2">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Camera className="w-3.5 h-3.5 text-primary" />
                    Logistics Proof
                </h3>
                <div className="h-px bg-slate-100 flex-1 ml-4" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {task.evidences.map((evidence) => {
                    const isDelivered = evidence.evidenceType === 'Delivered' || evidence.evidenceType === 'Shipped';

                    return (
                        <Card 
                            key={evidence.evidenceId} 
                            className="group relative overflow-hidden border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl"
                        >
                            {/* Evidence Info Header */}
                            <div className={cn(
                                "absolute top-3 left-3 z-10 px-2.5 py-1 rounded-lg backdrop-blur-md border flex items-center gap-1.5 shadow-sm",
                                isDelivered 
                                    ? "bg-emerald-50/80 border-emerald-100 text-emerald-700" 
                                    : "bg-indigo-50/80 border-indigo-100 text-indigo-700"
                            )}>
                                {isDelivered ? <PackageCheck className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                                <span className="text-[9px] font-black uppercase tracking-widest leading-none">
                                    {evidence.evidenceType}
                                </span>
                            </div>

                            {/* Timestamp */}
                            <div className="absolute top-3 right-3 z-10 px-2 py-1 bg-white/70 backdrop-blur-md rounded-lg border border-slate-100 text-[9px] font-bold text-slate-500 shadow-sm flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5" />
                                {formatTime(evidence.createdAt)}
                            </div>

                            {/* Image Container */}
                            <div className="relative aspect-[4/3] bg-slate-50 overflow-hidden">
                                <img 
                                    src={evidence.evidenceUrl} 
                                    alt={evidence.evidenceType}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                
                                {/* Overlay on hover */}
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 transform scale-90 group-hover:scale-100 transition-transform">
                                        <ImageIcon className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </section>
    );
});
