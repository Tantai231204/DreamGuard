import { useState } from "react";
import { PlusIcon, Pencil1Icon, TrashIcon } from "@radix-ui/react-icons";
import {
  Baby,
  Moon,
  Sparkles,
  ChevronRight,
  Heart,
  Gift,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Badge } from "../../../components/ui/badge";
import { mockRecommendations } from "../data";
import { calculateAge, getStageInfo, formatPrice } from "../utils";
import {
  useBabyProfiles,
  useCreateBabyProfile,
  useDeleteBabyProfile,
  useUpdateBabyProfile,
} from "@/hooks/useBabyProfile";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../components/ui/popover";
import { Calendar as DatePicker } from "../../../components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../../components/ui/dialog";
import type { BabyProfile } from "@/api/types/babyProfile";

interface BabyFormInitialData extends Omit<Partial<BabyProfile>, "dateOfBirth"> {
  dateOfBirth?: Date;
}

interface BabyFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: BabyFormInitialData | null;
}

export default function BabiesTab() {
  const { data: babies = [], isLoading } = useBabyProfiles();
  const deleteMutation = useDeleteBabyProfile();
  const [showForm, setShowForm] = useState(false);
  const [editingBaby, setEditingBaby] = useState<BabyFormDialogProps["initialData"]>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-[#4988c4]/20 border-t-[#4988c4] animate-spin" />
          <p className="text-sm text-gray-400 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Baby Profiles</h2>
          <p className="text-sm text-slate-500 mt-1">
            Manage your family's profiles for personalized product recommendations.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingBaby(null);
            setShowForm(true);
          }}
          className="relative px-6 h-11 rounded-xl bg-primary text-white font-black text-[10px] uppercase tracking-[0.15em] shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300 active:scale-95 group overflow-hidden gap-2"
        >
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[1200ms]" />
          <PlusIcon className="h-4 w-4 relative z-10" />
          <span className="relative z-10">Add Profile</span>
        </Button>
      </div>

      {/* Baby Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {babies.map((baby) => {
          const stage = getStageInfo(baby.dateOfBirth);
          const isBoy = baby.gender === "male";

          return (
            <div
              key={baby.babyId}
              className="group relative rounded-2xl bg-white border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
            >
              {/* Card Header */}
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`relative w-14 h-14 rounded-xl flex items-center justify-center shadow-sm ${isBoy
                        ? "bg-blue-50 text-blue-500"
                        : "bg-pink-50 text-pink-500"
                        }`}
                    >
                      <Baby className="h-6 w-6" />
                      <div
                        className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center shadow-sm ${isBoy ? "bg-blue-400" : "bg-pink-400"
                          }`}
                      >
                        <Heart className="h-2.5 w-2.5 text-white fill-white" />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">
                          {baby.name}
                        </h3>
                        <Badge
                          variant="secondary"
                          className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0 h-4 border-none ${isBoy
                            ? "bg-blue-100/50 text-blue-600"
                            : "bg-pink-100/50 text-pink-600"
                            }`}
                        >
                          {baby.gender}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-1">
                        {calculateAge(baby.dateOfBirth)}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <button
                      className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:text-[#4988c4] hover:bg-white border border-transparent hover:border-slate-200 transition-all"
                      onClick={() => {
                        setEditingBaby({
                          babyId: baby.babyId,
                          name: baby.name,
                          gender: baby.gender,
                          dateOfBirth: baby.dateOfBirth
                            ? new Date(baby.dateOfBirth)
                            : undefined,
                          height: baby.height,
                          weight: baby.weight,
                          note: baby.note || "",
                        });
                        setShowForm(true);
                      }}
                    >
                      <Pencil1Icon className="h-4 w-4" />
                    </button>
                    <button
                      className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-white border border-transparent hover:border-slate-200 transition-all"
                      onClick={() => deleteMutation.mutate(baby.babyId)}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-3 mt-6">
                  {[
                    { label: "Height", value: baby.height, unit: "cm", color: "text-slate-600" },
                    { label: "Weight", value: baby.weight, unit: "kg", color: "text-slate-600" },
                    { 
                      label: "Birth", 
                      value: new Date(baby.dateOfBirth).toLocaleDateString("en-US", { day: "2-digit", month: "2-digit" }), 
                      unit: "", 
                      color: "text-slate-600" 
                    },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="bg-slate-50/80 rounded-xl p-3 border border-slate-100/50"
                    >
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {stat.label}
                      </p>
                      <p className="text-sm font-bold text-slate-700 mt-0.5">
                        {stat.value}
                        <span className="text-[10px] font-medium text-slate-400 ml-0.5">
                          {stat.unit}
                        </span>
                      </p>
                    </div>
                  ))}
                </div>

                {/* Stage Info */}
                <div className="mt-4 p-4 rounded-xl bg-blue-50/30 border border-blue-100/50 flex items-start gap-3">
                  <Moon className="h-4 w-4 text-[#4988c4] mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#4988c4] uppercase tracking-wider">{stage.name}</p>
                    <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed line-clamp-2">{stage.tips}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {babies.length === 0 && (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 py-20 text-center">
          <div className="w-20 h-20 rounded-2xl bg-white shadow-sm flex items-center justify-center mx-auto mb-6">
            <Baby className="h-8 w-8 text-slate-200" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No baby profiles found</h3>
          <p className="text-sm text-slate-500 max-w-xs mx-auto mt-2 font-medium">
            Create a profile to unlock personalized recommendations and premium growth tracking.
          </p>
          <Button
            className="relative mt-8 h-12 px-10 rounded-2xl bg-primary text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-[0_10px_25px_-8px_rgba(var(--color-primary-rgb),0.5)] hover:shadow-[0_15px_30px_-10px_rgba(var(--color-primary-rgb),0.6)] hover:-translate-y-0.5 transition-all duration-300 active:scale-95 group overflow-hidden gap-2"
            onClick={() => {
              setEditingBaby(null);
              setShowForm(true);
            }}
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[1500ms]" />
            <PlusIcon className="h-5 w-5 relative z-10" />
            <span className="relative z-10">Add First Profile</span>
          </Button>
        </div>
      )}

      {/* Product Recommendations */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/30">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-amber-400" />
            <h3 className="text-sm font-bold text-slate-800">Recommended for your babies</h3>
          </div>
        </div>
        <div className="p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mockRecommendations.map((product) => (
              <div
                key={product.id}
                className="group flex items-center gap-4 p-3 rounded-xl border border-slate-100 hover:border-[#4988c4]/30 hover:bg-slate-50 transition-all cursor-pointer"
              >
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-800 text-sm truncate group-hover:text-[#4988c4] transition-colors">
                    {product.name}
                  </h4>
                  <p className="text-sm font-bold text-[#4988c4] mt-1">
                    {formatPrice(product.price)}
                  </p>
                  <span className="inline-block mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {product.forAge}
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-[#4988c4] transition-all transform group-hover:translate-x-1" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <BabyFormDialog
        key={showForm ? (editingBaby?.babyId || "new") : "closed"}
        open={showForm}
        onOpenChange={setShowForm}
        initialData={editingBaby}
      />
    </div>
  );
}

interface BabyFormData {
  babyId?: string;
  name: string;
  gender: string;
  dateOfBirth?: Date;
  height: number;
  weight: number;
  note: string;
}

function BabyFormDialog({ open, onOpenChange, initialData }: BabyFormDialogProps) {
  const createMutation = useCreateBabyProfile();
  const updateMutation = useUpdateBabyProfile();
  const [formData, setFormData] = useState<BabyFormData>(() => ({
    babyId: initialData?.babyId,
    name: initialData?.name || "",
    gender: initialData?.gender || "male",
    dateOfBirth: initialData?.dateOfBirth,
    height: initialData?.height || 0,
    weight: initialData?.weight || 0,
    note: initialData?.note || "",
  }));

  const isBoy = formData.gender === "male";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto rounded-3xl border-0 shadow-2xl shadow-gray-300/40 p-0">
        {/* Dialog Header with accent */}
        <div
          className={`px-6 pt-6 pb-5 ${isBoy
            ? "bg-gradient-to-br from-blue-50 to-sky-50/50"
            : "bg-gradient-to-br from-pink-50 to-rose-50/50"
            }`}
        >
          <div
            className={`absolute top-0 left-0 right-0 h-1 rounded-t-3xl ${isBoy
              ? "bg-gradient-to-r from-blue-400 to-cyan-300"
              : "bg-gradient-to-r from-pink-400 to-fuchsia-300"
              }`}
          />
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-lg font-bold text-gray-900">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${isBoy ? "bg-blue-100" : "bg-pink-100"
                  }`}
              >
                <Baby className={`h-5 w-5 ${isBoy ? "text-blue-500" : "text-pink-500"}`} />
              </div>
              {formData.babyId ? "Update Baby Profile" : "Add Baby Profile"}
            </DialogTitle>
            <DialogDescription className="text-gray-400 text-sm mt-1">
              Enter information to receive personalized product advice
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 pb-6 pt-4 space-y-4">
          {/* Baby Name */}
          <div className="space-y-1.5">
            <Label htmlFor="babyName" className="text-sm font-semibold text-gray-700">
              Baby Name
            </Label>
            <Input
              id="babyName"
              placeholder="Enter baby name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="h-11 rounded-xl border-gray-200 focus:border-[#4988c4] focus:ring-[#4988c4]/10 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Date of Birth */}
            <div className="space-y-1.5">
              <Label htmlFor="dateOfBirth" className="text-sm font-semibold text-gray-700">
                Date of Birth
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full h-11 justify-start text-left font-normal rounded-xl border-gray-200 hover:border-gray-300 ${!formData.dateOfBirth && "text-gray-400"
                      }`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-gray-400" />
                    {formData.dateOfBirth ? (
                      <span className="text-gray-800 font-medium">
                        {format(formData.dateOfBirth, "dd/MM/yyyy")}
                      </span>
                    ) : (
                      <span>Select date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 rounded-2xl shadow-xl border-gray-100">
                  <DatePicker
                    mode="single"
                    selected={formData.dateOfBirth}
                    onSelect={(date: Date | undefined) =>
                      setFormData({ ...formData, dateOfBirth: date })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Gender */}
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-gray-700">Gender</Label>
              <div className="flex gap-2 p-1 bg-gray-50 border border-gray-100 rounded-xl h-11">
                <button
                  type="button"
                  className={`flex-1 rounded-lg text-sm font-semibold transition-all ${isBoy
                    ? "bg-white shadow-sm border border-blue-100 text-blue-500"
                    : "text-gray-400 hover:text-gray-600"
                    }`}
                  onClick={() => setFormData({ ...formData, gender: "male" })}
                >
                  ♂ Boy
                </button>
                <button
                  type="button"
                  className={`flex-1 rounded-lg text-sm font-semibold transition-all ${!isBoy
                    ? "bg-white shadow-sm border border-pink-100 text-pink-500"
                    : "text-gray-400 hover:text-gray-600"
                    }`}
                  onClick={() => setFormData({ ...formData, gender: "female" })}
                >
                  ♀ Girl
                </button>
              </div>
            </div>
          </div>

          {/* Height & Weight */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="height" className="text-sm font-semibold text-gray-700">
                Height <span className="text-gray-400 font-normal">(cm)</span>
              </Label>
              <Input
                id="height"
                type="number"
                placeholder="70"
                value={formData.height}
                onChange={(e) =>
                  setFormData({ ...formData, height: Number(e.target.value) })
                }
                className="h-11 rounded-xl border-gray-200 focus:border-[#4988c4]"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="weight" className="text-sm font-semibold text-gray-700">
                Weight <span className="text-gray-400 font-normal">(kg)</span>
              </Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                placeholder="8.5"
                value={formData.weight}
                onChange={(e) =>
                  setFormData({ ...formData, weight: Number(e.target.value) })
                }
                className="h-11 rounded-xl border-gray-200 focus:border-[#4988c4]"
              />
            </div>
          </div>

          {/* Note */}
          <div className="space-y-1.5">
            <Label htmlFor="note" className="text-sm font-semibold text-gray-700">
              Note <span className="text-gray-400 font-normal">(optional)</span>
            </Label>
            <textarea
              id="note"
              placeholder="Enter notes for baby..."
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              className="w-full min-h-[80px] rounded-xl border border-gray-200 bg-background px-3 py-2.5 text-sm shadow-none focus:outline-none focus:ring-1 focus:ring-[#4988c4]/30 focus:border-[#4988c4] transition-colors resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1 h-11 rounded-2xl font-semibold text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-gray-800 transition-colors"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              className={cn(
                "relative flex-1 h-12 rounded-2xl font-black text-[10px] text-white uppercase tracking-[0.2em] transition-all duration-300 active:scale-[0.98] group overflow-hidden gap-2",
                isBoy 
                  ? "bg-primary shadow-[0_10px_25px_-8px_rgba(var(--color-primary-rgb),0.5)] hover:shadow-[0_15px_30px_-10px_rgba(var(--color-primary-rgb),0.6)]" 
                  : "bg-pink-500 shadow-[0_10px_25px_-8px_rgba(236,72,153,0.5)] hover:shadow-[0_15px_30px_-10px_rgba(236,72,153,0.6)]",
                "hover:-translate-y-0.5"
              )}
              onClick={() => {
                const payload = {
                  name: formData.name,
                  gender: formData.gender,
                  height: formData.height,
                  weight: formData.weight,
                  note: formData.note,
                  dateOfBirth:
                    formData.dateOfBirth?.toISOString().split("T")[0] ?? "",
                };

                if (formData.babyId !== undefined) {
                  updateMutation.mutate(
                    { babyId: formData.babyId, ...payload },
                    { onSuccess: () => onOpenChange(false) }
                  );
                } else {
                  createMutation.mutate(payload, {
                    onSuccess: () => onOpenChange(false),
                  });
                }
              }}
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[1500ms]" />
              <Gift className="h-4 w-4 relative z-10" />
              <span className="relative z-10">{formData.babyId ? "Update Profile" : "Add Baby"}</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}