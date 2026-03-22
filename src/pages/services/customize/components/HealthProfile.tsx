import { cn } from "@/lib/utils";
import type { ChildProfile } from "../types";
import { allergyOptions, healthConditionOptions } from "../data";
import { Label } from "@/components/ui/label";

interface HealthProfileProps {
  profile: ChildProfile;
  onChange: (profile: ChildProfile) => void;
}

const ageGroups = [
  { id: "newborn" as const, label: "Newborn", sub: "0–6 months", emoji: "👶" },
  { id: "infant" as const, label: "Infant", sub: "6–12 months", emoji: "🍼" },
  { id: "toddler" as const, label: "Toddler", sub: "1–3 years", emoji: "🧒" },
];

const sensitivityLevels = [
  { value: 1, label: "Normal", color: "bg-emerald-400" },
  { value: 2, label: "Sensitive", color: "bg-amber-400" },
  { value: 3, label: "Very Sensitive", color: "bg-rose-400" },
];

export default function HealthProfile({ profile, onChange }: HealthProfileProps) {
  const toggleAllergy = (id: string) => {
    if (id === "none") {
      onChange({ ...profile, allergies: ["none"] });
      return;
    }
    const filtered = profile.allergies.filter((a) => a !== "none");
    const updated = filtered.includes(id) ? filtered.filter((a) => a !== id) : [...filtered, id];
    onChange({ ...profile, allergies: updated });
  };

  const toggleCondition = (id: string) => {
    if (id === "none") {
      onChange({ ...profile, healthConditions: ["none"] });
      return;
    }
    const filtered = profile.healthConditions.filter((c) => c !== "none");
    const updated = filtered.includes(id) ? filtered.filter((c) => c !== id) : [...filtered, id];
    onChange({ ...profile, healthConditions: updated });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Child's Health Profile</h2>
        <p className="text-sm text-slate-500 font-medium">Help us recommend the safest materials for your baby.</p>
      </div>

      {/* Age Group */}
      <div className="space-y-3">
        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.12em] flex items-center gap-2">👶 Age Group</Label>
        <div className="grid grid-cols-3 gap-3">
          {ageGroups.map((ag) => {
            const isActive = profile.ageGroup === ag.id;
            return (
              <button key={ag.id} type="button" onClick={() => onChange({ ...profile, ageGroup: ag.id })} className={cn("flex flex-col items-center p-4 rounded-2xl border-2 transition-all duration-200", isActive ? "border-[#4988c4] bg-[#4988c4]/[0.04] shadow-md shadow-[#4988c4]/10" : "border-slate-100 border-dashed bg-white hover:border-[#4988c4]/30")}>
                <span className="text-2xl mb-1">{ag.emoji}</span>
                <span className={cn("font-black text-sm", isActive ? "text-[#4988c4]" : "text-slate-800")}>{ag.label}</span>
                <span className="text-[10px] font-bold text-slate-400 mt-0.5">{ag.sub}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Allergies */}
      <div className="space-y-3">
        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.12em] flex items-center gap-2">🛡️ Known Allergies</Label>
        <div className="flex flex-wrap gap-2">
          {allergyOptions.map((opt) => {
            const isActive = profile.allergies.includes(opt.id);
            return (
              <button key={opt.id} type="button" onClick={() => toggleAllergy(opt.id)} className={cn("px-4 py-2 rounded-full border-2 text-xs font-black transition-all duration-200", isActive ? "border-[#4988c4] bg-[#4988c4]/10 text-[#4988c4]" : "border-slate-100 border-dashed bg-white text-slate-600 hover:border-[#4988c4]/30")}>
                {opt.emoji} {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Skin Sensitivity */}
      <div className="space-y-3">
        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.12em] flex items-center gap-2">🧴 Skin Sensitivity</Label>
        <div className="flex gap-3">
          {sensitivityLevels.map((level) => {
            const isActive = profile.skinSensitivity === level.value;
            return (
              <button key={level.value} type="button" onClick={() => onChange({ ...profile, skinSensitivity: level.value })} className={cn("flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 transition-all duration-200", isActive ? "border-[#4988c4] bg-[#4988c4]/[0.04] shadow-sm" : "border-slate-100 border-dashed bg-white hover:border-[#4988c4]/30")}>
                <div className={cn("h-3 w-3 rounded-full", level.color)} />
                <span className={cn("text-xs font-black", isActive ? "text-[#4988c4]" : "text-slate-700")}>{level.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Health Conditions */}
      <div className="space-y-3">
        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.12em] flex items-center gap-2">🩺 Health Conditions (Optional)</Label>
        <div className="flex flex-wrap gap-2">
          {healthConditionOptions.map((opt) => {
            const isActive = profile.healthConditions.includes(opt.id);
            return (
              <button key={opt.id} type="button" onClick={() => toggleCondition(opt.id)} className={cn("px-4 py-2 rounded-full border-2 text-xs font-black transition-all duration-200", isActive ? "border-[#4988c4] bg-[#4988c4]/10 text-[#4988c4]" : "border-slate-100 border-dashed bg-white text-slate-600 hover:border-[#4988c4]/30")}>
                {opt.emoji} {opt.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
