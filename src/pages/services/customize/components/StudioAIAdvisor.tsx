import { memo, useState, useCallback } from 'react';
import { Baby, ChevronRight, Loader2, Sparkles } from 'lucide-react';
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

interface Recommendation {
    width: number;
    length: number;
    colorHex: string;
    explanation: string;
    babyName: string;
}

interface StudioAIAdvisorProps {
    onApplyRecommendation: (rec: { width: number; length: number; colorHex: string }) => void;
    productType?: string;
}

export const StudioAIAdvisor = memo(({ onApplyRecommendation, productType }: StudioAIAdvisorProps) => {
    const [open, setOpen] = useState(false);
    const [selectedBabyId, setSelectedBabyId] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [recommendation, setRecommendation] = useState<Recommendation | null>(null);

    const { data: babyProfiles, isLoading } = useBabyProfiles();

    const handleSelectBaby = useCallback((babyId: string) => {
        setSelectedBabyId(babyId);
        setRecommendation(null);
    }, []);

    const generateRecommendation = useCallback(async () => {
        if (!selectedBabyId || !babyProfiles) return;
        
        setIsGenerating(true);
        await new Promise(resolve => setTimeout(resolve, 1500));

        const baby = babyProfiles.find(b => b.babyId === selectedBabyId);
        if (!baby) return;

        const dob = new Date(baby.dateOfBirth);
        const ageInMonths = Math.max(0, (new Date().getTime() - dob.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
        const babyHeight = baby.height || 70;

        let recWidth = 60;
        let recLength = 120;

        if (productType?.includes('pillow')) {
            recWidth = ageInMonths < 6 ? 20 : 25;
            recLength = ageInMonths < 6 ? 30 : 35;
        } else if (productType?.includes('crib') || productType?.includes('mattress')) {
            recWidth = Math.ceil(babyHeight * 0.7 + 15);
            recLength = Math.ceil(babyHeight + 40);
            recWidth = Math.max(40, Math.min(90, recWidth));
            recLength = Math.max(90, Math.min(190, recLength));
        }

        let colorHex = "#B0D4F1"; 
        const isBoy = baby.gender.toLowerCase() === 'male' || baby.gender.toLowerCase() === 'nam';
        const isGirl = baby.gender.toLowerCase() === 'female' || baby.gender.toLowerCase() === 'nữ';
        
        if (isBoy) colorHex = "#7EB1D6"; 
        if (isGirl) colorHex = "#F4B6C2"; 

        const explanation = `Recommended specifications for ${baby.name} based on their current growth stage (~${Math.floor(ageInMonths)}m) to ensure optimal comfort and safety.`;

        setRecommendation({
            width: recWidth,
            length: recLength,
            colorHex,
            explanation,
            babyName: baby.name
        });
        setIsGenerating(false);
    }, [selectedBabyId, babyProfiles, productType]);

    const handleApply = useCallback(() => {
        if (recommendation) {
            onApplyRecommendation({
                width: recommendation.width,
                length: recommendation.length,
                colorHex: recommendation.colorHex
            });
            setOpen(false);
        }
    }, [recommendation, onApplyRecommendation]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button 
                    variant="outline" 
                    className="w-full h-11 rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold text-[11px] uppercase tracking-wider gap-2 transition-all shadow-sm group"
                >
                    <Sparkles className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#4988c4] transition-colors" />
                    Automatic Growth Fit
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden border-none rounded-3xl shadow-xl bg-white">
                <div className="bg-slate-50 px-6 py-8 border-b border-slate-100">
                    <DialogTitle className="text-xl font-bold tracking-tight text-slate-900 mb-1">Growth Advisor</DialogTitle>
                    <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold">Tailored to your resident's profile</p>
                </div>

                <div className="p-6 space-y-6">
                    <div className="space-y-3">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Select Profile</label>
                        {isLoading ? (
                            <div className="flex items-center justify-center py-10">
                                <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
                            </div>
                        ) : babyProfiles && babyProfiles.length > 0 ? (
                            <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1 no-scrollbar">
                                {babyProfiles.map(baby => (
                                    <button
                                        key={baby.babyId}
                                        onClick={() => handleSelectBaby(baby.babyId)}
                                        className={cn(
                                            "w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all",
                                            selectedBabyId === baby.babyId 
                                                ? "border-[#4988c4] bg-[#4988c4]/5"
                                                : "border-slate-50 bg-slate-50/50 hover:bg-slate-50"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-9 h-9 rounded-xl flex items-center justify-center transition-colors",
                                                selectedBabyId === baby.babyId ? "bg-[#4988c4] text-white" : "bg-white text-slate-300 shadow-sm"
                                            )}>
                                                <Baby className="w-4.5 h-4.5" />
                                            </div>
                                            <div className="text-left">
                                                <p className={cn(
                                                    "text-[13px] font-bold",
                                                    selectedBabyId === baby.babyId ? "text-slate-900" : "text-slate-600"
                                                )}>{baby.name}</p>
                                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">
                                                    {baby.height}cm • {baby.weight}kg
                                                </p>
                                            </div>
                                        </div>
                                        <ChevronRight className={cn(
                                            "w-4 h-4 transition-transform",
                                            selectedBabyId === baby.babyId ? "text-[#4988c4] translate-x-1" : "text-slate-200"
                                        )} />
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 px-6 rounded-2xl border-2 border-dashed border-slate-100 bg-slate-50/30">
                                <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-wide">No profiles found in your vault.</p>
                            </div>
                        )}
                    </div>

                    <AnimatePresence mode="wait">
                        {selectedBabyId && !recommendation && (
                            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}>
                                <Button 
                                    onClick={generateRecommendation} 
                                    className="w-full h-11 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] uppercase tracking-widest transition-all disabled:opacity-50"
                                    disabled={isGenerating}
                                >
                                    {isGenerating ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        "Synchronize Specs"
                                    )}
                                </Button>
                            </motion.div>
                        )}

                        {recommendation && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                                className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-5"
                            >
                                <p className="text-[11px] font-medium text-slate-500 leading-relaxed text-center px-2">
                                    "{recommendation.explanation}"
                                </p>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-white p-3.5 rounded-xl border border-slate-100 text-center">
                                        <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest block mb-1">Fit</span>
                                        <p className="text-sm font-bold text-slate-900">
                                            {recommendation.width} × {recommendation.length}cm
                                        </p>
                                    </div>
                                    <div className="bg-white p-3.5 rounded-xl border border-slate-100 text-center">
                                        <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest block mb-1">Foundation</span>
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-3 h-3 rounded-full border border-black/5" style={{ backgroundColor: recommendation.colorHex }} />
                                            <p className="text-[11px] font-bold text-slate-900 uppercase">
                                                {recommendation.colorHex}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <Button 
                                    onClick={handleApply}
                                    className="w-full h-11 rounded-xl bg-[#4988c4] hover:bg-[#3b6ea0] text-white font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-[#4988c4]/10"
                                >
                                    Apply Fitting
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
