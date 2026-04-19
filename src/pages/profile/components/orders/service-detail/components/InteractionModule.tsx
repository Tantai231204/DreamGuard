import React from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const InteractionModule = React.memo(({
    score,
    comment,
    isSubmitting,
    isAlreadyRated,
    setDraftScore,
    setDraftComment,
    onSubmit
}: {
    score: number;
    comment: string;
    isSubmitting: boolean;
    isAlreadyRated: boolean;
    setDraftScore: (s: number) => void;
    setDraftComment: (c: string) => void;
    onSubmit: () => void;
}) => (
    <div className="bg-white p-2 border-t border-slate-50">
        <div className="bg-slate-50/40 rounded-[2.5rem] border border-slate-100 p-6 space-y-6 transition-all hover:bg-white hover:shadow-xl hover:shadow-amber-500/5 group">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center border border-slate-100 shadow-sm group-hover:scale-110 transition-transform duration-500">
                        <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] leading-none">Service Quality Audit</p>
                        <h4 className="text-[18px] font-black text-slate-900 tracking-tighter uppercase italic leading-none">Session Evaluation</h4>
                    </div>
                </div>
                
                <div className="flex items-center gap-1.5 p-1.5 bg-white rounded-2xl border border-slate-100 shadow-sm px-4">
                    {[1, 2, 3, 4, 5].map((v) => (
                        <button
                            key={v}
                            onClick={() => setDraftScore(v)}
                            disabled={isSubmitting || isAlreadyRated}
                            className="p-1 transition-all hover:scale-125 hover:-translate-y-1 focus:outline-none disabled:opacity-50"
                        >
                            <Star className={cn(
                                "w-6 h-6 transition-all duration-300",
                                v <= score ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]" : "text-slate-100"
                            )} />
                        </button>
                    ))}
                </div>
            </div>

            <div className="relative">
                <textarea
                    value={comment}
                    onChange={(e) => setDraftComment(e.target.value)}
                    placeholder={isAlreadyRated ? "Digital signature recorded." : "Enter qualitative feedback regarding service execution..."}
                    disabled={isSubmitting || isAlreadyRated}
                    className="w-full min-h-[100px] bg-white border border-slate-100 rounded-[1.5rem] p-5 text-[14px] font-medium text-slate-600 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-amber-500/5 transition-all resize-none shadow-inner"
                />
                
                <div className="mt-4 flex items-center justify-between px-2">
                    <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Awaiting Verification</span>
                    </div>
                    <Button
                        onClick={onSubmit}
                        disabled={isSubmitting || isAlreadyRated || !score}
                        className={cn(
                            "h-11 px-10 rounded-[1rem] text-[11px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95",
                            isAlreadyRated
                                ? "bg-slate-100 text-slate-400 border-0 cursor-not-allowed shadow-none"
                                : "bg-amber-500 text-white hover:bg-amber-600 shadow-amber-500/20 border-0"
                        )}
                    >
                        {isAlreadyRated ? 'Recorded' : (isSubmitting ? 'Syncing...' : 'Finalize Audit')}
                    </Button>
                </div>
            </div>
        </div>
    </div>
));
InteractionModule.displayName = 'InteractionModule';
