import { memo } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RETURN_REASONS, OTHER_REASON_LABEL } from "@/constants/logistics";

interface DamageOutcomeSectionProps {
  selectedReason: string;
  damageNote: string;
  setSelectedReason: (val: string) => void;
  setDamageNote: (val: string) => void;
}

export const DamageOutcomeSection = memo(function DamageOutcomeSection({
  selectedReason,
  damageNote,
  setSelectedReason,
  setDamageNote,
}: DamageOutcomeSectionProps) {
  return (
    <div className="space-y-4 p-4 rounded-xl border border-slate-200 bg-slate-50/70 animate-in fade-in duration-300">
      <div className="space-y-1.5">
        <Label className="text-[13px] font-semibold text-slate-700">
          Outcome Reason
          <span className="text-[11px] font-normal text-rose-500 ml-1.5">(Required)</span>
        </Label>
        <Select value={selectedReason} onValueChange={setSelectedReason}>
          <SelectTrigger className="h-10 rounded-xl border-slate-200 bg-white hover:bg-slate-50 transition-colors shadow-sm">
            <SelectValue placeholder="Select a reason..." />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-slate-200 shadow-xl">
            {RETURN_REASONS.map((r) => (
              <SelectItem key={r} value={r} className="py-2 text-sm rounded-lg">{r}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {(selectedReason === OTHER_REASON_LABEL || !selectedReason) && (
        <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
          <Label className="text-[13px] font-semibold text-slate-700">
            Detail Notes
          </Label>
          <Textarea
            placeholder="Describe the damages or specific reason in detail..."
            value={damageNote}
            onChange={(e) => setDamageNote(e.target.value)}
            className="min-h-[86px] resize-none rounded-xl border-slate-200 focus:border-rose-200 focus:ring-rose-500/10 shadow-sm"
          />
        </div>
      )}
    </div>
  );
});
