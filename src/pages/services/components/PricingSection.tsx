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
          <h2 className="text-3xl font-semibold text-primary mb-2">
            Choose Your Package
          </h2>
          <p className="text-sm text-gray-700 max-w-3xl mx-auto">
            Pre-made packages for convenience — pick one and we handle the rest.
            Want something different?{" "}
            <button
              type="button"
              onClick={() => document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" })}
              className="text-primary underline cursor-pointer bg-transparent border-none p-0"
            >
              Build a custom order
            </button>
            .
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {pricingPackages.map((pkg, i) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`bg-white border border-dashed rounded-xl p-6 transition-all duration-300 ${
                pkg.featured
                  ? "border-primary shadow-lg scale-[1.02] relative"
                  : "border-blue-300 hover:shadow-md"
              }`}
            >
              {pkg.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs px-4 py-1 rounded-full font-medium">
                  Popular
                </div>
              )}

              <h3 className="text-base font-semibold text-gray-800 mb-2">
                {pkg.name}
              </h3>

              <p className="text-2xl font-bold text-primary mb-1">
                {pkg.price}{" "}
                <span className="text-sm font-normal text-gray-500">
                  {pkg.priceNote}
                </span>
              </p>

              <p className="text-xs text-gray-500 mb-5">{pkg.description}</p>

              {/* Features */}
              <ul className="space-y-2 mb-6 min-h-[100px]">
                {pkg.features.slice(0, 4).map((feature, idx) => (
                  <li
                    key={idx}
                    className="flex items-start text-xs text-gray-500"
                  >
                    <span className="text-primary mr-2 font-bold">•</span>
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
                className={`block w-full py-2.5 text-sm font-medium rounded-full transition-all duration-300 text-center ${
                  pkg.featured
                    ? "bg-primary text-white hover:bg-[var(--color-primary-hover)] hover:shadow-md"
                    : "bg-[var(--color-primary-light)] text-gray-900 hover:opacity-90"
                }`}
              >
                Book Now
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
