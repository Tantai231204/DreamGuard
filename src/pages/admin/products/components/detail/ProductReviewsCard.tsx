import { memo } from 'react';
import { Star, MessageSquare, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
    useProductFeedbacks,
    useUpdateProductFeedbackStatus
} from '@/hooks/queries/useProductFeedback';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ProductReviewsCardProps {
    productId: string;
}

export const ProductReviewsCard = memo(({ productId }: ProductReviewsCardProps) => {
    const { data: feedbacks, isLoading } = useProductFeedbacks(productId);
    const updateMutation = useUpdateProductFeedbackStatus();

    const handleStatusToggle = async (feedbackId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'Visible' ? 'Hidden' : 'Visible';
        try {
            await updateMutation.mutateAsync({ feedbackId, status: newStatus });
            toast.success(`Review is now ${newStatus}`);
        } catch {
            toast.error('Failed to update status');
        }
    };

    if (isLoading) {
        return (
            <div className="p-24 flex flex-col items-center justify-center gap-4">
                <div className="h-6 w-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Synchronizing Reviews</p>
            </div>
        );
    }

    const feedbackItems = feedbacks?.items || [];
    const avgRating = feedbackItems.length > 0
        ? feedbackItems.reduce((acc, f) => acc + f.score, 0) / feedbackItems.length
        : 0;

    return (
        <div className="p-12 space-y-16">
            {/* Elegant Header / Performance Stats */}
            <div className="flex items-end justify-between">
                <div className="flex items-center gap-12">
                    <div className="space-y-2">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.25em]">Customer Satisfaction</p>
                        <div className="flex items-baseline gap-3">
                            <span className="text-4xl font-black text-slate-900 tracking-tighter">{avgRating.toFixed(1)}</span>
                            <div className="flex gap-0.5 mb-1.5">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={cn(
                                            "h-3 w-3",
                                            i < Math.floor(avgRating) ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"
                                        )}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="h-12 w-px bg-slate-100" />

                    <div className="space-y-2">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.25em]">Total Submissions</p>
                        <div className="flex items-center gap-3">
                            <span className="text-4xl font-black text-slate-900 tracking-tighter">{feedbackItems.length}</span>
                            <MessageSquare className="h-4 w-4 text-slate-300" />
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 px-6 py-3 rounded-2xl bg-slate-50 border border-slate-100/50">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)] animate-pulse" />
                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Live Moderation</p>
                </div>
            </div>

            {/* Submissions Table */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="w-1 h-4 bg-slate-900 rounded-full" />
                    <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Public Narratives</h4>
                </div>

                <div className="w-full border border-slate-100 rounded-[2.5rem] overflow-hidden bg-white shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-50">
                                <th className="px-10 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Origin</th>
                                <th className="px-10 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">Impression</th>
                                <th className="px-10 py-6 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Moderation</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {feedbackItems.length > 0 ? (
                                feedbackItems.map((f) => (
                                    <tr key={f.id} className="group hover:bg-slate-50/30 transition-colors">
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-5">
                                                <div className="h-11 w-11 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                                                    {f.customerAvatar ? (
                                                        <img src={f.customerAvatar} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <span className="text-[10px] font-black text-slate-400 uppercase">{f.customerName?.[0] || 'A'}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-[12px] font-black text-slate-900 uppercase tracking-widest truncate max-w-[150px]">{f.customerName || 'Anonymous'}</p>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 opacity-60">
                                                        {new Date(f.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-1 mb-3">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={cn(
                                                            "h-2.5 w-2.5",
                                                            i < f.score ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"
                                                        )}
                                                    />
                                                ))}
                                            </div>
                                            <p className="text-[13px] font-medium text-slate-600 leading-relaxed italic max-w-lg">
                                                "{f.comment}"
                                            </p>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <div className="flex items-center justify-end gap-6">
                                                <div className="flex flex-col items-end gap-1">
                                                    <Badge className={cn(
                                                        "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 border-none shadow-none",
                                                        f.status === 'Visible' ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"
                                                    )}>
                                                        {f.status || 'Visible'}
                                                    </Badge>
                                                </div>
                                                <Switch
                                                    checked={f.status === 'Visible'}
                                                    onCheckedChange={() => handleStatusToggle(f.id, f.status || 'Visible')}
                                                    className="data-[state=checked]:bg-emerald-500 scale-110"
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={3} className="px-10 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center">
                                                <ShieldCheck className="h-6 w-6 text-slate-200" />
                                            </div>
                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">The sanctuary is awaiting stories.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
});

ProductReviewsCard.displayName = 'ProductReviewsCard';
