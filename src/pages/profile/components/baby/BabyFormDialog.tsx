import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Baby, Gift } from "lucide-react";
import { format } from "date-fns";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../../../components/ui/dialog";

import { DatePicker } from "../../../../components/ui/date-picker";
import { useCreateBabyProfile, useUpdateBabyProfile } from "@/hooks/useBabyProfile";
import type { BabyProfile } from "@/api/types/babyProfile";
import { cn } from "@/lib/utils";

const babyFormSchema = z.object({
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters"),
  gender: z.enum(["male", "female"]),
  dateOfBirth: z.date({ required_error: "Date of birth is required" }),
  height: z.coerce.number()
    .min(30, "Height must be at least 30 cm")
    .max(200, "Height seems invalid for a baby"),
  weight: z.coerce.number()
    .min(1, "Weight must be at least 1 kg")
    .max(50, "Weight seems invalid for a baby"),
  note: z.string().max(200, "Note cannot exceed 200 characters").optional().or(z.literal("")),
});

type BabyFormData = z.infer<typeof babyFormSchema>;

export interface BabyFormInitialData extends Omit<Partial<BabyProfile>, "dateOfBirth"> {
  dateOfBirth?: Date;
}

export interface BabyFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: BabyFormInitialData | null;
}

export default function BabyFormDialog({ open, onOpenChange, initialData }: BabyFormDialogProps) {
  const createMutation = useCreateBabyProfile();
  const updateMutation = useUpdateBabyProfile();

  const { register, handleSubmit, formState: { errors, isSubmitting }, control, watch, setValue, reset } = useForm<BabyFormData>({
    resolver: zodResolver(babyFormSchema),
    defaultValues: {
      name: "",
      gender: "male",
      dateOfBirth: undefined,
      height: 0,
      weight: 0,
      note: ""
    }
  });

  const selectedGender = watch("gender");
  const isBoy = selectedGender === "male";

  // Reset form with initialData when it changes or dialog opens
  useEffect(() => {
    if (open) {
      if (initialData) {
        reset({
          name: initialData.name || "",
          gender: (initialData.gender as "male" | "female") || "male",
          dateOfBirth: initialData.dateOfBirth ? new Date(initialData.dateOfBirth) : undefined,
          height: initialData.height || 0,
          weight: initialData.weight || 0,
          note: initialData.note || ""
        });
      } else {
        reset({
          name: "",
          gender: "male",
          dateOfBirth: undefined,
          height: 0,
          weight: 0,
          note: ""
        });
      }
    }
  }, [open, initialData, reset]);

  const onSubmit = (data: BabyFormData) => {
    const payload = {
      name: data.name,
      gender: data.gender,
      height: data.height,
      weight: data.weight,
      note: data.note || "",
      dateOfBirth: format(data.dateOfBirth, "yyyy-MM-dd"),
    };

    if (initialData?.babyId) {
      updateMutation.mutate(
        { babyId: initialData.babyId, ...payload },
        { onSuccess: () => onOpenChange(false) }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => onOpenChange(false),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto rounded-3xl border-0 shadow-2xl shadow-gray-300/40 p-0 [&>button]:text-slate-500 [&>button]:hover:text-slate-800 [&>button]:bg-white/50 [&>button]:rounded-xl [&>button]:top-5 [&>button]:right-5">
        {/* Dialog Header with accent */}
        <div
          className={cn(
            "px-6 pt-6 pb-5 transition-colors duration-300",
            isBoy
              ? "bg-gradient-to-br from-blue-50 to-sky-50/50"
              : "bg-gradient-to-br from-pink-50 to-rose-50/50"
          )}
        >
          <div
            className={cn(
              "absolute top-0 left-0 right-0 h-1 rounded-t-3xl transition-colors duration-300",
              isBoy
                ? "bg-gradient-to-r from-blue-400 to-cyan-300"
                : "bg-gradient-to-r from-pink-400 to-fuchsia-300"
            )}
          />
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-lg font-bold text-gray-900">
              <div
                className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center transition-colors duration-300",
                  isBoy ? "bg-blue-100" : "bg-pink-100"
                )}
              >
                <Baby className={cn("h-5 w-5", isBoy ? "text-blue-500" : "text-pink-500")} />
              </div>
              {initialData?.babyId ? "Update Baby Profile" : "Add Baby Profile"}
            </DialogTitle>
            <DialogDescription className="text-gray-400 text-sm mt-1">
              Enter information to receive personalized advice.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form className="px-6 pb-6 pt-4 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          {/* Baby Name */}
          <div className="space-y-1.5">
            <Label htmlFor="babyName" className="text-sm font-semibold text-gray-700">
              Baby Name
            </Label>
            <Input
              id="babyName"
              placeholder="Enter baby name"
              {...register("name")}
              className="h-11 rounded-xl border-gray-200 focus:border-[#4988c4] focus:ring-[#4988c4]/10 transition-colors"
            />
            {errors.name && <p className="text-red-500 text-[11px] ml-1">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Date of Birth */}
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-gray-700">
                Date of Birth
              </Label>
              <Controller
                control={control}
                name="dateOfBirth"
                render={({ field }) => (
                  <DatePicker
                    mode="single"
                    value={field.value || undefined}
                    onChange={field.onChange}
                    placeholder="Select date"
                    className="w-full"
                  />
                )}
              />
              {errors.dateOfBirth && <p className="text-red-500 text-[11px] ml-1">{errors.dateOfBirth.message}</p>}
            </div>

            {/* Gender */}
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-gray-700">Gender</Label>
              <div className="flex gap-2 p-1 bg-gray-50 border border-gray-100 rounded-xl h-11">
                <button
                  type="button"
                  className={cn(
                    "flex-1 rounded-lg text-sm font-semibold transition-all duration-200",
                    isBoy
                      ? "bg-white shadow-sm border border-blue-100 text-blue-500"
                      : "text-gray-400 hover:text-gray-600"
                  )}
                  onClick={() => setValue("gender", "male")}
                >
                  ♂ Boy
                </button>
                <button
                  type="button"
                  className={cn(
                    "flex-1 rounded-lg text-sm font-semibold transition-all duration-200",
                    !isBoy
                      ? "bg-white shadow-sm border border-pink-100 text-pink-500"
                      : "text-gray-400 hover:text-gray-600"
                  )}
                  onClick={() => setValue("gender", "female")}
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
                {...register("height")}
                className="h-11 rounded-xl border-gray-200 focus:border-[#4988c4]"
              />
              {errors.height && <p className="text-red-500 text-[11px] ml-1">{errors.height.message}</p>}
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
                {...register("weight")}
                className="h-11 rounded-xl border-gray-200 focus:border-[#4988c4]"
              />
              {errors.weight && <p className="text-red-500 text-[11px] ml-1">{errors.weight.message}</p>}
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
              {...register("note")}
              className="w-full min-h-[80px] rounded-xl border border-gray-200 bg-background px-3 py-2.5 text-sm shadow-none focus:outline-none focus:ring-1 focus:ring-[#4988c4]/30 focus:border-[#4988c4] transition-colors resize-none"
            />
            {errors.note && <p className="text-red-500 text-[11px] ml-1">{errors.note.message}</p>}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1 h-11 rounded-2xl font-semibold text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-gray-800 transition-colors"
              onClick={() => onOpenChange(false)}
              type="button"
            >
              Cancel
            </Button>
            <Button
              variant="premium"
              type="submit"
              disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}
              className={cn(
                "flex-1 h-12 rounded-2xl gap-2",
                !isBoy && "bg-pink-500 border-pink-500 hover:bg-pink-600 hover:border-pink-600 shadow-pink-500/40"
              )}
            >
              <Gift className="h-4 w-4 relative z-10" />
              <span className="relative z-10">
                {isSubmitting || createMutation.isPending || updateMutation.isPending
                  ? "Saving..."
                  : initialData?.babyId
                    ? "Update Profile"
                    : "Add Baby"}
              </span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
