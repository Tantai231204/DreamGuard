import { Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { pricingPackages } from "../../../data";

interface StepPackageProps {
  packageId: string;
  onSelect: (id: string) => void;
}

export default function StepPackage({ packageId, onSelect }: StepPackageProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-[#4988c4]/10 text-[#4988c4] border border-[#4988c4]/20 text-[9px] font-black uppercase tracking-widest">
          Step 01
        </div>
        <h3 className="text-xl font-black text-slate-900 tracking-tight">Select a Package</h3>
        <p className="text-xs text-slate-400 font-medium">Choose the package that fits your needs.</p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {pricingPackages.map((pkg) => {
          const isSelected = packageId === pkg.id;
          return (
            <div
              key={pkg.id}
              className={`relative rounded-2xl border-2 p-4 transition-all duration-300 overflow-hidden flex flex-col group
                ${isSelected
                  ? "border-[#4988c4] bg-[#4988c4]/5 shadow-sm"
                  : "border-slate-100 bg-white hover:border-[#4988c4]/40 hover:shadow-md text-slate-900"
                }
              `}
            >
              {pkg.badge && (
                <span
                  className={`absolute -top-2.5 right-6 px-2.5 py-0.5 rounded-full text-[8px] font-black tracking-wider uppercase shadow-sm z-10
                    ${pkg.featured ? "bg-[#4988c4] text-white" : "bg-amber-500 text-white"}
                  `}
                >
                  {pkg.badge}
                </span>
              )}

              <div
                role="button"
                onClick={() => onSelect(pkg.id)}
                className="flex items-center justify-between cursor-pointer w-full"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <span
                    className={`h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${isSelected
                        ? "bg-[#4988c4] border-[#4988c4]"
                        : "bg-slate-50 border-slate-200 group-hover:border-[#4988c4]/50"
                      }`}
                  >
                    <Check className={`h-2.5 w-2.5 ${isSelected ? "text-white" : "text-slate-200"}`} />
                  </span>

                  <div className="min-w-0">
                    <span className={`font-black text-sm tracking-tight block ${isSelected ? "text-[#4988c4]" : "text-slate-900"}`}>
                      {pkg.name}
                    </span>
                    <p className="text-xs text-slate-400 font-bold truncate mt-0.5">{pkg.description}</p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0 ml-4">
                  <div className={`text-base font-black tracking-tight ${isSelected ? "text-[#4988c4]" : "text-slate-900"}`}>
                    {pkg.price}
                  </div>
                  <div className="text-[8px] font-black uppercase tracking-widest text-slate-400 mt-0.3">{pkg.priceNote}</div>
                </div>
              </div>

              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-[#4988c4]/20 mt-3 pt-3 space-y-3"
                  >
                    <div className="flex flex-wrap gap-1.5">
                      {pkg.features.map((f) => (
                        <span key={f} className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#4988c4]/10 text-[#4988c4] text-[9px] font-black tracking-wider uppercase">
                          {f}
                        </span>
                      ))}
                    </div>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1.5">
                      {pkg.includes.map((inc) => (
                        <li key={inc} className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                          <Check className="h-3 w-3 text-[#4988c4] flex-shrink-0" />
                          <span className="truncate">{inc}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
