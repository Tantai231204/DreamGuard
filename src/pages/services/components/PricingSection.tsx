import { motion } from "framer-motion";
import { Check, Star } from "lucide-react";
import { pricingPackages } from "../data";

interface PricingSectionProps {
  onSelectPackage: (packageId: string) => void;
}

export default function PricingSection({
  onSelectPackage,
}: PricingSectionProps) {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="text-sm font-semibold tracking-wider uppercase text-[var(--color-primary)]">
            Pricing
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold mt-3 mb-4 text-gray-900">
            Choose Your Package
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Pre-made packages for convenience — pick one and we handle the rest.
            Want something different?{" "}
            <a href="#booking" className="text-[var(--color-primary)] underline">
              Build a custom order
            </a>
            .
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 items-stretch">
          {pricingPackages.map((pkg, i) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className={`relative flex flex-col rounded-2xl border-2 bg-white overflow-hidden transition-all ${
                pkg.featured
                  ? "border-[var(--color-primary)] shadow-xl shadow-blue-100 scale-[1.03]"
                  : "border-gray-100 shadow-sm hover:shadow-md"
              }`}
            >
              {/* Badge */}
              {pkg.badge && (
                <div
                  className={`absolute top-0 right-0 rounded-bl-xl px-4 py-1.5 text-xs font-bold tracking-wide ${
                    pkg.featured
                      ? "bg-[var(--color-primary)] text-white"
                      : "bg-gray-800 text-white"
                  }`}
                >
                  <Star className="h-3 w-3 inline mr-1 -mt-0.5" />
                  {pkg.badge}
                </div>
              )}

              {/* Header */}
              <div
                className={`p-8 ${
                  pkg.featured
                    ? "bg-gradient-to-br from-[var(--color-primary)]/5 to-blue-50"
                    : ""
                }`}
              >
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {pkg.name}
                </h3>
                <p className="text-sm text-gray-500 mb-6">{pkg.description}</p>
                <div className="flex items-end gap-1">
                  <span
                    className={`text-4xl font-extrabold ${
                      pkg.featured
                        ? "text-[var(--color-primary)]"
                        : "text-gray-900"
                    }`}
                  >
                    {pkg.price}
                  </span>
                  <span className="text-gray-400 text-sm mb-1">
                    {pkg.priceNote}
                  </span>
                </div>
              </div>

              {/* Includes */}
              <div className="px-8 py-4 border-t border-dashed border-gray-200">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3 block">
                  This package includes
                </span>
                <ul className="space-y-2">
                  {pkg.includes.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Features */}
              <div className="px-8 py-4 flex-1">
                <ul className="space-y-2">
                  {pkg.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2 text-sm">
                      <Check
                        className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                          pkg.featured
                            ? "text-[var(--color-primary)]"
                            : "text-gray-400"
                        }`}
                      />
                      <span className="text-gray-600">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              <div className="p-8 pt-4">
                <button
                  type="button"
                  onClick={() => onSelectPackage(pkg.id)}
                  className={`w-full py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all ${
                    pkg.featured
                      ? "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] shadow-lg shadow-blue-200 hover:shadow-xl"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  }`}
                >
                  Book This Package
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
