import { Check } from "lucide-react";
import { pricingPackages } from "../../../data";

interface StepPackageProps {
  packageId: string;
  onSelect: (id: string) => void;
}

export default function StepPackage({ packageId, onSelect }: StepPackageProps) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-xl font-bold text-gray-900">Select a Package</h3>
        <p className="text-sm text-gray-500 mt-1">
          Choose the package that fits your needs. You can always customize later.
        </p>
      </div>

      <div className="grid gap-4">
        {pricingPackages.map((pkg) => {
          const isSelected = packageId === pkg.id;
          return (
            <button
              key={pkg.id}
              type="button"
              onClick={() => onSelect(pkg.id)}
              className={`relative text-left rounded-2xl border-2 transition-all duration-200 overflow-visible
                ${isSelected
                  ? "border-[var(--color-primary)] bg-blue-50/70 shadow-lg shadow-blue-100 ring-4 ring-blue-100/60"
                  : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-md hover:bg-gray-50/50"
                }
              `}
            >
              {/* Popular / Best Value badge */}
              {pkg.badge && (
                <span
                  className={`absolute -top-3 left-5 px-3 py-0.5 rounded-full text-xs font-bold tracking-wide shadow-sm
                    ${pkg.featured ? "bg-[var(--color-primary)] text-white" : "bg-amber-500 text-white"}
                  `}
                >
                  {pkg.badge}
                </span>
              )}

              {/* Selected checkmark */}
              <span
                className={`absolute top-4 right-4 h-7 w-7 rounded-full border-2 flex items-center justify-center transition-all
                  ${isSelected
                    ? "bg-[var(--color-primary)] border-[var(--color-primary)] scale-100"
                    : "bg-white border-gray-300 scale-90 opacity-50"
                  }
                `}
              >
                <Check className={`h-4 w-4 ${isSelected ? "text-white" : "text-gray-300"}`} />
              </span>

              <div className="p-5 pr-14">
                {/* Name + Price */}
                <div className="flex items-start justify-between gap-3 mb-1">
                  <span className={`font-bold text-base leading-tight ${isSelected ? "text-[var(--color-primary)]" : "text-gray-900"}`}>
                    {pkg.name}
                  </span>
                  <div className="text-right flex-shrink-0">
                    <div className={`text-2xl font-extrabold leading-none ${isSelected ? "text-[var(--color-primary)]" : "text-gray-900"}`}>
                      {pkg.price}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">{pkg.priceNote}</div>
                  </div>
                </div>

                <p className="text-sm text-gray-500 mb-4">{pkg.description}</p>

                {/* Feature chips */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {pkg.features.map((f) => (
                    <span
                      key={f}
                      className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium transition-colors
                        ${isSelected
                          ? "bg-blue-100 text-blue-700 border border-blue-200"
                          : "bg-gray-100 text-gray-600 border border-gray-200"
                        }
                      `}
                    >
                      {f}
                    </span>
                  ))}
                </div>

                <div className={`border-t mb-3 ${isSelected ? "border-blue-200" : "border-gray-100"}`} />

                {/* Includes list */}
                <ul className="space-y-1.5">
                  {pkg.includes.map((inc) => (
                    <li key={inc} className="flex items-center gap-2 text-xs text-gray-700">
                      <span className={`flex-shrink-0 inline-flex items-center justify-center h-4 w-4 rounded-full
                        ${isSelected ? "bg-[var(--color-primary)] text-white" : "bg-green-100 text-green-600"}
                      `}>
                        <Check className="h-2.5 w-2.5" />
                      </span>
                      {inc}
                    </li>
                  ))}
                </ul>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
