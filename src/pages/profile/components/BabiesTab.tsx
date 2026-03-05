import { useState, useEffect } from "react";
import { PlusIcon, Pencil1Icon, TrashIcon } from "@radix-ui/react-icons";
import {
  Baby,
  Ruler,
  Scale,
  Moon,
  Calendar,
  Sparkles,
  Gift,
  ChevronRight,
  Heart,
  Star,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Badge } from "../../../components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../../components/ui/card";
import { mockRecommendations } from "../data";
import { calculateAge, getStageInfo, formatPrice } from "../utils";
import {
  useBabyProfiles,
  useCreateBabyProfile,
  useDeleteBabyProfile,
  useUpdateBabyProfile,
} from "@/hooks/useBabyProfile";
import { format } from "date-fns";
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

export default function BabiesTab() {
  const { data: babies = [], isLoading } = useBabyProfiles();
  const deleteMutation = useDeleteBabyProfile();
  const [showForm, setShowForm] = useState(false);
  const [editingBaby, setEditingBaby] = useState<any>(null);

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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Baby Profiles</h2>
          <p className="text-sm text-gray-400 mt-1 font-medium">
            Manage info & get tailored product suggestions
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingBaby(null);
            setShowForm(true);
          }}
          className="bg-[#4988c4] hover:bg-[#3b6fa3] text-white shadow-lg shadow-[#4988c4]/25 hover:shadow-[#4988c4]/40 transition-all active:scale-95 rounded-2xl px-5 h-11 font-semibold text-sm gap-2"
        >
          <PlusIcon className="h-4 w-4" />
          Add Baby
        </Button>
      </div>

      {/* Baby Cards */}
      <div className="grid gap-5 md:grid-cols-2">
        {babies.map((baby) => {
          const stage = getStageInfo(baby.dateOfBirth);
          const isBoy = baby.gender === "male";

          return (
            <div
              key={baby.babyId}
              className="group relative rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/60 transition-all duration-300 overflow-hidden"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)" }}
            >
              {/* Colored accent stripe */}
              <div
                className={`absolute top-0 left-0 right-0 h-1 ${isBoy
                  ? "bg-gradient-to-r from-blue-400 via-sky-400 to-cyan-300"
                  : "bg-gradient-to-r from-pink-400 via-rose-400 to-fuchsia-300"
                  }`}
              />

              {/* Card Header */}
              <div className="px-6 pt-6 pb-4">
                <div className="flex items-start justify-between">
                  {/* Avatar + Info */}
                  <div className="flex items-center gap-4">
                    {/* Avatar circle */}
                    <div
                      className={`relative w-14 h-14 rounded-2xl flex items-center justify-center shadow-md ${isBoy
                        ? "bg-gradient-to-br from-blue-100 to-sky-200"
                        : "bg-gradient-to-br from-pink-100 to-rose-200"
                        }`}
                    >
                      <Baby
                        className={`h-6 w-6 ${isBoy ? "text-blue-500" : "text-pink-500"}`}
                      />
                      <div
                        className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${isBoy ? "bg-blue-400" : "bg-pink-400"
                          }`}
                      >
                        <Heart className="h-2.5 w-2.5 text-white fill-white" />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-gray-900 leading-tight">
                          {baby.name}
                        </h3>
                        <span
                          className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${isBoy
                            ? "bg-blue-50 text-blue-600 border border-blue-100"
                            : "bg-pink-50 text-pink-600 border border-pink-100"
                            }`}
                        >
                          {isBoy ? "♂ Boy" : "♀ Girl"}
                        </span>
                      </div>
                      <p className={`text-sm font-medium mt-0.5 ${isBoy ? "text-blue-400" : "text-pink-400"}`}>
                        {calculateAge(baby.dateOfBirth)}
                      </p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      className="w-8 h-8 rounded-xl bg-gray-50 hover:bg-blue-50 border border-gray-100 hover:border-blue-200 text-gray-400 hover:text-[#4988c4] transition-all flex items-center justify-center"
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
                      <Pencil1Icon className="h-3.5 w-3.5" />
                    </button>
                    <button
                      className="w-8 h-8 rounded-xl bg-gray-50 hover:bg-red-50 border border-gray-100 hover:border-red-200 text-gray-400 hover:text-red-500 transition-all flex items-center justify-center"
                      onClick={() => deleteMutation.mutate(baby.babyId)}
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="mx-6 h-px bg-gray-50" />

              <CardContent className="px-6 pt-4 pb-5 space-y-4">
                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    {
                      icon: <Ruler className="h-4 w-4" />,
                      label: "Height",
                      value: `${baby.height}`,
                      unit: "cm",
                      color: isBoy ? "text-blue-500" : "text-pink-500",
                      bg: isBoy ? "bg-blue-50" : "bg-pink-50",
                    },
                    {
                      icon: <Scale className="h-4 w-4" />,
                      label: "Weight",
                      value: `${baby.weight}`,
                      unit: "kg",
                      color: isBoy ? "text-sky-500" : "text-rose-500",
                      bg: isBoy ? "bg-sky-50" : "bg-rose-50",
                    },
                    {
                      icon: <Calendar className="h-4 w-4" />,
                      label: "Birthday",
                      value: new Date(baby.dateOfBirth).toLocaleDateString("en-US", {
                        day: "2-digit",
                        month: "2-digit",
                      }),
                      unit: "",
                      color: isBoy ? "text-cyan-500" : "text-fuchsia-500",
                      bg: isBoy ? "bg-cyan-50" : "bg-fuchsia-50",
                    },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className={`${stat.bg} rounded-2xl p-3 flex flex-col gap-1.5`}
                    >
                      <div className={`${stat.color}`}>{stat.icon}</div>
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                          {stat.label}
                        </p>
                        <p className="text-base font-bold text-gray-800 leading-tight">
                          {stat.value}
                          {stat.unit && (
                            <span className="text-xs font-medium text-gray-400 ml-0.5">
                              {stat.unit}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Stage Badge */}
                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-amber-50 border border-amber-100/80">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                    <Moon className="h-4 w-4 text-amber-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-amber-800 truncate">{stage.name}</p>
                    <p className="text-xs text-amber-500 mt-0.5 leading-snug">{stage.tips}</p>
                  </div>
                  <Star className="h-4 w-4 text-amber-300 fill-amber-200 shrink-0 ml-auto" />
                </div>

                {/* Notes */}
                {baby.note && (
                  <div className="px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Note</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{baby.note}</p>
                  </div>
                )}
              </CardContent>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {babies.length === 0 && (
        <div className="rounded-3xl border-2 border-dashed border-gray-100 bg-gray-50/50 py-16 text-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-100 to-sky-100 flex items-center justify-center mx-auto mb-5 shadow-sm">
            <Baby className="h-9 w-9 text-[#4988c4]" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">No baby profiles yet</h3>
          <p className="text-sm text-gray-400 max-w-xs mx-auto leading-relaxed">
            Add your baby's profile to get personalized product recommendations and parenting tips.
          </p>
          <Button
            className="mt-6 bg-[#4988c4] hover:bg-[#3b6fa3] text-white shadow-lg shadow-[#4988c4]/20 transition-all active:scale-95 rounded-2xl h-11 px-6 font-semibold gap-2"
            onClick={() => {
              setEditingBaby(null);
              setShowForm(true);
            }}
          >
            <PlusIcon className="h-4 w-4" />
            Add First Baby
          </Button>
        </div>
      )}

      {/* Product Recommendations */}
      <div
        className="rounded-3xl bg-white border border-gray-100 overflow-hidden"
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)" }}
      >
        <div className="px-6 pt-6 pb-4 border-b border-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-50 to-sky-100 flex items-center justify-center">
              <Sparkles className="h-4.5 w-4.5 text-[#4988c4]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Suggestions for Baby</h3>
              <p className="text-xs text-gray-400 font-medium mt-0.5">
                Products matched to your baby's age & stage
              </p>
            </div>
          </div>
        </div>
        <div className="p-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {mockRecommendations.map((product) => (
              <div
                key={product.id}
                className="group flex items-center gap-3 p-3 rounded-2xl border border-gray-100 bg-white hover:border-[#4988c4]/20 hover:bg-blue-50/30 hover:shadow-md transition-all duration-200 cursor-pointer"
              >
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-50 shrink-0">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-800 text-sm truncate group-hover:text-[#4988c4] transition-colors">
                    {product.name}
                  </h4>
                  <p className="text-sm font-bold text-[#4988c4] mt-0.5">
                    {formatPrice(product.price)}
                  </p>
                  <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-100">
                    {product.forAge}
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-200 group-hover:text-[#4988c4] transition-colors shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <BabyFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        initialData={editingBaby}
      />
    </div>
  );
}

function BabyFormDialog({ open, onOpenChange, initialData }: any) {
  const createMutation = useCreateBabyProfile();
  const updateMutation = useUpdateBabyProfile();
  const [formData, setFormData] = useState<{
    babyId?: string;
    name: string;
    gender: string;
    dateOfBirth: Date | undefined;
    height: number;
    weight: number;
    note: string;
  }>({
    babyId: undefined,
    name: "",
    gender: "male",
    dateOfBirth: undefined,
    height: 0,
    weight: 0,
    note: "",
  });

  useEffect(() => {
    if (open) {
      setFormData(
        initialData || {
          babyId: undefined,
          name: "",
          gender: "male",
          dateOfBirth: undefined,
          height: 0,
          weight: 0,
          note: "",
        }
      );
    }
  }, [open, initialData]);

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
                <PopoverContent className="w-auto p-0 z-[100] rounded-2xl shadow-xl border-gray-100">
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
              className={`flex-1 h-11 rounded-2xl font-semibold text-white shadow-lg transition-all active:scale-[0.98] gap-2 ${isBoy
                ? "bg-[#4988c4] hover:bg-[#3b6fa3] shadow-[#4988c4]/25"
                : "bg-pink-500 hover:bg-pink-600 shadow-pink-500/25"
                }`}
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
              <Gift className="h-4 w-4" />
              {formData.babyId ? "Update Profile" : "Add Baby"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}