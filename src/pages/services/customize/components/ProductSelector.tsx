import { cn } from "@/lib/utils";
import type { CustomizableProduct } from "../types";
import { customizableProducts } from "../data";

interface ProductSelectorProps {
  selectedProduct: CustomizableProduct | null;
  onSelect: (product: CustomizableProduct) => void;
}

export default function ProductSelector({ selectedProduct, onSelect }: ProductSelectorProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-1 max-w-lg mx-auto">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Choose a Product</h2>
        <p className="text-sm text-slate-500 font-medium">Select the baby item you want to personalize.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
        {customizableProducts.map((product) => {
          const isSelected = selectedProduct?.id === product.id;
          return (
            <button
              key={product.id}
              type="button"
              onClick={() => onSelect(product)}
              className={cn(
                "group relative flex flex-col items-center text-center p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer",
                isSelected
                  ? "border-[#4988c4] border-solid bg-[#4988c4]/[0.04] shadow-lg shadow-[#4988c4]/10 scale-[1.02]"
                  : "border-slate-100 border-dashed bg-white hover:border-[#4988c4]/40 hover:shadow-md hover:bg-slate-50/50"
              )}
            >
              <div className={cn("text-4xl mb-3 transition-transform duration-300", isSelected ? "scale-110" : "group-hover:scale-105")}>
                {product.icon}
              </div>
              <h3 className={cn("font-black text-sm tracking-tight transition-colors", isSelected ? "text-[#4988c4]" : "text-slate-800")}>
                {product.name}
              </h3>
              <p className="text-[10px] font-bold text-slate-400 mt-1 leading-relaxed">{product.description}</p>
              <div className="mt-3 text-[10px] font-black uppercase tracking-widest text-slate-500">
                From {(product.basePrice / 1000).toFixed(0)}K VNĐ
              </div>
              {isSelected && (
                <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-[#4988c4] flex items-center justify-center animate-in zoom-in-50 duration-200">
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
