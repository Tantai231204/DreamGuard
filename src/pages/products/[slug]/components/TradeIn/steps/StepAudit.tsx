import { memo, useState } from 'react';
import { AlertCircle, Droplets, Bed, ShieldCheck, CheckCircle2, Waves, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TradeInAudit } from '../../../hooks/useTradeInFlow';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface StepAuditProps {
  audit: TradeInAudit;
  onToggle: (key: keyof TradeInAudit) => void;
  onDescriptionChange: (val: string) => void;
  onIsGoodChange: (val: boolean) => void;
}

const CATEGORY_CRITERIA = {
  mattress: [
    { 
      label: 'Core Integrity', 
      desc: 'Internal structure retains its original shape without permanent sagging.',
      Icon: Bed
    },
    { 
      label: 'Hygiene Standards', 
      desc: 'Free from biological stains, heavy moisture damage, or persistent odours.',
      Icon: Droplets
    },
    { 
      label: 'Surface Quality', 
      desc: 'No significant tears or structural fraying of the cover fabric.',
      Icon: ShieldCheck
    },
  ],
  bedding: [
    { 
      label: 'Fabric Health', 
      desc: 'No major thinning, large holes, or heavy pilling of the material.',
      Icon: Waves
    },
    { 
      label: 'Filling Quality', 
      desc: 'Fillings (down/silk/cotton) must not be heavily clumped or disintegrated.',
      Icon: Sparkles
    },
    { 
      label: 'Sanitation', 
      desc: 'Thoroughly cleaned with no residual household biological stains.',
      Icon: Droplets
    },
  ],
  pillow: [
    { 
      label: 'Structural Loft', 
      desc: 'Filling maintains adequate height and support without permanent flat spots.',
      Icon: Sparkles
    },
    { 
      label: 'Hygiene Integrity', 
      desc: 'Free from persistent sweat stains, biological odours, or moisture damage.',
      Icon: Droplets
    },
    { 
      label: 'Cover Condition', 
      desc: 'Protective casing is free from tears, fraying, or significant fabric thinning.',
      Icon: ShieldCheck
    },
  ]
};

export const StepAudit = memo(function StepAudit({ audit, onDescriptionChange, onIsGoodChange }: StepAuditProps) {
  const [activeTab, setActiveTab] = useState<'mattress' | 'bedding' | 'pillow'>('mattress');
  const [isAcknowledged, setIsAcknowledged] = useState(false);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
        <div>
          <h3 className="font-serif italic text-[26px] text-[#1A1A1A] font-normal leading-tight mb-2">
            Confirm item condition
          </h3>
          <p className="text-[13px] text-[#A89E94] font-medium tracking-wide">
            Select item category to view detailed requirements.
          </p>
        </div>
        
        {/* Tab Switcher */}
        <Tabs 
          value={activeTab} 
          onValueChange={(val) => setActiveTab(val as 'mattress' | 'bedding' | 'pillow')}
          className="w-full sm:w-auto"
        >
          <TabsList className="h-10 w-full sm:w-auto p-1 bg-[#FDFCFA] border border-[#EDE8E1] rounded-2xl">
            <TabsTrigger 
              value="mattress"
              className="rounded-xl px-4 py-1.5 text-[11px] font-black uppercase tracking-widest transition-all data-[state=active]:bg-[#3D5140] data-[state=active]:text-white"
            >
              Mattress
            </TabsTrigger>
            <TabsTrigger 
              value="bedding"
              className="rounded-xl px-4 py-1.5 text-[11px] font-black uppercase tracking-widest transition-all data-[state=active]:bg-[#3D5140] data-[state=active]:text-white"
            >
              Bedding
            </TabsTrigger>
            <TabsTrigger 
              value="pillow"
              className="rounded-xl px-4 py-1.5 text-[11px] font-black uppercase tracking-widest transition-all data-[state=active]:bg-[#3D5140] data-[state=active]:text-white"
            >
              Pillow
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Requirement Cards (Tab Controlled) */}
      <div className="grid gap-3 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.4 }}
            className="space-y-3"
          >
            {CATEGORY_CRITERIA[activeTab].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-5 p-5 rounded-[24px] border-[1px] border-[#EDE8E1] bg-white group shadow-sm"
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-[#FDFCFA] text-[#3D5140] border-[1px] border-[#EDE8E1]">
                  <item.Icon className="w-5 h-5 shrink-0" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="block text-[14px] font-bold text-[#1A1A1A] mb-0.5">{item.label}</span>
                  <span className="block text-[12px] text-[#A89E94] font-medium leading-[1.3]">{item.desc}</span>
                </div>
                <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="h-px bg-[#EDE8E1] w-full" />

      {/* Terms Acknowledgment */}
      <div 
        onClick={() => setIsAcknowledged(!isAcknowledged)}
        className={cn(
          "p-5 rounded-[24px] border-[1px] cursor-pointer transition-all flex items-center gap-4",
          isAcknowledged 
            ? "bg-white border-[#3D5140]/30 shadow-sm"
            : "bg-[#FDFCFA] border-[#EDE8E1] hover:border-[#3D5140]/30"
        )}
      >
         <div className={cn(
           "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
           isAcknowledged ? "bg-[#3D5140] border-[#3D5140]" : "border-[#EDE8E1] bg-white"
         )}>
           {isAcknowledged && <CheckCircle2 className="w-4 h-4 text-white" />}
         </div>
         <p className="text-[12px] text-[#1A1A1A] font-bold leading-snug">
           I verify that my item meets all the technical and hygiene criteria listed above.
         </p>
      </div>

      {/* Main Assessment Action (Only enabled if acknowledged) */}
      <div className={cn("space-y-6 transition-all", !isAcknowledged && "opacity-40 grayscale pointer-events-none")}>
        <div className="p-7 rounded-[28px] bg-[#F4F7F4] border-[1px] border-[#3D5140]/10 flex items-center justify-between gap-6 shadow-sm">
          <div className="flex-1">
            <div className="flex items-center gap-2.5 text-[#3D5140] font-black text-[12px] mb-1.5 uppercase tracking-[0.1em]">
              <AlertCircle className="w-4 h-4" />
              Final Quality Assessment
            </div>
            <p className="text-[12.5px] text-[#3D5140]/70 leading-relaxed font-medium">
              Considering the criteria, is this product still in <span className="text-[#3D5140] font-bold">Premium Good Condition</span>?
            </p>
          </div>
          <div className="flex flex-col items-center gap-3 shrink-0 px-2">
            <Switch
              checked={audit.isGood}
              onCheckedChange={onIsGoodChange}
              className="data-[state=checked]:bg-[#3D5140] scale-125"
            />
            <span className={cn(
              "text-[10px] font-black uppercase tracking-[0.2em] transition-colors",
              audit.isGood ? "text-emerald-700" : "text-amber-700"
            )}>
              {audit.isGood ? 'Premium' : 'Fair'}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-[11px] font-black text-[#1A1A1A] uppercase tracking-[0.2em] flex items-center gap-2.5 opacity-70">
            <span className="text-[#3D5140]">{`> _`}</span>
            Detailed Description (Optional)
          </label>
          <Textarea
            placeholder="Tell us about the current state, usage history, or any minor defects..."
            className="min-h-[100px] rounded-[24px] border-[#EDE8E1] bg-white text-[14px] focus:ring-1 focus:ring-[#3D5140] transition-all resize-none px-6 py-5 placeholder:text-[#D1CBC1] placeholder:font-medium"
            value={audit.description}
            onChange={(e) => onDescriptionChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
});
