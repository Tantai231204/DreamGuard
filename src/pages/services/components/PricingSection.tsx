import { motion } from "framer-motion";
import { pricingPackages } from "../data";

interface PricingSectionProps {
  onSelectPackage: (packageId: string) => void;
}

export default function PricingSection({
  onSelectPackage,
}: PricingSectionProps) {
  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            Our Service Tiers
          </h2>
          <p className="text-sm text-slate-500 max-w-3xl mx-auto font-medium tracking-wide">
            Select standard core cleaning levels designed to fit your needs.
            Pricing calculates dynamically per item in our builder.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
          {pricingPackages.map((pkg, i) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`bg-white border-2 rounded-[20px] p-7 transition-all duration-300 ${pkg.featured
                ? "border-[#4988c4] shadow-xl shadow-[#4988c4]/5 scale-[1.02] relative"
                : "border-slate-100 hover:shadow-md"
                }`}
            >
              {pkg.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#4988c4] text-white text-[10px] font-black uppercase tracking-wider px-4 py-1 rounded-full">
                  Popular
                </div>
              )}

              <h3 className="text-base font-semibold text-gray-800 mb-2">
                {pkg.name}
              </h3>

              <p className="text-2xl font-black text-[#4988c4] mb-1">
                {pkg.price}{" "}
                {pkg.priceNote && (
                  <span className="text-sm font-normal text-slate-400">
                    {pkg.priceNote}
                  </span>
                )}
              </p>

              <p className="text-xs text-slate-500 font-medium tracking-wide mb-5 leading-relaxed">{pkg.description}</p>

              {/* Features */}
              <ul className="space-y-2.5 mb-6 min-h-[120px]">
                {pkg.features.slice(0, 5).map((feature, idx) => (
                  <li
                    key={idx}
                    className="flex items-start text-xs text-slate-500 font-medium"
                  >
                    <span className="text-[#4988c4] mr-2 font-bold">•</span>
                    <span className="leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Includes */}
              <div className="border-t border-dashed border-gray-200 pt-4 mb-5">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2 block">
                  Includes
                </span>
                <ul className="space-y-1.5">
                  {pkg.includes.slice(0, 3).map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-start text-xs text-gray-600"
                    >
                      <span className="text-green-500 mr-2">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={() => onSelectPackage(pkg.id)}
                className={`block w-full py-2.5 text-sm font-bold rounded-xl transition-all duration-300 text-center ${pkg.featured
                  ? "bg-[#4988c4] text-white hover:bg-[#3a73a8] hover:shadow-lg hover:shadow-[#4988c4]/10"
                  : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-100"
                  }`}
              >
                Build your Booking
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
