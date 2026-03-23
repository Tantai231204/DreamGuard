import { memo } from "react";
// ... existing imports ...
import {
  Check,
} from "lucide-react";
import { motion } from "framer-motion";
import { useBookingData, type ProductType } from "../useBookingData";
import { useWatch, type UseFormReturn } from "react-hook-form";
import type { BookingFormValues } from "../schema";
import { formatPrice } from "@/lib/utils";
import { ProductAssetIcons, type ProductAssetIconKey } from "@/components/common/icons";

interface StepProductsProps {
  form: UseFormReturn<BookingFormValues>;
}

const StepProducts = memo(({ form }: StepProductsProps) => {
  const selected: string[] = useWatch({ control: form.control, name: "selectedProducts" }) ?? [];
  const { productTypes } = useBookingData();
  const { setValue } = form;

  function toggle(productId: string) {
    if (selected.includes(productId)) {
      setValue(
        "selectedProducts",
        selected.filter((id) => id !== productId),
        { shouldValidate: true },
      );
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

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {productTypes.map((product: ProductType) => {
          const iconSrc = ProductAssetIcons[product.icon as ProductAssetIconKey] || ProductAssetIcons.PRODUCT_CATEGORIES;
          const isSelected = selected.includes(product.id);
          const priceFrom = product.tiers[0]?.price || 0;

          return (
            <motion.button
              key={product.id}
              type="button"
              onClick={() => toggle(product.id)}
              whileTap={{ scale: 0.98 }}
              className={`relative flex flex-col items-center text-center p-5 rounded-[24px] border-2 transition-all duration-300 group cursor-pointer
                ${isSelected
                  ? "border-          [#4988c4] bg-white shadow-2xl shadow-[#4988c4]/12 scale-[1.02] z-10"
                  : "border-slate-100 bg-white hover:border-slate-200 hover:shadow-xl hover:shadow-slate-100/80 hover:-translate-y-0.5"
                }
              `}
            >
              <div className={`absolute top-3 right-3 h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all
                ${isSelected
                  ? "bg-[#4988c4] border-[#4988c4] scale-100"
                  : "bg-white border-slate-200 scale-90 group-hover:border-[#4988c4]/40"
                }
              `}>
                <Check className={`h-3.5 w-3.5 transition-colors ${isSelected ? "text-white" : "text-transparent"}`} strokeWidth={3} />
              </div>

              <div className={`h-16 w-16 rounded-[20px] flex items-center justify-center mb-4 transition-all duration-300
                ${isSelected
                  ? "bg-gradient-to-br from-[#4988c4]/[0.04] to-[#4988c4]/[0.15] shadow-inner border border-[#4988c4]/10"
                  : "bg-slate-50/80 border border-slate-50 group-hover:bg-[#4988c4]/5 group-hover:border-[#4988c4]/10"
                }
              `}>
                <img src={iconSrc} alt={product.label} className={`h-9 w-9 object-contain transition-all duration-300 ${isSelected ? "scale-110 drop-shadow-md" : "opacity-90 group-hover:opacity-100 scale-100"}`} />
              </div>

              <h4 className={`text-sm font-black tracking-tight transition-colors ${isSelected ? "text-[#4988c4]" : "text-slate-800"}`}>
                {product.label}
              </h4>
              <p className="text-[11px] text-slate-500 font-medium mt-1.5 leading-relaxed line-clamp-2 min-h-[32px]">
                {product.description}
              </p>

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
});

export default StepProducts;
