import { memo, useState, useCallback } from 'react';
import { Sparkles, Baby, Ruler, Palette, BrainCircuit, ChevronRight, Loader2, Wand2 } from 'lucide-react';
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
import { MATTRESS_LIMITS } from '../constants';

interface Recommendation {
    length: number;
    width: number;
    thickness: number;
    colorHex: string;
    explanation: string;
    babyName: string;
}

interface AICustomizationAdvisorProps {
    onApplyRecommendation: (rec: { length: number; width: number; thickness: number; colorHex: string }) => void;
    currentGender?: string;
}

export const AICustomizationAdvisor = memo(({ onApplyRecommendation }: AICustomizationAdvisorProps) => {
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
        // Simulate AI processing delay
        await new Promise(resolve => setTimeout(resolve, 1800));

        const baby = babyProfiles.find(b => b.babyId === selectedBabyId);
        if (!baby) return;

        // --- Simulated AI Logic based on Pediatric ergonomics ---
        const dob = new Date(baby.dateOfBirth);
        const ageInMonths = Math.max(0, (new Date().getTime() - dob.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
        
        // Base dimensions from baby height
        const babyHeight = baby.height || 70;
        const babyWeight = baby.weight || 8;

        // Limits
        const limits = MATTRESS_LIMITS;

        // Heuristics
        let recLength = Math.ceil(babyHeight + (ageInMonths < 12 ? 30 : 40));
        let recWidth = Math.ceil(babyHeight * 0.7 + 20);
        let recThickness = ageInMonths < 6 ? 10 : 15;

        // Clamp to business limits
        recLength = Math.min(limits.length.max, Math.max(limits.length.min, recLength));
        recWidth = Math.min(limits.width.max, Math.max(limits.width.min, recWidth));
        recThickness = Math.min(limits.thickness.max, Math.max(limits.thickness.min, recThickness));

        // Color logic
        let colorHex = "#FFFFFF";
        if (baby.gender.toLowerCase() === 'male' || baby.gender.toLowerCase() === 'nam') {
            colorHex = "#2563EB"; // Azure
        } else if (baby.gender.toLowerCase() === 'female' || baby.gender.toLowerCase() === 'nữ') {
            colorHex = "#EC4899"; // Rosy
        }

        const explanation = `Based on ${baby.name}'s current age (${Math.floor(ageInMonths)}m), height (${babyHeight}cm), and weight (${babyWeight}kg), we recommend a ${recLength}x${recWidth}x${recThickness} sanctuary. This provides optimal posture support and ${~~((limits.length.max - recLength)/10)} months of safe growth room.`;

        setRecommendation({
            length: recLength,
            width: recWidth,
            thickness: recThickness,
            colorHex,
            explanation,
            babyName: baby.name
        });
        setIsGenerating(false);
    }, [selectedBabyId, babyProfiles]);

    const handleApply = useCallback(() => {
        if (recommendation) {
            onApplyRecommendation({
                length: recommendation.length,
                width: recommendation.width,
                thickness: recommendation.thickness,
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
                    className="w-full h-11 rounded-xl border-[#4988c4]/30 bg-[#4988c4]/5 hover:bg-[#4988c4]/10 text-[#4988c4] font-black text-[11px] uppercase tracking-widest gap-2.5 transition-all shadow-sm group"
                >
                    <Sparkles className="w-4 h-4 text-[#4988c4] animate-pulse" />
                    Bespoke AI Recommendation
                    <BrainCircuit className="w-4 h-4 opacity-40 group-hover:opacity-100 transition-opacity ml-auto" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden border-none rounded-[32px] shadow-2xl bg-[#FDFCFA]">
                <div className="bg-[#4988c4] p-6 text-white text-center space-y-2 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                    <Sparkles className="w-10 h-10 mx-auto opacity-80" />
                    <DialogTitle className="text-xl font-serif italic font-normal tracking-tight">AI Sanctuary Advisor</DialogTitle>
                    <p className="text-white/70 text-[11px] font-medium uppercase tracking-[0.15em]">Precision Ergonomics for your Baby</p>
                </div>

                <div className="p-6 space-y-6">
                    {/* Step 1: Select Baby */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Select Resident Profile</label>
                        {isLoading ? (
                            <div className="flex items-center justify-center py-10">
                                <Loader2 className="w-6 h-6 animate-spin text-[#4988c4]" />
                            </div>
                        ) : babyProfiles && babyProfiles.length > 0 ? (
                            <div className="grid grid-cols-1 gap-2 max-h-[220px] overflow-y-auto pr-1 no-scrollbar">
                                {babyProfiles.map(baby => (
                                    <button
                                        key={baby.babyId}
                                        onClick={() => handleSelectBaby(baby.babyId)}
                                        className={cn(
                                            "flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all text-left group",
                                            selectedBabyId === baby.babyId 
                                                ? "border-[#4988c4] bg-[#4988c4]/5 shadow-md"
                                                : "border-slate-100 hover:border-slate-200 bg-white"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                                                selectedBabyId === baby.babyId ? "bg-[#4988c4] text-white" : "bg-slate-50 text-slate-400 group-hover:bg-slate-100"
                                            )}>
                                                <Baby className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className={cn(
                                                    "text-[14px] font-bold leading-none mb-1",
                                                    selectedBabyId === baby.babyId ? "text-slate-900" : "text-slate-600"
                                                )}>{baby.name}</p>
                                                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">
                                                    {baby.gender} • {new Date().getFullYear() - new Date(baby.dateOfBirth).getFullYear()} years
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
                            <div className="text-center py-10 px-6 rounded-2xl border-2 border-dashed border-slate-100 bg-slate-50/50">
                                <p className="text-xs font-bold text-slate-400 leading-relaxed">No baby profiles found. Please create a profile in your settings first.</p>
                            </div>
                        )}
                    </div>

                    {/* Step 2: Generate/Show Recommendation */}
                    <AnimatePresence mode="wait">
                        {selectedBabyId && !recommendation && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                className="pt-2"
                            >
                                <Button 
                                    onClick={generateRecommendation} 
                                    className="w-full h-12 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-900/20 disabled:opacity-50"
                                    disabled={isGenerating}
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                            Analyzing Growth Data
                                        </>
                                    ) : (
                                        "Generate Intelligence"
                                    )}
                                </Button>
                            </motion.div>
                        )}

                        {recommendation && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                className="p-5 rounded-[24px] bg-white border-2 border-[#4988c4]/20 shadow-xl space-y-5"
                            >
                                <div className="flex items-center gap-3 pb-4 border-b border-slate-50">
                                    <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                        <Wand2 className="w-5 h-5" />
                                    </div>
                                    <p className="text-[11px] font-bold text-slate-600 leading-snug">
                                        {recommendation.explanation}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5 p-3 rounded-xl bg-slate-50/50 border border-slate-100">
                                        <div className="flex items-center gap-1.5 text-slate-400">
                                            <Ruler className="w-3 h-3" />
                                            <span className="text-[8px] font-black uppercase tracking-widest">Dimensions</span>
                                        </div>
                                        <p className="text-[14px] font-black text-slate-900 tracking-tight">
                                            {recommendation.length}x{recommendation.width}x{recommendation.thickness} cm
                                        </p>
                                    </div>
                                    <div className="space-y-1.5 p-3 rounded-xl bg-slate-50/50 border border-slate-100">
                                        <div className="flex items-center gap-1.5 text-slate-400">
                                            <Palette className="w-3 h-3" />
                                            <span className="text-[8px] font-black uppercase tracking-widest">Color Mode</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3.5 h-3.5 rounded-full border border-black/5" style={{ backgroundColor: recommendation.colorHex }} />
                                            <p className="text-[12px] font-black text-slate-900 uppercase">
                                                {recommendation.colorHex}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <Button 
                                    onClick={handleApply}
                                    className="w-full h-11 rounded-xl bg-[#4988c4] hover:bg-[#3b6ea0] text-white font-black text-[10px] uppercase tracking-[0.15em] shadow-lg shadow-blue-500/20"
                                >
                                    Apply Configuration
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="bg-slate-50 p-4 border-t border-slate-100 text-center">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Powered by DreamGuard Intelligence</p>
                </div>
            </DialogContent>
        </Dialog>
    );
});

AICustomizationAdvisor.displayName = 'AICustomizationAdvisor';
