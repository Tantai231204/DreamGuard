import { MapPin } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import { useWatch } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { BookingFormValues } from "../schema";

interface StepContactProps {
  form: UseFormReturn<BookingFormValues>;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-red-500 mt-1">{message}</p>;
}

export default function StepContact({ form }: StepContactProps) {
  const { register, control, formState: { errors } } = form;
  const notesValue = useWatch({ control, name: "notes" }) ?? "";

  return (
    <div className="space-y-5">
      <h3 className="text-xl font-bold text-gray-900">Your Information</h3>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="customerName" className="text-gray-700">
            Full Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="customerName"
            placeholder="John Doe"
            {...register("customerName")}
            className={errors.customerName ? "border-red-400 focus:border-red-400 focus:ring-red-300/20" : ""}
          />
          <FieldError message={errors.customerName?.message} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="customerPhone" className="text-gray-700">
            Phone Number <span className="text-red-500">*</span>
          </Label>
          <Input
            id="customerPhone"
            placeholder="+84 (0) 000-0000"
            {...register("customerPhone")}
            className={errors.customerPhone ? "border-red-400 focus:border-red-400 focus:ring-red-300/20" : ""}
          />
          <FieldError message={errors.customerPhone?.message} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="customerEmail" className="text-gray-700">Email</Label>
        <Input
          id="customerEmail"
          type="email"
          placeholder="john@example.com"
          {...register("customerEmail")}
          className={errors.customerEmail ? "border-red-400 focus:border-red-400 focus:ring-red-300/20" : ""}
        />
        <FieldError message={errors.customerEmail?.message} />
      </div>

      <div className="space-y-1.5">
        <Label className="flex items-center gap-1.5 text-gray-700">
          <MapPin className="h-4 w-4" />
          Address <span className="text-red-500 ml-0.5">*</span>
        </Label>
        <Input
          placeholder="Street address"
          {...register("address.street")}
          className={errors.address?.street ? "border-red-400 focus:border-red-400 focus:ring-red-300/20" : ""}
        />
        <FieldError message={errors.address?.street?.message} />

        <div className="grid grid-cols-3 gap-3 pt-2">
          <div>
            <Input
              placeholder="Ward"
              {...register("address.ward")}
            />
          </div>
          <div>
            <Input
              placeholder="District *"
              {...register("address.district")}
              className={errors.address?.district ? "border-red-400 focus:border-red-400 focus:ring-red-300/20" : ""}
            />
            <FieldError message={errors.address?.district?.message} />
          </div>
          <div>
            <Input
              placeholder="City *"
              {...register("address.city")}
              className={errors.address?.city ? "border-red-400 focus:border-red-400 focus:ring-red-300/20" : ""}
            />
            <FieldError message={errors.address?.city?.message} />
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="notes" className="text-gray-700">Notes (optional)</Label>
          <span className="text-xs text-gray-400">{notesValue.length} / 500</span>
        </div>
        <Textarea
          id="notes"
          rows={3}
          placeholder="Any special instructions..."
          {...register("notes")}
          className={errors.notes ? "border-red-400 focus:border-red-400 focus:ring-red-300/20" : ""}
        />
        <FieldError message={errors.notes?.message} />
      </div>
    </div>
  );
}
