import { memo } from 'react';
import { useShippingTaskDetail } from '@/hooks/queries/useShippingTask';
import { Card } from '@/components/ui/card';
import {  MapPin, PackageCheck, Image as ImageIcon, Camera, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatTime } from '@/lib/utils';

interface ShippingLogisticsEvidenceProps {
    taskId: string;
    taskLabel?: string;
    delay?: number;
    orderItems?: Array<{ id: string; itemName: string }>;
}

const MANAGER_NOTE_SPLITTER = /\s\|\sManager Note(?:\s*\(([^)]+)\))?:\s*/i;

const formatTaskStatusLabel = (status?: string) => {
    if (!status) return 'Unknown';

    return status
        .replace(/_/g, ' ')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/\b\w/g, (char) => char.toUpperCase());
};

const parseTaskNotes = (rawNote?: string | null) => {
    const source = (rawNote || '').trim();
    if (!source) {
        return {
            staffNote: '',
            managerNote: '',
            managerContext: '',
        };
    }

    const match = source.match(MANAGER_NOTE_SPLITTER);
    if (!match || typeof match.index !== 'number') {
        return {
            staffNote: source,
            managerNote: '',
            managerContext: '',
        };
    }

    const marker = match[0] || '';
    const managerContext = (match[1] || '').trim();
    const staffNote = source.slice(0, match.index).trim();
    const managerNote = source.slice(match.index + marker.length).trim();

    return {
        staffNote,
        managerNote,
        managerContext,
    };
};

export const ShippingLogisticsEvidence = memo(function ShippingLogisticsEvidence({ taskId, taskLabel, delay = 0, orderItems }: ShippingLogisticsEvidenceProps) {
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

    const hasEvidences = !!task?.evidences && task.evidences.length > 0;
    const parsedNotes = parseTaskNotes(task?.staffNote);
    const hasStaffNote = !!parsedNotes.staffNote;
    const hasManagerNote = !!parsedNotes.managerNote;
    const hasAnyNote = hasStaffNote || hasManagerNote;
    const taskStatusLabel = formatTaskStatusLabel(task?.status);

    if (!hasEvidences && !hasAnyNote) return null;

    return (
        <section className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-700" style={{ animationDelay: `${delay}s` }}>
            <div className="flex items-center justify-between px-2">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Camera className="w-3.5 h-3.5 text-primary" />
                    Logistics Proof
                </h3>
                <div className="ml-3 flex items-center gap-2">
                    {taskLabel && (
                        <span className="rounded-md border border-blue-100 bg-blue-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-blue-600">
                            {taskLabel}
                        </span>
                    )}
                    <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-slate-500">
                        {taskStatusLabel}
                    </span>
                </div>
            </div>

            {hasAnyNote && (
                <Card className="border-slate-100 shadow-sm rounded-2xl p-4 bg-slate-50/70">
                    {hasStaffNote && (
                        <div className="space-y-1.5">
                            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Staff Note</p>
                            <p className="text-sm text-slate-700 leading-relaxed">{parsedNotes.staffNote}</p>
                        </div>
                    )}

                    {hasManagerNote && (
                        <div className={cn('space-y-1.5', hasStaffNote && 'mt-4 pt-4 border-t border-slate-200')}>
                            <div className="flex items-center gap-2">
                                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-blue-500">Manager Note</p>
                                {parsedNotes.managerContext && (
                                    <span className="rounded-md border border-blue-100 bg-blue-50 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-blue-600">
                                        {parsedNotes.managerContext}
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-slate-700 leading-relaxed">{parsedNotes.managerNote}</p>
                        </div>
                    )}

                    {task?.damagedItems && task.damagedItems.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-slate-200">
                            <div className="flex items-center gap-2 mb-2.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-rose-500">Damage Assessment</p>
                            </div>
                            <div className="space-y-1.5">
                                {task.damagedItems.map((item, idx) => {
                                    const productName = orderItems?.find(oi => oi.id === item.orderItemId)?.itemName || `Item #${item.orderItemId.substring(0, 8)}`;
                                    return (
                                        <div key={idx} className="flex items-center justify-between bg-white/50 px-3 py-2 rounded-lg border border-rose-100/50">
                                            <span className="text-[11px] font-bold text-slate-700 truncate mr-2">{productName}</span>
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                <span className="text-[9px] font-black text-rose-600 uppercase tracking-widest bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">
                                                    Qty: {item.damagedQuantity}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </Card>
            )}

            {hasEvidences && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {task?.evidences?.map((evidence) => {
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
                                    : "bg-primary-50/80 border-primary-100 text-primary-700"
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
            )}
        </section>
    );
});
