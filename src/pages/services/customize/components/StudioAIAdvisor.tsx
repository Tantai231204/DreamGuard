import { memo, useState, useCallback } from 'react';
import { Baby, ChevronRight, Loader2, Sparkles, Ruler, Palette, Zap } from 'lucide-react';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useBabyProfiles } from '@/hooks/useBabyProfile';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

import { useCustomizationRecommendation } from '@/hooks/queries/useProduct';
import type { ProductRecommendationResponse, CustomizationRecommendation } from '@/api/types/product.types';

interface StudioAIAdvisorProps {
    onApplyRecommendation: (data: ProductRecommendationResponse) => void;
    productId: string;
}

export const StudioAIAdvisor = memo(({ onApplyRecommendation, productId }: StudioAIAdvisorProps) => {
    const [open, setOpen] = useState(false);
    const [selectedBabyId, setSelectedBabyId] = useState<string | null>(null);
    const [recommendation, setRecommendation] = useState<ProductRecommendationResponse | null>(null);

    const { data: babyProfiles, isLoading } = useBabyProfiles();
    const { mutateAsync: getRecommendation, isPending: isGenerating } = useCustomizationRecommendation();

    const handleSelectBaby = useCallback((babyId: string) => {
        setSelectedBabyId(babyId);
        setRecommendation(null);
    }, []);

    const generateRecommendation = useCallback(async () => {
        if (!selectedBabyId || !productId) return;

        try {
            const data = await getRecommendation({ babyId: selectedBabyId, productId });
            setRecommendation(data);
        } catch (error) {
            console.error("AI Recommendation failed:", error);
            toast.error("Failed to generate recommendations. Please try again.");
        }
    }, [selectedBabyId, productId, getRecommendation]);

    const handleApply = useCallback(() => {
        if (recommendation) {
            onApplyRecommendation(recommendation);
            setOpen(false);
        }
    }, [recommendation, onApplyRecommendation]);

    const sizeRec = recommendation?.CustomizationRecommendations.find((r: CustomizationRecommendation) => r.Category === 'Size');
    const colorRec = recommendation?.CustomizationRecommendations.find((r: CustomizationRecommendation) => r.Category === 'Color');
    const selectedBaby = babyProfiles?.find(b => b.babyId === selectedBabyId);

    return (
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setRecommendation(null); setSelectedBabyId(null); } }}>
            <DialogTrigger asChild>
                <button
                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-[#4988c4]/15 bg-[#4988c4]/[0.03] hover:bg-[#4988c4]/[0.06] hover:border-[#4988c4]/25 transition-all duration-200 group"
                >
                    <div className="h-8 w-8 rounded-lg bg-[#4988c4]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#4988c4]/15 transition-colors">
                        <Sparkles className="w-3.5 h-3.5 text-[#4988c4]" />
                    </div>
                    <div className="flex-1 text-left">
                        <p className="text-[11px] font-bold text-slate-700">Growth Fit Advisor</p>
                        <p className="text-[9px] text-slate-400 font-medium">AI-powered sizing for your baby</p>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#4988c4] group-hover:translate-x-0.5 transition-all" />
                </button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[380px] p-0 overflow-hidden border border-slate-200 rounded-2xl shadow-2xl bg-white">
                {/* Header */}
                <div className="px-5 pt-5 pb-4">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="h-8 w-8 rounded-lg bg-[#4988c4]/10 flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-[#4988c4]" />
                        </div>
                        <div>
                            <DialogTitle className="text-sm font-bold text-slate-900">Growth Fit Advisor</DialogTitle>
                            <p className="text-[10px] text-slate-400 font-medium">Select a profile to get AI recommendations</p>
                        </div>
                    </div>
                </div>

                <div className="px-5 pb-5 space-y-4">
                    {/* Baby Profile Selection */}
                    <div className="space-y-2">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em] px-0.5">Baby Profile</p>
                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-5 h-5 animate-spin text-slate-300" />
                            </div>
                        ) : babyProfiles && babyProfiles.length > 0 ? (
                            <div className="space-y-1.5 max-h-[180px] overflow-y-auto no-scrollbar">
                                {babyProfiles.map(baby => {
                                    const isSelected = selectedBabyId === baby.babyId;
                                    return (
                                        <button
                                            key={baby.babyId}
                                            onClick={() => handleSelectBaby(baby.babyId)}
                                            className={cn(
                                                "w-full flex items-center gap-3 p-2.5 rounded-xl border transition-all duration-150",
                                                isSelected
                                                    ? "border-[#4988c4] bg-[#4988c4]/5"
                                                    : "border-slate-100 hover:border-slate-200 hover:bg-slate-50/50"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-8 h-8 rounded-lg flex items-center justify-center transition-colors flex-shrink-0",
                                                isSelected ? "bg-[#4988c4] text-white" : "bg-slate-100 text-slate-400"
                                            )}>
                                                <Baby className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 text-left min-w-0">
                                                <p className={cn(
                                                    "text-[12px] font-semibold truncate",
                                                    isSelected ? "text-slate-900" : "text-slate-600"
                                                )}>{baby.name}</p>
                                                <p className="text-[9px] text-slate-400 font-medium">
                                                    {baby.height}cm · {baby.weight}kg
                                                </p>
                                            </div>
                                            {isSelected && (
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#4988c4] flex-shrink-0" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-8 rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
                                <Baby className="w-5 h-5 text-slate-300 mx-auto mb-2" />
                                <p className="text-[10px] text-slate-400 font-medium">No baby profiles found</p>
                            </div>
                        )}
                    </div>

                    <AnimatePresence mode="wait">
                        {/* Generate Button */}
                        {selectedBabyId && !recommendation && (
                            <motion.div
                                key="generate"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.15 }}
                            >
                                <Button
                                    onClick={generateRecommendation}
                                    className="w-full h-10 rounded-xl bg-[#4988c4] hover:bg-[#3d7ab5] text-white font-semibold text-[11px] gap-2 transition-all disabled:opacity-60"
                                    disabled={isGenerating}
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            Analyzing...
                                        </>
                                    ) : (
                                        <>
                                            <Zap className="w-3.5 h-3.5" />
                                            Generate for {selectedBaby?.name || "Baby"}
                                        </>
                                    )}
                                </Button>
                            </motion.div>
                        )}

                        {/* Results */}
                        {recommendation && (
                            <motion.div
                                key="results"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-3"
                            >
                                {/* Recommendation Cards */}
                                <div className="grid grid-cols-2 gap-2">
                                    {sizeRec && (
                                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                                            <div className="flex items-center gap-1.5 mb-2">
                                                <Ruler className="w-3 h-3 text-[#4988c4]" />
                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Size</span>
                                            </div>
                                            <p className="text-[11px] font-bold text-slate-900 leading-snug">
                                                {sizeRec.RecommendedValue}
                                            </p>
                                            {sizeRec.Reason && (
                                                <p className="text-[9px] text-slate-400 mt-1 leading-relaxed line-clamp-2">
                                                    {sizeRec.Reason}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                    {colorRec && (
                                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                                            <div className="flex items-center gap-1.5 mb-2">
                                                <Palette className="w-3 h-3 text-[#4988c4]" />
                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Color</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-5 h-5 rounded-md border border-black/8 shadow-sm flex-shrink-0"
                                                    style={{ backgroundColor: colorRec.RecommendedValue }}
                                                />
                                                <p className="text-[11px] font-bold text-slate-900 uppercase font-mono">
                                                    {colorRec.RecommendedValue}
                                                </p>
                                            </div>
                                            {colorRec.Reason && (
                                                <p className="text-[9px] text-slate-400 mt-1 leading-relaxed line-clamp-2">
                                                    {colorRec.Reason}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Match Reasons */}
                                {recommendation.RecommendedVariant?.MatchReasons?.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5">
                                        {recommendation.RecommendedVariant.MatchReasons.map((reason, i) => (
                                            <span
                                                key={i}
                                                className="text-[8px] font-semibold text-[#4988c4] bg-[#4988c4]/8 px-2 py-1 rounded-md border border-[#4988c4]/10"
                                            >
                                                {reason}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Apply Button */}
                                <Button
                                    onClick={handleApply}
                                    className="w-full h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[11px] gap-2 transition-all"
                                >
                                    <Sparkles className="w-3.5 h-3.5" />
                                    Apply Recommendations
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </DialogContent>
        </Dialog>
    );
});

StudioAIAdvisor.displayName = 'StudioAIAdvisor';
