import {
  Check,
  BedDouble, Layers, SquareStack, CloudSun, Baby, Car,
} from "lucide-react";
import { motion } from "framer-motion";
import { productTypes } from "../../../data";
import { useWatch, type UseFormReturn } from "react-hook-form";
import type { BookingFormValues } from "../schema";
import { formatPrice } from "@/lib/utils";

const iconMap: Record<string, typeof BedDouble> = {
  BedDouble, Layers, SquareStack, CloudSun, Baby, Car,
};

interface StepProductsProps {
  form: UseFormReturn<BookingFormValues>;
}

export default function StepProducts({ form }: StepProductsProps) {
  const { setValue } = form;
  const selected: string[] = useWatch({ control: form.control, name: "selectedProducts" }) ?? [];

  function toggle(productId: string) {
    if (selected.includes(productId)) {
      setValue(
        "selectedProducts",
        selected.filter((id) => id !== productId),
        { shouldValidate: true },
      );
      // Also remove from items array if present
      const items = form.getValues("items") ?? [];
      setValue(
        "items",
        items.filter((it) => it.itemType !== productId),
        { shouldValidate: true },
      );
    } else {
      setValue("selectedProducts", [...selected, productId], { shouldValidate: true });
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-[#4988c4]/10 text-[#4988c4] border border-[#4988c4]/20 text-[9px] font-black uppercase tracking-widest">
          Step 01
        </div>
        <h3 className="text-2xl font-black text-slate-900 tracking-tight">
          What needs cleaning?
        </h3>
        <p className="text-sm text-slate-500 font-medium tracking-wide">
          Select all the items you want us to take care of.
        </p>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {productTypes.map((product) => {
          const Icon = iconMap[product.icon] || BedDouble;
          const isSelected = selected.includes(product.id);
          const priceFrom = product.tiers[0]?.price || 0;

          return (
            <motion.button
              key={product.id}
              type="button"
              onClick={() => toggle(product.id)}
              whileTap={{ scale: 0.97 }}
              className={`relative flex flex-col items-center text-center p-5 rounded-2xl border-2 transition-all duration-200 group cursor-pointer
                ${isSelected
                  ? "border-[#4988c4] bg-gradient-to-b from-[#4988c4]/[0.03] to-[#4988c4]/[0.08] shadow-lg shadow-[#4988c4]/10"
                  : "border-slate-100 bg-white hover:border-slate-200 hover:shadow-md"
                }
              `}
            >
              {/* Corner check circle */}
              <div className={`absolute top-3 right-3 h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all
                ${isSelected
                  ? "bg-[#4988c4] border-[#4988c4] scale-100"
                  : "bg-white border-slate-200 scale-90 group-hover:border-[#4988c4]/40"
                }
              `}>
                <Check className={`h-3.5 w-3.5 transition-colors ${isSelected ? "text-white" : "text-transparent"}`} strokeWidth={3} />
              </div>

              {/* Icon */}
              <div className={`h-12 w-12 rounded-2xl flex items-center justify-center mb-3 transition-all
                ${isSelected
                  ? "bg-[#4988c4] text-white shadow-md shadow-[#4988c4]/20"
                  : "bg-slate-50 text-slate-400 group-hover:bg-[#4988c4]/10 group-hover:text-[#4988c4]"
                }
              `}>
                <Icon className="h-5 w-5" />
              </div>

              {/* Label */}
              <h4 className={`text-sm font-black tracking-tight transition-colors ${isSelected ? "text-[#4988c4]" : "text-slate-800"}`}>
                {product.label}
              </h4>
              <p className="text-[11px] text-slate-500 font-medium mt-1.5 leading-relaxed line-clamp-2 min-h-[32px]">
                {product.description}
              </p>

              {/* Price hint — inline border badge style */}
              <div className={`mt-3 px-3 py-1 rounded-lg border text-[9px] font-black uppercase tracking-wider transition-colors
                ${isSelected
                  ? "border-[#4988c4]/25 bg-[#4988c4]/10 text-[#4988c4]"
                  : "border-slate-100 bg-slate-50 text-slate-500"
                }
              `}>
                From {formatPrice(priceFrom)}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Selection counter */}
      {selected.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 rounded-2xl border-2 border-[#4988c4]/15 bg-[#4988c4]/[0.03]"
        >
          <div className="h-8 w-8 rounded-xl bg-[#4988c4] text-white flex items-center justify-center text-xs font-black shadow-md shadow-[#4988c4]/20">
            {selected.length}
          </div>
          <div>
            <p className="text-sm font-black text-slate-800 tracking-tight">
              {selected.length} {selected.length === 1 ? "product" : "products"} selected
            </p>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              Continue to choose service tiers for each.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
